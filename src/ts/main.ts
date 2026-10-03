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
import { initC418 } from './features/c418.js';
import { initShortcuts } from './features/shortcuts.js';
import { initTerminalFocusTrap } from './features/focus-trap.js';
import { initNavActive } from './features/nav-active.js';

initTheme();
initShortcuts();

const canvas = document.querySelector<HTMLCanvasElement>('#particles-canvas');
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  initParticles(canvas, ctx);
}

initBoot();
initBackToTop();
initAvatar();
initTyping();
initTerminal();
initProjectFilter();
initTerminalPage();
initSnake();
initC418();
initTerminalFocusTrap();
initNavActive();
