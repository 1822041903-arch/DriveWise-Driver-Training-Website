const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev-only-change-me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'Vui lòng nhập họ tên, email và mật khẩu.' });
    if (String(fullName).trim().length < 2) return res.status(400).json({ message: 'Họ tên quá ngắn.' });
    if (!/^\S+@\S+\.\S+$/.test(String(email))) return res.status(400).json({ message: 'Email không đúng định dạng.' });
    if (String(password).length < 8) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'Email đã được sử dụng.' });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName: String(fullName).trim(), email: normalizedEmail, password: hash, phone: phone || '', role: 'student' });
    return res.status(201).json({ token: makeToken(user), user: user.toJSON() });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    const safeUser = await User.findById(user._id);
    return res.json({ token: makeToken(user), user: safeUser.toJSON() });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user.toJSON() }));

module.exports = router;
