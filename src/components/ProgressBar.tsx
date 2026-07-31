type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
};

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-slate-700 dark:text-slate-300">{label}</span>
          <span className="text-slate-500 dark:text-slate-400">{percent}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-2 rounded-full bg-teal-600 transition-all dark:bg-teal-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
