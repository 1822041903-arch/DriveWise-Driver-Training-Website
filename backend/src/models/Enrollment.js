const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  status: { type: String, enum: ['pending', 'approved', 'in-progress', 'completed', 'cancelled'], default: 'pending', index: true },
  enrolledAt: { type: Date, default: Date.now },
  note: { type: String, trim: true, default: '' },
  theoryHoursCompleted: { type: Number, min: 0, default: 0 },
  practiceHoursCompleted: { type: Number, min: 0, default: 0 },
  practiceKmCompleted: { type: Number, min: 0, default: 0 }
}, { timestamps: true });
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
