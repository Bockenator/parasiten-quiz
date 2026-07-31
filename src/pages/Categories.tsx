import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { de } from '../i18n/de';
import { loadCategories, loadQuestions } from '../lib/loadContent';
import { filterQuestions } from '../lib/filterQuestions';
import { getCategorySelection, saveCategorySelection } from '../lib/storage';
import { defaultCategorySelection, type Categories, type CategoryDimensionId, type CategorySelection, type Question } from '../types';
import { PrimaryButton } from '../components/PrimaryButton';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; categories: Categories; questions: Question[] };

export function Categories() {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [selection, setSelection] = useState<CategorySelection>(defaultCategorySelection);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadCategories(), loadQuestions()])
      .then(([categories, questions]) => {
        if (cancelled) return;
        setLoadState({ status: 'ready', categories, questions });
        setSelection(getCategorySelection());
      })
      .catch(() => {
        if (!cancelled) setLoadState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function applySelection(next: CategorySelection) {
    setSelection(next);
    saveCategorySelection(next);
  }

  function toggleValue(dimension: CategoryDimensionId, valueId: string) {
    const current = selection[dimension];
    const nextValues = current.includes(valueId) ? current.filter((v) => v !== valueId) : [...current, valueId];
    applySelection({ ...selection, [dimension]: nextValues });
  }

  function selectAll() {
    if (loadState.status !== 'ready') return;
    const { categories, questions } = loadState;
    // Eine Dimension nur dann komplett befüllen, wenn wirklich jede Frage dort
    // mindestens einen Tag hat (z.B. subclass/flags können bei einzelnen Fragen
    // leer sein — dort würde "alle Werte ausgewählt" solche Fragen fälschlich
    // herausfiltern, obwohl "alles" eigentlich "kein Filter" bedeuten soll).
    const filled = Object.fromEntries(
      categories.dimensions.map((dim) => {
        const everyQuestionHasTag = questions.every((q) => q.tags[dim.id].length > 0);
        return [dim.id, everyQuestionHasTag ? dim.values.map((v) => v.id) : []];
      }),
    ) as Record<CategoryDimensionId, string[]>;
    applySelection({ ...filled, onlyTopImportance: false });
  }

  function reset() {
    applySelection(defaultCategorySelection);
  }

  function quickFilterTopImportance() {
    applySelection({ ...defaultCategorySelection, onlyTopImportance: true });
  }

  function quickFilterZoonoses() {
    applySelection({ ...defaultCategorySelection, flags: ['zoonose'] });
  }

  function quickFilterNematodes() {
    applySelection({ ...defaultCategorySelection, class: ['nematoden'] });
  }

  if (loadState.status === 'loading') {
    return <StatusMessage text={de.categories.loading} />;
  }
  if (loadState.status === 'error') {
    return <StatusMessage text={de.categories.loadError} />;
  }

  const { categories, questions } = loadState;
  const matchedCount = filterQuestions(questions, selection).length;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold">{de.categories.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{de.categories.intro}</p>
      </div>

      <div className="rounded-lg border border-teal-500 bg-teal-50 px-4 py-3 text-center dark:bg-teal-950">
        <span className="text-lg font-semibold text-teal-900 dark:text-teal-100">
          {de.categories.liveCount(matchedCount, questions.length)}
        </span>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{de.categories.quickFiltersLabel}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <QuickFilterButton label={de.categories.quickFilterTopImportance} onClick={quickFilterTopImportance} />
          <QuickFilterButton label={de.categories.quickFilterZoonoses} onClick={quickFilterZoonoses} />
          <QuickFilterButton label={de.categories.quickFilterNematodes} onClick={quickFilterNematodes} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={selectAll} className="text-sm font-medium text-teal-700 underline dark:text-teal-400">
          {de.categories.selectAll}
        </button>
        <button type="button" onClick={reset} className="text-sm font-medium text-slate-500 underline dark:text-slate-400">
          {de.categories.reset}
        </button>
      </div>

      {categories.dimensions.map((dimension) => (
        <div key={dimension.id}>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{dimension.label}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {dimension.values.map((value) => {
              const active = selection[dimension.id].includes(value.id);
              return (
                <button
                  key={value.id}
                  type="button"
                  onClick={() => toggleValue(dimension.id, value.id)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : 'border-slate-300 text-slate-700 hover:border-teal-400 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {value.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-slate-400 dark:text-slate-500">{de.categories.savedHint}</p>

      <PrimaryButton className="mt-2" onClick={() => navigate('/quiz')}>
        {de.categories.goToQuiz}
      </PrimaryButton>
    </div>
  );
}

function QuickFilterButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
    >
      {label}
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
