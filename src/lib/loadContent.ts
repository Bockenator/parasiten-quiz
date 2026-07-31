import { categoriesSchema, questionsSchema, type Categories, type Question } from '../types';

async function fetchJson(path: string): Promise<unknown> {
  const url = `${import.meta.env.BASE_URL}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Konnte ${url} nicht laden (${response.status}).`);
  }
  return response.json();
}

export async function loadQuestions(): Promise<Question[]> {
  const raw = await fetchJson('data/questions.json');
  const result = questionsSchema.safeParse(raw);
  if (!result.success) {
    throw new Error('Fragenbank ist ungültig (Schema-Fehler).');
  }
  return result.data;
}

export async function loadCategories(): Promise<Categories> {
  const raw = await fetchJson('data/categories.json');
  const result = categoriesSchema.safeParse(raw);
  if (!result.success) {
    throw new Error('Kategorien sind ungültig (Schema-Fehler).');
  }
  return result.data;
}
