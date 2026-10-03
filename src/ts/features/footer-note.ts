const PHRASES = [
  '— coffee and code.',
  '— still here.',
  '— somewhere between.',
  '— c418 playing in the background.',
] as const;

const CYCLE_MS = 12_000;

export function initFooterNote(): void {
  const el = document.querySelector<HTMLElement>('.footer-note .typed');
  if (!el) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const idx = Math.floor(Date.now() / CYCLE_MS) % PHRASES.length;
  const initial = PHRASES[idx] ?? PHRASES[0];
  el.dataset['typed'] = initial;
  el.textContent = initial;

  let i = idx;
  setInterval(() => {
    i = (i + 1) % PHRASES.length;
    el.classList.add('is-fading');
    setTimeout(() => {
      el.textContent = PHRASES[i] ?? PHRASES[0];
      el.classList.remove('is-fading');
    }, 600);
  }, CYCLE_MS);
}
