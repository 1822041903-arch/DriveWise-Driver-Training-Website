const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Bạn cần đăng nhập để sử dụng chức năng này.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-only-change-me');
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Tài khoản không còn tồn tại.' });
    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
    }
    next();
  };
}

module.exports = { requireAuth, allowRoles };
