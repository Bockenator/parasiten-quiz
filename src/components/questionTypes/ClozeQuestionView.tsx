import { useState } from 'react';
import { de } from '../../i18n/de';
import type { ClozeQuestion } from '../../types';
import { checkClozeAnswer } from '../../lib/cloze';
import { PrimaryButton } from '../PrimaryButton';
import type { QuestionTypeProps } from './types';

export function ClozeQuestionView({ question, submitted, onSubmit }: QuestionTypeProps<ClozeQuestion>) {
  const [value, setValue] = useState('');

  function handleCheck() {
    if (!value.trim()) return;
    onSubmit(checkClozeAnswer(value, question.answer, question.acceptedAnswers));
  }

  return (
    <div>
      <p className="text-lg font-medium">{question.prompt}</p>
      <input
        type="text"
        value={value}
        disabled={submitted}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') handleCheck();
        }}
        placeholder={de.quiz.clozePlaceholder}
        className={`mt-4 w-full rounded-lg border px-4 py-3 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-900 ${
          submitted
            ? checkClozeAnswer(value, question.answer, question.acceptedAnswers)
              ? 'border-teal-500'
              : 'border-rose-500'
            : 'border-slate-300 dark:border-slate-700'
        }`}
      />
      {submitted && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {de.quiz.correctAnswerLabel}: <span className="font-medium">{question.answer}</span>
        </p>
      )}
      {!submitted && (
        <PrimaryButton className="mt-4" onClick={handleCheck} disabled={!value.trim()}>
          {de.quiz.checkAnswer}
        </PrimaryButton>
      )}
    </div>
  );
}
