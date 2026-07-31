import { de } from '../i18n/de';

type FeedbackBannerProps = {
  correct: boolean;
  explanation: string;
  source: string;
};

export function FeedbackBanner({ correct, explanation, source }: FeedbackBannerProps) {
  return (
    <div
      role="status"
      className={`mt-4 rounded-lg border-l-4 p-4 ${
        correct
          ? 'border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-100'
          : 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-100'
      }`}
    >
      <p className="font-semibold">{correct ? de.quiz.correct : de.quiz.incorrect}</p>
      <p className="mt-1 text-sm">{explanation}</p>
      <p className="mt-2 text-xs opacity-70">
        {de.quiz.sourceLabel}: {source}
      </p>
    </div>
  );
}
