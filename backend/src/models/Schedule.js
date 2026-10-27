const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  location: { type: String, required: true, trim: true },
  sessionType: { type: String, enum: ['theory', 'practice', 'exam'], default: 'theory' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });
scheduleSchema.index({ instructor: 1, startsAt: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
