/**
 * Type text into elements marked with [data-typed].
 * - Respects prefers-reduced-motion (renders final text instantly).
 * - Screen readers read the pre-set text via an .sr-only sibling.
 */
export function initTyping(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-typed]');
  if (!els.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  els.forEach((el) => {
    const text = el.dataset['typed'] ?? '';

    if (reduced) {
      el.textContent = text;
      return;
    }

    /* Clear first so the full text never flashes before typing starts. */
    el.textContent = '';

    const speed = Number(el.dataset['speed'] ?? 55);
    const delay = Number(el.dataset['delay'] ?? 0);

    const tick = (i: number): void => {
      if (i >= text.length) return;
      el.textContent = text.slice(0, i + 1);
      const jitter = speed + (Math.random() * 40 - 20);
      setTimeout(() => tick(i + 1), Math.max(15, jitter));
    };

    setTimeout(() => tick(0), delay);
  });
}
