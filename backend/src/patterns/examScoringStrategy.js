/**
 * Strategy Pattern: assessment rules are selected by exam type.
 * These thresholds are illustrative rules for the software-design demo, not
 * official Vietnamese driving-test passing criteria.
 */
class ExamScoringStrategy {
  constructor(name, passingScore) {
    this.name = name;
    this.passingScore = passingScore;
  }

  evaluate(score) {
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
      throw new RangeError('Điểm thi phải nằm trong khoảng 0–100.');
    }
    return {
      score: numericScore,
      passed: numericScore >= this.passingScore,
      passingScore: this.passingScore,
      strategy: this.name
    };
  }
}

class TheoryExamStrategy extends ExamScoringStrategy {
  constructor() { super('TheoryExamStrategy', 50); }
}

class PracticeExamStrategy extends ExamScoringStrategy {
  constructor() { super('PracticeExamStrategy', 70); }
}

const strategies = Object.freeze({
  theory: new TheoryExamStrategy(),
  practice: new PracticeExamStrategy()
});

function evaluateExamResult({ examType, score }) {
  const strategy = strategies[examType];
  if (!strategy) throw new TypeError(`Loại kỳ thi không được hỗ trợ: ${examType}.`);
  return strategy.evaluate(score);
}

module.exports = {
  ExamScoringStrategy,
  TheoryExamStrategy,
  PracticeExamStrategy,
  evaluateExamResult
};
