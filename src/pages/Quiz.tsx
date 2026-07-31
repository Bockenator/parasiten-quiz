import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { de } from '../i18n/de';
import { loadQuestions } from '../lib/loadContent';
import { buildTempSession } from '../lib/tempSession';
import type { Question } from '../types';
import { QuestionCard } from '../components/QuestionCard';
import { PrimaryButton } from '../components/PrimaryButton';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'ready'; allQuestions: Question[] };

export function Quiz() {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [session, setSession] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadQuestions()
      .then((questions) => {
        if (cancelled) return;
        if (questions.length === 0) {
          setLoadState({ status: 'empty' });
          return;
        }
        setLoadState({ status: 'ready', allQuestions: questions });
        setSession(buildTempSession(questions));
      })
      .catch(() => {
        if (!cancelled) setLoadState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function restart() {
    if (loadState.status !== 'ready') return;
    setSession(buildTempSession(loadState.allQuestions));
    setIndex(0);
    setCorrectCount(0);
    setFinished(false);
  }

  function handleNext(correct: boolean) {
    const nextCorrectCount = correct ? correctCount + 1 : correctCount;
    setCorrectCount(nextCorrectCount);
    if (index + 1 >= session.length) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  }

  if (loadState.status === 'loading') {
    return <StatusMessage text={de.quiz.loading} />;
  }
  if (loadState.status === 'error') {
    return <StatusMessage text={de.quiz.loadError} />;
  }
  if (loadState.status === 'empty' || session.length === 0) {
    return <StatusMessage text={de.quiz.empty} />;
  }

  if (finished) {
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{de.quiz.sessionComplete}</h1>
        <p className="text-slate-600 dark:text-slate-300">{de.quiz.sessionScore(correctCount, session.length)}</p>
        <div className="mt-2 flex gap-3">
          <PrimaryButton onClick={restart}>{de.quiz.restartSession}</PrimaryButton>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium dark:border-slate-700"
          >
            {de.quiz.backToDashboard}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = session[index];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {de.quiz.progress(index + 1, session.length)}
        </span>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 underline dark:text-slate-400"
        >
          {de.quiz.finishSession}
        </button>
      </div>
      <QuestionCard key={currentQuestion.id} question={currentQuestion} onNext={handleNext} />
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
