type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function getStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* localStorage unavailable */
  }
  return null;
}

function getSystem(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset['theme'] = theme;
  root.style.colorScheme = theme;

  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (meta) meta.content = theme === 'light' ? '#f5f5f7' : '#0a0a0b';

  const btn = document.querySelector<HTMLButtonElement>('#theme-toggle');
  if (btn) {
    btn.setAttribute('aria-pressed', String(theme === 'light'));
    btn.setAttribute(
      'aria-label',
      theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme',
    );
  }

  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function getCurrentTheme(): Theme {
  return document.documentElement.dataset['theme'] === 'light'
    ? 'light'
    : 'dark';
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function toggleTheme(): void {
  setTheme(getCurrentTheme() === 'light' ? 'dark' : 'light');
}

export function initTheme(): void {
  const stored = getStored();
  applyTheme(stored ?? getSystem());

  const btn = document.querySelector<HTMLButtonElement>('#theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => toggleTheme());
  }

  window
    .matchMedia('(prefers-color-scheme: light)')
    .addEventListener('change', (e) => {
      if (!getStored()) applyTheme(e.matches ? 'light' : 'dark');
    });
}
