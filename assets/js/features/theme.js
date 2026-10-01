const STORAGE_KEY = 'theme';
function getStored() {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === 'light' || v === 'dark')
            return v;
    }
    catch {
    }
    return null;
}
function getSystem() {
    return window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
}
function apply(theme) {
    const root = document.documentElement;
    root.dataset['theme'] = theme;
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
        meta.content = theme === 'light' ? '#faf8f3' : '#0f0f10';
    const btn = document.querySelector('#theme-toggle');
    if (btn) {
        btn.setAttribute('aria-pressed', String(theme === 'light'));
        btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}
export function initTheme() {
    const stored = getStored();
    const initial = stored ?? getSystem();
    apply(initial);
    const btn = document.querySelector('#theme-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const current = document.documentElement.dataset['theme'];
            const next = current === 'light' ? 'dark' : 'light';
            apply(next);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            }
            catch {
            }
        });
    }
    window
        .matchMedia('(prefers-color-scheme: light)')
        .addEventListener('change', (e) => {
        if (!getStored())
            apply(e.matches ? 'light' : 'dark');
    });
}
//# sourceMappingURL=theme.js.map