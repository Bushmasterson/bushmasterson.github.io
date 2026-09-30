export function initBackToTop() {
    const el = document.querySelector('#back-to-top');
    if (!el)
        return;
    const SCROLL_THRESHOLD = 300;
    window.addEventListener('scroll', () => {
        el.classList.toggle('visible', window.scrollY > SCROLL_THRESHOLD);
    });
    el.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
//# sourceMappingURL=back-to-top.js.map