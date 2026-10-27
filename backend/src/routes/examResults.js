const express = require('express');
const ExamResult = require('../models/ExamResult');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { requireAuth, allowRoles } = require('../middleware/auth');
const { evaluateExamResult } = require('../patterns/examScoringStrategy');

const router = express.Router();
router.get('/my', requireAuth, allowRoles('student'), async (req, res, next) => {
  try {
    const items = await ExamResult.find({ student: req.user._id }).populate('course', 'title code').populate('assessedBy', 'fullName').sort({ takenAt: -1 });
    res.json({ items });
  } catch (error) { next(error); }
});
router.post('/', requireAuth, allowRoles('admin', 'instructor'), async (req, res, next) => {
  try {
    const { studentId, courseId, examType, score } = req.body;
    const numericScore = Number(score);
    if (!studentId || !courseId || !['theory', 'practice'].includes(examType) || !Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) return res.status(400).json({ message: 'Thông tin kết quả thi chưa hợp lệ.' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') return res.status(404).json({ message: 'Không tìm thấy tài khoản học viên.' });
    if (req.user.role === 'instructor' && String(course.instructor) !== String(req.user._id)) return res.status(403).json({ message: 'Bạn không phụ trách khóa học này.' });
    const enrollment = await Enrollment.findOne({ student: student._id, course: course._id, status: { $in: ['approved', 'in-progress', 'completed'] } });
    if (!enrollment) return res.status(400).json({ message: 'Học viên cần có hồ sơ đã được xác nhận cho khóa học trước khi ghi nhận kết quả.' });
    const evaluation = evaluateExamResult({ examType, score: numericScore });
    const result = await ExamResult.create({
      student: studentId,
      course: courseId,
      examType,
      score: evaluation.score,
      passed: evaluation.passed,
      passingScore: evaluation.passingScore,
      scoringStrategy: evaluation.strategy,
      feedback: req.body.feedback || '',
      assessedBy: req.user._id
    });
    res.status(201).json({ result, evaluation });
  } catch (error) { next(error); }
});
module.exports = router;
