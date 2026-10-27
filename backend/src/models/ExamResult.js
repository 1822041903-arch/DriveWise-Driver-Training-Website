const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  examType: { type: String, enum: ['theory', 'practice'], required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  passed: { type: Boolean, required: true },
  passingScore: { type: Number, required: true, min: 0, max: 100 },
  scoringStrategy: { type: String, required: true, trim: true },
  feedback: { type: String, trim: true, default: '' },
  assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  takenAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ExamResult', examResultSchema);
