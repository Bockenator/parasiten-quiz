import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialProgress } from './srs';
import { getAllProgress, getProgress, resetAllProgress, saveProgress } from './storage';

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
});
