import { getCurrentTheme, toggleTheme } from './theme.js';

const VFS: Record<string, string[]> = {
  'about.md': [
    'birthday on november 2',
    'live in moscow',
    'i code in c++ (main), python and typescript',
    'i speak russian & english, learning german',
    'male · intj',
  ],
  'projects.md': [
    'bushnews   — cybersecurity & it news      [telegram]',
    'bush-bot   — telegram bot for updates     [typescript]',
    'bush-tasks — cli task manager             [c++] · android (kotlin) wip',
    'bush-math  — math animations with manim   [python]',
    '',
    '→ /projects for details',
  ],
  'uses.md': [
    'editor     vs code · neovim',
    'terminal   windows terminal · git bash',
    'languages  c++ · python · typescript',
    'tools      git · vite · obsidian · bitwarden · proton',
    'hardware   windows 11 · poco x5 pro → iphone 15 pro',
    '',
    '→ /uses for details',
  ],
  'social.md': [
    'github     github.com/bushmasterson',
    'telegram   t.me/bushmasterson',
    'x          x.com/bushmasterson02',
    'email      bushmasterson@proton.me',
    '',
    '→ /social for full list',
  ],
  'rules.md': [
    '1. keep talk respectful and clear.',
    '2. use email for formal messages.',
    '3. there may be fakes, be vigilant.',
  ],
};

const COMMANDS = [
  'cat',
  'cd',
  'clear',
  'date',
  'echo',
  'exit',
  'help',
  'history',
  'ls',
  'pwd',
  'social',
  'sudo',
  'theme',
  'uses',
  'whoami',
  'projects',
] as const;

export function initTerminalPage(): void {
  const page = document.querySelector<HTMLElement>('.terminal-page');
  if (!page) return;

  const output = page.querySelector<HTMLElement>('.terminal-page-output');
  const input = page.querySelector<HTMLInputElement>('.term-input');
  if (!output || !input) return;

  let cwd = '~';
  const history: string[] = [];
  let historyIndex = 0;

  const scroll = (): void => {
    output.scrollTop = output.scrollHeight;
  };

  const print = (text: string, cls = 'term-line'): void => {
    const line = document.createElement('div');
    line.className = cls;
    line.textContent = text;
    output.appendChild(line);
  };

  const printLines = (lines: string[]): void => {
    lines.forEach((l) => print(l));
    scroll();
  };

  const escapeHtml = (s: string): string =>
    s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c]!,
    );

  const currentPrompt = (): string => `bushmasterson@arch:${cwd}$`;

  const run = (raw: string): void => {
    const value = raw.trim();
    if (!value) return;

    const echo = document.createElement('div');
    echo.className = 'term-line term-echo';
    echo.innerHTML = `<span class="prompt">${escapeHtml(currentPrompt())}</span> ${escapeHtml(value)}`;
    output.appendChild(echo);

    history.push(value);
    historyIndex = history.length;

    const parts = value.split(/\s+/);
    const cmd = parts[0] ?? '';
    const arg = parts.slice(1).join(' ');

    switch (cmd) {
      case 'help':
        printLines([
          'available commands:',
          '  help          this message',
          '  whoami        who am i',
          '  ls            list files',
          '  cat <file>    read a file',
          '  pwd           current directory',
          '  cd <dir>      change directory (fake)',
          '  projects      list projects',
          '  uses          what i use',
          '  social        social links',
          '  date          current date and time',
          '  theme         toggle theme',
          '  echo <text>   print text',
          '  history       command history',
          '  clear         clear screen',
          '  exit          go home',
        ]);
        break;

      case 'whoami':
        printLines(['bushmasterson', 'freedom thinker, coder, athlete']);
        break;

      case 'ls':
        printLines([Object.keys(VFS).join('   ')]);
        break;

      case 'cat': {
        if (!arg) {
          print('usage: cat <file>');
          break;
        }
        const file = VFS[arg];
        if (!file) {
          print(`cat: ${arg}: No such file or directory`);
          break;
        }
        printLines(file);
        break;
      }

      case 'pwd':
        print(
          cwd === '~' ? '/home/bushmasterson' : `/home/bushmasterson/${cwd}`,
        );
        break;

      case 'cd':
        if (!arg || arg === '~' || arg === '..') cwd = '~';
        else cwd = arg;
        scroll();
        break;

      case 'projects':
        printLines(VFS['projects.md'] ?? []);
        break;

      case 'uses':
        printLines(VFS['uses.md'] ?? []);
        break;

      case 'social':
        printLines(VFS['social.md'] ?? []);
        break;

      case 'date':
        print(new Date().toString());
        scroll();
        break;

      case 'theme':
        toggleTheme();
        print(`theme → ${getCurrentTheme()}`);
        scroll();
        break;

      case 'echo':
        print(arg);
        scroll();
        break;

      case 'history':
        history.slice(0, -1).forEach((h, i) => print(`  ${i + 1}  ${h}`));
        scroll();
        break;

      case 'sudo':
        print('nice try.');
        scroll();
        break;

      case 'clear':
        output.innerHTML = '';
        return;

      case 'exit':
        window.location.href = '../';
        return;

      default:
        print(`command not found: ${cmd}`);
        print("try 'help'");
        scroll();
    }
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      run(input.value);
      input.value = '';
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] ?? '';
      const len = input.value.length;
      input.setSelectionRange(len, len);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!history.length) return;
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] ?? '';
      const len = input.value.length;
      input.setSelectionRange(len, len);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.value.trim();
      if (!partial || partial.includes(' ')) return;
      const matches = COMMANDS.filter((c) => c.startsWith(partial));
      if (matches.length === 1) {
        input.value = matches[0] + ' ';
      } else if (matches.length > 1) {
        const echo = document.createElement('div');
        echo.className = 'term-line term-echo';
        echo.textContent = matches.join('   ');
        output.appendChild(echo);
        scroll();
      }
    }
  });

  page.addEventListener('click', () => input.focus());
  input.focus();
}
