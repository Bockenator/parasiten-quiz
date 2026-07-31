import { categoryDimensionIds, type CategorySelection, type Question } from '../types';

/** UND zwischen Dimensionen, ODER innerhalb einer Dimension (Plan Abschnitt 5). Leere Dimension = kein Filter. */
export function matchesSelection(question: Question, selection: CategorySelection): boolean {
  if (selection.onlyTopImportance && question.importance !== 3) {
    return false;
  }

  return categoryDimensionIds.every((dimension) => {
    const selectedValues = selection[dimension];
    if (selectedValues.length === 0) return true;
    const questionValues = question.tags[dimension];
    return questionValues.some((value) => selectedValues.includes(value));
  });
}

export function filterQuestions(questions: Question[], selection: CategorySelection): Question[] {
  return questions.filter((question) => matchesSelection(question, selection));
}
