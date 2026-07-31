import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { de } from '../i18n/de';
import { computeBadges, countAnsweredToday, levelForXp, xpIntoCurrentLevel, type Badge } from '../lib/gamification';
import { loadCategories, loadQuestions } from '../lib/loadContent';
import { computeClassStats, type CategoryStat } from '../lib/stats';
import { getAllProgress, getGamificationState, getSettings } from '../lib/storage';
import type { GamificationState } from '../types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { ProgressRing } from '../components/ProgressRing';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready';
      gamification: GamificationState;
      answeredToday: number;
      dailyGoal: number;
      classStats: CategoryStat[];
      badges: Badge[];
    };

const EXAM_COUNT_OPTIONS: (number | 'all')[] = [10, 20, 50, 'all'];

export function Dashboard() {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [showExamPicker, setShowExamPicker] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadQuestions(), loadCategories()])
      .then(([questions, categories]) => {
        if (cancelled) return;
        const progress = getAllProgress();
        const gamification = getGamificationState();
        setLoadState({
          status: 'ready',
          gamification,
          answeredToday: countAnsweredToday(progress),
          dailyGoal: getSettings().dailyGoal,
          classStats: computeClassStats(questions, progress, categories),
          badges: computeBadges(questions, progress, gamification.streak.current),
        });
      })
      .catch(() => {
        if (!cancelled) setLoadState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadState.status === 'loading') {
    return <StatusMessage text={de.dashboard.loading} />;
  }
  if (loadState.status === 'error') {
    return <StatusMessage text={de.dashboard.loadError} />;
  }

  const { gamification, answeredToday, dailyGoal, classStats, badges } = loadState;
  const level = levelForXp(gamification.totalXp);
  const xpInLevel = xpIntoCurrentLevel(gamification.totalXp);
  const dailyGoalReached = answeredToday >= dailyGoal;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold">{de.dashboard.greeting}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {gamification.streak.current > 0 ? de.dashboard.streakLabel(gamification.streak.current) : de.dashboard.streakNone}
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div className="relative flex-shrink-0">
          <ProgressRing value={answeredToday} max={dailyGoal} size={80} strokeWidth={8} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-semibold">{answeredToday}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/{dailyGoal}</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">
            {dailyGoalReached ? de.dashboard.dailyGoalReached : de.dashboard.dailyGoalLabel(answeredToday, dailyGoal)}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {de.dashboard.levelLabel(level)} · {de.dashboard.xpLabel(gamification.totalXp)}
          </p>
          <ProgressBar value={xpInLevel} max={100} />
        </div>
      </div>

      <PrimaryButton className="w-full py-3 text-base" onClick={() => navigate('/quiz')}>
        {de.dashboard.continueLearning}
      </PrimaryButton>

      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton onClick={() => setShowExamPicker((v) => !v)}>{de.dashboard.examButton}</SecondaryButton>
        <SecondaryButton onClick={() => navigate('/kategorien')}>{de.dashboard.categoriesButton}</SecondaryButton>
        <SecondaryButton onClick={() => navigate('/statistik')}>{de.dashboard.statsButton}</SecondaryButton>
        <SecondaryButton onClick={() => navigate('/einstellungen')}>{de.dashboard.settingsButton}</SecondaryButton>
      </div>

      {showExamPicker && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">{de.dashboard.examPickerTitle}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAM_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => navigate('/quiz', { state: { mode: 'exam', count } })}
                className="rounded-full border border-amber-400 bg-white px-4 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-100"
              >
                {count === 'all' ? de.dashboard.examCountAll : count}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold">{de.dashboard.classProgressTitle}</h2>
        <div className="mt-3 flex flex-col gap-3">
          {classStats.map((stat) => (
            <ProgressBar
              key={stat.id}
              value={stat.mastered}
              max={stat.total}
              label={`${stat.label} — ${de.dashboard.masteredOfTotal(stat.mastered, stat.total)}`}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">{de.dashboard.badgesTitle}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-lg border px-3 py-2 text-center text-xs font-medium ${
                badge.earned
                  ? 'border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-100'
                  : 'border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-600'
              }`}
              title={de.badges[badge.id].description}
            >
              {de.badges[badge.id].label}
              {!badge.earned && (
                <div className="mt-0.5 text-[10px] opacity-80">
                  {badge.progress}/{badge.threshold}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:border-teal-400 dark:border-slate-700"
    >
      {children}
    </button>
  );
}

function StatusMessage({ text }: { text: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 text-center text-slate-500 dark:text-slate-400">
      {text}
    </div>
  );
}
