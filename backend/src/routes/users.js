const express = require('express');
const User = require('../models/User');
const { requireAuth, allowRoles } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', allowRoles('admin', 'instructor'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'instructor') filter.role = 'student';
    else if (req.query.role && ['student', 'instructor', 'admin'].includes(req.query.role)) filter.role = req.query.role;
    if (req.query.q) filter.$or = [
      { fullName: { $regex: String(req.query.q), $options: 'i' } },
      { email: { $regex: String(req.query.q), $options: 'i' } }
    ];
    const items = await User.find(filter).select('fullName email phone role createdAt').sort({ createdAt: -1 }).limit(500);
    res.json({ items });
  } catch (error) { next(error); }
});

router.patch('/:id/role', allowRoles('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'instructor', 'admin'].includes(role)) return res.status(400).json({ message: 'Vai trò người dùng không hợp lệ.' });
    if (String(req.user._id) === String(req.params.id) && role !== 'admin') return res.status(400).json({ message: 'Không thể tự hạ quyền tài khoản quản trị đang đăng nhập.' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('fullName email phone role createdAt');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    res.json({ user, message: 'Đã cập nhật vai trò.' });
  } catch (error) { next(error); }
});

module.exports = router;
