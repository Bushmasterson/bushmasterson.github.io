import { initParticles } from './features/particles.js';
import { initBackToTop } from './features/back-to-top.js';
import { initAvatar } from './features/avatar.js';
import { initTyping } from './features/typing.js';
import { initBoot } from './features/boot.js';
import { initTerminal } from './features/terminal.js';
import { initTheme } from './features/theme.js';
import { initProjectFilter } from './features/projects-filter.js';
import { initTerminalPage } from './features/terminal-page.js';
import { initSnake } from './features/snake.js';
import { initPlayer } from './features/player.js';
import { initShortcuts } from './features/shortcuts.js';
import { initTerminalFocusTrap } from './features/focus-trap.js';
import { initNavActive } from './features/nav-active.js';

const safe = (name: string, fn: () => void): void => {
  try {
    fn();
  } catch (err) {
    console.error(`[init:${name}]`, err);
  }
};

safe('theme', initTheme);
safe('shortcuts', initShortcuts);

const canvas = document.querySelector<HTMLCanvasElement>('#particles-canvas');
const ctx = canvas?.getContext('2d');
if (canvas && ctx) {
  safe('particles', () => initParticles(canvas, ctx));
}

safe('boot', initBoot);
safe('back-to-top', initBackToTop);
safe('avatar', initAvatar);
safe('typing', initTyping);
safe('terminal', initTerminal);
safe('projects-filter', initProjectFilter);
safe('terminal-page', initTerminalPage);
safe('snake', initSnake);
safe('player', initPlayer);
safe('focus-trap', initTerminalFocusTrap);
safe('nav-active', initNavActive);
