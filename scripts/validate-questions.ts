import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { categoriesSchema, questionSchema, type Categories } from '../src/types';

const CATEGORIES_PATH = 'content/categories.json';
const QUESTIONS_PATH = 'content/questions.json';
const IMAGES_DIR = 'public/images';

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

// 1. categories.json muss gültig sein — es ist die Referenzquelle für Tag-Prüfungen.
if (!existsSync(CATEGORIES_PATH)) {
  fail(`${CATEGORIES_PATH} fehlt.`);
}

const categoriesResult = categoriesSchema.safeParse(readJson(CATEGORIES_PATH));
if (!categoriesResult.success) {
  console.error(`✗ ${CATEGORIES_PATH} ist ungültig:`);
  for (const issue of categoriesResult.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const categories: Categories = categoriesResult.data;
const allowedValuesByDimension = new Map<string, Set<string>>(
  categories.dimensions.map((dim) => [dim.id, new Set(dim.values.map((v) => v.id))]),
);

console.log(`✓ ${CATEGORIES_PATH} ist gültig (${categories.dimensions.length} Dimensionen).`);

// 2. questions.json ist erst ab Phase 2 vorhanden.
if (!existsSync(QUESTIONS_PATH)) {
  console.log(`${QUESTIONS_PATH} existiert noch nicht — Fragenbank folgt in Phase 2.`);
  process.exit(0);
}

const questionsRaw = readJson(QUESTIONS_PATH);
if (!Array.isArray(questionsRaw)) {
  fail(`${QUESTIONS_PATH} muss ein Array von Fragen sein.`);
}

let hasErrors = false;
let needsReviewCount = 0;
const seenIds = new Map<string, number>();

// Jede Frage wird einzeln geprüft, damit ein Schema-Fehler bei einer Frage
// nicht die ID-/Tag-/Bild-Prüfung der übrigen Fragen verdeckt.
questionsRaw.forEach((raw, index) => {
  const rawId = (raw as { id?: unknown })?.id;
  const label = `Frage ${index}${typeof rawId === 'string' ? ` (${rawId})` : ''}`;

  const result = questionSchema.safeParse(raw);
  if (!result.success) {
    hasErrors = true;
    for (const issue of result.error.issues) {
      console.error(`  - ${label}: [${issue.path.join('.') || '(root)'}] ${issue.message}`);
    }
  } else if (result.data.needsReview) {
    needsReviewCount += 1;
  }

  if (typeof rawId === 'string') {
    if (seenIds.has(rawId)) {
      hasErrors = true;
      console.error(`  - ${label}: ID ist doppelt vergeben (zuerst bei Index ${seenIds.get(rawId)}).`);
    } else {
      seenIds.set(rawId, index);
    }
  }

  const tags = (raw as { tags?: Record<string, unknown> })?.tags;
  if (tags && typeof tags === 'object') {
    for (const [dimensionId, values] of Object.entries(tags)) {
      const allowed = allowedValuesByDimension.get(dimensionId);
      if (!allowed || !Array.isArray(values)) continue;
      for (const value of values) {
        if (typeof value === 'string' && !allowed.has(value)) {
          hasErrors = true;
          console.error(`  - ${label}: tags.${dimensionId} referenziert unbekannten Wert "${value}".`);
        }
      }
    }
  }

  const image = (raw as { image?: unknown })?.image;
  if (typeof image === 'string' && !existsSync(join(IMAGES_DIR, image.replace(/^images\//, '')))) {
    hasErrors = true;
    console.error(`  - ${label}: image "${image}" existiert nicht unter ${IMAGES_DIR}/.`);
  }
});

if (hasErrors) {
  console.error(`✗ Validierung fehlgeschlagen (${questionsRaw.length} Fragen geprüft).`);
  process.exit(1);
}

console.log(`✓ ${QUESTIONS_PATH}: ${questionsRaw.length} Fragen, davon ${needsReviewCount} mit needsReview.`);
console.log('✓ Validierung erfolgreich.');
