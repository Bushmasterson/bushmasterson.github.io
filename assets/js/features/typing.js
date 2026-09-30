export function initTyping() {
    const els = document.querySelectorAll('[data-typed]');
    if (!els.length)
        return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    els.forEach((el) => {
        const text = el.dataset.typed ?? '';
        el.textContent = text;
        if (reduced)
            return;
        const speed = Number(el.dataset.speed ?? 55);
        const delay = Number(el.dataset.delay ?? 0);
        el.textContent = '';
        const tick = (i) => {
            if (i >= text.length)
                return;
            el.textContent = text.slice(0, i + 1);
            const jitter = speed + (Math.random() * 40 - 20);
            setTimeout(() => tick(i + 1), Math.max(15, jitter));
        };
        setTimeout(() => tick(0), delay);
    });
}
//# sourceMappingURL=typing.js.map