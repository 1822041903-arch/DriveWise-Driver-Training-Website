const mongoose = require('mongoose');

/** Validation middleware is one link in Express's Chain of Responsibility. */
function validateEnrollmentRequest(req, res, next) {
  const courseId = req.body?.courseId;
  if (!courseId) {
    return res.status(400).json({ message: 'Thiếu courseId.' });
  }
  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ message: 'courseId không đúng định dạng.' });
  }
  return next();
}

module.exports = { validateEnrollmentRequest };
