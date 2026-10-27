const express = require('express');
const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const { requireAuth, allowRoles } = require('../middleware/auth');

const router = express.Router();
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.course = req.query.courseId;
    if (req.query.from || req.query.to) {
      filter.startsAt = {};
      if (req.query.from) filter.startsAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.startsAt.$lte = new Date(req.query.to);
    }
    if (req.user.role === 'instructor') filter.instructor = req.user._id;
    if (req.user.role === 'student') {
      const enrollments = await Enrollment.find({ student: req.user._id, status: { $in: ['approved', 'in-progress', 'completed'] } }).select('course');
      const courseIds = enrollments.map((item) => item.course);
      filter.$or = [{ student: req.user._id }, { course: { $in: courseIds } }];
    }
    const items = await Schedule.find(filter).populate('course', 'title code category').populate('instructor', 'fullName').populate('student', 'fullName').populate('lessonId', 'title lessonType order').sort({ startsAt: 1 }).limit(300);
    res.json({ items });
  } catch (error) { next(error); }
});
router.post('/', requireAuth, allowRoles('admin', 'instructor'), async (req, res, next) => {
  try {
    const { courseId, startsAt, endsAt, location, sessionType } = req.body;
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (!courseId || !startsAt || !endsAt || !location || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return res.status(400).json({ message: 'Thông tin lịch học không hợp lệ; thời gian kết thúc phải sau thời gian bắt đầu.' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
    if (req.user.role === 'instructor' && String(course.instructor) !== String(req.user._id)) return res.status(403).json({ message: 'Giảng viên chỉ được tạo lịch cho khóa học mình phụ trách.' });
    let lessonId = null;
    if (req.body.lessonId) {
      const lesson = await Lesson.findOne({ _id: req.body.lessonId, course: course._id });
      if (!lesson) return res.status(400).json({ message: 'Bài học không thuộc khóa học đã chọn.' });
      lessonId = lesson._id;
    }
    const instructorId = req.user.role === 'instructor' ? req.user._id : (req.body.instructor || course.instructor);
    if (!instructorId) return res.status(400).json({ message: 'Khóa học chưa được phân công giảng viên.' });
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'instructor') return res.status(400).json({ message: 'Giảng viên được chọn không hợp lệ.' });
    const schedule = await Schedule.create({ course: courseId, lessonId, instructor: instructorId, student: req.body.student || null, startsAt: start, endsAt: end, location, sessionType: sessionType || 'theory' });
    res.status(201).json({ schedule });
  } catch (error) { next(error); }
});
module.exports = router;
