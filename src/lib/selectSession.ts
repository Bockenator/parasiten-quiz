import type { ProgressMap, Question, QuestionTypeWeights } from '../types';
import { shuffle, weightedShuffle } from './random';
import { isDue } from './srs';

const DEFAULT_MAX_NEW = 20;
const DEFAULT_SESSION_SIZE = 20;
const DEFAULT_TYPE_WEIGHT = 2;

function typeWeightOf(question: Question, typeWeights?: QuestionTypeWeights): number {
  return typeWeights?.[question.type] ?? DEFAULT_TYPE_WEIGHT;
}

/** Fragen mit Gewicht 0 (Fragetypen-Mix "Nie") vollständig ausschließen. */
function excludeZeroWeightTypes(questions: Question[], typeWeights?: QuestionTypeWeights): Question[] {
  if (!typeWeights) return questions;
  return questions.filter((q) => typeWeightOf(q, typeWeights) > 0);
}

function orderByTypeWeight(questions: Question[], typeWeights?: QuestionTypeWeights): Question[] {
  return typeWeights ? weightedShuffle(questions, (q) => typeWeightOf(q, typeWeights)) : shuffle(questions);
}

export type LearnSessionOptions = {
  maxNew?: number;
  sessionSize?: number;
  today?: Date;
  /** Fragetypen-Mix (Kategorien-Seite): steuert Ausschluss (Gewicht 0) und
   * relative Häufigkeit unter den neuen bzw. bald fälligen Karten. Fällige
   * Karten werden davon unabhängig immer vollständig berücksichtigt, damit
   * die Spaced-Repetition-Terminierung nicht durch die Gewichtung unterlaufen wird. */
  typeWeights?: QuestionTypeWeights;
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
  const { maxNew = DEFAULT_MAX_NEW, sessionSize = DEFAULT_SESSION_SIZE, today = new Date(), typeWeights } = options;
  const pool = excludeZeroWeightTypes(questions, typeWeights);

  const due: Question[] = [];
  const notDueYet: Question[] = [];
  const brandNew: Question[] = [];

  for (const question of pool) {
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
  // Wichtigkeit bestimmt der Fragetypen-Mix, welche zuerst drankommen (Array.sort
  // ist stabil, die gewichtete Reihenfolge davor bleibt also innerhalb einer
  // Wichtigkeitsstufe erhalten).
  const newCards = orderByTypeWeight(brandNew, typeWeights)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, maxNew);

  // Bald fällige Karten als Lückenfüller. Der Fragetypen-Mix entscheidet, welche
  // der noch nicht fälligen Karten die verbleibenden Plätze füllen; erst danach
  // wird innerhalb dieser Auswahl nach Fälligkeitsdatum sortiert (nächstfällige
  // zuerst), damit die Gewichtung nicht durch das Datum überschrieben wird.
  const remainingSlots = Math.max(sessionSize - due.length - newCards.length, 0);
  const soonDue = orderByTypeWeight(notDueYet, typeWeights)
    .slice(0, remainingSlots)
    .sort((a, b) => {
      const dueA = progress[a.id]?.due ?? '';
      const dueB = progress[b.id]?.due ?? '';
      return dueA.localeCompare(dueB);
    });

  return [...due, ...newCards, ...soonDue].slice(0, sessionSize);
}

/**
 * Prüfungsmodus: ignoriert Fälligkeit, zieht einen zufälligen Satz aus den
 * übergebenen Fragen. `count: 'all'` liefert alle (gemischt). Der Fragetypen-Mix
 * schließt Gewicht-0-Typen aus und beeinflusst bei begrenztem `count`, welche
 * Typen bevorzugt in die Auswahl kommen.
 */
export function selectExamSession(
  questions: Question[],
  count: number | 'all' = 'all',
  typeWeights?: QuestionTypeWeights,
): Question[] {
  const pool = excludeZeroWeightTypes(questions, typeWeights);
  const ordered = orderByTypeWeight(pool, typeWeights);
  return count === 'all' ? ordered : ordered.slice(0, count);
}
