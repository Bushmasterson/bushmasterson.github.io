import { toggleTheme } from './theme.js';

const TERMINAL_PATH = '/terminal/';

let goPressed = false;
let goTimer = 0;

const isEditable = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    el.isContentEditable
  );
};

export function initShortcuts(): void {
  window.addEventListener('keydown', (e) => {
    if (isEditable(e.target)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key.toLowerCase();

    if (e.key === 'Escape') {
      const openOverlay = document.querySelector<HTMLElement>(
        '#terminal.open, .disco, #snake-gameover.is-visible',
      );
      if (openOverlay) {
        document.dispatchEvent(new CustomEvent('overlay-close'));
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      active?.blur();
      return;
    }

    if (key === 'g') {
      goPressed = true;
      window.clearTimeout(goTimer);
      goTimer = window.setTimeout(() => {
        goPressed = false;
      }, 800);
      return;
    }

    if (goPressed && key === 't') {
      goPressed = false;
      window.location.href = TERMINAL_PATH;
      return;
    }

    if (key === 't') {
      toggleTheme();
      return;
    }

    if (key === 's') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
