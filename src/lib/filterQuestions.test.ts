import { describe, expect, it } from 'vitest';
import { defaultCategorySelection } from '../types';
import { filterQuestions, matchesSelection } from './filterQuestions';
import { makeQuestion } from './testUtils';

describe('matchesSelection', () => {
  it('matches everything when the selection is empty (no filter)', () => {
    const question = makeQuestion('q_1');
    expect(matchesSelection(question, defaultCategorySelection)).toBe(true);
  });

  it('filters by a single dimension', () => {
    const nematode = makeQuestion('q_1', { tags: { class: ['nematoden'] } });
    const trematode = makeQuestion('q_2', { tags: { class: ['trematoden'] } });
    const selection = { ...defaultCategorySelection, class: ['nematoden'] };

    expect(matchesSelection(nematode, selection)).toBe(true);
    expect(matchesSelection(trematode, selection)).toBe(false);
  });

  it('combines multiple values within one dimension with OR', () => {
    const dog = makeQuestion('q_1', { tags: { host: ['hund'] } });
    const cat = makeQuestion('q_2', { tags: { host: ['katze'] } });
    const horse = makeQuestion('q_3', { tags: { host: ['pferd'] } });
    const selection = { ...defaultCategorySelection, host: ['hund', 'katze'] };

    expect(matchesSelection(dog, selection)).toBe(true);
    expect(matchesSelection(cat, selection)).toBe(true);
    expect(matchesSelection(horse, selection)).toBe(false);
  });

  it('combines multiple dimensions with AND', () => {
    const question = makeQuestion('q_1', {
      tags: { class: ['nematoden'], host: ['hund'], flags: ['zoonose'] },
    });
    const matchingSelection = {
      ...defaultCategorySelection,
      class: ['nematoden'],
      host: ['hund'],
    };
    const nonMatchingSelection = {
      ...defaultCategorySelection,
      class: ['nematoden'],
      host: ['katze'],
    };

    expect(matchesSelection(question, matchingSelection)).toBe(true);
    expect(matchesSelection(question, nonMatchingSelection)).toBe(false);
  });

  it('applies the "Nur ***" quick filter on importance, independent of tags', () => {
    const important = makeQuestion('q_1', { importance: 3 });
    const minor = makeQuestion('q_2', { importance: 1 });
    const selection = { ...defaultCategorySelection, onlyTopImportance: true };

    expect(matchesSelection(important, selection)).toBe(true);
    expect(matchesSelection(minor, selection)).toBe(false);
  });

  it('a nematoden subclass filter excludes trematoden/zestoden questions (empty subclass tag)', () => {
    const nematode = makeQuestion('q_1', { tags: { class: ['nematoden'], subclass: ['hakenwuermer'] } });
    const trematode = makeQuestion('q_2', { tags: { class: ['trematoden'], subclass: [] } });
    const selection = { ...defaultCategorySelection, subclass: ['hakenwuermer'] };

    expect(matchesSelection(nematode, selection)).toBe(true);
    expect(matchesSelection(trematode, selection)).toBe(false);
  });
});

describe('filterQuestions', () => {
  it('returns only the questions matching the selection', () => {
    const questions = [
      makeQuestion('q_1', { tags: { flags: ['zoonose'] } }),
      makeQuestion('q_2', { tags: { flags: [] } }),
    ];
    const selection = { ...defaultCategorySelection, flags: ['zoonose'] };
    expect(filterQuestions(questions, selection).map((q) => q.id)).toEqual(['q_1']);
  });

  it('returns everything unfiltered by default', () => {
    const questions = [makeQuestion('q_1'), makeQuestion('q_2')];
    expect(filterQuestions(questions, defaultCategorySelection)).toHaveLength(2);
  });
});
