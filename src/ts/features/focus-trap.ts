/* keeps keyboard focus inside the terminal page while typing */

export function initTerminalFocusTrap(): void {
  const page = document.querySelector<HTMLElement>('.terminal-page');
  const input = page?.querySelector<HTMLInputElement>('.term-input');
  if (!page || !input) return;

  page.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('a, button')) return;
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const focusables = page.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea, select',
    );
    const list = Array.from(focusables).filter(
      (el) => el !== input && el.offsetParent !== null,
    );

    if (list.length === 0) {
      e.preventDefault();
      input.focus();
      return;
    }

    e.preventDefault();
    const first = list[0]!;
    const last = list[list.length - 1]!;
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      input.focus();
    } else if (!e.shiftKey && active === input) {
      first.focus();
    } else if (e.shiftKey && active === input) {
      last.focus();
    } else {
      input.focus();
    }
  });
}
