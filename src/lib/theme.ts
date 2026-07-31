import type { Settings, ThemePreference } from '../types';

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveIsDark(pref: ThemePreference): boolean {
  return pref === 'dark' || (pref === 'system' && systemPrefersDark());
}

export function applyTheme(pref: ThemePreference): void {
  const isDark = resolveIsDark(pref);
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

export function applyAnimationsPreference(enabled: boolean): void {
  document.documentElement.classList.toggle('no-animations', !enabled);
}

let stopWatchingSystemTheme: (() => void) | null = null;

/** Bei Präferenz "system" auf spätere OS-Theme-Wechsel reagieren, solange die App offen ist. */
export function watchSystemTheme(pref: ThemePreference): void {
  stopWatchingSystemTheme?.();
  stopWatchingSystemTheme = null;
  if (pref !== 'system') return;

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = () => applyTheme('system');
  media.addEventListener('change', listener);
  stopWatchingSystemTheme = () => media.removeEventListener('change', listener);
}

/** Wendet Theme + Animationspräferenz an. In main.tsx synchron vor dem ersten Render aufrufen (kein Flackern). */
export function applyAppearanceSettings(settings: Pick<Settings, 'theme' | 'animationsEnabled'>): void {
  applyTheme(settings.theme);
  watchSystemTheme(settings.theme);
  applyAnimationsPreference(settings.animationsEnabled);
}
