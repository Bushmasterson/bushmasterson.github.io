import { initParticles } from './features/particles.js';
import { initBackToTop } from './features/back-to-top.js';
import { initAvatar } from './features/avatar.js';
const canvas = document.querySelector('#particles-canvas');
const ctx = canvas?.getContext('2d');
if (canvas && ctx) {
    initParticles(canvas, ctx);
}
initBackToTop();
initAvatar();
//# sourceMappingURL=main.js.map