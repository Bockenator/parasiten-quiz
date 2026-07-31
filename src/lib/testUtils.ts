import type { Importance, Question, Tags } from '../types';

/** Minimale, gültige Testfrage (true_false) für Unit-Tests außerhalb von questions.json. */
export function makeQuestion(id: string, overrides: Partial<{ importance: Importance; tags: Partial<Tags> }> = {}): Question {
  return {
    id,
    type: 'true_false',
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
    difficulty: 'mittel',
    explanation: 'Weil...',
    source: 'Testquelle',
    needsReview: false,
    image: null,
    answer: true,
  };
}
