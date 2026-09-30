export function initAvatar(): void {
  const avatar = document.querySelector<HTMLImageElement>('.avatar');
  if (!avatar) return;

  if (avatar.complete) {
    avatar.classList.add('loaded');
    return;
  }

  avatar.addEventListener('load', () => avatar.classList.add('loaded'), { once: true });
}
