/* type text into [data-typed] elements */
export function initTyping(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-typed]');
  if (!els.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  els.forEach((el) => {
    const text = el.dataset['typed'] ?? '';
    if (!text) return;

    if (reduced) {
      el.textContent = text;
      return;
    }

    if (el.textContent === text) return;
    el.textContent = '';

    const speed = Number(el.dataset['speed'] ?? 55);
    const delay = Number(el.dataset['delay'] ?? 0);

    const tick = (i: number): void => {
      if (!el.isConnected) return;
      if (i >= text.length) return;
      el.textContent = text.slice(0, i + 1);
      const jitter = speed + (Math.random() * 40 - 20);
      window.setTimeout(() => tick(i + 1), Math.max(15, jitter));
    };

    window.setTimeout(() => tick(0), delay);
  });
}
