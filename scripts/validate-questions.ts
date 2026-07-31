import { existsSync, readFileSync } from 'node:fs';

// Volles Zod-Schema folgt in Phase 1, sobald src/types.ts existiert.
const questionsPath = 'content/questions.json';

if (!existsSync(questionsPath)) {
  console.log(
    'content/questions.json existiert noch nicht — Schema-Validierung startet ab Phase 1.',
  );
  process.exit(0);
}

const questions = JSON.parse(readFileSync(questionsPath, 'utf-8'));
console.log(`${questions.length} Fragen gefunden. Vollständige Schema-Prüfung folgt in Phase 1.`);
