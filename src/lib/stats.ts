import { addDays, isDue, isMastered, toDateKey } from './srs';
import type { CardProgress, Categories, ProgressMap, Question } from '../types';

export type Stat = {
  total: number;
  seen: number;
  mastered: number;
  due: number;
  accuracy: number; // 0..1, 0 wenn noch keine Antworten vorliegen
};

export type CategoryStat = Stat & { id: string; label: string };

function computeStat(questionsInGroup: Question[], progress: ProgressMap, today: Date): Stat {
  const progressEntries = questionsInGroup
    .map((q) => progress[q.id])
    .filter((p): p is CardProgress => p !== undefined);

  const seen = progressEntries.length;
  const mastered = progressEntries.filter(isMastered).length;
  const due = progressEntries.filter((p) => isDue(p, today)).length;
  const totalAnswers = progressEntries.reduce((sum, p) => sum + p.history.length, 0);
  const correctAnswers = progressEntries.reduce(
    (sum, p) => sum + p.history.filter((h) => h.quality >= 3).length,
    0,
  );

  return {
    total: questionsInGroup.length,
    seen,
    mastered,
    due,
    accuracy: totalAnswers > 0 ? correctAnswers / totalAnswers : 0,
  };
}

/** Fortschritt pro Parasitengruppe (Dimension A, die "Hauptachse" laut Plan Abschnitt 5). */
export function computeClassStats(
  questions: Question[],
  progress: ProgressMap,
  categories: Categories,
  today: Date = new Date(),
): CategoryStat[] {
  const classDimension = categories.dimensions.find((d) => d.id === 'class');
  if (!classDimension) return [];

  return classDimension.values.map((value) => ({
    id: value.id,
    label: value.label,
    ...computeStat(
      questions.filter((q) => q.tags.class.includes(value.id)),
      progress,
      today,
    ),
  }));
}

export function computeOverallStats(questions: Question[], progress: ProgressMap, today: Date = new Date()): Stat {
  return computeStat(questions, progress, today);
}

export type ActivityDay = { date: string; count: number };

/** Anzahl beantworteter Fragen pro Tag der letzten `days` Tage (für den Verlaufs-Chart). */
export function computeDailyActivity(progress: ProgressMap, days = 14, today: Date = new Date()): ActivityDay[] {
  const countsByDate = new Map<string, number>();
  for (const cardProgress of Object.values(progress)) {
    for (const entry of cardProgress.history) {
      countsByDate.set(entry.date, (countsByDate.get(entry.date) ?? 0) + 1);
    }
  }

  const result: ActivityDay[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = toDateKey(addDays(today, -offset));
    result.push({ date, count: countsByDate.get(date) ?? 0 });
  }
  return result;
}
