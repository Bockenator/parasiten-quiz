import { useState } from 'react';
import { de } from '../../i18n/de';
import type { FlashcardQuestion as FlashcardQuestionType } from '../../types';
import { PrimaryButton } from '../PrimaryButton';
import type { QuestionTypeProps } from './types';

export function FlashcardQuestion({ question, submitted, onSubmit }: QuestionTypeProps<FlashcardQuestionType>) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <p className="text-lg font-medium">{question.front}</p>

      {(revealed || submitted) && (
        <div className="mt-4 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          {question.back}
        </div>
      )}

      {!revealed && !submitted && (
        <PrimaryButton className="mt-4" onClick={() => setRevealed(true)}>
          {de.quiz.flashcardShowAnswer}
        </PrimaryButton>
      )}

      {revealed && !submitted && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => onSubmit(false)}
            className="flex-1 rounded-lg border border-rose-400 px-4 py-2 font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950"
          >
            {de.quiz.flashcardDidNotKnow}
          </button>
          <PrimaryButton className="flex-1" onClick={() => onSubmit(true)}>
            {de.quiz.flashcardKnew}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
