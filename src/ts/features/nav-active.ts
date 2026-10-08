export function initNavActive(): void {
  const nav = document.querySelector<HTMLElement>('.page-nav');
  if (!nav) return;

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const current = path === '/' ? '/' : '/' + path.split('/').filter(Boolean)[0];

  nav.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const clean = ('/' + href.replace(/^\.\.?\//, '').replace(/\/+$/, ''))
      .replace(/\/+/g, '/')
      .replace(/\/$/, '');
    const parts = clean.split('/').filter(Boolean);
    const target = clean === '/' || parts.length === 0 ? '/' : '/' + parts[0];

    if (current === target) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}
