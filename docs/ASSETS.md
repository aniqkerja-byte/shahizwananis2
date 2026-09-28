# Assets and provenance

## Open Graph — kolaj kenangan

Generated with the built-in imagegen tool on 28 September 2026, using a contact sheet of the six client-supplied childhood photos and S&A monogram. `scripts/prepare-og-reference.mjs` builds that labelled input sheet from the original web assets. The source photographs are unchanged in the repository; the generated collage is an AI-composited rendering with monochrome styling.

Selected full-resolution output: `references/og-kenangan-source.png`. Production share image: `public/assets/og-kenangan-v1.jpg`, exported to 1200 × 630 JPEG with `node scripts/export-og.mjs`. The export contains the full composition without cropping. All original client files remain available separately.

Exact generation prompt:

```text
Use case: compositing
Asset type: finished Open Graph wedding invitation share card, landscape 1200 x 630 aspect ratio (1.90476:1).
The reference is a contact sheet. Its labelled cells 1-6 are six original childhood photos to insert as photographic prints, each exactly once. Cell 7: original S&A monogram to use small above the title. Preserve identities, faces, poses, people and details in every photo; do not redraw people, invent faces, or combine people from different photographs into one photo.
Primary request: luxurious nostalgic Malay wedding invitation, warm ivory paper #F7F5EE, navy ink #16223C. Three lightly angled vintage polaroid prints on the left using inputs 1-3 and three on the right using inputs 4-6. Subtle monochrome photo treatment. Keep each photo distinct and all six recognisable, with faces uncovered. Middle 50% is clear for elegant large calligraphic names and readable serif date/location. Delicate navy hairline frame, small restrained flourishes, soft paper shadows, generous negative space. Name typography is focal point, legible at thumbnail size. Small original monogram above title. Flat full-bleed graphic, no surrounding scene or devices.
Exact text only, centered:
"MAJLIS PERKAHWINAN"
"Shahizwan"
"& Anis"
"9 JANUARI 2027"
"Dewan Perdana, Tampin"
Keep text and monogram within middle 50% of canvas, safe from edge crops; photos may frame edges. Use elegant calligraphy for names, serif for location, tracked small caps for date and label. No English, no extra words, no watermark. Final polished digital share card, not a mockup.
Use the photographs in the contact sheet as source inserts only. Do not copy the white contact-sheet layout, labels, filenames or numbers into the final card.
```

## Existing website assets

- Dresscode artwork: generated with the built-in image generation tool using the imagegen skill, 28 September 2026. Selected output: `public/assets/dresscode-lookbook.png`. The website uses `public/assets/dresscode-lookbook.webp` (compressed from the PNG); the source PNG is retained.
- The artwork was reviewed for four outfit combinations, no people or logos, and no white or silver clothing. Two CSS viewports show the womenswear and menswear halves. The source is not cropped or repainted.
- Childhood photographs and the S&A monogram are copies of the files supplied by the client. Originals are retained under references/client-assets/. Grayscale/paper styling is applied only in CSS.
- Flourishes, folding fan and interface arrows are simple code-native SVG artwork.
- Fonts are self-hosted Fontsource packages (Great Vibes, Cormorant Garamond, DM Sans); their licenses are included in the installed packages.

## Exact generation prompt

The prompt below records the initial flat lookbook. The interactive version uses the additional sprite atlas documented at the end of this file.

