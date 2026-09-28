# Shahizwan & Anis

Local wedding invitation prototype. Product requirements: [docs/PRD.md](docs/PRD.md).

## Struktur folder

- `src/` — kod aplikasi dan gaya.
- `public/assets/` — aset yang dipaparkan oleh website.
- `references/` — video, inspirasi dan aset asal klien; tidak dimuatkan oleh website.
- `docs/` — PRD dan rekod asal aset.
- `tests/` — semakan automatik Playwright.
- `scripts/` — utiliti semakan visual.

## Run

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite (normally http://127.0.0.1:5173).

```sh
npm run build
npm run preview
```

## Verify

```sh
npx playwright install chromium
npm test
```

RSVP is a simulation. Responses remain in memory only and are never sent or saved. Google Sheets is not connected. Maps opens a venue search; confirm the exact venue pin before launch. WhatsApp links open prefilled drafts without sending them.

Edit wedding copy in src/content.js, pages in src/main.js, and visual styling in src/styles.css. The future RSVP integration boundary is src/rsvp.js; credentials must never be embedded in frontend code. Image provenance and generation prompt: [docs/ASSETS.md](docs/ASSETS.md).

Scroll or swipe to change pages. Each page fills the viewport; content that exceeds a short screen scrolls internally before a fresh gesture switches pages. Fullscreen behaviour is in `src/scroll-navigation.js` and `src/fullscreen.css`.

The Dresscode page has 16 independently draggable garment/accessory pieces. Drag with mouse or touch, use arrow keys on a focused piece, or press Reset to restore the arrangement. On phones, switch between Wanita and Lelaki. Interaction code is in `src/dresscode.js`; the artwork is `public/assets/dresscode-pieces.png`.
