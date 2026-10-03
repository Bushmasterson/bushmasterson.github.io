const CYCLE_MS = 12_000;

export function initC418(): void {
  const widget = document.querySelector<HTMLElement>('.now-playing');
  if (!widget) return;

  const trackEl = widget.querySelector<HTMLElement>('.now-playing-track');
  const fillEl = widget.querySelector<HTMLElement>('.now-playing-bar-fill');
  if (!trackEl || !fillEl) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const start = Date.now() % CYCLE_MS;
  fillEl.style.animationDelay = `-${start / 1000}s`;

  trackEl.classList.add('is-playing');
}
