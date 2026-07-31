import { describe, expect, it } from 'vitest';
import type { ProgressMap } from '../types';
import { createInitialProgress, updateCardProgress } from './srs';
import { selectExamSession, selectLearnSession } from './selectSession';
import { makeQuestion } from './testUtils';

const today = new Date('2026-01-10T00:00:00.000Z');

describe('selectLearnSession', () => {
  it('puts due cards before brand-new cards, and both before not-yet-due cards', () => {
    const dueQuestion = makeQuestion('due');
    const newQuestion = makeQuestion('new');
    const soonDueQuestion = makeQuestion('soon-due');

    const progress: ProgressMap = {
      due: { ...createInitialProgress('due', today), due: '2026-01-09' },
      'soon-due': { ...createInitialProgress('soon-due', today), due: '2026-01-20' },
    };

    const session = selectLearnSession([soonDueQuestion, newQuestion, dueQuestion], progress, { today });
    expect(session.map((q) => q.id)).toEqual(['due', 'new', 'soon-due']);
  });

  it('sorts due cards by ease ascending (weakest first)', () => {
    const strong = makeQuestion('strong');
    const weak = makeQuestion('weak');
    const progress: ProgressMap = {
      strong: { ...createInitialProgress('strong', today), due: '2026-01-01', ease: 2.8 },
      weak: { ...createInitialProgress('weak', today), due: '2026-01-01', ease: 1.4 },
    };

    const session = selectLearnSession([strong, weak], progress, { today });
    expect(session.map((q) => q.id)).toEqual(['weak', 'strong']);
  });

  it('introduces new cards by importance, highest first', () => {
    const low = makeQuestion('low', { importance: 1 });
    const high = makeQuestion('high', { importance: 3 });
    const mid = makeQuestion('mid', { importance: 2 });

    const session = selectLearnSession([low, mid, high], {}, { today, maxNew: 3 });
    expect(session.map((q) => q.id)).toEqual(['high', 'mid', 'low']);
  });

  it('limits new cards to maxNew', () => {
    const questions = Array.from({ length: 5 }, (_, i) => makeQuestion(`q_${i}`, { importance: 2 }));
    const session = selectLearnSession(questions, {}, { today, maxNew: 2 });
    expect(session).toHaveLength(2);
  });

  it('caps the total session size', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q_${i}`, { importance: 2 }));
    const session = selectLearnSession(questions, {}, { today, maxNew: 10, sessionSize: 3 });
    expect(session).toHaveLength(3);
  });

  it('a question answered incorrectly becomes due again sooner than one answered correctly twice', () => {
    const question = makeQuestion('q_1');
    const other = makeQuestion('q_2');

    // q_1: einmal falsch -> Intervall 1 Tag. q_2: zweimal richtig -> Intervall 6 Tage.
    const wrongProgress = updateCardProgress(createInitialProgress('q_1', today), 1, today);
    const rightProgress = updateCardProgress(
      updateCardProgress(createInitialProgress('q_2', today), 4, today),
      4,
      today,
    );
    const progress: ProgressMap = { q_1: wrongProgress, q_2: rightProgress };

    const tomorrow = new Date('2026-01-11T00:00:00.000Z');
    const session = selectLearnSession([question, other], progress, { today: tomorrow });
    // q_1 ist faellig und kommt vor q_2, das erst als Luecken-Fueller (noch nicht faellig) folgt.
    expect(session.map((q) => q.id)).toEqual(['q_1', 'q_2']);
  });

  it('excludes weight-0 types entirely, even overdue cards of that type', () => {
    const dueFlashcard = makeQuestion('due_fc', { type: 'flashcard' });
    const progress: ProgressMap = {
      due_fc: { ...createInitialProgress('due_fc', today), due: '2026-01-01' },
    };
    const session = selectLearnSession([dueFlashcard], progress, { today, typeWeights: { flashcard: 0 } });
    expect(session).toHaveLength(0);
  });

  it('introduces more heavily-weighted new-card types when maxNew limits the selection', () => {
    const heavy = Array.from({ length: 10 }, (_, i) => makeQuestion(`heavy_${i}`, { type: 'matching', importance: 2 }));
    const light = Array.from({ length: 10 }, (_, i) => makeQuestion(`light_${i}`, { type: 'flashcard', importance: 2 }));

    // Einzelne Ziehungen streuen; über viele Durchläufe gemittelt ist das
    // Ergebnis stabil und robust gegen Zufallsschwankungen (kein Flaky-Test).
    let totalHeavy = 0;
    const trials = 30;
    for (let i = 0; i < trials; i++) {
      const session = selectLearnSession([...heavy, ...light], {}, {
        today,
        maxNew: 8,
        typeWeights: { matching: 3, flashcard: 1 },
      });
      totalHeavy += session.filter((q) => q.type === 'matching').length;
    }
    // Gleichverteilung würde im Schnitt 4 von 8 ergeben; bei Gewicht 3:1 deutlich mehr.
    expect(totalHeavy / trials).toBeGreaterThan(5);
  });
});

describe('selectExamSession', () => {
  it('returns the requested number of questions regardless of due dates', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q_${i}`));
    const session = selectExamSession(questions, 4);
    expect(session).toHaveLength(4);
  });

  it('returns all questions (shuffled) when count is "all"', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q_${i}`));
    const session = selectExamSession(questions, 'all');
    expect(session).toHaveLength(10);
    expect(new Set(session.map((q) => q.id))).toEqual(new Set(questions.map((q) => q.id)));
  });

  it('excludes question types with weight 0 entirely, even with count "all"', () => {
    const flashcards = Array.from({ length: 5 }, (_, i) => makeQuestion(`fc_${i}`, { type: 'flashcard' }));
    const trueFalse = Array.from({ length: 5 }, (_, i) => makeQuestion(`tf_${i}`, { type: 'true_false' }));
    const session = selectExamSession([...flashcards, ...trueFalse], 'all', { flashcard: 0, true_false: 2 });
    expect(session).toHaveLength(5);
    expect(session.every((q) => q.type === 'true_false')).toBe(true);
  });

  it('picks heavily-weighted types far more often than lightly-weighted ones when count is limited', () => {
    const heavy = Array.from({ length: 20 }, (_, i) => makeQuestion(`heavy_${i}`, { type: 'matching' }));
    const light = Array.from({ length: 20 }, (_, i) => makeQuestion(`light_${i}`, { type: 'flashcard' }));

    // Einzelne Ziehungen streuen; über viele Durchläufe gemittelt ist das
    // Ergebnis stabil und robust gegen Zufallsschwankungen (kein Flaky-Test).
    let totalHeavy = 0;
    const trials = 30;
    for (let i = 0; i < trials; i++) {
      const session = selectExamSession([...heavy, ...light], 10, { matching: 3, flashcard: 1 });
      totalHeavy += session.filter((q) => q.type === 'matching').length;
    }
    // Gleichverteilung würde im Schnitt 5 von 10 ergeben; bei Gewicht 3:1 (Erwartungswert
    // ~7,5) deutlich mehr.
    expect(totalHeavy / trials).toBeGreaterThan(6);
  });
});
