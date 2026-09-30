const COMMANDS: Record<string, string[]> = {
  help: [
    'available commands:',
    '  help      — this message',
    '  whoami    — about me',
    '  contact   — social links',
    '  projects  — my projects',
    '  clear     — clear screen',
    '  exit      — close terminal',
  ],
  whoami: [
    'bushmasterson',
    'freedom thinker, coder, athlete',
    'c++ / python / typescript',
  ],
  contact: [
    'github    →  github.com/bushmasterson',
    'telegram  →  t.me/bushmasterson',
    'email     →  bushmasterson@proton.me',
  ],
  projects: [
    'bushnews   — cybersecurity & it news',
    'bush-bot   — telegram bot for news',
    'bush-tasks — productivity tool',
  ],
  sudo: ['nice try.'],
};

const CLICK_WINDOW_MS = 2000;
const CLICKS_NEEDED = 5;

export function initTerminal(): void {
  const title = document.querySelector<HTMLElement>('.typed-line');
  const term = document.querySelector<HTMLDivElement>('#terminal');
  if (!title || !term) return;

  const input = term.querySelector<HTMLInputElement>('.term-input');
  const output = term.querySelector<HTMLDivElement>('.term-output');
  if (!input || !output) return;

  let clicks: number[] = [];

  title.addEventListener('click', () => {
    const now = Date.now();
    clicks = clicks.filter((t) => now - t < CLICK_WINDOW_MS);
    clicks.push(now);

    if (clicks.length >= CLICKS_NEEDED) {
      clicks = [];
      openTerminal(term, input);
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;

    const value = input.value.trim().toLowerCase();
    input.value = '';

    const echo = document.createElement('div');
    echo.className = 'term-line term-echo';
    echo.textContent = `$ ${value}`;
    output.appendChild(echo);

    if (value === 'clear') {
      output.innerHTML = '';
      return;
    }

    if (value === 'exit' || value === 'quit') {
      term.classList.remove('open');
      return;
    }

    if (value === '') {
      output.scrollTop = output.scrollHeight;
      return;
    }

    const response = COMMANDS[value] ?? [
      `command not found: ${value}`,
      `try 'help'`,
    ];
    for (const line of response) {
      const el = document.createElement('div');
      el.className = 'term-line';
      el.textContent = line;
      output.appendChild(el);
    }

    output.scrollTop = output.scrollHeight;
  });
}

function openTerminal(term: HTMLDivElement, input: HTMLInputElement): void {
  if (term.classList.contains('open')) return;
  term.classList.add('open');
  setTimeout(() => input.focus(), 250);
}
