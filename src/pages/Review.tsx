import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { de } from '../i18n/de';
import { loadQuestions } from '../lib/loadContent';
import type { Question } from '../types';

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; questions: Question[] };

export function Review() {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadQuestions()
      .then((questions) => {
        if (cancelled) return;
        setLoadState({ status: 'ready', questions: questions.filter((q) => q.needsReview) });
      })
      .catch(() => {
        if (!cancelled) setLoadState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadState.status === 'loading') {
    return <StatusMessage text={de.review.loading} />;
  }
  if (loadState.status === 'error') {
    return <StatusMessage text={de.review.loadError} />;
  }

  const { questions } = loadState;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold">{de.review.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{de.review.intro}</p>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{de.review.empty}</p>
      ) : (
        <>
          <p className="text-sm font-medium">{de.review.countLabel(questions.length)}</p>
          <div className="flex flex-col gap-4">
            {questions.map((question) => (
              <ReviewCard key={question.id} question={question} />
            ))}
          </div>
        </>
      )}

      <Link to="/einstellungen" className="mt-2 text-sm text-teal-700 underline dark:text-teal-400">
        {de.review.backToSettings}
      </Link>
    </div>
  );
}

function ReviewCard({ question }: { question: Question }) {
  const allTags = [...question.tags.class, ...question.tags.subclass, ...question.tags.host, ...question.tags.topic, ...question.tags.flags];

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
      <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
        <span className="font-mono">{question.id}</span>
        <span>{question.type}</span>
      </div>
      <p className="mt-2 font-medium">{question.prompt}</p>

      <dl className="mt-3 flex flex-col gap-1.5 text-sm">
        <ReviewField label={de.review.parasiteLabel} value={question.parasite} />
        <ReviewField label={de.review.correctAnswerLabel} value={formatCorrectAnswer(question)} />
        <ReviewField label={de.review.explanationLabel} value={question.explanation} />
        <ReviewField label={de.review.sourceLabel} value={question.source} />
        {allTags.length > 0 && <ReviewField label={de.review.tagsLabel} value={allTags.join(', ')} />}
      </dl>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">{label}</dt>
      <dd className="text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}

function formatCorrectAnswer(question: Question): string {
  switch (question.type) {
    case 'single_choice':
    case 'case_vignette':
    case 'image_id':
      return question.options[question.correctIndex];
    case 'multiple_choice':
      return question.correctIndices.map((i) => question.options[i]).join(', ');
    case 'true_false':
      return question.answer ? de.quiz.trueLabel : de.quiz.falseLabel;
    case 'cloze':
      return [question.answer, ...(question.acceptedAnswers ?? [])].join(' / ');
    case 'matching':
      return question.correctPairs.map(([l, r]) => `${question.left[l]} → ${question.right[r]}`).join('; ');
    case 'ordering':
      return question.correctOrder.map((i) => question.items[i]).join(' → ');
    case 'flashcard':
      return question.back;
  }
}

function StatusMessage({ text }: { text: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 text-center text-slate-500 dark:text-slate-400">
      {text}
    </div>
  );
}
