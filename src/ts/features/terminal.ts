const COMMANDS: Record<string, string[]> = {
  help: [
    'available commands:',
    '  help          — this message',
    '  whoami        — about me',
    '  contact       — social links',
    '  projects      — my projects',
    '  ls            — list files',
    '  cat <file>    — show file',
    '  neofetch      — system info',
    '  theme         — toggle theme',
    '  date          — current time',
    '  clear / ctrl+l — clear screen',
    '  exit          — close terminal',
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
    'more      →  /social/',
  ],
  projects: [
    'bushnews   — cybersecurity & it news   [telegram]',
    'bush-bot   — telegram bot for updates  [typescript]',
    'bush-tasks — cli task manager          [c++]',
    'more       →  /projects/',
  ],
  ls: ['about.md   projects.md   rules.md   uses.md   social.md'],
  neofetch: [
    '    ▄▄▄▄▄    bushmasterson@arch',
    '  ▄█▀▀▀▀▀█▄  ─────────────────',
    ' █▀  ▄▄▄  ▀█  os       arch linux',
    ' █  █▀▀▀█  █  host     personal site',
    ' █  █   █  █  kernel   6.x-custom',
    ' █▄  ▀▀▀  ▄█  shell    zsh',
    '  ▀█▄▄▄▄▄█▀   lang     c++ / py / ts',
    '    ▀▀▀▀▀    editor   vscode',
  ],
  theme: ['~ toggling theme...'],
  date: [],
  sudo: ['nice try.'],
  exit: [],
};

const FILES: Record<string, string[]> = {
  'about.md': [
    'birthday on november 2',
    'live in moscow',
    'i code in c++ (main), python and typescript',
    'i speak in russian & english and started to learn german',
    'male · intj',
  ],
  'projects.md': COMMANDS['projects'] ?? [],
  'rules.md': [
    '1. keep talk respectful and clear.',
    '2. use email for formal messages.',
    '3. there may be fakes, be vigilant.',
  ],
  'uses.md': ['→ see /uses/'],
  'social.md': ['→ see /social/'],
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
  const history: string[] = [];
  let historyIndex = -1;

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
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      output.innerHTML = '';
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      historyIndex = Math.min(historyIndex + 1, history.length - 1);
      input.value = history[history.length - 1 - historyIndex] ?? '';
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        historyIndex = -1;
        input.value = '';
        return;
      }
      historyIndex -= 1;
      input.value = history[history.length - 1 - historyIndex] ?? '';
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.value.trim().toLowerCase();
      if (!partial) return;
      const match = Object.keys(COMMANDS).find((cmd) =>
        cmd.startsWith(partial),
      );
      if (match) input.value = match;
      return;
    }

    if (e.key !== 'Enter') return;

    const value = input.value.trim().toLowerCase();
    input.value = '';
    historyIndex = -1;

    if (value) {
      history.push(value);
      if (history.length > 50) history.shift();
    }

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

    if (value === 'theme') {
      const btn = document.querySelector<HTMLButtonElement>('#theme-toggle');
      btn?.click();
      pushLine(output, '~ theme toggled');
      return;
    }

    if (value === 'date') {
      pushLine(output, new Date().toString());
      return;
    }

    if (value.startsWith('cat ')) {
      const file = value.slice(4).trim();
      const content = FILES[file];
      if (!content) {
        pushLine(output, `cat: ${file}: No such file`);
        return;
      }
      content.forEach((line) => pushLine(output, line));
      return;
    }

    const response = COMMANDS[value] ?? [
      `command not found: ${value}`,
      `try 'help'`,
    ];
    response.forEach((line) => pushLine(output, line));
  });
}

function pushLine(output: HTMLElement, text: string): void {
  const el = document.createElement('div');
  el.className = 'term-line';
  el.textContent = text;
  output.appendChild(el);
  output.scrollTop = output.scrollHeight;
}

function openTerminal(term: HTMLDivElement, input: HTMLInputElement): void {
  if (term.classList.contains('open')) return;
  term.classList.add('open');
  setTimeout(() => input.focus(), 250);
}
