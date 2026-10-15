# Novus Link Socio — website

SvelteKit 3 · Svelte 5 · Tailwind CSS 4 · TypeScript · Sanity · GSAP

```sh
pnpm install
pnpm dev          # http://localhost:5173
pnpm check        # svelte-check / types
pnpm test         # vitest (pricing, enquiry validation, PriceTag render)
pnpm lint
pnpm build
```

The site runs with **no configuration**: when `PUBLIC_SANITY_PROJECT_ID` is empty it serves the
built-in content in `src/lib/content/` (transcribed from the official brochures) and the enquiry
form tells visitors to call. Copy `.env.example` to `.env` to connect Sanity.

## Pages

| Route           | Purpose                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| `/`             | The scroll story ("Signal"), plans, card designs, experiences, FAQ, CTA          |
| `/plans`        | All plans, Everyday / Metal tabs                                                 |
| `/plans/[slug]` | Plan detail — price, inclusions, designs offered, order link                     |
| `/templates`    | 39 catalogue designs, filter by plan, flip front/back, "Choose" → prefilled form |
| `/contact`      | Enquiry form (saved to Sanity) + call / Instagram                                |
| `/sitemap.xml`  | Generated from the plans                                                         |

## Sanity (`/studio`)

```sh
cd studio
cp .env.example .env              # set SANITY_STUDIO_PROJECT_ID
pnpm install --ignore-workspace
pnpm dev                          # Studio at http://localhost:3333
pnpm seed:build && pnpm seed:import   # load every plan, price, template image, FAQ and page's copy
```

Everything on the site is edited in the Studio:

| Studio item                                            | Controls                                                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Site settings**                                      | Phone, WhatsApp, email, Instagram, banner, price note, ordering note · header menu & button, footer text, links, wordmark |
| **Plans & prices** (`product`)                         | Every plan, its features and its striked / offer price                                                                    |
| **Card templates**, **Enhanced experiences**, **FAQs** | Those collections                                                                                                         |
| **Page copy › Home page**                              | Search title/description and every word of the scroll story (headline, chapters, Rolodex tags, card callouts)             |
| **Page copy › Shared sections**                        | Plans, card designs, experiences (incl. SymphoZen services), FAQ and closing call-to-action headings, metal finishes      |
| **Page copy › Plans / Card designs / Contact page**    | Page header, page-specific copy, search title/description                                                                 |
| **Enquiries**                                          | Written by the website; `status` is editable                                                                              |

Headlines are **text + accent** (the accent is set in the italic serif). Any page-copy field left
empty shows the built-in text from `src/lib/content/copy.ts`, so clearing a field never leaves a
gap. Copy can use placeholders filled from live data:

| Placeholder   | Becomes                                                                                 |
| ------------- | --------------------------------------------------------------------------------------- |
| `{fromPrice}` | The cheapest plan's price — in the story with its ~~striked MRP~~ when an offer is live |
| `{plans}`     | Number of plans                                                                         |
| `{count}`     | Number of card designs                                                                  |
| `{finishes}`  | The metal finishes, e.g. "Black, Silver, Gold and Rose Gold"                            |
| `{phone}`     | The display phone number                                                                |

### Pricing — striked price & offer price

Each plan has a `pricing` object:

| Field                 | Shown as                                                     |
| --------------------- | ------------------------------------------------------------ |
| `offerPrice`          | The price charged (required)                                 |
| `compareAtPrice`      | ~~Struck-through MRP~~ — only if it is higher than the offer |
| `offerLabel`          | Small tag, e.g. "Launch offer"                               |
| `offerEndsAt`         | After this time the strike disappears and the MRP is charged |
| `showDiscountPercent` | "−20%" chip                                                  |

Wherever a price appears it follows these rules: plan cards and plan pages show the strike,
"−x%" and label (plan pages also "You save ₹…"); the story's `{fromPrice}` shows the strike inline;
places that can't draw a strike (the enquiry form's plan list, page titles) read "₹199 (was ₹249)"
or the price charged today.

Logic lives in `src/lib/pricing.ts` (unit-tested). The brochure lists a single price per plan, so
the seed sets `offerPrice` only — add a `compareAtPrice` only when it is a genuine regular price.

The website needs `SANITY_API_WRITE_TOKEN` (Editor) to save enquiries, and the site's origin must be
added to the project's CORS origins only if you fetch from the browser (this app fetches server-side).

## Brand tokens

All colours are CSS variables in `src/routes/layout.css` (`@theme`), each with its source:

- `#26004A` Novus Night — **primary**, verified (live site CSS + logo SVG)
- `#4A0095` Novus Violet — brochure wordmark, pixel-sampled
- `#190030` / `#2D004A` — verified logo / site gradient stops
- `#FF4986` Signal Pink — verified CTA colour; always paired with dark text (6:1)
- Tints `violet-50…600` derived on the same 270° hue; neutrals, paper and semantic colours documented inline.

## Motion

- The home story is a real-time, physically-based product scene (three.js, lazy-loaded) driven by
  one GSAP ScrollTrigger timeline over a sticky stage — native scroll, no scroll-jacking.
  Shot list: `src/lib/components/story/scene/timeline.ts`; materials, lights and camera framing:
  `scene/build.ts`; card/phone artwork is drawn procedurally in `scene/textures.ts` (the QR on the
  card is real and opens novuslinksocio.com).
- Loading, reduced motion, no JavaScript or no WebGL → a still render (`static/story/poster*.webp`)
  with the chapters as readable text. Regenerate posters after changing the scene.
- Rendering pauses when the story is off-screen or the tab is hidden; pixel ratio and shadow-map
  size drop on small / low-core devices.

## Assets

- `src/lib/components/brand/Mark.svelte` — mark paths extracted from the official `NLS SL.svg`.
- `static/templates/*.webp` — cropped from the "Card Templates" PDF. Designs featuring third-party
  characters or trademarks (NLST-40, 43, 44, 46, 47, NLS-P28) are intentionally **not** published.
- Product visuals are drawn in CSS/SVG; upload real photos per plan in Sanity to replace them.
