import { useState } from 'react';
import { de } from '../../i18n/de';
import type { OrderingQuestion as OrderingQuestionType } from '../../types';
import { PrimaryButton } from '../PrimaryButton';
import type { QuestionTypeProps } from './types';

export function OrderingQuestion({ question, submitted, onSubmit }: QuestionTypeProps<OrderingQuestionType>) {
  const [builtOrder, setBuiltOrder] = useState<number[]>([]);

  const remaining = question.items
    .map((_, index) => index)
    .filter((index) => !builtOrder.includes(index));

  function addItem(itemIndex: number) {
    if (submitted) return;
    setBuiltOrder((prev) => [...prev, itemIndex]);
  }

  function reset() {
    setBuiltOrder([]);
  }

  function handleCheck() {
    const correct = builtOrder.every((itemIndex, position) => itemIndex === question.correctOrder[position]);
    onSubmit(correct);
  }

  const allPlaced = builtOrder.length === question.items.length;

  return (
    <div>
      <p className="text-lg font-medium">{question.prompt}</p>
      {!submitted && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{de.quiz.orderingHint}</p>}

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{de.quiz.orderingYourOrder}</p>
        <ol className="mt-2 flex flex-col gap-2">
          {builtOrder.map((itemIndex, position) => {
            const isCorrectPosition = submitted && itemIndex === question.correctOrder[position];
            const isWrongPosition = submitted && !isCorrectPosition;
            return (
              <li
                key={position}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  isCorrectPosition
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                    : isWrongPosition
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950'
                      : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                {position + 1}. {question.items[itemIndex]}
              </li>
            );
          })}
          {builtOrder.length === 0 && (
            <li className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-400 dark:border-slate-700">
              —
            </li>
          )}
        </ol>
      </div>

      {!submitted && remaining.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {remaining.map((itemIndex) => (
            <button
              key={itemIndex}
              type="button"
              onClick={() => addItem(itemIndex)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:border-teal-400 dark:border-slate-700"
            >
              {question.items[itemIndex]}
            </button>
          ))}
        </div>
      )}

      {submitted && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {de.quiz.correctAnswerLabel}: {question.correctOrder.map((itemIndex) => question.items[itemIndex]).join(' → ')}
        </p>
      )}

      {!submitted && (
        <div className="mt-4 flex items-center gap-3">
          <PrimaryButton onClick={handleCheck} disabled={!allPlaced}>
            {de.quiz.checkAnswer}
          </PrimaryButton>
          <button type="button" onClick={reset} className="text-sm text-slate-500 underline dark:text-slate-400">
            {de.quiz.orderingReset}
          </button>
        </div>
      )}
    </div>
  );
}
