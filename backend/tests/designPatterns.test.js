const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCoursePrototype, buildLessonPrototypes } = require('../src/patterns/coursePrototype');
const { transitionEnrollment, EnrollmentTransitionError } = require('../src/patterns/enrollmentState');
const { evaluateExamResult } = require('../src/patterns/examScoringStrategy');

test('Prototype copies course curriculum to a separate draft edition', () => {
  const source = {
    title: 'Khóa B căn bản', code: 'B-K11', category: 'B', type: 'Tổng hợp',
    description: 'Chương trình lái xe mẫu dùng cho demo.', durationWeeks: 12,
    tuition: 10000000, seatLimit: 25, instructor: 'teacher-id', status: 'published',
    learningOutcomes: ['Lý thuyết', 'Thực hành']
  };
  const clone = buildCoursePrototype(source, { title: 'Khóa B K12', code: 'b-k12' });
  assert.equal(clone.title, 'Khóa B K12');
  assert.equal(clone.code, 'B-K12');
  assert.equal(clone.status, 'draft');
  assert.notEqual(clone.learningOutcomes, source.learningOutcomes);
  clone.learningOutcomes.push('Bổ sung');
  assert.equal(source.learningOutcomes.length, 2);

  const lessons = buildLessonPrototypes([
    { title: 'Biển báo', lessonType: 'theory', order: 1 },
    { title: 'Làm quen xe', lessonType: 'practice', order: 2 }
  ], 'new-course-id');
  assert.equal(lessons.length, 2);
  assert.equal(lessons[0].course, 'new-course-id');
  assert.equal(lessons[1].order, 2);
});

test('State Pattern only allows defined enrollment transitions', () => {
  assert.equal(transitionEnrollment('pending', 'approved'), 'approved');
  assert.equal(transitionEnrollment('approved', 'in-progress'), 'in-progress');
  assert.equal(transitionEnrollment('in-progress', 'completed'), 'completed');
  assert.throws(() => transitionEnrollment('pending', 'completed'), EnrollmentTransitionError);
  assert.throws(() => transitionEnrollment('completed', 'cancelled'), EnrollmentTransitionError);
});

test('cancelled enrollment can only re-enter pending if the course is published and has seats', () => {
  assert.equal(transitionEnrollment('cancelled', 'pending', { coursePublished: true, hasAvailableSeat: true }), 'pending');
  assert.throws(() => transitionEnrollment('cancelled', 'pending', { coursePublished: false, hasAvailableSeat: true }), /chưa được mở/);
  assert.throws(() => transitionEnrollment('cancelled', 'pending', { coursePublished: true, hasAvailableSeat: false }), /đủ chỉ tiêu/);
});

test('Strategy Pattern evaluates theory and practice with their own demo thresholds', () => {
  assert.deepEqual(evaluateExamResult({ examType: 'theory', score: 50 }), {
    score: 50, passed: true, passingScore: 50, strategy: 'TheoryExamStrategy'
  });
  assert.deepEqual(evaluateExamResult({ examType: 'practice', score: 69 }), {
    score: 69, passed: false, passingScore: 70, strategy: 'PracticeExamStrategy'
  });
  assert.throws(() => evaluateExamResult({ examType: 'practice', score: 101 }), /0–100/);
  assert.throws(() => evaluateExamResult({ examType: 'unknown', score: 80 }), /không được hỗ trợ/);
});
