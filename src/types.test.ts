import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { categoriesSchema, questionSchema, questionsSchema } from './types';

const baseFields = {
  id: 'q_test',
  prompt: 'Testfrage?',
  parasite: 'Fasciola hepatica',
  tags: {
    class: ['trematoden'],
    subclass: [],
    host: ['wiederkaeuer'],
    topic: ['diagnose'],
    flags: [],
  },
  importance: 3 as const,
  difficulty: 'mittel' as const,
  explanation: 'Weil...',
  source: 'Kap. 1',
  needsReview: false,
  image: null,
};

describe('questionSchema', () => {
  it('accepts a valid single_choice question', () => {
    const result = questionSchema.safeParse({
      ...baseFields,
      type: 'single_choice',
      options: ['A', 'B', 'C'],
      correctIndex: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects correctIndex out of bounds', () => {
    const result = questionSchema.safeParse({
      ...baseFields,
      type: 'single_choice',
      options: ['A', 'B'],
      correctIndex: 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate correctIndices for multiple_choice', () => {
    const result = questionSchema.safeParse({
      ...baseFields,
      type: 'multiple_choice',
      options: ['A', 'B', 'C'],
      correctIndices: [0, 0],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid multiple_choice question', () => {
    const result = questionSchema.safeParse({
      ...baseFields,
      type: 'multiple_choice',
      options: ['A', 'B', 'C'],
      correctIndices: [0, 2],
    });
    expect(result.success).toBe(true);
  });

  it('rejects ordering when correctOrder is not a permutation', () => {
    const result = questionSchema.safeParse({
      ...baseFields,
      type: 'ordering',
      items: ['Ei', 'Larve', 'Adult'],
      correctOrder: [0, 1, 1],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid ordering question', () => {
    const result = questionSchema.safeParse({
      ...baseFields,
      type: 'ordering',
      items: ['Ei', 'Larve', 'Adult'],
      correctOrder: [2, 0, 1],
    });
    expect(result.success).toBe(true);
  });

  it('rejects matching when a left index is missing from correctPairs', () => {
    const result = questionSchema.safeParse({
      ...baseFields,
      type: 'matching',
      left: ['Toxocara canis', 'Dirofilaria immitis'],
      right: ['Dünndarm', 'Herz/Lunge'],
      correctPairs: [
        [0, 0],
        [0, 1],
      ],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid matching question', () => {
    const result = questionSchema.safeParse({
      ...baseFields,
      type: 'matching',
      left: ['Toxocara canis', 'Dirofilaria immitis'],
      right: ['Dünndarm', 'Herz/Lunge'],
      correctPairs: [
        [0, 0],
        [1, 1],
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid flashcard question', () => {
    const result = questionSchema.safeParse({
      ...baseFields,
      type: 'flashcard',
      front: 'Endwirt von Echinococcus granulosus?',
      back: 'Hund (und andere Kanidae)',
    });
    expect(result.success).toBe(true);
  });

  it('requires image_id questions to have an image', () => {
    const result = questionSchema.safeParse({
      ...baseFields,
      type: 'image_id',
      options: ['A', 'B'],
      correctIndex: 0,
      image: null,
    });
    expect(result.success).toBe(false);
  });
});

describe('questionsSchema', () => {
  it('validates an array of questions and reports the failing index', () => {
    const result = questionsSchema.safeParse([
      { ...baseFields, type: 'true_false', answer: true },
      { ...baseFields, id: 'q_bad', type: 'single_choice', options: ['A'], correctIndex: 3 },
    ]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path[0]).toBe(1);
    }
  });
});

describe('categoriesSchema', () => {
  it('parses content/categories.json', () => {
    const raw = JSON.parse(readFileSync('content/categories.json', 'utf-8'));
    const result = categoriesSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });
});
