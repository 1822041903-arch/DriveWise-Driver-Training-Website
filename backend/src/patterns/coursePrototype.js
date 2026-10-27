/**
 * Prototype Pattern for duplicating a course edition and its curriculum.
 * The result deliberately starts as a draft. Real calendar events are not cloned
 * because their dates, instructor availability and student assignments are specific
 * to the source cohort and must be scheduled again.
 */
function plainObject(value) {
  if (!value) return {};
  if (typeof value.toObject === 'function') return value.toObject();
  return { ...value };
}

function buildCoursePrototype(source, overrides = {}) {
  const original = plainObject(source);
  if (!original.title || !original.code) {
    throw new TypeError('Course prototype must have title and code.');
  }

  return {
    title: String(overrides.title ?? `${original.title} (bản sao)`).trim(),
    code: String(overrides.code ?? '').trim().toUpperCase(),
    category: original.category,
    type: original.type,
    description: original.description,
    durationWeeks: original.durationWeeks,
    tuition: original.tuition,
    seatLimit: original.seatLimit,
    instructor: overrides.instructor ?? original.instructor ?? null,
    status: 'draft',
    imageUrl: original.imageUrl || '',
    learningOutcomes: Array.isArray(original.learningOutcomes)
      ? original.learningOutcomes.map((outcome) => String(outcome))
      : []
  };
}

function buildLessonPrototypes(sourceLessons, targetCourseId) {
  if (!Array.isArray(sourceLessons)) throw new TypeError('sourceLessons must be an array.');
  if (!targetCourseId) throw new TypeError('targetCourseId is required.');

  return sourceLessons.map((lesson, index) => {
    const original = plainObject(lesson);
    return {
      course: targetCourseId,
      title: original.title,
      summary: original.summary || '',
      lessonType: original.lessonType,
      order: Number.isInteger(original.order) && original.order > 0 ? original.order : index + 1,
      videoUrl: original.videoUrl || '',
      materialsUrl: original.materialsUrl || ''
    };
  });
}

module.exports = { buildCoursePrototype, buildLessonPrototypes };
