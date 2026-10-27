const ALLOWED_CATEGORIES = new Set(['A1', 'A', 'B', 'C1', 'C', 'D1', 'Khác']);
const ALLOWED_TYPES = new Set(['Lý thuyết', 'Thực hành', 'Tổng hợp']);

function validateCoursePayload(payload = {}) {
  const errors = [];
  if (typeof payload.title !== 'string' || payload.title.trim().length < 3) errors.push('Tên khóa học phải có ít nhất 3 ký tự.');
  if (typeof payload.code !== 'string' || !/^[A-Za-z0-9_-]{2,20}$/.test(payload.code.trim())) errors.push('Mã khóa học gồm 2–20 chữ cái, số, dấu gạch ngang hoặc gạch dưới.');
  if (!ALLOWED_CATEGORIES.has(payload.category)) errors.push('Hạng đào tạo không hợp lệ.');
  if (payload.type !== undefined && !ALLOWED_TYPES.has(payload.type)) errors.push('Hình thức đào tạo không hợp lệ.');
  if (typeof payload.description !== 'string' || payload.description.trim().length < 10) errors.push('Mô tả cần có ít nhất 10 ký tự.');
  if (!Number.isFinite(Number(payload.durationWeeks)) || Number(payload.durationWeeks) < 1) errors.push('Thời lượng phải từ 1 tuần trở lên.');
  if (!Number.isFinite(Number(payload.tuition)) || Number(payload.tuition) < 0) errors.push('Học phí phải là số không âm.');
  if (payload.seatLimit !== undefined && (!Number.isFinite(Number(payload.seatLimit)) || Number(payload.seatLimit) < 1)) errors.push('Số lượng học viên tối đa phải ít nhất là 1.');
  return { valid: errors.length === 0, errors };
}

module.exports = { validateCoursePayload };
