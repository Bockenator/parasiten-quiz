import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { de } from '../i18n/de';
import { gradeForAccuracy } from '../lib/gamification';
import { loadQuestions } from '../lib/loadContent';
import { getLastSessionResult } from '../lib/storage';
import type { Question, SessionResult } from '../types';
import { PrimaryButton } from '../components/PrimaryButton';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'no-result' }
  | { status: 'ready'; result: SessionResult; wrongQuestions: Question[] };

export function Result() {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const result = getLastSessionResult();
    if (!result) {
      setLoadState({ status: 'no-result' });
      return;
    }
    loadQuestions()
      .then((questions) => {
        if (cancelled) return;
        const byId = new Map(questions.map((q) => [q.id, q]));
        const wrongQuestions = result.wrongQuestionIds
          .map((id) => byId.get(id))
          .filter((q): q is Question => q !== undefined);
        setLoadState({ status: 'ready', result, wrongQuestions });
      })
      .catch(() => {
        if (!cancelled) setLoadState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadState.status === 'loading') {
    return <StatusMessage text={de.result.loading} />;
  }
  if (loadState.status === 'error') {
    return <StatusMessage text={de.quiz.loadError} />;
  }
  if (loadState.status === 'no-result') {
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-slate-600 dark:text-slate-300">{de.result.noResult}</p>
        <PrimaryButton onClick={() => navigate('/quiz')}>{de.result.goToQuiz}</PrimaryButton>
      </div>
    );
  }

  const { result, wrongQuestions } = loadState;
  const accuracyPct = result.total > 0 ? Math.round((result.correctCount / result.total) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      <div className="text-center">
        <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{accuracyPct}%</p>
        <p className="mt-1 text-slate-600 dark:text-slate-300">{de.result.scoreLabel(result.correctCount, result.total)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label={de.result.xpEarnedLabel(result.xpEarned)} />
        <StatTile label={de.result.streakLabel(result.streakAfter)} />
        {result.mode === 'exam' && (
          <StatTile label={de.result.gradeLabel(gradeForAccuracy(result.correctCount / Math.max(1, result.total)))} />
        )}
      </div>

      {wrongQuestions.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold">{de.result.wrongAnswersTitle}</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {wrongQuestions.map((question) => (
              <li key={question.id} className="rounded-lg border border-rose-300 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950">
                <p className="font-medium text-rose-900 dark:text-rose-100">{question.prompt}</p>
                <p className="mt-1 text-sm text-rose-800 dark:text-rose-200">{question.explanation}</p>
                <p className="mt-1 text-xs text-rose-700/70 dark:text-rose-300/70">
                  {de.quiz.sourceLabel}: {question.source}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-slate-600 dark:text-slate-300">{de.result.noWrongAnswers}</p>
      )}

      <div className="flex flex-col gap-3">
        {wrongQuestions.length > 0 && (
          <PrimaryButton
            onClick={() =>
              navigate('/quiz', { state: { mode: 'review', questionIds: wrongQuestions.map((q) => q.id) } })
            }
          >
            {de.result.reviewWrongButton}
          </PrimaryButton>
        )}
        <button
          type="button"
          onClick={() => navigate('/quiz')}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium dark:border-slate-700"
        >
          {de.result.newSessionButton}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 underline dark:text-slate-400"
        >
          {de.result.backToDashboard}
        </button>
      </div>
    </div>
  );
}

function StatTile({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium dark:border-slate-800">
      {label}
    </div>
  );
}

function StatusMessage({ text }: { text: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 text-center text-slate-500 dark:text-slate-400">
      {text}
    </div>
  );
}
