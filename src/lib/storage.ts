// Kapselt sämtlichen Zugriff auf localStorage. Ein späterer Wechsel auf einen
// Server-Speicher (z.B. Supabase, siehe CLAUDE.md) soll nur diese Datei betreffen.
import { progressMapSchema, type CardProgress, type ProgressMap } from '../types';

const PROGRESS_KEY = 'paraquiz:progress:v1';

function readProgressMap(): ProgressMap {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const result = progressMapSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

function writeProgressMap(map: ProgressMap): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch {
    // z.B. Privater Modus oder voller Speicher — Fortschritt bleibt dann auf diese Session beschränkt.
  }
}

export function getAllProgress(): ProgressMap {
  return readProgressMap();
}

export function getProgress(questionId: string): CardProgress | undefined {
  return readProgressMap()[questionId];
}

export function saveProgress(progress: CardProgress): void {
  const map = readProgressMap();
  map[progress.id] = progress;
  writeProgressMap(map);
}

export function resetAllProgress(): void {
  writeProgressMap({});
}
