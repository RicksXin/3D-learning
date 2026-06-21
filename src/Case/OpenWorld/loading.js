export function createLoadingTracker(steps) {
  const orderedSteps = [...steps];
  const completed = new Set();

  function percent() {
    if (!orderedSteps.length) return 100;
    return Math.min(100, Math.ceil((completed.size / orderedSteps.length) * 100));
  }

  return {
    complete(step) {
      if (orderedSteps.includes(step)) {
        completed.add(step);
      }
      return percent();
    },
    current() {
      return {
        done: completed.size,
        total: orderedSteps.length,
        percent: percent(),
      };
    },
    isComplete() {
      return completed.size >= orderedSteps.length;
    },
    percent,
  };
}
