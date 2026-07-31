import { useState } from 'react';
import { de } from '../i18n/de';
import type { Question } from '../types';
import { FeedbackBanner } from './FeedbackBanner';
import { PrimaryButton } from './PrimaryButton';
import { ChoiceQuestion } from './questionTypes/ChoiceQuestion';
import { MultipleChoiceQuestion } from './questionTypes/MultipleChoiceQuestion';
import { TrueFalseQuestion } from './questionTypes/TrueFalseQuestion';
import { ClozeQuestionView } from './questionTypes/ClozeQuestionView';
import { MatchingQuestion } from './questionTypes/MatchingQuestion';
import { OrderingQuestion } from './questionTypes/OrderingQuestion';
import { FlashcardQuestion } from './questionTypes/FlashcardQuestion';

type QuestionCardProps = {
  question: Question;
  onNext: (correct: boolean) => void;
};

export function QuestionCard({ question, onNext }: QuestionCardProps) {
  const [correct, setCorrect] = useState<boolean | null>(null);
  const submitted = correct !== null;

  function renderQuestion() {
    switch (question.type) {
      case 'single_choice':
        return <ChoiceQuestion question={question} submitted={submitted} onSubmit={setCorrect} />;
      case 'case_vignette':
        return (
          <ChoiceQuestion
            question={question}
            submitted={submitted}
            onSubmit={setCorrect}
            badge={de.quiz.caseVignetteLabel}
          />
        );
      case 'multiple_choice':
        return <MultipleChoiceQuestion question={question} submitted={submitted} onSubmit={setCorrect} />;
      case 'true_false':
        return <TrueFalseQuestion question={question} submitted={submitted} onSubmit={setCorrect} />;
      case 'cloze':
        return <ClozeQuestionView question={question} submitted={submitted} onSubmit={setCorrect} />;
      case 'matching':
        return <MatchingQuestion question={question} submitted={submitted} onSubmit={setCorrect} />;
      case 'ordering':
        return <OrderingQuestion question={question} submitted={submitted} onSubmit={setCorrect} />;
      case 'flashcard':
        return <FlashcardQuestion question={question} submitted={submitted} onSubmit={setCorrect} />;
      case 'image_id':
        // Keine Bilder in der Fragenbank vorhanden (siehe CLAUDE.md) — Typ wird aktuell nicht generiert.
        return null;
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
      {renderQuestion()}
      {submitted && (
        <>
          <FeedbackBanner correct={correct} explanation={question.explanation} source={question.source} />
          <PrimaryButton className="mt-4 w-full" onClick={() => onNext(correct)}>
            {de.quiz.next}
          </PrimaryButton>
        </>
      )}
    </div>
  );
}
