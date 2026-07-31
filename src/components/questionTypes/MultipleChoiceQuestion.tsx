import { useMemo, useState } from 'react';
import { de } from '../../i18n/de';
import type { MultipleChoiceQuestion as MultipleChoiceQuestionType } from '../../types';
import { PrimaryButton } from '../PrimaryButton';
import type { QuestionTypeProps } from './types';
import { optionButtonClasses } from './optionStyles';
import { shuffleOptions } from '../../lib/shuffleOptions';

function arraysHaveSameMembers(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((value) => setB.has(value));
}

export function MultipleChoiceQuestion({ question, submitted, onSubmit }: QuestionTypeProps<MultipleChoiceQuestionType>) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  // Shuffled once per question instance (QuestionCard remounts via key={question.id}) so
  // the correct answers aren't always in the same positions as authored in the content.
  const { options, newIndexOf } = useMemo(() => shuffleOptions(question.options), [question.id, question.options]);
  const correctIndices = useMemo(
    () => question.correctIndices.map((index) => newIndexOf[index]),
    [question.correctIndices, newIndexOf],
  );

  function toggle(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleCheck() {
    onSubmit(arraysHaveSameMembers([...selected], correctIndices));
  }

  return (
    <div>
      <p className="text-lg font-medium">{question.prompt}</p>
      <div className="mt-4 flex flex-col gap-2">
        {options.map((option, index) => {
          const isSelected = selected.has(index);
          const isCorrectOption = correctIndices.includes(index);
          let state: 'idle' | 'selected' | 'correct' | 'incorrect' = 'idle';
          if (submitted) {
            state = isCorrectOption ? 'correct' : isSelected ? 'incorrect' : 'idle';
          } else if (isSelected) {
            state = 'selected';
          }
          return (
            <button
              key={index}
              type="button"
              disabled={submitted}
              onClick={() => toggle(index)}
              className={`flex items-center ${optionButtonClasses(state)}`}
            >
              <span
                aria-hidden="true"
                className={`mr-3 inline-block h-4 w-4 flex-shrink-0 rounded border-2 ${
                  isSelected ? 'border-teal-600 bg-teal-600' : 'border-slate-400 dark:border-slate-500'
                }`}
              />
              {option}
            </button>
          );
        })}
      </div>
      {!submitted && (
        <PrimaryButton className="mt-4" onClick={handleCheck} disabled={selected.size === 0}>
          {de.quiz.checkAnswer}
        </PrimaryButton>
      )}
    </div>
  );
}
