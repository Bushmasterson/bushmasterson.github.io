export function initAvatar() {
    const avatar = document.querySelector('.avatar');
    if (!avatar)
        return;
    if (avatar.complete) {
        avatar.classList.add('loaded');
        return;
    }
    avatar.addEventListener('load', () => avatar.classList.add('loaded'), { once: true });
}
//# sourceMappingURL=avatar.js.map