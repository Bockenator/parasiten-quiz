import { useState } from 'react';
import { de } from '../../i18n/de';
import type { CaseVignetteQuestion, SingleChoiceQuestion } from '../../types';
import { PrimaryButton } from '../PrimaryButton';
import type { QuestionTypeProps } from './types';
import { optionButtonClasses } from './optionStyles';

type Props = QuestionTypeProps<SingleChoiceQuestion | CaseVignetteQuestion> & { badge?: string };

export function ChoiceQuestion({ question, submitted, onSubmit, badge }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleCheck() {
    if (selected === null) return;
    onSubmit(selected === question.correctIndex);
  }

  return (
    <div>
      {badge && (
        <span className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          {badge}
        </span>
      )}
      <p className="text-lg font-medium">{question.prompt}</p>
      <div className="mt-4 flex flex-col gap-2">
        {question.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrectOption = index === question.correctIndex;
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
              onClick={() => setSelected(index)}
              className={optionButtonClasses(state)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {!submitted && (
        <PrimaryButton className="mt-4" onClick={handleCheck} disabled={selected === null}>
          {de.quiz.checkAnswer}
        </PrimaryButton>
      )}
    </div>
  );
}
