/**
 * Disco easter egg — triggered by typing `hahaha` in /terminal/.
 * Spawns a full-screen overlay with chaotic neon projectors.
 * Auto-stops after DISCO_DURATION_MS; Esc / click stop early.
 * Respects prefers-reduced-motion (never spawns).
 */

const DISCO_DURATION_MS = 12000;
const PROJECTOR_COUNT = 16;

let stopTimer = 0;
let keyHandler: ((e: KeyboardEvent) => void) | null = null;

export function isDiscoActive(): boolean {
  return document.querySelector('#disco') !== null;
}

export function toggleDisco(): boolean {
  if (isDiscoActive()) {
    stopDisco();
    return false;
  }
  return startDisco();
}

function startDisco(): boolean {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return false;

  const overlay = document.createElement('div');
  overlay.id = 'disco';
  overlay.className = 'disco';
  overlay.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < PROJECTOR_COUNT; i += 1) {
    const p = document.createElement('div');
    p.className = 'disco-projector';
    p.style.setProperty('--dx', `${(Math.random() - 0.5) * 180}vw`);
    p.style.setProperty('--dy', `${(Math.random() - 0.5) * 180}vh`);
    p.style.setProperty('--dur', `${0.6 + Math.random() * 0.9}s`);
    p.style.setProperty('--delay', `${Math.random() * 0.5}s`);
    p.style.setProperty('--hue', String(Math.floor(Math.random() * 360)));
    p.style.setProperty('--size', `${35 + Math.random() * 45}vmin`);
    overlay.appendChild(p);
  }

  document.body.appendChild(overlay);

  stopTimer = window.setTimeout(stopDisco, DISCO_DURATION_MS);

  keyHandler = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') stopDisco();
  };
  window.addEventListener('keydown', keyHandler);
  overlay.addEventListener('click', stopDisco);

  return true;
}

function stopDisco(): void {
  const overlay = document.querySelector('#disco');
  if (!overlay) return;

  window.clearTimeout(stopTimer);
  stopTimer = 0;

  if (keyHandler) {
    window.removeEventListener('keydown', keyHandler);
    keyHandler = null;
  }

  overlay.classList.add('disco-out');
  window.setTimeout(() => overlay.remove(), 400);
}
