const express = require('express');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { requireAuth, allowRoles } = require('../middleware/auth');

const router = express.Router();
router.get('/course/:courseId', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
    const items = await Lesson.find({ course: course._id }).sort({ order: 1 });
    res.json({ items });
  } catch (error) { next(error); }
});
router.post('/', requireAuth, allowRoles('admin', 'instructor'), async (req, res, next) => {
  try {
    const { courseId, title, lessonType, order } = req.body;
    if (!courseId || !title || !['theory', 'practice'].includes(lessonType) || Number(order) < 1) return res.status(400).json({ message: 'Vui lòng nhập khóa học, tiêu đề, loại bài học và thứ tự hợp lệ.' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
    if (req.user.role === 'instructor' && String(course.instructor) !== String(req.user._id)) return res.status(403).json({ message: 'Giảng viên chỉ được thêm bài cho khóa học mình phụ trách.' });
    const lesson = await Lesson.create({ course: courseId, title, lessonType, order: Number(order), summary: req.body.summary || '', videoUrl: req.body.videoUrl || '', materialsUrl: req.body.materialsUrl || '' });
    res.status(201).json({ lesson });
  } catch (error) { next(error); }
});
module.exports = router;
