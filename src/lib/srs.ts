import type { CardProgress } from '../types';

const INITIAL_EASE = 2.5;
const MIN_EASE = 1.3;
const MASTERED_MIN_REPETITIONS = 3;
const MASTERED_MIN_EASE = 2.3;

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Vereinfachte Ableitung der SM-2-Bewertung (0-5) aus richtig/falsch. */
export function qualityFromCorrect(correct: boolean): number {
  return correct ? 4 : 1;
}

export function createInitialProgress(id: string, today: Date = new Date()): CardProgress {
  return {
    id,
    ease: INITIAL_EASE,
    intervalDays: 0,
    repetitions: 0,
    due: toDateKey(today),
    lastQuality: 0,
    history: [],
  };
}

/** SM-2-Update nach Parasiten-Quiz_Implementation-Plan.md, Abschnitt 8. */
export function updateCardProgress(progress: CardProgress, quality: number, today: Date = new Date()): CardProgress {
  let { ease, intervalDays, repetitions } = progress;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ease);
  }

  ease = Math.max(MIN_EASE, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  return {
    ...progress,
    ease,
    intervalDays,
    repetitions,
    due: toDateKey(addDays(today, intervalDays)),
    lastQuality: quality,
    history: [...progress.history, { date: toDateKey(today), quality }],
  };
}

export function isDue(progress: CardProgress, today: Date = new Date()): boolean {
  return progress.due <= toDateKey(today);
}

export function isMastered(progress: CardProgress): boolean {
  return progress.repetitions >= MASTERED_MIN_REPETITIONS && progress.ease >= MASTERED_MIN_EASE;
}
