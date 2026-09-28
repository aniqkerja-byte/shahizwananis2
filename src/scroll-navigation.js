// One deliberate wheel/swipe gesture changes one page. Native scrolling stays
// available when a small viewport, zoom, or form errors make the content taller.
export function installScrollNavigation({ container, navigate, menuIsOpen }) {
  const gestureGap = 200;
  const transitionTime = 650;
  let lastWheel = -Infinity;
  let total = 0;
  let consumed = false;
  let blockedUntil = 0;
  let touch = null;

  const isControl = target => target instanceof Element &&
    Boolean(target.closest('input, textarea, select, button, [contenteditable="true"]'));
  const canScroll = direction => {
    // The entrance transform can temporarily enlarge scrollHeight even though
    // the actual layout fits; don't mistake that animation for long content.
    if (container.firstElementChild?.offsetHeight <= container.clientHeight + 2) return false;
    return direction > 0
      ? container.scrollTop + container.clientHeight < container.scrollHeight - 2
      : container.scrollTop > 2;
  };
  const changePage = direction => {
    if (performance.now() < blockedUntil) return;
    if (navigate(direction)) blockedUntil = performance.now() + transitionTime;
  };

  window.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || menuIsOpen()) return;
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
      return;
    }
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? container.clientHeight : 1);
    const direction = Math.sign(delta);
    if (canScroll(direction)) {
      container.scrollTop += delta;
      consumed = true;
      total = 0;
      return;
    }
    // Reaching the end of a long page never changes pages mid-gesture.
    if (consumed) return;
    total = Math.sign(total) !== direction ? delta : total + delta;
    if (Math.abs(total) >= 55) {
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
      canScrollDown: canScroll(1),
      canScrollUp: canScroll(-1),
    };
  }, { passive: true });
  window.addEventListener('touchmove', event => {
    if (!touch || event.touches.length !== 1) { touch = null; return; }
    const dy = touch.y - event.touches[0].clientY;
    const dx = touch.x - event.touches[0].clientX;
    if (Math.abs(dy) > Math.abs(dx) && !(dy > 0 ? touch.canScrollDown : touch.canScrollUp)) {
      event.preventDefault();
    }
  }, { passive: false });
  window.addEventListener('touchend', event => {
    const gesture = touch;
    touch = null;
    if (!gesture || !event.changedTouches.length || event.touches.length || menuIsOpen()) return;
    const dy = gesture.y - event.changedTouches[0].clientY;
    const dx = gesture.x - event.changedTouches[0].clientX;
    if (Math.abs(dy) < 60 || Math.abs(dy) <= Math.abs(dx)) return;
    if (dy > 0 ? gesture.canScrollDown : gesture.canScrollUp) return;
    changePage(Math.sign(dy));
  }, { passive: true });
  window.addEventListener('touchcancel', () => { touch = null; }, { passive: true });

  window.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        isControl(event.target) || event.target.closest('a') || menuIsOpen()) return;
    const direction = ['ArrowDown', 'PageDown', ' '].includes(event.key) ? 1
      : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    if (canScroll(direction)) container.scrollTop += direction * container.clientHeight * .85;
    else changePage(direction);
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
