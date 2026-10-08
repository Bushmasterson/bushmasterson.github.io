/* music player — play/pause, seek, keyboard */

const LABEL_PLAY = 'play c418 — sweden';
const LABEL_PAUSE = 'pause c418 — sweden';
const LABEL_ERROR = 'track unavailable';

export function initPlayer(): void {
  const player = document.querySelector<HTMLElement>('#player');
  const toggle = document.querySelector<HTMLButtonElement>('#player-toggle');
  const audio = document.querySelector<HTMLAudioElement>('#player-audio');
  const progress = document.querySelector<HTMLElement>('#player-progress');
  const bar = document.querySelector<HTMLElement>('#player-progress-bar');
  const currentEl = document.querySelector<HTMLElement>('#player-current');
  const totalEl = document.querySelector<HTMLElement>('#player-total');

  if (
    !player ||
    !toggle ||
    !audio ||
    !progress ||
    !bar ||
    !currentEl ||
    !totalEl
  ) {
    return;
  }

  audio.volume = 0.35;

  const formatTime = (s: number): string => {
    if (!Number.isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const setPlaying = (playing: boolean): void => {
    player.classList.toggle('is-playing', playing);
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? LABEL_PAUSE : LABEL_PLAY);
  };

  const setError = (): void => {
    player.classList.add('is-error');
    toggle.disabled = true;
    toggle.setAttribute('aria-label', LABEL_ERROR);
    const track = player.querySelector<HTMLElement>('.player-track');
    if (track) track.textContent = LABEL_ERROR;
  };

  const updateProgress = (): void => {
    const duration = audio.duration;
    const current = audio.currentTime;
    const pct = duration > 0 ? (current / duration) * 100 : 0;
    bar.style.width = `${pct}%`;
    currentEl.textContent = formatTime(current);
    progress.setAttribute('aria-valuenow', String(Math.round(pct)));
  };

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('ended', () => setPlaying(false));
  audio.addEventListener('error', setError);

  audio.addEventListener('loadedmetadata', () => {
    totalEl.textContent = formatTime(audio.duration);
    updateProgress();
  });

  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('seeked', updateProgress);

  const seek = (clientX: number): void => {
    const duration = audio.duration;
    if (!duration) return;
    const rect = progress.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
  };

  progress.addEventListener('pointerdown', (e) => {
    seek(e.clientX);
    try {
      progress.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  });

  progress.addEventListener('pointermove', (e) => {
    if (progress.hasPointerCapture?.(e.pointerId)) seek(e.clientX);
  });

  progress.addEventListener('pointerup', (e) => {
    try {
      progress.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  });

  progress.addEventListener('keydown', (e) => {
    const duration = audio.duration;
    if (!duration) return;
    const step = 5;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      audio.currentTime = Math.min(duration, audio.currentTime + step);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      audio.currentTime = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      audio.currentTime = duration;
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle.click();
    }
  });

  setPlaying(false);
  updateProgress();
}
