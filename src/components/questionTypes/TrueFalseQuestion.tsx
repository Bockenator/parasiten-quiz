import { useState } from 'react';
import { de } from '../../i18n/de';
import type { TrueFalseQuestion as TrueFalseQuestionType } from '../../types';
import { PrimaryButton } from '../PrimaryButton';
import type { QuestionTypeProps } from './types';
import { optionButtonClasses } from './optionStyles';

export function TrueFalseQuestion({ question, submitted, onSubmit }: QuestionTypeProps<TrueFalseQuestionType>) {
  const [selected, setSelected] = useState<boolean | null>(null);

  function handleCheck() {
    if (selected === null) return;
    onSubmit(selected === question.answer);
  }

  function stateFor(value: boolean): 'idle' | 'selected' | 'correct' | 'incorrect' {
    if (submitted) {
      if (value === question.answer) return 'correct';
      if (value === selected) return 'incorrect';
      return 'idle';
    }
    return value === selected ? 'selected' : 'idle';
  }

  return (
    <div>
      <p className="text-lg font-medium">{question.prompt}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={submitted}
          onClick={() => setSelected(true)}
          className={`${optionButtonClasses(stateFor(true))} text-center font-medium`}
        >
          {de.quiz.trueLabel}
        </button>
        <button
          type="button"
          disabled={submitted}
          onClick={() => setSelected(false)}
          className={`${optionButtonClasses(stateFor(false))} text-center font-medium`}
        >
          {de.quiz.falseLabel}
        </button>
      </div>
      {!submitted && (
        <PrimaryButton className="mt-4" onClick={handleCheck} disabled={selected === null}>
          {de.quiz.checkAnswer}
        </PrimaryButton>
      )}
    </div>
  );
}
