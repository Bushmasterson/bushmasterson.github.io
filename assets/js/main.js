import { initParticles } from './features/particles.js';
import { initBackToTop } from './features/back-to-top.js';
import { initAvatar } from './features/avatar.js';
import { initTyping } from './features/typing.js';
const canvas = document.querySelector('#particles-canvas');
const ctx = canvas?.getContext('2d');
if (canvas && ctx) {
    initParticles(canvas, ctx);
}
initBackToTop();
initAvatar();
initTyping();
//# sourceMappingURL=main.js.map