import type { Question } from '../types';
import { shuffle } from './random';

const DEFAULT_SESSION_SIZE = 15;

/**
 * Vorläufige Fragenauswahl für Phase 3 (manuelles Durchspielen aller Fragetypen).
 * Wird in Phase 4 durch die SM-2-gesteuerte Auswahl in selectSession.ts ersetzt.
 */
export function buildTempSession(all: Question[], size = DEFAULT_SESSION_SIZE): Question[] {
  const byType = new Map<string, Question[]>();
  for (const question of all) {
    const group = byType.get(question.type) ?? [];
    group.push(question);
    byType.set(question.type, group);
  }

  const oneOfEachType = [...byType.values()].map((group) => shuffle(group)[0]);
  const usedIds = new Set(oneOfEachType.map((q) => q.id));
  const remainingPool = shuffle(all.filter((q) => !usedIds.has(q.id)));
  const filler = remainingPool.slice(0, Math.max(0, size - oneOfEachType.length));

  return shuffle([...oneOfEachType, ...filler]);
}
