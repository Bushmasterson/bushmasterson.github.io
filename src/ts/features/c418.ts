export function initC418(): void {
  const widget = document.querySelector<HTMLElement>('.now-playing');
  const toggle = document.querySelector<HTMLButtonElement>(
    '#now-playing-toggle',
  );
  const audio = document.querySelector<HTMLAudioElement>('#now-playing-audio');
  const icon = toggle?.querySelector<HTMLElement>('.now-playing-icon');

  if (!widget || !toggle || !audio || !icon) return;

  audio.volume = 0.35;

  const setPlaying = (playing: boolean): void => {
    widget.classList.toggle('is-playing', playing);
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute(
      'aria-label',
      playing ? 'Pause c418 — sweden' : 'Play c418 — sweden',
    );
    icon.textContent = playing ? '❚❚' : '▶';
  };

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('ended', () => setPlaying(false));

  setPlaying(false);
}
