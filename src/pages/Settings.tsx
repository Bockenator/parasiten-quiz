import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { de } from '../i18n/de';
import { applyAppearanceSettings } from '../lib/theme';
import { exportAllData, getSettings, importAllData, resetLearningProgress, saveSettings } from '../lib/storage';
import type { Settings as SettingsType, ThemePreference } from '../types';
import { PrimaryButton } from '../components/PrimaryButton';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: de.settings.themeLight },
  { value: 'dark', label: de.settings.themeDark },
  { value: 'system', label: de.settings.themeSystem },
];

export function Settings() {
  const [settings, setSettings] = useState<SettingsType>(() => getSettings());
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update(next: SettingsType) {
    setSettings(next);
    saveSettings(next);
    applyAppearanceSettings(next);
  }

  function handleExport() {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paraquiz-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    file
      .text()
      .then((text) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          setMessage(de.settings.importError);
          return;
        }
        const result = importAllData(parsed);
        if (!result.success) {
          setMessage(de.settings.importError);
          return;
        }
        setMessage(de.settings.importSuccess);
        window.setTimeout(() => window.location.reload(), 1200);
      })
      .catch(() => setMessage(de.settings.importError));
  }

  function handleReset() {
    if (!window.confirm(de.settings.resetConfirm)) return;
    resetLearningProgress();
    setMessage(de.settings.resetSuccess);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-semibold">{de.settings.title}</h1>

      <section>
        <h2 className="text-lg font-semibold">{de.settings.goalsTitle}</h2>
        <div className="mt-3 flex flex-col gap-3">
          <NumberField
            label={de.settings.dailyGoalLabel}
            value={settings.dailyGoal}
            onChange={(value) => update({ ...settings, dailyGoal: value })}
          />
          <NumberField
            label={de.settings.maxNewCardsLabel}
            value={settings.maxNewCardsPerDay}
            onChange={(value) => update({ ...settings, maxNewCardsPerDay: value })}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{de.settings.appearanceTitle}</h2>
        <div className="mt-3 flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">{de.settings.themeLabel}</p>
            <div className="flex gap-2">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={settings.theme === option.value}
                  onClick={() => update({ ...settings, theme: option.value })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                    settings.theme === option.value
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <ToggleRow
            label={de.settings.soundLabel}
            checked={settings.soundEnabled}
            onChange={(checked) => update({ ...settings, soundEnabled: checked })}
          />
          <ToggleRow
            label={de.settings.animationsLabel}
            checked={settings.animationsEnabled}
            onChange={(checked) => update({ ...settings, animationsEnabled: checked })}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{de.settings.dataTitle}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{de.settings.dataIntro}</p>
        <div className="mt-3 flex flex-col gap-3">
          <PrimaryButton onClick={handleExport}>{de.settings.exportButton}</PrimaryButton>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium dark:border-slate-700"
          >
            {de.settings.importButton}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-rose-400 px-4 py-2 font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950"
          >
            {de.settings.resetButton}
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{de.settings.contentTitle}</h2>
        <Link to="/review-modus" className="mt-3 inline-block text-sm text-teal-700 underline dark:text-teal-400">
          {de.settings.reviewLinkLabel}
        </Link>
      </section>

      {message && <p className="text-center text-sm text-teal-700 dark:text-teal-400">{message}</p>}
      <p className="text-center text-xs text-slate-400 dark:text-slate-500">{de.settings.savedHint}</p>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          if (Number.isFinite(next) && next >= 1) onChange(next);
        }}
        className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-right dark:border-slate-700 dark:bg-slate-900"
      />
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 text-sm"
    >
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <span
        className={`inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
