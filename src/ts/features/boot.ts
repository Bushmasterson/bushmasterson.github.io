const BOOT_LINES = [
  'bushmasterson bio v2.0',
  'loading kernel ............ ok',
  'mounting /dev/heart ....... ok',
  'checking memories ......... ok',
  'loading hopes ............. ok',
  'starting ...',
  'c418 — sweden',
] as const;

export function initBoot(): void {
  const overlay = document.querySelector<HTMLDivElement>('#boot');
  if (!overlay) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try {
    seen = sessionStorage.getItem('boot_shown') === '1';
  } catch {
    /* ignore */
  }

  if (seen || reduced) {
    overlay.remove();
    return;
  }

  const output = overlay.querySelector<HTMLDivElement>('.boot-output');
  if (!output) return;

  let i = 0;

  const finish = (): void => {
    if (!overlay.isConnected) return;
    overlay.classList.add('boot-done');
    try {
      sessionStorage.setItem('boot_shown', '1');
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      if (overlay.isConnected) overlay.remove();
    }, 500);
  };

  const next = (): void => {
    if (!overlay.isConnected) return;
    if (i >= BOOT_LINES.length) {
      window.setTimeout(finish, 400);
      return;
    }

    const line = document.createElement('div');
    line.className = 'boot-line';
    line.textContent = BOOT_LINES[i] ?? '';
    output.appendChild(line);

    i += 1;
    window.setTimeout(next, 220);
  };

  next();
}
