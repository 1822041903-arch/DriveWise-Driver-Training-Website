const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCoursePayload } = require('../src/utils/courseValidation');

test('chấp nhận dữ liệu khóa học hợp lệ', () => {
  const result = validateCoursePayload({ title: 'Khóa học lái xe B', code: 'B-100', category: 'B', type: 'Tổng hợp', description: 'Mô tả khóa học đủ dài để kiểm tra.', durationWeeks: 12, tuition: 10000000, seatLimit: 20 });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('từ chối mã khóa học sai định dạng và học phí âm', () => {
  const result = validateCoursePayload({ title: 'B', code: '###', category: 'Z9', description: 'ngắn', durationWeeks: 0, tuition: -5 });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 5);
});
