// Kapselt sämtlichen Zugriff auf localStorage. Ein späterer Wechsel auf einen
// Server-Speicher (z.B. Supabase, siehe CLAUDE.md) soll nur diese Datei betreffen.
import {
  categorySelectionSchema,
  defaultCategorySelection,
  progressMapSchema,
  type CardProgress,
  type CategorySelection,
  type ProgressMap,
} from '../types';

const PROGRESS_KEY = 'paraquiz:progress:v1';
const CATEGORY_SELECTION_KEY = 'paraquiz:categorySelection:v1';

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // z.B. Privater Modus oder voller Speicher — Wert bleibt dann auf diese Session beschränkt.
  }
}

function readProgressMap(): ProgressMap {
  const raw = readJson(PROGRESS_KEY);
  if (raw === undefined) return {};
  const result = progressMapSchema.safeParse(raw);
  return result.success ? result.data : {};
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
  writeJson(PROGRESS_KEY, map);
}

export function resetAllProgress(): void {
  writeJson(PROGRESS_KEY, {});
}

export function getCategorySelection(): CategorySelection {
  const raw = readJson(CATEGORY_SELECTION_KEY);
  if (raw === undefined) return defaultCategorySelection;
  const result = categorySelectionSchema.safeParse(raw);
  return result.success ? result.data : defaultCategorySelection;
}

export function saveCategorySelection(selection: CategorySelection): void {
  writeJson(CATEGORY_SELECTION_KEY, selection);
}
