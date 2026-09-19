export type Theme = 'dark' | 'light' | 'doom';

const STORAGE_KEY = 'theme';

/** Cycle order for the toggle button. */
export const THEMES: Theme[] = ['dark', 'light', 'doom'];

function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function getPreferredTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function getCurrentTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return isTheme(current) ? current : 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // private browsing / storage disabled — theme just won't persist
  }
}

export function nextTheme(theme: Theme = getCurrentTheme()): Theme {
  return THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
}

export function cycleTheme(): Theme {
  const next = nextTheme();
  setTheme(next);
  return next;
}
