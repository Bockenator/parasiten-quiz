import type { Importance, Question, QuestionType, Tags } from '../types';

type Overrides = Partial<{ importance: Importance; tags: Partial<Tags>; type: QuestionType }>;

/** Minimale, gültige Testfrage (Default: true_false) für Unit-Tests außerhalb von questions.json. */
export function makeQuestion(id: string, overrides: Overrides = {}): Question {
  const base = {
    id,
    prompt: `Testfrage ${id}`,
    parasite: 'Testparasit',
    tags: {
      class: ['trematoden'],
      subclass: [],
      host: ['wiederkaeuer'],
      topic: ['klinik'],
      flags: [],
      ...overrides.tags,
    },
    importance: overrides.importance ?? 2,
    difficulty: 'mittel' as const,
    explanation: 'Weil...',
    source: 'Testquelle',
    needsReview: false,
    image: null as string | null,
  };

  switch (overrides.type) {
    case 'single_choice':
    case 'case_vignette':
      return { ...base, type: overrides.type, options: ['A', 'B'], correctIndex: 0 };
    case 'image_id':
      return { ...base, type: 'image_id', image: 'x.png', options: ['A', 'B'], correctIndex: 0 };
    case 'multiple_choice':
      return { ...base, type: 'multiple_choice', options: ['A', 'B'], correctIndices: [0] };
    case 'cloze':
      return { ...base, type: 'cloze', answer: 'x' };
    case 'matching':
      return {
        ...base,
        type: 'matching',
        left: ['A', 'B'],
        right: ['1', '2'],
        correctPairs: [
          [0, 0],
          [1, 1],
        ],
      };
    case 'ordering':
      return { ...base, type: 'ordering', items: ['A', 'B'], correctOrder: [0, 1] };
    case 'flashcard':
      return { ...base, type: 'flashcard', front: 'F', back: 'B' };
    case 'true_false':
    default:
      return { ...base, type: 'true_false', answer: true };
  }
}
