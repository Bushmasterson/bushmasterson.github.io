import { getCurrentTheme, toggleTheme } from './theme.js';
import { toggleDisco } from './disco.js';

const VFS: Record<string, string[]> = {
  'about.md': [
    'birthday on november 2',
    'live in moscow',
    'i code in c++ (main), python and typescript',
    'i speak in russian & english, learning german',
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
  'banner',
  'cat',
  'cd',
  'clear',
  'date',
  'echo',
  'exit',
  'hahaha',
  'help',
  'history',
  'ls',
  'man',
  'neofetch',
  'pwd',
  'social',
  'sudo',
  'theme',
  'tree',
  'uses',
  'whoami',
  'projects',
] as const;

const MAN: Record<string, string> = {
  help: 'list all commands, grouped by purpose',
  whoami: 'print current user identity',
  ls: 'list files in current directory',
  cat: 'read a file: cat <file>',
  tree: 'print file tree of the virtual fs',
  pwd: 'print working directory',
  cd: 'change directory (fake): cd <dir>',
  projects: 'list projects i build and maintain',
  uses: 'show what i use daily',
  social: 'print social links and contact',
  date: 'print current date and time',
  theme: 'toggle light / dark theme',
  echo: 'print the given text',
  history: 'show command history',
  clear: 'clear the screen',
  neofetch: 'print system info banner',
  banner: 'print large ascii name',
  hahaha: 'surprise',
  sudo: 'attempt privileged command',
  exit: 'go back to the home page',
};

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

  const print = (text: string, cls = 'term-line term-body'): void => {
    const line = document.createElement('div');
    line.className = cls;
    line.textContent = text;
    output.appendChild(line);
  };

  const printGroup = (title: string): void => {
    const line = document.createElement('div');
    line.className = 'term-line term-group';
    line.textContent = `╭─ ${title}`;
    output.appendChild(line);
  };

  const printHead = (title: string, meta = ''): void => {
    const line = document.createElement('div');
    line.className = 'term-line term-head';
    line.textContent = meta ? `${title}  ──  ${meta}` : title;
    output.appendChild(line);
  };

  const printRule = (): void => {
    const line = document.createElement('div');
    line.className = 'term-line term-rule';
    line.textContent = '─'.repeat(60);
    output.appendChild(line);
  };

  const printLines = (lines: string[], indent = true): void => {
    lines.forEach((l) =>
      print(l, indent ? 'term-line term-body' : 'term-line'),
    );
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

  const showHelp = (): void => {
    const groups: Array<[string, string[]]> = [
      [
        'navigation',
        [
          'cd <dir>      change directory (fake)',
          'ls            list files',
          'pwd           print working directory',
          'tree          show file tree',
        ],
      ],
      [
        'files',
        ['cat <file>    read a file', 'man <cmd>     manual for a command'],
      ],
      [
        'info',
        [
          'whoami        who am i',
          'projects      list projects',
          'uses          what i use',
          'social        social links',
          'date          current time',
          'neofetch      system info',
        ],
      ],
      [
        'controls',
        [
          'theme         toggle theme',
          'echo <text>   print text',
          'history       command history',
          'clear         clear screen',
          'hahaha        surprise',
          'banner        ascii banner',
          'exit          go home',
        ],
      ],
    ];
    groups.forEach(([name, cmds]) => {
      printGroup(name);
      cmds.forEach((c) => print(`│   ${c}`, 'term-line term-body'));
    });
    scroll();
  };

  const showNeofetch = (): void => {
    const banner = [
      '    ▄▄▄▄▄    bushmasterson@arch',
      '  ▄█▀▀▀▀▀█▄  ─────────────────',
      ' █▀  ▄▄▄  ▀█  os       arch linux',
      ' █  █▀▀▀█  █  host     personal site',
      ' █  █   █  █  kernel   6.x-custom',
      ' █▄  ▀▀▀  ▄█  shell    zsh',
      '  ▀█▄▄▄▄▄█▀   lang     c++ / py / ts',
      '    ▀▀▀▀▀    editor   vscode',
    ];
    printHead('neofetch', 'system info');
    printRule();
    printLines(banner, false);
  };

  const showBanner = (): void => {
    const art = [
      '  ██████╗ ██╗   ██╗███████╗██╗  ██╗███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗ ███████╗ ██████╗ ███╗   ██╗',
      '  ██╔══██╗██║   ██║██╔════╝██║  ██║████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔════╝██╔═══██╗████╗  ██║',
      '  ██████╔╝██║   ██║███████╗███████║██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝███████╗██║   ██║██╔██╗ ██║',
      '  ██╔══██╗██║   ██║╚════██║██╔══██║██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗╚════██║██║   ██║██║╚██╗██║',
      '  ██████╔╝╚██████╔╝███████║██║  ██║██║ ╚═╝ ██║██║  ██║███████║   ██║   ███████╗██║  ██║███████║╚██████╔╝██║ ╚████║',
      '  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝',
    ];
    printHead('banner', 'ascii name');
    printRule();
    printLines(art, false);
  };

  const showTree = (): void => {
    const lines = [
      '~/bushmasterson',
      '├── about.md',
      '├── projects.md',
      '├── rules.md',
      '├── social.md',
      '├── uses.md',
      '└── (hidden)',
    ];
    printHead('tree', `${Object.keys(VFS).length} files`);
    printRule();
    printLines(lines, false);
  };

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
        showHelp();
        break;

      case 'whoami':
        printHead('whoami', 'identity');
        printRule();
        printLines([
          'bushmasterson',
          'freedom thinker, coder, athlete',
          'c++ / python / typescript',
        ]);
        break;

      case 'ls': {
        const files = Object.keys(VFS);
        printHead('ls', `${files.length} files`);
        printRule();
        printLines(
          files.map((f) => `· ${f}`),
          false,
        );
        break;
      }

      case 'tree':
        showTree();
        break;

      case 'cat': {
        if (!arg) {
          print('usage: cat <file>');
          break;
        }
        const file = VFS[arg];
        if (!file) {
          print(`cat: ${arg}: no such file or directory`);
          break;
        }
        printHead(`cat ${arg}`, `${file.length} lines`);
        printRule();
        printLines(file);
        break;
      }

      case 'man': {
        if (!arg) {
          print('usage: man <command>');
          print('available: ' + COMMANDS.join(' · '));
          break;
        }
        const man = MAN[arg];
        if (!man) {
          print(`man: ${arg}: no entry`);
          break;
        }
        printHead(`man ${arg}`, 'manual');
        printRule();
        printLines([man]);
        break;
      }

      case 'pwd':
        printHead('pwd', 'working directory');
        printRule();
        printLines([
          cwd === '~' ? '/home/bushmasterson' : `/home/bushmasterson/${cwd}`,
        ]);
        break;

      case 'cd': {
        const next = !arg || arg === '~' || arg === '..' ? '~' : arg;
        cwd = next;
        printHead('cd', `→ ${cwd}`);
        break;
      }

      case 'projects':
        printHead('projects', 'what i build');
        printRule();
        printLines(VFS['projects.md'] ?? []);
        break;

      case 'uses':
        printHead('uses', 'daily tools');
        printRule();
        printLines(VFS['uses.md'] ?? []);
        break;

      case 'social':
        printHead('social', 'where to find me');
        printRule();
        printLines(VFS['social.md'] ?? []);
        break;

      case 'date': {
        const d = new Date();
        const pad = (n: number): string => String(n).padStart(2, '0');
        const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        printHead('date', 'current time');
        printRule();
        printLines([`${iso} msk`]);
        break;
      }

      case 'theme': {
        toggleTheme();
        printHead('theme', `→ ${getCurrentTheme()}`);
        break;
      }

      case 'echo':
        print(arg);
        scroll();
        break;

      case 'history':
        printHead('history', `${Math.max(0, history.length - 1)} entries`);
        printRule();
        history
          .slice(0, -1)
          .forEach((h, i) =>
            print(`  ${String(i + 1).padStart(2, ' ')}  ${h}`),
          );
        scroll();
        break;

      case 'sudo':
        printHead('sudo', 'permission denied');
        printRule();
        printLines(['nice try.', 'but this incident will be reported.']);
        break;

      case 'neofetch':
        showNeofetch();
        break;

      case 'banner':
        showBanner();
        break;

      case 'hahaha': {
        const started = toggleDisco();
        printHead('hahaha', started ? 'party time' : 'party over');
        break;
      }

      case 'clear':
        output.innerHTML = '';
        return;

      case 'exit':
        window.location.href = '../';
        return;

      default:
        print(`command not found: ${cmd}`);
        print(`try 'help'`);
        scroll();
    }
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      run(input.value);
      input.value = '';
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      output.innerHTML = '';
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      input.value = '';
      print(`${currentPrompt()} ${input.value}^C`, 'term-line term-echo');
      scroll();
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
      if (!partial) return;

      const parts = partial.split(/\s+/);
      const lastPart = parts[parts.length - 1] ?? '';
      const isArg = parts.length > 1;
      const cmd = parts[0] ?? '';

      if (!isArg) {
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
        return;
      }

      const argSource =
        cmd === 'cat'
          ? Object.keys(VFS)
          : cmd === 'man'
            ? Object.keys(MAN)
            : [];
      const matches = argSource.filter((f) => f.startsWith(lastPart));
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0]!;
        input.value = parts.join(' ') + ' ';
      } else if (matches.length > 1) {
        const echo = document.createElement('div');
        echo.className = 'term-line term-echo';
        echo.textContent = matches.join('   ');
        output.appendChild(echo);
        scroll();
      }
    }
  });

  page.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('a')) return;
    input.focus();
  });
  input.focus();
}
