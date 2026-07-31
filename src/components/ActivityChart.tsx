import type { ActivityDay } from '../lib/stats';

type ActivityChartProps = {
  days: ActivityDay[];
};

const CHART_HEIGHT = 72;

export function ActivityChart({ days }: ActivityChartProps) {
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <div>
      <div className="flex items-end gap-1" style={{ height: CHART_HEIGHT }}>
        {days.map((day) => {
          const barHeight = day.count === 0 ? 2 : Math.max(4, Math.round((day.count / max) * CHART_HEIGHT));
          return (
            <div
              key={day.date}
              className="flex-1"
              title={`${day.date}: ${day.count}`}
              aria-label={`${day.date}: ${day.count}`}
            >
              <div
                className="w-full rounded-t bg-teal-600 dark:bg-teal-500"
                style={{ height: `${barHeight}px` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>{days[0]?.date}</span>
        <span>{days[days.length - 1]?.date}</span>
      </div>
    </div>
  );
}
