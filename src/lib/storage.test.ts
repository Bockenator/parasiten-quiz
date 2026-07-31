import { beforeEach, describe, expect, it } from 'vitest';
import { defaultCategorySelection, defaultGamificationState, defaultSettings, type SessionResult } from '../types';
import { createInitialProgress } from './srs';
import {
  exportAllData,
  getAllProgress,
  getCategorySelection,
  getGamificationState,
  getLastSessionResult,
  getProgress,
  getSettings,
  importAllData,
  resetAllProgress,
  resetLearningProgress,
  saveCategorySelection,
  saveGamificationState,
  saveLastSessionResult,
  saveProgress,
  saveSettings,
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

  it('returns the default settings when nothing was saved yet', () => {
    expect(getSettings()).toEqual(defaultSettings);
  });

  it('round-trips saved settings', () => {
    const settings = { ...defaultSettings, theme: 'dark' as const, dailyGoal: 15 };
    saveSettings(settings);
    expect(getSettings()).toEqual(settings);
  });

  it('falls back to default settings when the stored value fails schema validation', () => {
    localStorage.setItem('paraquiz:settings:v1', JSON.stringify({ theme: 'purple' }));
    expect(getSettings()).toEqual(defaultSettings);
  });

  it('resetLearningProgress clears progress and gamification but keeps category selection and settings', () => {
    saveProgress(createInitialProgress('q_1'));
    saveGamificationState({ totalXp: 500, streak: { current: 10, longest: 10, lastStudyDate: '2026-01-10' } });
    saveLastSessionResult({
      mode: 'learn',
      completedAt: '2026-01-10T12:00:00.000Z',
      total: 5,
      correctCount: 5,
      xpEarned: 70,
      streakAfter: 10,
      wrongQuestionIds: [],
    });
    const selection = { ...defaultCategorySelection, class: ['nematoden'] };
    saveCategorySelection(selection);
    const settings = { ...defaultSettings, dailyGoal: 25 };
    saveSettings(settings);

    resetLearningProgress();

    expect(getAllProgress()).toEqual({});
    expect(getGamificationState()).toEqual(defaultGamificationState);
    expect(getLastSessionResult()).toBeUndefined();
    expect(getCategorySelection()).toEqual(selection);
    expect(getSettings()).toEqual(settings);
  });

  describe('exportAllData / importAllData', () => {
    it('exports the current state and re-imports it into a cleared store', () => {
      saveProgress(createInitialProgress('q_1', new Date('2026-01-01T00:00:00.000Z')));
      saveCategorySelection({ ...defaultCategorySelection, class: ['nematoden'] });
      saveGamificationState({ totalXp: 40, streak: { current: 2, longest: 2, lastStudyDate: '2026-01-05' } });
      saveSettings({ ...defaultSettings, theme: 'dark' });

      const exported = exportAllData();
      expect(exported.version).toBe(1);

      localStorage.clear();
      const result = importAllData(exported);

      expect(result.success).toBe(true);
      expect(getAllProgress()).toEqual(exported.progress);
      expect(getCategorySelection()).toEqual(exported.categorySelection);
      expect(getGamificationState()).toEqual(exported.gamification);
      expect(getSettings()).toEqual(exported.settings);
    });

    it('rejects data that does not match the expected shape and leaves storage untouched', () => {
      saveSettings({ ...defaultSettings, dailyGoal: 33 });
      const result = importAllData({ nonsense: true });
      expect(result.success).toBe(false);
      expect(getSettings().dailyGoal).toBe(33);
    });
  });
});
