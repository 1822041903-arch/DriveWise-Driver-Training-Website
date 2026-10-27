/** State Pattern: each state declares its permitted next states. */
class EnrollmentTransitionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EnrollmentTransitionError';
    this.statusCode = 409;
  }
}

class EnrollmentState {
  constructor(name) { this.name = name; }
  transitionTo(next, context = {}) {
    if (next === this.name) return this.name;
    throw new EnrollmentTransitionError(`Không thể chuyển hồ sơ từ ${this.name} sang ${next}.`);
  }
}

class PendingState extends EnrollmentState {
  constructor() { super('pending'); }
  transitionTo(next, context = {}) {
    if (next === 'approved' || next === 'cancelled') return next;
    return super.transitionTo(next, context);
  }
}

class ApprovedState extends EnrollmentState {
  constructor() { super('approved'); }
  transitionTo(next, context = {}) {
    if (next === 'in-progress' || next === 'cancelled') return next;
    return super.transitionTo(next, context);
  }
}

class InProgressState extends EnrollmentState {
  constructor() { super('in-progress'); }
  transitionTo(next, context = {}) {
    if (next === 'completed' || next === 'cancelled') return next;
    return super.transitionTo(next, context);
  }
}

class CompletedState extends EnrollmentState {
  constructor() { super('completed'); }
}

class CancelledState extends EnrollmentState {
  constructor() { super('cancelled'); }
  transitionTo(next, context = {}) {
    if (next !== 'pending') return super.transitionTo(next, context);
    if (context.coursePublished !== true) {
      throw new EnrollmentTransitionError('Không thể đăng ký lại vì khóa học chưa được mở.');
    }
    if (context.hasAvailableSeat !== true) {
      throw new EnrollmentTransitionError('Không thể đăng ký lại vì khóa học đã đủ chỉ tiêu.');
    }
    return 'pending';
  }
}

const states = new Map([
  ['pending', new PendingState()],
  ['approved', new ApprovedState()],
  ['in-progress', new InProgressState()],
  ['completed', new CompletedState()],
  ['cancelled', new CancelledState()]
]);

function transitionEnrollment(currentStatus, nextStatus, context = {}) {
  const state = states.get(currentStatus);
  if (!state) throw new EnrollmentTransitionError(`Trạng thái hiện tại không hợp lệ: ${currentStatus}.`);
  if (!states.has(nextStatus)) throw new EnrollmentTransitionError(`Trạng thái đích không hợp lệ: ${nextStatus}.`);
  return state.transitionTo(nextStatus, context);
}

module.exports = {
  EnrollmentTransitionError,
  EnrollmentState,
  PendingState,
  ApprovedState,
  InProgressState,
  CompletedState,
  CancelledState,
  transitionEnrollment
};
