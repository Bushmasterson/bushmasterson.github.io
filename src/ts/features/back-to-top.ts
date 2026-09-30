export function initBackToTop(): void {
  const el = document.querySelector<HTMLButtonElement>('#back-to-top');
  if (!el) return;

  const SCROLL_THRESHOLD = 300;

  window.addEventListener('scroll', () => {
    el.classList.toggle('visible', window.scrollY > SCROLL_THRESHOLD);
  });

  el.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
