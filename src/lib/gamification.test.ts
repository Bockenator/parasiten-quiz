import { describe, expect, it } from 'vitest';
import type { CardProgress, StreakState } from '../types';
import { createInitialProgress, updateCardProgress } from './srs';
import { makeQuestion } from './testUtils';
import {
  computeBadges,
  computeXpEarned,
  countAnsweredToday,
  gradeForAccuracy,
  levelForXp,
  updateStreak,
  xpIntoCurrentLevel,
} from './gamification';

describe('computeXpEarned', () => {
  it('awards 10 XP per correct answer plus a completion bonus', () => {
    expect(computeXpEarned(8, 10)).toBe(8 * 10 + 20);
  });

  it('awards no XP for an empty session', () => {
    expect(computeXpEarned(0, 0)).toBe(0);
  });

  it('still awards the completion bonus even with zero correct answers', () => {
    expect(computeXpEarned(0, 5)).toBe(20);
  });
});

describe('levelForXp / xpIntoCurrentLevel', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(levelForXp(0)).toBe(1);
    expect(xpIntoCurrentLevel(0)).toBe(0);
  });

  it('advances a level every 100 XP', () => {
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(250)).toBe(3);
    expect(xpIntoCurrentLevel(250)).toBe(50);
  });
});

describe('updateStreak', () => {
  const day1 = new Date('2026-01-10T00:00:00.000Z');
  const emptyStreak: StreakState = { current: 0, longest: 0, lastStudyDate: null };

  it('starts a streak of 1 on the first study day', () => {
    expect(updateStreak(emptyStreak, day1)).toEqual({ current: 1, longest: 1, lastStudyDate: '2026-01-10' });
  });

  it('does not change the streak when studying again the same day', () => {
    const streak: StreakState = { current: 3, longest: 5, lastStudyDate: '2026-01-10' };
    expect(updateStreak(streak, day1)).toEqual(streak);
  });

  it('increments the streak when studying on the following day', () => {
    const streak: StreakState = { current: 3, longest: 5, lastStudyDate: '2026-01-09' };
    expect(updateStreak(streak, day1)).toEqual({ current: 4, longest: 5, lastStudyDate: '2026-01-10' });
  });

  it('updates the longest streak once the current one surpasses it', () => {
    const streak: StreakState = { current: 5, longest: 5, lastStudyDate: '2026-01-09' };
    expect(updateStreak(streak, day1)).toEqual({ current: 6, longest: 6, lastStudyDate: '2026-01-10' });
  });

  it('resets the streak to 1 after a missed day', () => {
    const streak: StreakState = { current: 8, longest: 8, lastStudyDate: '2026-01-05' };
    expect(updateStreak(streak, day1)).toEqual({ current: 1, longest: 8, lastStudyDate: '2026-01-10' });
  });
});

describe('gradeForAccuracy', () => {
  it('maps accuracy to the German 1-6 grading scale', () => {
    expect(gradeForAccuracy(1)).toBe(1);
    expect(gradeForAccuracy(0.92)).toBe(1);
    expect(gradeForAccuracy(0.85)).toBe(2);
    expect(gradeForAccuracy(0.7)).toBe(3);
    expect(gradeForAccuracy(0.55)).toBe(4);
    expect(gradeForAccuracy(0.35)).toBe(5);
    expect(gradeForAccuracy(0.1)).toBe(6);
    expect(gradeForAccuracy(0)).toBe(6);
  });
});

describe('computeBadges', () => {
  const today = new Date('2026-01-10T00:00:00.000Z');

  it('is not earned before reaching the thresholds', () => {
    const badges = computeBadges([], {}, 0);
    expect(badges.every((b) => !b.earned)).toBe(true);
  });

  it('earns the streak badge once the streak reaches 7', () => {
    const badges = computeBadges([], {}, 7);
    expect(badges.find((b) => b.id === 'sieben_tage_serie')?.earned).toBe(true);
  });

  it('earns the "100 Fragen" badge once enough answers have been recorded', () => {
    const progress: Record<string, CardProgress> = {};
    for (let i = 0; i < 10; i++) {
      let p = createInitialProgress(`q_${i}`, today);
      // 10 Antworten pro Frage x 10 Fragen = 100 Antworten insgesamt.
      for (let j = 0; j < 10; j++) {
        p = updateCardProgress(p, 4, today);
      }
      progress[p.id] = p;
    }
    const badges = computeBadges([], progress, 0);
    expect(badges.find((b) => b.id === 'hundert_fragen')?.earned).toBe(true);
    expect(badges.find((b) => b.id === 'hundert_fragen')?.progress).toBe(100);
  });

  it('only counts mastered nematoden questions toward the "Nematoden-Meister" badge', () => {
    const nematodeQuestion = makeQuestion('q_nema', { tags: { class: ['nematoden'] } });
    const trematodeQuestion = makeQuestion('q_trema', { tags: { class: ['trematoden'] } });
    const masteredProgress = (id: string): CardProgress => ({
      ...createInitialProgress(id, today),
      repetitions: 5,
      ease: 2.6,
    });

    const badges = computeBadges(
      [nematodeQuestion, trematodeQuestion],
      { q_nema: masteredProgress('q_nema'), q_trema: masteredProgress('q_trema') },
      0,
    );
    expect(badges.find((b) => b.id === 'nematoden_meister')?.progress).toBe(1);
  });
});

describe('countAnsweredToday', () => {
  const today = new Date('2026-01-10T00:00:00.000Z');
  const yesterday = new Date('2026-01-09T00:00:00.000Z');

  it('counts only answers from today across all cards', () => {
    let q1 = createInitialProgress('q_1', yesterday);
    q1 = updateCardProgress(q1, 4, yesterday);
    q1 = updateCardProgress(q1, 4, today);

    let q2 = createInitialProgress('q_2', today);
    q2 = updateCardProgress(q2, 1, today);

    expect(countAnsweredToday({ q_1: q1, q_2: q2 }, today)).toBe(2);
  });

  it('returns 0 when nothing was answered today', () => {
    let q1 = createInitialProgress('q_1', yesterday);
    q1 = updateCardProgress(q1, 4, yesterday);
    expect(countAnsweredToday({ q_1: q1 }, today)).toBe(0);
  });
});
