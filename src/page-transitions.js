// Match the reference: two complete page canvases meet at a clean vertical seam
// while the old canvas dims and the new composition resolves in softly.
export function createPageTransitions(container) {
  const root = container.closest('#app');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  let revision = 0;
  let oldLayer = null;
  let newLayer = null;

  function clear() {
    revision++;
    for (const animation of animations) animation.cancel();
    animations.clear();
    oldLayer?.remove();
    newLayer?.remove();
    oldLayer = null;
    newLayer = null;
    delete container.dataset.transitioning;
  }

  function animate(element, frames, options) {
    const animation = element.animate(frames, {
      duration: 620,
      easing: 'cubic-bezier(.76, 0, .24, 1)',
      fill: 'both',
      ...options,
    });
    animations.add(animation);
    return animation.finished.catch(() => {});
  }

  function makeLayer(kind) {
    const layer = root.cloneNode(true);
    layer.removeAttribute('id');
    layer.className = `site-transition-layer site-transition-${kind}`;
    layer.setAttribute('aria-hidden', 'true');
    layer.inert = true;
    layer.querySelector('#page-announcement')?.remove();
    layer.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    layer.querySelectorAll('a').forEach(link => {
      link.removeAttribute('href');
      link.removeAttribute('data-page');
    });

    // Keep a single semantic <main> in the document while preserving its layout.
    const clonedMain = layer.querySelector('main');
    if (clonedMain) {
      const visualMain = document.createElement('div');
      visualMain.className = 'transition-main';
      visualMain.setAttribute('data-page', clonedMain.dataset.page || '');
      visualMain.innerHTML = clonedMain.innerHTML;
      clonedMain.replaceWith(visualMain);
    }
    return layer;
  }

  function revealContent(page, direction, initial) {
    if (!page) return [];
    return [...page.children]
      .filter(element => !element.classList.contains('sr-only'))
      .map((element, index) => animate(element, [
        { opacity: 0, translate: `${direction * 16}px 0` },
        { opacity: 1, translate: '0 0' },
      ], {
        delay: (initial ? 25 : 210) + Math.min(index, 5) * 38,
        duration: initial ? 430 : 390,
        easing: 'cubic-bezier(.22, 1, .36, 1)',
      }));
  }

  async function run(render, { direction = 1, initial = false } = {}) {
    clear();
    const current = revision;

    if (reducedMotion.matches || typeof root.animate !== 'function') {
      render();
      return;
    }

    if (!initial && container.querySelector('.page')) oldLayer = makeLayer('old');
    render();
    if (current !== revision) return;

    if (initial || !oldLayer) {
      container.dataset.transitioning = 'true';
      try {
        await Promise.all(revealContent(container.querySelector('.page'), direction, true));
      } finally {
        if (current === revision) clear();
      }
      return;
    }

    newLayer = makeLayer('new');
    document.body.append(oldLayer, newLayer);
    container.dataset.transitioning = 'true';
    const newPage = newLayer.querySelector('.page');
    const startX = direction * 100;
    const endX = -direction * 100;
    const effects = [
      animate(oldLayer, [
        { transform: 'translate3d(0, 0, 0)', filter: 'brightness(1)' },
        { transform: `translate3d(${endX}%, 0, 0)`, filter: 'brightness(.72)' },
      ]),
      animate(newLayer, [
        { transform: `translate3d(${startX}%, 0, 0)` },
        { transform: 'translate3d(0, 0, 0)' },
      ]),
      ...revealContent(newPage, direction, false),
    ];

    try {
      await Promise.all(effects);
    } finally {
      if (current === revision) clear();
    }
  }

  function finish() {
    clear();
  }

  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finish(); });
  window.addEventListener('resize', finish);
  // Let users interact immediately instead of waiting for the visual tail.
  root.addEventListener('pointerdown', event => {
    if (event.target.closest('button, input, select, textarea, a')) finish();
  }, { capture: true });
  root.addEventListener('keydown', event => {
    if (event.target.closest('button, input, select, textarea')) finish();
  }, { capture: true });
  return { run, finish };
}
