# Shahizwan & Anis

Laman awam: https://shahizwananis.vercel.app/

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

RSVP submits to a server endpoint and confirms only after a Google Sheets append succeeds. Configure server credentials and the deployment-specific sheet ID using [RSVP setup](docs/RSVP-SETUP.md). Until configured, submissions show an error and preserve the form. Run `npm run test:api` for backend checks. Maps opens a venue search; confirm the exact venue pin before launch. WhatsApp links open prefilled drafts without sending them.

Edit wedding copy in src/content.js, pages in src/main.js, and visual styling in src/styles.css. RSVP client code is in src/rsvp.js, with the Vercel handler in api/rsvp.js and Google Sheets storage in server/rsvp.js. Credentials must never be embedded in frontend code. Image provenance and generation prompt: [docs/ASSETS.md](docs/ASSETS.md).

Scroll or swipe to change pages. Each page fills one viewport without internal scrolling; sections scale responsively when a short screen needs more space. Fullscreen behaviour is in `src/scroll-navigation.js` and `src/fullscreen.css`.

Page changes use the reference video's direction-aware horizontal push/reveal followed by staggered content fades. The controller is in `src/page-transitions.js`; it settles safely when navigation is interrupted, the viewport changes, or reduced-motion is enabled.

The Event Details page retains the #dresscode route and presents the dress code, Atur Cara schedule and Hidangan menu. Desktop and phones stack Atur Cara above Hidangan in a vertically scrollable page. Swipe left/right or use the left/right arrow keys to change pages. When the page overflows, vertical wheel and keyboard input scroll its content without leaving the page. Content is in src/content.js and styling is in src/event-details.css. Original dresscode artwork remains in public/assets for reference.

## Preview perkongsian pautan

Metadata Open Graph/Twitter tersedia terus dalam `index.html`, termasuk URL HTTPS mutlak ke `public/assets/og-kenangan-v1.jpg` (1200 × 630). Semua seksyen menggunakan kad perkongsian yang sama. Sumber imej tersimpan dalam `references/og-kenangan-source.png`; jalankan `node scripts/export-og.mjs` untuk mengeksport semula JPG.

Jika domain berubah, kemas kini canonical, `og:url`, dan semua URL imej dalam `index.html`. Untuk reka bentuk baharu, gunakan nama aset versi baharu dan kemas kini metadata supaya cache imej lama tidak digunakan. Selepas push ke `main`, semak deployment Vercel dan uji pautan dalam aplikasi perkongsian. Facebook Sharing Debugger boleh menyegar cache Facebook; cache WhatsApp bergantung pada aplikasi dan mungkin mengambil masa. `noindex, nofollow` dikekalkan sebagai permintaan kepada enjin carian; laman dan foto masih boleh dicapai secara awam.
