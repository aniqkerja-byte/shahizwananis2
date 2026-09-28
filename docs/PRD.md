# PRD — Shahizwan & Anis Wedding RSVP

Status: approved scope, localhost design prototype. Last updated: 28 September 2026.

## 1. Product and success criteria

A personal wedding invitation for Mohd Shahizwan Mohammad Shahari and Anis Jamilah Jamlus, closely following the website shown inside references/main_reference.mp4. Guests can read the invitation, browse outfit inspiration, find the reception and contact its organisers, preview an RSVP, and read a personal closing note.

The first release is a working localhost design review. Success means all five pages are visually complete, usable on desktop and mobile, and navigation, contact links and RSVP validation work. The prototype must not imply that a real RSVP has been delivered. Google Sheets integration is a later phase.

## 2. Reference and visual direction

- Primary reference: the website within references/main_reference.mp4, not the surrounding photographic video background or browser chrome. Preserve generous blank space, elegant script names, serif text, small left navigation, editorial fashion collage, page arrows and gentle transitions.
- Secondary references: references/inspiration/additional_reference.jpeg informs scrapbook/paper photo treatment; references/inspiration/additional_reference2.jpeg informs restrained typography and fine line ornament.
- Colours: navy `#16223C` for text and actions, warm ivory `#F7F5EE` for the main canvas, and supplied cool grey `#E5E4E2` as a secondary neutral. Website colours are separate from allowed guest clothing colours.
- Typography: locally bundled Great Vibes for the couple’s display names; Cormorant Garamond for headings/body; DM Sans for navigation, form utilities and small labels.
- The supplied S&A monogram is used in the desktop navigation and closing note. Existing photographs remain intact; monochrome treatment is presentation-only.
- No music is included because no audio asset or choice has been supplied. No autoplay or automatic page changes.

## 3. Approved wedding content

| Item | Content |
| --- | --- |
| Bride | Anis Jamilah Jamlus |
| Groom | Mohd Shahizwan Mohammad Shahari |
| Display names | Shahizwan & Anis |
| Date | Saturday, 9 January 2027 (9/1/2027 interpreted as day/month/year) |
| Time | 11:00 AM–4:30 PM, Asia/Kuala_Lumpur |
| Venue | Dewan Perdana, Tampin, Negeri Sembilan |
| Bride’s parents | Dato' Ir. Jamlus Aziz & Datin Hamidah Mansor |
| Groom’s parents | Mohammad Shahari Ludin & Sariah Datok Gempa Borhan |
| Bride’s PIC | Azfar Jamil — 0192767122 |
| Groom’s PIC | Wan — 01129922304 |
| Attire | Tradisional / Smart Casual — kecuali putih dan silver |
| Hosting | localhost for design review |

No street address, verified venue pin, RSVP deadline, guest invitation limit or programme of events has been supplied. Do not invent these. The Maps action opens a search for the supplied venue; the final verified Maps link is a launch dependency.

## 4. Pages and interactions

### Home

Show a small decorative ornament, family invitation line, prominently staggered script names, both full names, date, time and venue. Both sets of parents appear beneath the event information. A quiet RSVP text link opens the RSVP page. Keep the visual centre focused on the couple rather than a photograph.

### Dresscode

Show “Tradisional / Smart Casual” and an interactive lookbook labelled “For the ladies” and “For the gentlemen”. Four outfit combinations start composed: navy baju kurung, sage/olive kebaya, navy baju Melayu with sampin/songkok, and a cocoa shirt with charcoal trousers. Show navy, sage, olive, taupe, cocoa and charcoal as optional inspiration.

Each of 16 pieces is independently draggable: two women's tops and skirts, a selendang, handbag, two pairs of women's shoes, two men's shirts and trousers, sampin, songkok, loafers, and capal. Use a generated transparent sprite atlas with a separate interactive element for each garment. Mouse, pen and touch support free positioning within the lookbook. The active piece comes to the front. Dragging never navigates or scrolls the page. Keyboard users can Tab to an item, use arrow keys to move it, Shift for larger steps, and Escape to restore that item. A Reset button restores every outfit. Positions survive page navigation in memory only, and refresh clears them.

Desktop displays all four outfits together. On narrow phones, Wanita/Lelaki switches between two outfits at a readable, draggable size; maintain separate positions for desktop and mobile layouts. Reflow must not leave moved pieces outside the board.

The explicit rule is “Apa sahaja warna pilihan anda, kecuali putih dan silver.” The inspiration palette does not restrict guests to those six colours. Generated clothing and accessories must exclude white and silver. Use readable HTML for labels and guidance rather than image-embedded text.

### Location

Display a decorative folding fan, venue name, Tampin/Negeri Sembilan, date and time. “Open Google Maps” opens a new tab with a venue search. Two WhatsApp actions are labelled with the PIC name, phone and family side; use international numbers `60192767122` and `601129922304` and a prefilled enquiry. Opening a WhatsApp link must not automatically send a message.

### RSVP

