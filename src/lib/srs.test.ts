import { describe, expect, it } from 'vitest';
import { addDays, createInitialProgress, isDue, isMastered, toDateKey, updateCardProgress } from './srs';

const day0 = new Date('2026-01-01T00:00:00.000Z');

describe('createInitialProgress', () => {
  it('starts with ease 2.5 and is immediately due', () => {
    const progress = createInitialProgress('q_1', day0);
    expect(progress.ease).toBe(2.5);
    expect(progress.repetitions).toBe(0);
    expect(progress.due).toBe('2026-01-01');
  });
});

describe('updateCardProgress', () => {
  it('resets repetitions and sets a 1-day interval on a failed answer (quality < 3)', () => {
    const progress = createInitialProgress('q_1', day0);
    const seeded = { ...progress, repetitions: 5, intervalDays: 40 };
    const next = updateCardProgress(seeded, 1, day0);
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
    expect(next.due).toBe(toDateKey(addDays(day0, 1)));
  });

  it('sets a 1-day interval after the first correct repetition', () => {
    const progress = createInitialProgress('q_1', day0);
    const next = updateCardProgress(progress, 4, day0);
    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
  });

  it('sets a 6-day interval after the second correct repetition', () => {
    const progress = createInitialProgress('q_1', day0);
    const afterFirst = updateCardProgress(progress, 4, day0);
    const afterSecond = updateCardProgress(afterFirst, 4, day0);
    expect(afterSecond.repetitions).toBe(2);
    expect(afterSecond.intervalDays).toBe(6);
  });

  it('multiplies the previous interval by ease from the third correct repetition onward', () => {
    let progress = createInitialProgress('q_1', day0);
    progress = updateCardProgress(progress, 4, day0); // rep 1, interval 1
    progress = updateCardProgress(progress, 4, day0); // rep 2, interval 6
    const before = progress;
    progress = updateCardProgress(progress, 4, day0); // rep 3
    expect(progress.repetitions).toBe(3);
    expect(progress.intervalDays).toBe(Math.round(6 * before.ease));
  });

  it('never lets ease drop below 1.3', () => {
    let progress = createInitialProgress('q_1', day0);
    for (let i = 0; i < 20; i++) {
      progress = updateCardProgress(progress, 0, day0);
    }
    expect(progress.ease).toBeGreaterThanOrEqual(1.3);
  });

  it('increases ease for high-quality answers and decreases it for low-quality ones', () => {
    const progress = createInitialProgress('q_1', day0);
    const easyNext = updateCardProgress(progress, 5, day0);
    const hardNext = updateCardProgress(progress, 3, day0);
    expect(easyNext.ease).toBeGreaterThan(progress.ease);
    expect(hardNext.ease).toBeLessThan(progress.ease);
  });

  it('records the answer in the history', () => {
    const progress = createInitialProgress('q_1', day0);
    const next = updateCardProgress(progress, 4, day0);
    expect(next.history).toEqual([{ date: '2026-01-01', quality: 4 }]);
  });

  it('a card that was wrong twice in a row becomes due again sooner than one answered correctly twice', () => {
    const progress = createInitialProgress('q_1', day0);
    const wrongTwice = updateCardProgress(updateCardProgress(progress, 4, day0), 1, day0);
    const rightTwice = updateCardProgress(updateCardProgress(progress, 4, day0), 4, day0);
    expect(wrongTwice.due < rightTwice.due).toBe(true);
  });
});

describe('isDue', () => {
  it('is true when due date is today or in the past', () => {
    const progress = createInitialProgress('q_1', day0);
    expect(isDue(progress, day0)).toBe(true);
    expect(isDue(progress, addDays(day0, 1))).toBe(true);
  });

  it('is false when due date is in the future', () => {
    const progress = updateCardProgress(createInitialProgress('q_1', day0), 4, day0);
    expect(isDue(progress, day0)).toBe(false);
  });
});

describe('isMastered', () => {
  it('requires at least 3 repetitions and ease >= 2.3', () => {
    expect(isMastered({ ...createInitialProgress('q_1', day0), repetitions: 3, ease: 2.3 })).toBe(true);
    expect(isMastered({ ...createInitialProgress('q_1', day0), repetitions: 2, ease: 2.5 })).toBe(false);
    expect(isMastered({ ...createInitialProgress('q_1', day0), repetitions: 3, ease: 2.0 })).toBe(false);
  });
});
