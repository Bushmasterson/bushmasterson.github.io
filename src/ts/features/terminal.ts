/* 5 clicks on the title -> /terminal/ */
const CLICK_WINDOW_MS = 2000;
const CLICKS_NEEDED = 5;
const TERMINAL_PATH = '/terminal/';

export function initTerminal(): void {
  const title = document.querySelector<HTMLElement>('.typed-line');
  if (!title) return;

  let clicks: number[] = [];

  title.addEventListener('click', () => {
    const now = Date.now();
    clicks = clicks.filter((t) => now - t < CLICK_WINDOW_MS);
    clicks.push(now);

    if (clicks.length >= CLICKS_NEEDED) {
      clicks = [];
      window.location.href = TERMINAL_PATH;
    }
  });
}