- Fields: full name, attending yes/no, and total guests including the respondent.
- Name is required, trimmed and at most 120 characters. Attendance is required. For “yes”, guest count must be a whole number from 1–99. This is a demo input guard, not an agreed invitation allocation.
- For “no”, hide and disable guest count; a future stored record uses zero guests.
- Show inline errors and focus the first invalid field. Disable repeated submission while processing.
- Preserve the draft only in page memory when navigating between sections; refresh clears it. Do not use localStorage or send a network request for RSVP.
- Both the form and confirmation explain that this is a preview, with no response saved or sent to organisers.
- Allow a return to the form from the confirmation screen.

Future integration boundary: `submitRsvp({ name, attendance, pax })` returns a result consumed by the UI. The live phase must use a server-side endpoint and private credentials to append `timestamp`, `name`, `attendance` and `pax` to the chosen Google Sheet. The owner email alone is not sufficient to configure secure write access. Authentication/configuration, server validation, spam protection, errors, retry and duplicate handling must be settled before enabling real submissions. There is no live API in this prototype.

### Note

Place the exact closing copy inside a paper-like letter with six supplied childhood photographs around it. Desktop shows a scrapbook composition; mobile places the photographs in a grid below the letter so they cannot obscure the copy. Use the supplied S&A monogram as a signature.

Closing copy (HTML entity artefacts removed; wording preserved):

> This day would not feel complete without you. Your doa, your prayers, your restu have made this day happen.
>
> Dalam setiap doa dan restu yang diterima, kami dipertemukan dan ditakdirkan sampai ke sini. Our takdir has always been cared for and guided in the most beautiful ways through you.
>
> Terima kasih daripada kami untuk semua doa-doa yang baik. Terima kasih sudi luangkan masa untuk raikan kami. Semoga hari kita nanti diberkati dan jadi satu memori yang indah untuk semua.
>
> Jumpa nanti, we can’t wait to see you!
>
> 🤍 Shahizwan & Anis

## 5. Navigation, responsiveness and accessibility

- Five hash routes: `#home`, `#dresscode`, `#location`, `#rsvp`, `#note`; direct links, refresh and browser Back/Forward work. Unknown hashes return to Home.
- Persistent small left navigation on desktop; expandable top menu below 768px. Active page is visibly marked and exposed with `aria-current`.
- Bottom previous/next arrows and page progress indicator. Previous is disabled on Home; the final page can return to Home.
- Each page occupies one viewport, with the header/footer always visible. Scroll down/up switches to the next/previous page. One continuous wheel/trackpad gesture advances at most once; a transition guard prevents accidental skips. Scroll navigation stops at the first/last page rather than wrapping.
- Vertical touch swipes and Page Up/Down also navigate. Inputs, form controls, open menus, horizontal gestures and pinch/zoom are not hijacked. A mobile menu and arrow controls remain available.
- Compact spacing fits typical desktop/laptop viewports. Every section remains in one viewport; when a small screen, zoom or validation errors make content taller, the section scales down to remain fully visible. A downward/upward gesture always navigates directly to the next/previous page.
- Keyboard arrows navigate pages outside inputs and controls. Form typing and input steppers must not change pages. Escape closes the mobile menu.
- Semantic headings, associated form labels, error messages, visible focus, sufficiently large tap areas and decorative SVGs hidden from assistive technology.
- Honour reduced motion. No horizontal overflow or internal vertical scrolling at 320px through desktop widths.
- All fonts and imagery are bundled locally. Only intentional Maps/WhatsApp link clicks leave the site.

## 6. Implementation and assets

Use Vite with plain JavaScript and CSS for a small static prototype. Shared content lives in `src/content.js`; form validation and the submission adapter live in `src/rsvp.js`. `npm run dev` serves localhost; `npm run build` creates `dist`.

Source references and original photographs are preserved under references/. Web copies are under public/assets/. The initial generated lookbook PNG/WebP is retained as a reference; the interactive website uses dresscode-pieces.png, a transparent 4×4 sprite atlas. Prompt/provenance is recorded in docs/ASSETS.md.

No admin dashboard, Google Sheets connection, login, deployment, real guest list, guest payment, analytics or unrequested wedding features are in the first release.

## 7. Acceptance tests and next release

- Check all five pages visually at desktop and mobile sizes; compare their hierarchy and compositions against the main reference.
- Confirm menu, arrow, keyboard and history navigation; direct-link refresh; unknown route fallback.
- Confirm wheel, trackpad and swipe navigation advances once per gesture, directly changes pages, and does not hijack form controls or garment dragging.
- Drag clothing with mouse and touch; confirm independent motion, bounds, Reset, keyboard movement, navigation persistence, mobile group switching and responsive reflow.
- Verify exact event/parent/PIC details, allowed colour guidance and full closing copy.
- Test empty/whitespace name, missing attendance, invalid guest counts, yes/no paths, form draft preservation and edit after confirmation.
- Confirm RSVP creates no external requests or persisted browser records, and that confirmation explicitly describes a demo.
- Validate destination URLs and international PIC numbers without sending messages.
- Build successfully; check for console errors, missing assets and horizontal overflow, including reduced-motion mode.

After layout approval, obtain a verified venue link, Google Sheet/write-access setup and production hosting choice. Before launch, define real RSVP constraints and submission behaviour, integrate and test the live endpoint, remove preview-specific notices, and revisit the current `noindex` metadata. Do not switch to real collection merely because an email address has been supplied.
