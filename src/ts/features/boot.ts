const BOOT_LINES = [
  'bushmasterson bio v2.0',
  'loading kernel ............ ok',
  'mounting /dev/heart ....... ok',
  'loading personality ....... ok',
  'starting ...',
] as const;

export function initBoot(): void {
  const overlay = document.querySelector<HTMLDivElement>('#boot');
  if (!overlay) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = sessionStorage.getItem('boot_shown');

  if (seen || reduced) {
    overlay.remove();
    return;
  }

  const output = overlay.querySelector<HTMLDivElement>('.boot-output');
  if (!output) return;

  let i = 0;

  const next = (): void => {
    if (i >= BOOT_LINES.length) {
      setTimeout(() => {
        overlay.classList.add('boot-done');
        sessionStorage.setItem('boot_shown', '1');
        setTimeout(() => overlay.remove(), 500);
      }, 350);
      return;
    }

    const line = document.createElement('div');
    line.className = 'boot-line';
    line.textContent = BOOT_LINES[i] ?? '';
    output.appendChild(line);

    i += 1;
    setTimeout(next, 180);
  };

  next();
}
