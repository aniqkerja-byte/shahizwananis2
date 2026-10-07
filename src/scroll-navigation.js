// One deliberate wheel/swipe gesture changes one fullscreen page.
export function installScrollNavigation({ container, navigate, menuIsOpen }) {
  const gestureGap = 350;
  const transitionTime = 520;
  let lastWheel = -Infinity;
  let total = 0;
  let consumed = false;
  let blockedUntil = 0;
  let touch = null;

  const isControl = target => target instanceof Element &&
    Boolean(target.closest('input, textarea, select, button, [contenteditable="true"]'));
  const overflowingPage = () => {
    const page = container.querySelector('[data-page-scroll]');
    return page && page.scrollHeight > page.clientHeight + 1 ? page : null;
  };
  const changePage = direction => {
    if (performance.now() < blockedUntil) return;
    if (navigate(direction)) blockedUntil = performance.now() + transitionTime;
  };

  window.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || menuIsOpen()) return;
    if (overflowingPage() && container.contains(event.target)) {
      total = 0;
      consumed = true;
      lastWheel = performance.now();
      return;
    }
    const now = performance.now();
    if (now - lastWheel > gestureGap) {
      total = 0;
      consumed = false;
    }
    lastWheel = now;
    if (isControl(event.target)) {
      consumed = true;
      return;
    }
    event.preventDefault();
    if (now < blockedUntil) {
      consumed = true;
      // Treat continued wheel events as momentum from the same gesture. A brief
      // pause is enough to start a new intentional page change afterwards.
      blockedUntil = Math.max(blockedUntil, now + gestureGap);
      return;
    }
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? container.clientHeight : 1);
    const direction = Math.sign(delta);
    if (consumed) return;
    total = Math.sign(total) !== direction ? delta : total + delta;
    if (Math.abs(total) >= 32) {
      consumed = true;
      total = 0;
      changePage(direction);
    }
  }, { passive: false });

  window.addEventListener('touchstart', event => {
    touch = null;
    if (event.touches.length !== 1 || menuIsOpen() || isControl(event.target)) return;
    touch = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }, { passive: true });
  window.addEventListener('touchmove', event => {
    if (!touch || event.touches.length !== 1) { touch = null; return; }
    const dy = touch.y - event.touches[0].clientY;
    const dx = touch.x - event.touches[0].clientX;
    if (Math.abs(dx) > Math.abs(dy)) {
      event.preventDefault();
    }
  }, { passive: false });
  window.addEventListener('touchend', event => {
    const gesture = touch;
    touch = null;
    if (!gesture || !event.changedTouches.length || event.touches.length || menuIsOpen()) return;
    const dy = gesture.y - event.changedTouches[0].clientY;
    const dx = gesture.x - event.changedTouches[0].clientX;
    if (Math.abs(dx) < 36 || Math.abs(dx) <= Math.abs(dy)) return;
    changePage(Math.sign(dx));
  }, { passive: true });
  window.addEventListener('touchcancel', () => { touch = null; }, { passive: true });

  window.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        isControl(event.target) || event.target.closest('a') || menuIsOpen()) return;
    if (overflowingPage() && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) return;
    const direction = ['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key) ? 1
      : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    changePage(direction);
  });

  return {
    reset() {
      blockedUntil = performance.now() + transitionTime;
      total = 0;
      consumed = true;
      touch = null;
    },
  };
}
