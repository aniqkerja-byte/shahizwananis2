// Atlas cells are independent visual items, each with its own pointer target.
const pieces = [
  { id: 'kurung-skirt', label: 'Kain baju kurung biru gelap', cell: 1, side: 'women', x: 105, mobileX: 105, y: 239, size: 166, layer: 1 },
  { id: 'kebaya-skirt', label: 'Kain kebaya hijau zaitun', cell: 5, side: 'women', x: 265, mobileX: 285, y: 239, size: 176, layer: 1 },
  { id: 'navy-trousers', label: 'Seluar baju Melayu biru gelap', cell: 9, side: 'men', x: 475, mobileX: 105, y: 239, size: 184, layer: 1 },
  { id: 'charcoal-trousers', label: 'Seluar kelabu arang', cell: 13, side: 'men', x: 640, mobileX: 285, y: 239, size: 182, layer: 1 },
  { id: 'kurung-top', label: 'Baju kurung biru gelap', cell: 0, side: 'women', x: 105, mobileX: 105, y: 125, size: 160, layer: 2 },
  { id: 'kebaya-top', label: 'Baju kebaya hijau lembut', cell: 4, side: 'women', x: 265, mobileX: 285, y: 125, size: 160, layer: 2 },
  { id: 'melayu-top', label: 'Baju Melayu biru gelap', cell: 8, side: 'men', x: 475, mobileX: 105, y: 125, size: 150, layer: 2 },
  { id: 'casual-shirt', label: 'Kemeja coklat', cell: 12, side: 'men', x: 640, mobileX: 285, y: 125, size: 154, layer: 2 },
  { id: 'sampin', label: 'Sampin biru dan emas', cell: 10, side: 'men', x: 475, mobileX: 105, y: 210, size: 104, layer: 3 },
  { id: 'selendang', label: 'Selendang perang kelabu', cell: 2, side: 'women', x: 98, mobileX: 98, y: 52, size: 88, layer: 4 },
  { id: 'songkok', label: 'Songkok hitam', cell: 11, side: 'men', x: 475, mobileX: 105, y: 39, size: 65, layer: 4 },
  { id: 'handbag', label: 'Beg tangan perang kelabu', cell: 6, side: 'women', x: 325, mobileX: 340, y: 201, size: 80, layer: 4 },
  { id: 'black-heels', label: 'Kasut wanita hitam', cell: 3, side: 'women', x: 105, mobileX: 105, y: 320, size: 76, layer: 3 },
  { id: 'brown-heels', label: 'Kasut wanita coklat', cell: 7, side: 'women', x: 265, mobileX: 285, y: 320, size: 72, layer: 3 },
  { id: 'loafers', label: 'Kasut loafer lelaki', cell: 14, side: 'men', x: 640, mobileX: 285, y: 320, size: 76, layer: 3 },
  { id: 'capal', label: 'Capal hitam', cell: 15, side: 'men', x: 475, mobileX: 105, y: 320, size: 72, layer: 3 },
];

const arrangements = new Map();
let selectedGroup = 'women';
const compact = () => matchMedia('(max-width: 600px)').matches;

export function dresscodeBoard() {
  return `<div class="dresscode-playground">
    <div class="outfit-tabs" role="group" aria-label="Pilihan pakaian"><button type="button" data-outfit-group="women">Wanita</button><button type="button" data-outfit-group="men">Lelaki</button></div>
    <div class="outfit-headings" aria-hidden="true"><span class="eyebrow">Untuk wanita</span><span class="eyebrow">Untuk lelaki</span></div>
    <div class="outfit-board" role="group" aria-label="Lookbook interaktif" aria-describedby="drag-help" data-group="${selectedGroup}">
      ${pieces.map(piece => `<button type="button" class="dress-piece" data-piece="${piece.id}" data-side="${piece.side}" aria-label="${piece.label}" aria-describedby="drag-help" title="${piece.label}" style="--sprite-x:${(piece.cell % 4) * 100 / 3}%;--sprite-y:${Math.floor(piece.cell / 4) * 100 / 3}%;z-index:${piece.layer}"><span class="piece-art" aria-hidden="true"></span></button>`).join('')}
    </div>
    <div class="outfit-toolbar"><p id="drag-help">Susun gaya anda <span>· Seret item pakaian ke mana-mana</span></p><button type="button" class="reset-outfits" aria-label="Set semula susunan pakaian">↺ <span>Semula</span></button></div>
    <span class="sr-only" id="outfit-status" aria-live="polite"></span>
    <span class="sr-only">Guna Tab untuk pilih item. Tekan anak panah untuk alih item, Shift untuk langkah lebih besar, atau Escape untuk pulangkan item ke kedudukan asal.</span>
  </div>`;
}

