import { useEffect, useState } from 'react';
import { de } from '../i18n/de';
import { loadCategories, loadQuestions } from '../lib/loadContent';
import { computeClassStats, computeDailyActivity, computeOverallStats, type ActivityDay, type CategoryStat, type Stat } from '../lib/stats';
import { getAllProgress } from '../lib/storage';
import { ActivityChart } from '../components/ActivityChart';
import { ProgressBar } from '../components/ProgressBar';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; overall: Stat; classStats: CategoryStat[]; activity: ActivityDay[] };

export function Stats() {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadQuestions(), loadCategories()])
      .then(([questions, categories]) => {
        if (cancelled) return;
        const progress = getAllProgress();
        setLoadState({
          status: 'ready',
          overall: computeOverallStats(questions, progress),
          classStats: computeClassStats(questions, progress, categories),
          activity: computeDailyActivity(progress),
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
    return <StatusMessage text={de.stats.loading} />;
  }
  if (loadState.status === 'error') {
    return <StatusMessage text={de.stats.loadError} />;
  }

  const { overall, classStats, activity } = loadState;
  const hasActivity = activity.some((day) => day.count > 0);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-semibold">{de.stats.title}</h1>

      <div>
        <h2 className="text-lg font-semibold">{de.stats.overviewTitle}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <OverviewTile label={de.stats.seenLabel} value={`${overall.seen} / ${overall.total}`} />
          <OverviewTile label={de.stats.masteredLabel} value={`${overall.mastered} / ${overall.total}`} />
          <OverviewTile label={de.stats.dueTodayLabel} value={String(overall.due)} />
          <OverviewTile label={de.stats.accuracyLabel} value={`${Math.round(overall.accuracy * 100)}%`} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">{de.stats.classProgressTitle}</h2>
        <div className="mt-3 flex flex-col gap-3">
          {classStats.map((stat) => (
            <ProgressBar
              key={stat.id}
              value={stat.mastered}
              max={stat.total}
              label={`${stat.label} — ${stat.mastered}/${stat.total} ${de.stats.masteredLabel.toLowerCase()}`}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">{de.stats.activityTitle}</h2>
        {hasActivity ? (
          <div className="mt-3">
            <ActivityChart days={activity} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{de.stats.noActivity}</p>
        )}
      </div>
    </div>
  );
}

function OverviewTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 text-center dark:border-slate-800">
      <p className="text-xl font-semibold text-teal-600 dark:text-teal-400">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
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
