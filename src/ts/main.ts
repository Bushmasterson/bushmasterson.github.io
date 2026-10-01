import { initParticles } from './features/particles.js';
import { initBackToTop } from './features/back-to-top.js';
import { initAvatar } from './features/avatar.js';
import { initTyping } from './features/typing.js';
import { initBoot } from './features/boot.js';
import { initTerminal } from './features/terminal.js';
import { initTheme } from './features/theme.js';

initTheme();

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