export function bindDresscode() {
  const board = document.querySelector('.outfit-board');
  const status = document.querySelector('#outfit-status');
  let drag = null;
  let topLayer = 5;
  const buttons = [...board.querySelectorAll('.dress-piece')];
  const key = id => `${compact() ? 'mobile' : 'desktop'}:${id}`;
  const initial = piece => ({
    x: (compact() ? piece.mobileX / 400 : piece.x / 720) * 100,
    y: piece.y / 360 * 100,
  });
  const position = (button, point) => {
    button.style.left = `${point.x}%`;
    button.style.top = `${point.y}%`;
  };
  const bounded = (button, point) => {
    const halfWidth = button.offsetWidth / board.clientWidth * 50;
    const halfHeight = button.offsetHeight / board.clientHeight * 50;
    return {
      x: Math.max(halfWidth, Math.min(100 - halfWidth, point.x)),
      y: Math.max(halfHeight, Math.min(100 - halfHeight, point.y)),
    };
  };
  const update = (button, point) => {
    const next = bounded(button, point);
    arrangements.set(key(button.dataset.piece), next);
    position(button, next);
  };
  const layout = () => {
    buttons.forEach(button => {
      const piece = pieces.find(p => p.id === button.dataset.piece);
      button.style.width = `${piece.size / (compact() ? 400 : 720) * 100}%`;
      position(button, arrangements.get(key(piece.id)) || initial(piece));
      if (!compact() || button.dataset.side === selectedGroup) {
        const saved = arrangements.get(key(piece.id));
        if (saved) update(button, saved);
      }
    });
  };
  const endDrag = () => {
    if (!drag) return;
    const { button, pointerId } = drag;
    drag = null;
    button.classList.remove('is-dragging');
    board.classList.remove('is-dragging');
    if (button.hasPointerCapture(pointerId)) button.releasePointerCapture(pointerId);
    status.textContent = `${button.getAttribute('aria-label')} dialihkan.`;
  };
  board.addEventListener('pointerdown', event => {
    const button = event.target.closest('.dress-piece');
    if (!button || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    const piece = pieces.find(p => p.id === button.dataset.piece);
    drag = { button, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, start: arrangements.get(key(piece.id)) || initial(piece) };
    button.focus({ preventScroll: true });
    button.style.zIndex = ++topLayer;
    button.classList.add('is-dragging');
    board.classList.add('is-dragging');
    button.setPointerCapture(event.pointerId);
  });
  board.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const visual = board.getBoundingClientRect();
    const scaleX = visual.width / board.clientWidth || 1;
    const scaleY = visual.height / board.clientHeight || 1;
    update(drag.button, {
      x: drag.start.x + (event.clientX - drag.startX) / scaleX / board.clientWidth * 100,
      y: drag.start.y + (event.clientY - drag.startY) / scaleY / board.clientHeight * 100,
    });
  });
  board.addEventListener('pointerup', endDrag);
  board.addEventListener('pointercancel', endDrag);
  board.addEventListener('lostpointercapture', endDrag);
  board.addEventListener('keydown', event => {
    const button = event.target.closest('.dress-piece');
    if (!button || event.ctrlKey || event.metaKey || event.altKey) return;
    const piece = pieces.find(p => p.id === button.dataset.piece);
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (event.key === 'Escape') {
      event.preventDefault();
      endDrag();
      arrangements.delete(key(piece.id));
      position(button, initial(piece));
      button.style.zIndex = piece.layer;
      status.textContent = `${piece.label} dipulangkan ke kedudukan asal.`;
    } else if (directions[event.key]) {
      event.preventDefault();
      const [dx, dy] = directions[event.key];
      const step = event.shiftKey ? 24 : 8;
      const point = arrangements.get(key(piece.id)) || initial(piece);
      update(button, { x: point.x + dx * step / board.clientWidth * 100, y: point.y + dy * step / board.clientHeight * 100 });
      button.style.zIndex = ++topLayer;
    }
  });
  document.querySelector('.reset-outfits').addEventListener('click', () => {
    endDrag();
    arrangements.clear();
    buttons.forEach(button => { button.style.zIndex = pieces.find(p => p.id === button.dataset.piece).layer; });
    layout();
    status.textContent = 'Semua pakaian dipulangkan ke susunan asal.';
  });
  const tabs = [...document.querySelectorAll('[data-outfit-group]')];
  const select = group => {
    endDrag();
    selectedGroup = group;
    board.dataset.group = group;
    tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.outfitGroup === group)));
    layout();
  };
  tabs.forEach(tab => tab.addEventListener('click', () => select(tab.dataset.outfitGroup)));
  select(selectedGroup);
  const resize = new ResizeObserver(() => { endDrag(); layout(); });
  resize.observe(board);
  return () => { endDrag(); resize.disconnect(); };
}
