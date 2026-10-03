export function initNavActive(): void {
  const nav = document.querySelector<HTMLElement>('.page-nav');
  if (!nav) return;

  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  nav.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    const clean = ('/' + href.replace(/^\.\.?\//, '').replace(/\/+$/, ''))
      .replace(/\/+/g, '/')
      .replace(/\/$/, '');

    const current =
      path === '/' ? '/' : '/' + path.split('/').filter(Boolean)[0];
    const target =
      clean === '/' ? '/' : '/' + clean.split('/').filter(Boolean)[0];

    if (current === target) {
      link.classList.add('active');
    }
  });
}
