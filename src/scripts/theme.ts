export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
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
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
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

export function toggleTheme(): Theme {
  const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
