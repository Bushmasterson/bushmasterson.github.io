/**
 * Project filtering on /projects page.
 * Filters cards by data-tags. Updates counter. Purely client-side.
 */

type Filter = 'all' | 'telegram' | 'typescript' | 'c++';

export function initProjectFilter(): void {
  const toolbar = document.querySelector<HTMLElement>('.projects-toolbar');
  if (!toolbar) return;

  const buttons = toolbar.querySelectorAll<HTMLButtonElement>('.filter-btn');
  const cards = document.querySelectorAll<HTMLElement>('.project-card');
  const counter = toolbar.querySelector<HTMLElement>('.projects-count-num');

  if (!buttons.length || !cards.length) return;

  function applyFilter(filter: Filter): void {
    let visible = 0;

    cards.forEach((card) => {
      const tags = (card.dataset['tags'] ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const match = filter === 'all' || tags.includes(filter);

      if (match) {
        card.hidden = false;
        visible += 1;
        card.animate(
          [
            { opacity: 0, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: 320,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both',
          },
        );
      } else {
        card.hidden = true;
      }
    });

    if (counter) counter.textContent = String(visible);

    buttons.forEach((btn) => {
      btn.setAttribute(
        'aria-pressed',
        String(btn.dataset['filter'] === filter),
      );
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = (btn.dataset['filter'] ?? 'all') as Filter;
      applyFilter(filter);
    });
  });
}
