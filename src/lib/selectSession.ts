import type { ProgressMap, Question } from '../types';
import { shuffle } from './random';
import { isDue } from './srs';

const DEFAULT_MAX_NEW = 20;
const DEFAULT_SESSION_SIZE = 20;

export type LearnSessionOptions = {
  maxNew?: number;
  sessionSize?: number;
  today?: Date;
};

/**
 * Lernmodus (Parasiten-Quiz_Implementation-Plan.md, Abschnitt 8): zieht bevorzugt
 * fällige Karten (schwächste zuerst), dann neue Karten (nach Wichtigkeit, auf
 * maxNew begrenzt), dann bald fällige Karten als Lückenfüller.
 */
export function selectLearnSession(
  questions: Question[],
  progress: ProgressMap,
  options: LearnSessionOptions = {},
): Question[] {
  const { maxNew = DEFAULT_MAX_NEW, sessionSize = DEFAULT_SESSION_SIZE, today = new Date() } = options;

  const due: Question[] = [];
  const notDueYet: Question[] = [];
  const brandNew: Question[] = [];

  for (const question of questions) {
    const cardProgress = progress[question.id];
    if (!cardProgress) {
      brandNew.push(question);
    } else if (isDue(cardProgress, today)) {
      due.push(question);
    } else {
      notDueYet.push(question);
    }
  }

  // Schwächste Karten (niedrigste Ease) zuerst.
  due.sort((a, b) => (progress[a.id]?.ease ?? 0) - (progress[b.id]?.ease ?? 0));

  // Neue Karten nach Wichtigkeit einführen (*** zuerst); innerhalb gleicher
  // Wichtigkeit zufällig (Array.sort ist stabil, shuffle davor genügt daher).
  const newCards = shuffle(brandNew)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, maxNew);

  // Bald fällige Karten als Lückenfüller, die nächstfälligen zuerst.
  const soonDue = shuffle(notDueYet).sort((a, b) => {
    const dueA = progress[a.id]?.due ?? '';
    const dueB = progress[b.id]?.due ?? '';
    return dueA.localeCompare(dueB);
  });

  return [...due, ...newCards, ...soonDue].slice(0, sessionSize);
}

/**
 * Prüfungsmodus: ignoriert Fälligkeit, zieht einen zufälligen Satz aus den
 * übergebenen Fragen. `count: 'all'` liefert alle (gemischt).
 */
export function selectExamSession(questions: Question[], count: number | 'all' = 'all'): Question[] {
  const shuffled = shuffle(questions);
  return count === 'all' ? shuffled : shuffled.slice(0, count);
}
