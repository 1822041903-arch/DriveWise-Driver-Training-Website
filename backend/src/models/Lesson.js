const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  summary: { type: String, trim: true, default: '' },
  lessonType: { type: String, enum: ['theory', 'practice'], required: true },
  order: { type: Number, required: true, min: 1 },
  videoUrl: { type: String, trim: true, default: '' },
  materialsUrl: { type: String, trim: true, default: '' }
}, { timestamps: true });
lessonSchema.index({ course: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', lessonSchema);
