const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { requireAuth } = require('./middleware/auth');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'driver-training-api' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', (req, res, next) => {
  // Public catalog is readable without a token. Attach a user when a valid token is sent.
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return next();
  return requireAuth(req, res, next);
}, require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/exam-results', require('./routes/examResults'));

app.use((_req, res) => res.status(404).json({ message: 'Không tìm thấy đường dẫn API.' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err && err.code === 11000) return res.status(409).json({ message: 'Dữ liệu bị trùng; vui lòng kiểm tra mã hoặc email.' });
  if (err && err.name === 'ValidationError') return res.status(400).json({ message: 'Dữ liệu không hợp lệ.', details: err.message });
  if (err && err.name === 'CastError') return res.status(400).json({ message: 'ID không đúng định dạng.' });
  return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ.' });
});

module.exports = app;
