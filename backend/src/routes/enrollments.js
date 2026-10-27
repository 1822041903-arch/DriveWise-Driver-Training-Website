const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { requireAuth, allowRoles } = require('../middleware/auth');
const { validateEnrollmentRequest } = require('../middleware/validateEnrollmentRequest');
const { transitionEnrollment, EnrollmentTransitionError } = require('../patterns/enrollmentState');

const router = express.Router();
router.use(requireAuth);

router.get('/my', allowRoles('student'), async (req, res, next) => {
  try {
    const items = await Enrollment.find({ student: req.user._id }).populate('course').sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) { next(error); }
});

router.post('/', allowRoles('student'), validateEnrollmentRequest, async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course || course.status !== 'published') return res.status(404).json({ message: 'Khóa học không tồn tại hoặc chưa mở đăng ký.' });
    const count = await Enrollment.countDocuments({ course: course._id, status: { $in: ['pending', 'approved', 'in-progress'] } });
    if (count >= course.seatLimit) return res.status(409).json({ message: 'Khóa học đã đủ số lượng đăng ký.' });
    const existing = await Enrollment.findOne({ student: req.user._id, course: course._id });
    if (existing && existing.status !== 'cancelled') return res.status(409).json({ message: 'Bạn đã đăng ký khóa học này.' });
    let enrollment;
    if (existing) {
      try {
        existing.status = transitionEnrollment(existing.status, 'pending', {
          coursePublished: course.status === 'published',
          hasAvailableSeat: count < course.seatLimit
        });
      } catch (error) {
        if (error instanceof EnrollmentTransitionError) return res.status(error.statusCode).json({ message: error.message });
        throw error;
      }
      existing.enrolledAt = new Date();
      enrollment = await existing.save();
    } else {
      enrollment = await Enrollment.create({ student: req.user._id, course: course._id });
    }
    await enrollment.populate('course');
    res.status(201).json({ enrollment, message: 'Đăng ký thành công. Trung tâm sẽ xác nhận hồ sơ.' });
  } catch (error) { next(error); }
});

router.get('/', allowRoles('admin', 'instructor'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'instructor') {
      const Course = require('../models/Course');
      const owned = await Course.find({ instructor: req.user._id }).select('_id');
      filter.course = { $in: owned.map((item) => item._id) };
    }
    const items = await Enrollment.find(filter).populate('student', 'fullName email phone').populate('course', 'title code category').sort({ createdAt: -1 }).limit(500);
    res.json({ items });
  } catch (error) { next(error); }
});

router.patch('/:id/progress', allowRoles('admin', 'instructor'), async (req, res, next) => {
  try {
    const fields = ['theoryHoursCompleted', 'practiceHoursCompleted', 'practiceKmCompleted'];
    const supplied = fields.filter((field) => req.body[field] !== undefined);
    if (!supplied.length) return res.status(400).json({ message: 'Cần cung cấp ít nhất một chỉ số tiến độ.' });
    for (const field of supplied) {
      const value = Number(req.body[field]);
      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({ message: `${field} phải là số không âm.` });
      }
    }
    const enrollment = await Enrollment.findById(req.params.id).populate('course');
    if (!enrollment) return res.status(404).json({ message: 'Không tìm thấy hồ sơ đăng ký.' });
    if (req.user.role === 'instructor' && String(enrollment.course?.instructor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Bạn không phụ trách khóa học này.' });
    }
    if (!['approved', 'in-progress'].includes(enrollment.status)) {
      return res.status(409).json({ message: 'Chỉ cập nhật tiến độ khi hồ sơ đã được duyệt hoặc đang học.' });
    }
    for (const field of supplied) enrollment[field] = Number(req.body[field]);
    await enrollment.save();
    res.json({ enrollment, message: 'Đã cập nhật tiến độ đào tạo.' });
  } catch (error) { next(error); }
});

router.patch('/:id/status', allowRoles('admin', 'instructor'), async (req, res, next) => {
  try {
    const allowed = ['pending', 'approved', 'in-progress', 'completed', 'cancelled'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Trạng thái đăng ký không hợp lệ.' });
    const enrollment = await Enrollment.findById(req.params.id).populate('course');
    if (!enrollment) return res.status(404).json({ message: 'Không tìm thấy hồ sơ đăng ký.' });
    if (req.user.role === 'instructor' && String(enrollment.course?.instructor) !== String(req.user._id)) return res.status(403).json({ message: 'Bạn không phụ trách khóa học này.' });
    let hasAvailableSeat = true;
    if (enrollment.course && enrollment.status === 'cancelled' && req.body.status === 'pending') {
      const activeCount = await Enrollment.countDocuments({
        course: enrollment.course._id,
        status: { $in: ['pending', 'approved', 'in-progress'] }
      });
      hasAvailableSeat = activeCount < enrollment.course.seatLimit;
    }
    try {
      enrollment.status = transitionEnrollment(enrollment.status, req.body.status, {
        coursePublished: enrollment.course?.status === 'published',
        hasAvailableSeat
      });
    } catch (error) {
      if (error instanceof EnrollmentTransitionError) return res.status(error.statusCode).json({ message: error.message });
      throw error;
    }
    await enrollment.save();
    res.json({ enrollment });
  } catch (error) { next(error); }
});

module.exports = router;
