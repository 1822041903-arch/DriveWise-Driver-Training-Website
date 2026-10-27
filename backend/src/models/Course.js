const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: String, enum: ['A1', 'A', 'B', 'C1', 'C', 'D1', 'Khác'], required: true },
  type: { type: String, enum: ['Lý thuyết', 'Thực hành', 'Tổng hợp'], default: 'Tổng hợp' },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  durationWeeks: { type: Number, required: true, min: 1, max: 104 },
  tuition: { type: Number, required: true, min: 0 },
  seatLimit: { type: Number, default: 30, min: 1, max: 500 },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
  imageUrl: { type: String, default: '' },
  learningOutcomes: [{ type: String, trim: true }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
