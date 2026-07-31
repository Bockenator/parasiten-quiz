import { beforeEach, describe, expect, it } from 'vitest';
import { defaultCategorySelection, defaultGamificationState, type SessionResult } from '../types';
import { createInitialProgress } from './srs';
import {
  getAllProgress,
  getCategorySelection,
  getGamificationState,
  getLastSessionResult,
  getProgress,
  resetAllProgress,
  saveCategorySelection,
  saveGamificationState,
  saveLastSessionResult,
  saveProgress,
} from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('storage', () => {
  it('returns an empty map when nothing was saved yet', () => {
    expect(getAllProgress()).toEqual({});
    expect(getProgress('q_1')).toBeUndefined();
  });

  it('round-trips a saved progress entry', () => {
    const progress = createInitialProgress('q_1', new Date('2026-01-01T00:00:00.000Z'));
    saveProgress(progress);
    expect(getProgress('q_1')).toEqual(progress);
    expect(getAllProgress()).toEqual({ q_1: progress });
  });

  it('keeps entries for different questions independent', () => {
    saveProgress(createInitialProgress('q_1'));
    saveProgress(createInitialProgress('q_2'));
    const all = getAllProgress();
    expect(Object.keys(all).sort()).toEqual(['q_1', 'q_2']);
  });

  it('falls back to an empty map when the stored value is corrupted', () => {
    localStorage.setItem('paraquiz:progress:v1', 'not valid json{{{');
    expect(getAllProgress()).toEqual({});
  });

  it('falls back to an empty map when the stored value fails schema validation', () => {
    localStorage.setItem('paraquiz:progress:v1', JSON.stringify({ q_1: { nonsense: true } }));
    expect(getAllProgress()).toEqual({});
  });

  it('resetAllProgress clears all saved entries', () => {
    saveProgress(createInitialProgress('q_1'));
    resetAllProgress();
    expect(getAllProgress()).toEqual({});
  });

  it('returns the default (unfiltered) category selection when nothing was saved yet', () => {
    expect(getCategorySelection()).toEqual(defaultCategorySelection);
  });

  it('round-trips a saved category selection', () => {
    const selection = { ...defaultCategorySelection, class: ['nematoden'], flags: ['zoonose'] };
    saveCategorySelection(selection);
    expect(getCategorySelection()).toEqual(selection);
  });

  it('falls back to the default category selection when the stored value fails schema validation', () => {
    localStorage.setItem('paraquiz:categorySelection:v1', JSON.stringify({ nonsense: true }));
    expect(getCategorySelection()).toEqual(defaultCategorySelection);
  });

  it('returns the default gamification state when nothing was saved yet', () => {
    expect(getGamificationState()).toEqual(defaultGamificationState);
  });

  it('round-trips a saved gamification state', () => {
    const state = { totalXp: 150, streak: { current: 3, longest: 5, lastStudyDate: '2026-01-10' } };
    saveGamificationState(state);
    expect(getGamificationState()).toEqual(state);
  });

  it('falls back to the default gamification state when the stored value fails schema validation', () => {
    localStorage.setItem('paraquiz:gamification:v1', JSON.stringify({ nonsense: true }));
    expect(getGamificationState()).toEqual(defaultGamificationState);
  });

  it('returns undefined for the last session result when nothing was saved yet', () => {
    expect(getLastSessionResult()).toBeUndefined();
  });

  it('round-trips a saved session result', () => {
    const result: SessionResult = {
      mode: 'learn',
      completedAt: '2026-01-10T12:00:00.000Z',
      total: 20,
      correctCount: 15,
      xpEarned: 170,
      streakAfter: 4,
      wrongQuestionIds: ['q_1', 'q_2'],
    };
    saveLastSessionResult(result);
    expect(getLastSessionResult()).toEqual(result);
  });
});
