import { addDays, isMastered, toDateKey } from './srs';
import type { ProgressMap, Question, StreakState } from '../types';

export const XP_PER_CORRECT_ANSWER = 10;
export const XP_SESSION_COMPLETION_BONUS = 20;
const XP_PER_LEVEL = 100;

export function computeXpEarned(correctCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return correctCount * XP_PER_CORRECT_ANSWER + XP_SESSION_COMPLETION_BONUS;
}

export function levelForXp(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

export function xpIntoCurrentLevel(totalXp: number): number {
  return totalXp % XP_PER_LEVEL;
}

/** Serie fortschreiben: gleicher Tag = unverändert, Vortag = +1, sonst Reset auf 1. */
export function updateStreak(streak: StreakState, today: Date = new Date()): StreakState {
  const todayKey = toDateKey(today);
  if (streak.lastStudyDate === todayKey) {
    return streak;
  }
  const yesterdayKey = toDateKey(addDays(today, -1));
  const current = streak.lastStudyDate === yesterdayKey ? streak.current + 1 : 1;
  return { current, longest: Math.max(streak.longest, current), lastStudyDate: todayKey };
}

export function countAnsweredToday(progress: ProgressMap, today: Date = new Date()): number {
  const todayKey = toDateKey(today);
  return Object.values(progress).reduce(
    (sum, p) => sum + p.history.filter((h) => h.date === todayKey).length,
    0,
  );
}

/** Deutsche Notenskala 1 (sehr gut) bis 6 (ungenügend) für den Prüfungsmodus. */
export function gradeForAccuracy(accuracy: number): number {
  if (accuracy >= 0.92) return 1;
  if (accuracy >= 0.81) return 2;
  if (accuracy >= 0.67) return 3;
  if (accuracy >= 0.5) return 4;
  if (accuracy >= 0.3) return 5;
  return 6;
}

export const ANSWERED_BADGE_THRESHOLD = 100;
export const STREAK_BADGE_THRESHOLD = 7;
export const NEMATODE_MASTERY_BADGE_THRESHOLD = 20;

export type BadgeId = 'hundert_fragen' | 'sieben_tage_serie' | 'nematoden_meister';

export type Badge = {
  id: BadgeId;
  earned: boolean;
  progress: number;
  threshold: number;
};

/** Reine Berechnung — Texte für die Abzeichen leben zentral in i18n/de.ts. */
export function computeBadges(questions: Question[], progress: ProgressMap, currentStreak: number): Badge[] {
  const progressEntries = Object.values(progress);
  const totalAnswered = progressEntries.reduce((sum, p) => sum + p.history.length, 0);

  const questionById = new Map(questions.map((q) => [q.id, q]));
  const masteredNematodeCount = progressEntries.filter((p) => {
    if (!isMastered(p)) return false;
    return questionById.get(p.id)?.tags.class.includes('nematoden') ?? false;
  }).length;

  return [
    {
      id: 'hundert_fragen',
      earned: totalAnswered >= ANSWERED_BADGE_THRESHOLD,
      progress: totalAnswered,
      threshold: ANSWERED_BADGE_THRESHOLD,
    },
    {
      id: 'sieben_tage_serie',
      earned: currentStreak >= STREAK_BADGE_THRESHOLD,
      progress: currentStreak,
      threshold: STREAK_BADGE_THRESHOLD,
    },
    {
      id: 'nematoden_meister',
      earned: masteredNematodeCount >= NEMATODE_MASTERY_BADGE_THRESHOLD,
      progress: masteredNematodeCount,
      threshold: NEMATODE_MASTERY_BADGE_THRESHOLD,
    },
  ];
}
