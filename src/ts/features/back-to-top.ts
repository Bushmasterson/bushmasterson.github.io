export function initBackToTop(): void {
  const el = document.querySelector<HTMLButtonElement>('#back-to-top');
  if (!el) return;

  const SCROLL_THRESHOLD = 300;
  let ticking = false;

  const update = (): void => {
    el.classList.toggle('visible', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  };

  const onScroll = (): void => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  el.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener(
    'pagehide',
    () => window.removeEventListener('scroll', onScroll),
    { once: true },
  );
}