```text
Use case: product-mockup
Asset type: wide editorial fashion lookbook collage for Malaysian wedding invitation website.
Primary request: A refined photorealistic cut-paper catalogue collage of FOUR coordinated guest outfits, with NO people and NO mannequins visible, garment-only styling, isolated over a single perfectly flat warm ivory background #F7F5EE. Landscape 3:2 composition, four distinct outfits evenly spaced across frame with generous negative space, all fully visible and no overlaps between outfits.
Left half women: one elegant navy blue baju kurung with long skirt, taupe hijab and black low heels; one muted sage green long-sleeved modest kebaya blouse with deep olive long skirt, taupe small handbag and dark brown heels.
Right half men: one deep navy traditional baju Melayu long-sleeve shirt and trousers with patterned muted gold and navy sampin and black songkok, brown leather loafers; one cocoa brown smart-casual collared shirt with charcoal tailored trousers and black loafers.
Style/medium: tasteful vintage fashion editorial moodboard with tactile woven fabric details, realistic product photography, subtle irregular paper cut-out edges, a quiet luxury wedding stationery aesthetic.
Lighting: soft even studio lighting with almost no cast shadows.
Colors: navy #16223C, muted sage, olive, taupe, cocoa, charcoal, dark brown. The background may be ivory but absolutely NO white, silver, light grey, or metallic silver clothing/accessories.
Constraints: exactly four complete outfits, garment-only, no visible humans or bodies, no text, no lettering, no labels, no logos, no watermark, no extra props, no furniture, no decorative frame. Leave approximately 8% empty margin on each edge.
```

## Interactive garment atlas

Built-in imagegen edit with `public/assets/dresscode-lookbook.png` as the style reference. Output saved as `public/assets/dresscode-pieces.png` (1254 × 1254 RGBA). The request specified 2048 × 2048; the tool returned 1254 × 1254, so CSS uses relative 4×4 cell coordinates. No source photographs were edited. Each atlas cell has its own draggable HTML button; transparency allows the pieces to be recomposed. The original flat artwork is retained, but is no longer the interactive page's display asset.

Exact prompt:

```text
Use case: precise-object-edit / compositing
Asset type: a SINGLE transparent PNG sprite atlas for an interactive wedding outfit lookbook. Use the reference artwork as the clothing style and fabric reference. Reconstruct its individual garment components as separated full cutout products. Do not output a website or UI.
Output a square 2048 by 2048 image with EXACTLY 16 individual product cutouts, aligned into an invisible regular 4-column by 4-row grid of equal square cells, each cell 512 by 512. Nothing crosses cell boundaries. Every cutout must be wholly contained in its own cell with at least 40px transparent padding on all sides. Centre each product within its cell. Each product is separate, never touching any other product.
Cell assignments, left to right:
Row 1: (1) women's navy long-sleeved lace baju kurung tunic TOP ONLY, no skirt; (2) matching navy long maxi SKIRT ONLY, no shirt; (3) taupe draped selendang / hijab scarf, no head and no blouse; (4) pair of black closed-toe women's low heels.
Row 2: (5) sage green lace long-sleeved kebaya blouse TOP ONLY; (6) dark olive long maxi SKIRT ONLY; (7) taupe small structured handbag; (8) pair of brown women's low heels.
Row 3: (9) navy men's long-sleeved baju Melayu shirt TOP ONLY; (10) navy men's full-length trousers ONLY; (11) navy and muted gold traditional sampin folded/wrapped as a waist-to-knee standalone fabric tube, no trousers underneath; (12) black velvet songkok cap, slight side-angle.
Row 4: (13) cocoa-brown men's collared smart-casual shirt TOP ONLY; (14) charcoal men's full-length tailored trousers ONLY; (15) pair of dark brown men's loafers; (16) pair of black Malay capal leather sandals.
Style: realistic editorial catalog photography, soft lighting, clean garment silhouettes, tactile fabric and lace details consistent with the reference, frontal view for all clothing, all complete items fully visible. No human faces, no body parts, no mannequins.
The background MUST be genuinely transparent alpha across the ENTIRE image including every gap and product cell; no ivory rectangles, no fake checkerboard painted into pixels. No shadows outside cutouts. NO text, NO numbers, NO labels, NO grid lines, NO borders, NO watermarks, NO white/silver garments. This is one clean production-ready sprite sheet, not four composed outfits. Separate tops and bottoms completely. Keep exact cell ordering.
```
