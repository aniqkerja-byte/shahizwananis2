// A paper sheet covers the swap, then lifts away to reveal the next composition.
// Page fitting owns `transform`; motion uses independent translate/opacity only.
export function createPageTransitions(container) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  let revision = 0;
  let sheet = null;
  let pendingRender = null;

  function clear() {
    revision++;
    for (const animation of animations) animation.cancel();
    animations.clear();
    sheet?.remove();
    sheet = null;
    delete container.dataset.transitioning;
  }

  function finish() {
    const render = pendingRender;
    pendingRender = null;
    clear();
    render?.();
  }

  function animate(element, frames, options) {
    const animation = element.animate(frames, {
      duration: 380,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'both',
      ...options,
    });
    animations.add(animation);
    // Keep the final frame until the whole sequence settles, especially the
    // sheet off-screen, so shorter effects cannot flash back over the content.
    return animation.finished.catch(() => {});
  }

  function reveal(direction, initial) {
    const page = container.querySelector('.page');
    const groups = [...page.children].filter(el => !el.classList.contains('sr-only'));
    const effects = groups.map((el, index) => animate(el, [
      { opacity: 0, translate: `0 ${direction * 18}px` },
      { opacity: 1, translate: '0 0' },
    ], { delay: (initial ? 0 : 65) + Math.min(index, 5) * 35, duration: 360 }));

    // These are decorative photos, not interactive garment pointer targets.
    page.querySelectorAll('.memory').forEach((photo, index) => {
      effects.push(animate(photo, [
        { opacity: 0, translate: `0 ${direction * 24}px`, scale: '.96' },
        { opacity: 1, translate: '0 0', scale: '1' },
      ], { delay: 100 + index * 35, duration: 350 }));
    });
    return effects;
  }

  async function run(render, { direction = 1, initial = false } = {}) {
    clear();
    pendingRender = render;
    const current = revision;
    if (reducedMotion.matches || typeof container.animate !== 'function') {
      pendingRender = null;
      render();
      return;
    }

    container.dataset.transitioning = 'true';
    try {
      if (!initial && container.querySelector('.page')) {
        sheet = document.createElement('div');
        sheet.className = 'page-turn-sheet';
        sheet.setAttribute('aria-hidden', 'true');
        container.append(sheet);
        const oldPage = container.querySelector('.page');
        // The sheet stays opaque throughout: there is no blank flash at the swap.
        await Promise.all([
          animate(oldPage, [
            { opacity: 1, translate: '0 0' },
            { opacity: .25, translate: `0 ${-direction * 28}px` },
          ], { duration: 230, easing: 'cubic-bezier(.55, 0, .8, .4)' }),
          animate(sheet, [
            { transform: `translateY(${direction * 110}%)` },
            { transform: 'translateY(0)' },
          ], { duration: 230, easing: 'cubic-bezier(.55, 0, .2, 1)' }),
        ]);
        if (current !== revision) return;
      }

      pendingRender = null;
      render();
      if (sheet) container.append(sheet);
      const effects = reveal(direction, initial);
      if (sheet) effects.push(animate(sheet, [
        { transform: 'translateY(0)' },
        { transform: `translateY(${-direction * 110}%)` },
      ], { duration: 460, easing: 'cubic-bezier(.22, 1, .36, 1)' }));
      await Promise.all(effects);
    } finally {
      if (current === revision) clear();
    }
  }

  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finish(); });
  window.addEventListener('resize', finish);
  // Interacting with new content immediately settles its entrance animation.
  container.addEventListener('pointerdown', event => {
    if (!pendingRender && event.target.closest('button, input, select, textarea, a')) finish();
  }, { capture: true });
  container.addEventListener('keydown', event => {
    if (!pendingRender && event.target.closest('button, input, select, textarea')) finish();
  }, { capture: true });
  return { run, finish };
}
