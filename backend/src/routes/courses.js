const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const Schedule = require('../models/Schedule');
const ExamResult = require('../models/ExamResult');
const { requireAuth, allowRoles } = require('../middleware/auth');
const { validateCoursePayload } = require('../utils/courseValidation');
const { buildCoursePrototype, buildLessonPrototypes } = require('../patterns/coursePrototype');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (!req.user || !['admin', 'instructor'].includes(req.user.role)) filter.status = 'published';
    else if (req.query.status) filter.status = req.query.status;
    if (req.user?.role === 'instructor') filter.instructor = req.user._id;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.q) filter.$or = [
      { title: { $regex: String(req.query.q), $options: 'i' } },
      { code: { $regex: String(req.query.q), $options: 'i' } },
      { description: { $regex: String(req.query.q), $options: 'i' } }
    ];
    const courses = await Course.find(filter).populate('instructor', 'fullName email').sort({ createdAt: -1 }).limit(100);
    res.json({ items: courses, total: courses.length });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'fullName email');
    const instructorId = course?.instructor?._id || course?.instructor;
    if (!course || (course.status !== 'published' && (!req.user || !['admin', 'instructor'].includes(req.user.role))) || (req.user?.role === 'instructor' && String(instructorId) !== String(req.user._id))) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
    }
    res.json({ course });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, allowRoles('admin', 'instructor'), async (req, res, next) => {
  try {
    const validation = validateCoursePayload(req.body);
    if (!validation.valid) return res.status(400).json({ message: 'Dữ liệu khóa học chưa hợp lệ.', errors: validation.errors });
    const data = { ...req.body, code: String(req.body.code).trim().toUpperCase(), instructor: req.user.role === 'instructor' ? req.user._id : (req.body.instructor || null) };
    const course = await Course.create(data);
    res.status(201).json({ course });
  } catch (error) { next(error); }
});


// Prototype Pattern: duplicate course metadata and lesson structure as a new draft edition.
// Concrete schedules, enrollments and exam results are intentionally not copied.
router.post('/:id/clone', requireAuth, allowRoles('admin'), async (req, res, next) => {
  let clonedCourse = null;
  try {
    const source = await Course.findById(req.params.id);
    if (!source) return res.status(404).json({ message: 'Không tìm thấy khóa học nguồn.' });
    const code = String(req.body.code || '').trim().toUpperCase();
    const title = String(req.body.title || '').trim();
    if (!code || !title) return res.status(400).json({ message: 'Cần cung cấp mã và tên cho khóa học mới.' });

    const coursePayload = buildCoursePrototype(source, {
      title,
      code,
      instructor: req.body.instructor || source.instructor || null
    });
    const validation = validateCoursePayload(coursePayload);
    if (!validation.valid) return res.status(400).json({ message: 'Dữ liệu khóa học sao chép chưa hợp lệ.', errors: validation.errors });

    const sourceLessons = await Lesson.find({ course: source._id }).sort({ order: 1 }).lean();
    clonedCourse = await Course.create(coursePayload);
    const lessonPayloads = buildLessonPrototypes(sourceLessons, clonedCourse._id);
    const clonedLessons = lessonPayloads.length ? await Lesson.insertMany(lessonPayloads) : [];
    res.status(201).json({
      course: clonedCourse,
      clonedLessonCount: clonedLessons.length,
      message: 'Đã tạo bản nháp từ khóa học mẫu. Vui lòng rà soát và lập lịch học mới trước khi xuất bản.'
    });
  } catch (error) {
    if (clonedCourse?._id) {
      await Promise.all([
        Course.deleteOne({ _id: clonedCourse._id }),
        Lesson.deleteMany({ course: clonedCourse._id })
      ]).catch(() => {});
    }
    next(error);
  }
});

router.patch('/:id', requireAuth, allowRoles('admin', 'instructor'), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
    if (req.user.role === 'instructor' && String(course.instructor) !== String(req.user._id)) return res.status(403).json({ message: 'Giảng viên chỉ được sửa khóa học của mình.' });
    const merged = { ...course.toObject(), ...req.body };
    const validation = validateCoursePayload(merged);
    if (!validation.valid) return res.status(400).json({ message: 'Dữ liệu khóa học chưa hợp lệ.', errors: validation.errors });
    const allowed = ['title', 'code', 'category', 'type', 'description', 'durationWeeks', 'tuition', 'seatLimit', 'status', 'imageUrl', 'learningOutcomes'];
    for (const key of allowed) if (req.body[key] !== undefined) course[key] = req.body[key];
    if (req.user.role === 'admin' && req.body.instructor !== undefined) course.instructor = req.body.instructor || null;
    if (req.user.role === 'instructor' && req.body.instructor !== undefined) return res.status(403).json({ message: 'Giảng viên không được tự thay đổi người phụ trách khóa học.' });
    if (course.code) course.code = String(course.code).trim().toUpperCase();
    await course.save();
    res.json({ course });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, allowRoles('admin'), async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
    await Promise.all([
      Enrollment.deleteMany({ course: course._id }),
      Lesson.deleteMany({ course: course._id }),
      Schedule.deleteMany({ course: course._id }),
      ExamResult.deleteMany({ course: course._id })
    ]);
    res.json({ message: 'Đã xóa khóa học và dữ liệu phụ thuộc.' });
  } catch (error) { next(error); }
});

module.exports = router;
