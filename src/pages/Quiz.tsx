import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { de } from '../i18n/de';
import { filterQuestions } from '../lib/filterQuestions';
import { computeXpEarned, updateStreak } from '../lib/gamification';
import { loadQuestions } from '../lib/loadContent';
import { shuffle } from '../lib/random';
import { selectExamSession, selectLearnSession } from '../lib/selectSession';
import { createInitialProgress, qualityFromCorrect, updateCardProgress } from '../lib/srs';
import {
  getAllProgress,
  getCategorySelection,
  getGamificationState,
  getProgress,
  saveGamificationState,
  saveLastSessionResult,
  saveProgress,
} from '../lib/storage';
import type { Question, SessionMode } from '../types';
import { QuestionCard } from '../components/QuestionCard';
import { PrimaryButton } from '../components/PrimaryButton';

/** Navigations-State, mit dem andere Seiten einen Quiz-Modus anstoßen können. */
export type QuizNavState = { mode: 'exam'; count: number | 'all' } | { mode: 'review'; questionIds: string[] } | undefined;

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'empty' } | { status: 'filtered-empty' } | { status: 'ready' };

export function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as QuizNavState;

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [session, setSession] = useState<Question[]>([]);
  const [mode, setMode] = useState<SessionMode>('learn');
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadQuestions()
      .then((questions) => {
        if (cancelled) return;
        if (questions.length === 0) {
          setLoadState({ status: 'empty' });
          return;
        }

        let builtSession: Question[];
        let resolvedMode: SessionMode;

        if (navState?.mode === 'review') {
          const idSet = new Set(navState.questionIds);
          builtSession = shuffle(questions.filter((q) => idSet.has(q.id)));
          resolvedMode = 'review';
        } else {
          const filteredQuestions = filterQuestions(questions, getCategorySelection());
          if (filteredQuestions.length === 0) {
            setLoadState({ status: 'filtered-empty' });
            return;
          }
          if (navState?.mode === 'exam') {
            builtSession = selectExamSession(filteredQuestions, navState.count);
            resolvedMode = 'exam';
          } else {
            builtSession = selectLearnSession(filteredQuestions, getAllProgress());
            resolvedMode = 'learn';
          }
        }

        if (builtSession.length === 0) {
          setLoadState({ status: 'filtered-empty' });
          return;
        }

        setMode(resolvedMode);
        setSession(builtSession);
        setLoadState({ status: 'ready' });
      })
      .catch(() => {
        if (!cancelled) setLoadState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
    // navState wird bewusst nur beim Einstieg in die Seite ausgewertet, nicht bei jeder Änderung.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finishSession(finalCorrectCount: number, finalWrongIds: string[]) {
    const xpEarned = computeXpEarned(finalCorrectCount, session.length);
    const gamification = getGamificationState();
    const streakAfter = updateStreak(gamification.streak);
    saveGamificationState({ totalXp: gamification.totalXp + xpEarned, streak: streakAfter });

    saveLastSessionResult({
      mode,
      completedAt: new Date().toISOString(),
      total: session.length,
      correctCount: finalCorrectCount,
      xpEarned,
      streakAfter: streakAfter.current,
      wrongQuestionIds: finalWrongIds,
    });

    navigate('/ergebnis');
  }

  function handleNext(correct: boolean) {
    const question = session[index];
    const quality = qualityFromCorrect(correct);
    const existing = getProgress(question.id) ?? createInitialProgress(question.id);
    saveProgress(updateCardProgress(existing, quality));

    const nextCorrectCount = correct ? correctCount + 1 : correctCount;
    const nextWrongIds = correct ? wrongQuestionIds : [...wrongQuestionIds, question.id];
    setCorrectCount(nextCorrectCount);
    setWrongQuestionIds(nextWrongIds);

    if (index + 1 >= session.length) {
      finishSession(nextCorrectCount, nextWrongIds);
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
  if (loadState.status === 'empty') {
    return <StatusMessage text={de.quiz.empty} />;
  }
  if (loadState.status === 'filtered-empty') {
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">{de.quiz.filteredEmptyTitle}</h1>
        <p className="text-slate-600 dark:text-slate-300">{de.quiz.filteredEmptyText}</p>
        <PrimaryButton onClick={() => navigate('/kategorien')}>{de.quiz.adjustCategories}</PrimaryButton>
      </div>
    );
  }
  if (session.length === 0) {
    return <StatusMessage text={de.quiz.empty} />;
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
