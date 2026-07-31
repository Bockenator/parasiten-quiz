export type OptionVisualState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'neutral';

const base = 'w-full rounded-lg border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed';

export function optionButtonClasses(state: OptionVisualState): string {
  switch (state) {
    case 'selected':
      return `${base} border-teal-500 bg-teal-50 dark:bg-teal-950`;
    case 'correct':
      return `${base} border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-100`;
    case 'incorrect':
      return `${base} border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-100`;
    case 'neutral':
      return `${base} border-slate-200 opacity-60 dark:border-slate-800`;
    case 'idle':
    default:
      return `${base} border-slate-300 hover:border-teal-400 dark:border-slate-700`;
  }
}
