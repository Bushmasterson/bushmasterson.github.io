export function initTerminalFocusTrap(): void {
  const page = document.querySelector<HTMLElement>('.terminal-page');
  const input = page?.querySelector<HTMLInputElement>('.term-input');
  if (!page || !input) return;

  page.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      input.focus();
    }
  });
}
