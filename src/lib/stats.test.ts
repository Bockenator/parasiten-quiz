import { describe, expect, it } from 'vitest';
import type { Categories, ProgressMap } from '../types';
import { createInitialProgress, updateCardProgress } from './srs';
import { makeQuestion } from './testUtils';
import { computeClassStats, computeDailyActivity, computeOverallStats } from './stats';

const today = new Date('2026-01-10T00:00:00.000Z');

const categories: Categories = {
  dimensions: [
    {
      id: 'class',
      label: 'Parasitengruppe',
      values: [
        { id: 'trematoden', label: 'Trematoden' },
        { id: 'nematoden', label: 'Nematoden' },
      ],
    },
  ],
};

describe('computeClassStats', () => {
  it('reports totals per class and leaves unseen questions at zero', () => {
    const questions = [
      makeQuestion('q_1', { tags: { class: ['trematoden'] } }),
      makeQuestion('q_2', { tags: { class: ['nematoden'] } }),
      makeQuestion('q_3', { tags: { class: ['nematoden'] } }),
    ];
    const stats = computeClassStats(questions, {}, categories, today);

    expect(stats.find((s) => s.id === 'trematoden')).toMatchObject({ total: 1, seen: 0, mastered: 0, due: 0 });
    expect(stats.find((s) => s.id === 'nematoden')).toMatchObject({ total: 2, seen: 0, mastered: 0, due: 0 });
  });

  it('counts seen, mastered and due questions correctly', () => {
    const questions = [makeQuestion('q_1', { tags: { class: ['nematoden'] } })];
    let progress = createInitialProgress('q_1', today);
    progress = updateCardProgress(progress, 4, today);
    progress = updateCardProgress(progress, 4, today);
    progress = updateCardProgress(progress, 4, today); // 3x richtig -> repetitions 3, ease weiterhin >= 2.3 -> mastered
    const progressMap: ProgressMap = { q_1: progress };

    const stats = computeClassStats(questions, progressMap, categories, today);
    const nematodenStat = stats.find((s) => s.id === 'nematoden')!;
    expect(nematodenStat.seen).toBe(1);
    expect(nematodenStat.mastered).toBe(1);
    expect(nematodenStat.accuracy).toBe(1);
  });

  it('computes accuracy across right and wrong answers', () => {
    const questions = [makeQuestion('q_1', { tags: { class: ['nematoden'] } })];
    let progress = createInitialProgress('q_1', today);
    progress = updateCardProgress(progress, 4, today); // richtig
    progress = updateCardProgress(progress, 1, today); // falsch
    const progressMap: ProgressMap = { q_1: progress };

    const stats = computeClassStats(questions, progressMap, categories, today);
    expect(stats.find((s) => s.id === 'nematoden')!.accuracy).toBe(0.5);
  });
});

describe('computeOverallStats', () => {
  it('aggregates across all questions regardless of class', () => {
    const questions = [
      makeQuestion('q_1', { tags: { class: ['trematoden'] } }),
      makeQuestion('q_2', { tags: { class: ['nematoden'] } }),
    ];
    const stats = computeOverallStats(questions, {}, today);
    expect(stats.total).toBe(2);
  });
});

describe('computeDailyActivity', () => {
  it('returns one entry per requested day, oldest first', () => {
    const activity = computeDailyActivity({}, 5, today);
    expect(activity).toHaveLength(5);
    expect(activity[activity.length - 1]?.date).toBe('2026-01-10');
    expect(activity.every((day) => day.count === 0)).toBe(true);
  });

  it('counts answers per day across all cards', () => {
    let progress = createInitialProgress('q_1', today);
    progress = updateCardProgress(progress, 4, today);
    const yesterday = new Date('2026-01-09T00:00:00.000Z');
    progress = updateCardProgress(progress, 4, yesterday);
    const progressMap: ProgressMap = { q_1: progress };

    const activity = computeDailyActivity(progressMap, 3, today);
    expect(activity.find((d) => d.date === '2026-01-09')?.count).toBe(1);
    expect(activity.find((d) => d.date === '2026-01-08')?.count).toBe(0);
  });
});
