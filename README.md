# Lemon Tree Hotels

Implementation of `design/dc/Lemon Tree Home.dc.html`, imported from the Claude
Design project _Family Hotel Website Recreation_.

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 with CSS-variable
tokens · Radix · Zod · React Hook Form · TanStack Query (funnel only) ·
Vitest · Playwright.

```bash
npm install
npm run dev            # http://localhost:3000
npm run verify         # lint + typecheck + unit + build + e2e
npm run lh             # Core Web Vitals budget (desktop)
```

---

## Scale

Two factors are applied, in order.

**1. Un-scale the artboard (÷ 0.8).** Every `px` and `vw` in the source artboard
is exactly 0.8× an underlying clean value — it was authored at 80%. Dividing by
0.8 recovers an 8px grid with no exceptions.

**2. Global 0.85 reduction**, applied at the client's request. Net factor against
the artboard: **1.0625×**.

| Role        | Artboard                        | Recovered (÷0.8)              | Shipped (×0.85)                  |
| ----------- | ------------------------------- | ----------------------------- | -------------------------------- |
| Page gutter | `clamp(19.2px, 3.2vw, 51.2px)`  | `clamp(24px, 4vw, 64px)`      | `clamp(20.4px, 3.4vw, 54.4px)`   |
| Nav height  | `clamp(51.2px, 4.72vw, 76.8px)` | `clamp(64px, 5.9vw, 96px)`    | `clamp(54.4px, 5.015vw, 81.6px)` |
| Radii       | 4.8 / 6.4 / 8.8 / 12.8px        | 6 / 8 / 11 / 16px             | 5.1 / 6.8 / 9.3 / 13.6px         |
| Hairline    | 1.2px                           | 1.5px                         | 1.3px                            |
| H1          | `clamp(35.2px, 6.1vw, 112px)`   | `clamp(44px, 7.625vw, 140px)` | `clamp(37.4px, 6.481vw, 119px)`  |
| Content max | 1420px                          | 1420px                        | 1207px                           |

The reduction applies to **sizes only**. Durations, delays and easing curves are
untouched and remain verbatim from the artboard;
`tests/unit/tokens.test.ts` asserts both halves of that.

Tailwind's numeric utilities (`p-4`, `gap-2`, `size-9`) and the `--spacing()`
function all multiply one variable, so the factor is applied once as
`--spacing: 0.2125rem` (0.25rem × 0.85) rather than at each use.

Viewport references are deliberately **not** scaled, because they express "how
much of the screen", not "how big": `100vw` inside `calc()`, the `vw` caps in
`min()`, `100svh`, `h-screen`, and every `sizes` attribute on an image.

### Measured result

|                     | Mobile (375px) | Desktop (1440px) |
| ------------------- | -------------- | ---------------- |
| H1                  | 37.4px         | 93.3px           |
| Section H2          | 28.9px         | 52.6px           |
| Nav link            | 11.0px         | 14.1px           |
| Body / eyebrow      | 10.2px         | 11.6px           |
| Nav height          | 54px           | 72px             |
| Horizontal overflow | 0              | 0                |

> **Readability caution.** At this scale mobile body copy renders at **10.2px**
> and nav links at **11px**. WCAG sets no minimum font size, so axe passes and
> all gates are green — but 10.2px is below what is comfortable on a phone, and
> it is close to the undersized-text problem that un-scaling the artboard was
> meant to solve. If this reads too small in review, the factor is a single
> value: see `--spacing` and the size tokens in `styles/tokens.css`.

## Tokens

`styles/tokens.css` is the single source of truth. Components reference tokens
only; ESLint fails the build on a raw hex literal anywhere else.

- **Colour** — the artboard's 13 colours, unchanged, plus four accessibility
  pairs (below).
- **Type** — 41 fluid `clamp()` steps, named by role (`--text-h2`,
  `--text-eyebrow`) because the source scale is role-driven, not numeric, with a
  deliberate mobile floor (see Responsive).
- **Spacing** — one fluid scale on shared anchors (below).
- **Motion** — durations, delays and easings, mirrored in
  `lib/tokens/motion.ts`. `tests/unit/tokens.test.ts` parses the CSS and asserts
  every value matches, so the two cannot drift.

### The spacing scale

The first pass transcribed the artboard's spacing literally: **37 independent
`clamp()` values** scattered through the components, most used once, each with
its own floor and its own slope. Every individual value was right, and the
system was still wrong — because they crossed their floors at different viewport
widths, so the _ratios_ between gaps drifted as the screen narrowed. A gap that
was 2.4× another on desktop might be 1.1× on a phone. That is what made the
mobile rhythm read as arbitrary.

Ten steps now interpolate between the **same two anchors, 360px and 1440px**, so
everything compresses in lockstep and the rhythm stays proportional at every
width:

| Step  | 360px | 1440px |     | Step  | 360px | 1440px |
| ----- | ----- | ------ | --- | ----- | ----- | ------ |
| `4xs` | 4     | 8      |     | `md`  | 24    | 40     |
| `3xs` | 6     | 10     |     | `lg`  | 30    | 56     |
| `2xs` | 10    | 16     |     | `xl`  | 40    | 72     |
| `xs`  | 14    | 22     |     | `2xl` | 52    | 104    |
| `sm`  | 18    | 28     |     | `3xl` | 64    | 116    |

Maxima are the previous desktop values, so the approved desktop appearance did
not move. Components reference **semantic names**, not steps — naming the
relationship is what stops a one-off clamp reappearing:

```
--spacing-gap-eyebrow   eyebrow → heading      2xs
--spacing-gap-heading   heading → body         md
--spacing-items         between list items     2xs
--spacing-cards         grid gap between cards xs
--spacing-columns       major column gap       xl
--spacing-field         between form fields    md
--spacing-pad-card      card padding           sm
```

Three things this pays for:

- **`tests/unit/tokens.test.ts`** asserts every step hits its floor and ceiling
  exactly at the two anchors, that the scale is monotonic, and that the ratio
  between any two steps stays within ±40% across the range. A hand-added step
  with a different slope fails.
- The semantic aliases **repeat their step's clamp rather than referencing it**.
  With the indirection, ~90 utilities each resolved two `var()` hops during style
  recalculation; on a 4×-throttled mobile profile that measured as ~350ms of
  extra Style & Layout and pushed LCP from 3.35s to 3.71s. A test asserts each
  alias still equals its step exactly, so the duplication cannot drift.
- **`tests/unit/utilities.test.ts`** reads the compiled CSS and asserts every
  token-based spacing class was actually emitted. Tailwind derives the utility
  from the token name, so `--spacing-gap-items` produces `gap-gap-items` and not
  `gap-items` — writing the latter compiles, typechecks, lints, and silently
  applies nothing. That is how the footer wordmark ended up rendering
  "Lemon TreeHOTELS" with its gap collapsed to zero.

### Hero rhythm and hierarchy

The hero is the one place the gaps and the type are both stated explicitly,
because the relationships carry meaning.

| From → to            | Step  | 375px | Why                                |
| -------------------- | ----- | ----- | ---------------------------------- |
| eyebrow → headline   | `2xs` | 10px  | label attached to its heading      |
| headline → script    | `4xs` | 4px   | two halves of one sentence         |
| script → bullet list | `md`  | 25px  | different content, real separation |
| list → promo pill    | `lg`  | 34px  | a new idea                         |

The two headings deliberately sit **above** the global 0.85 reduction, and the
supporting copy below it, so the hierarchy is unambiguous. At 375px:

|                                       | Size | Weight                          |
| ------------------------------------- | ---- | ------------------------------- |
| Script line — "wherever you go."      | 52px | 400 (Sacramento has one weight) |
| Headline — "Warm Indian hospitality," | 46px | **500**                         |
| Bullet list                           | 14px | 400                             |
| Eyebrow                               | 11px | 700, tracked                    |

`tests/unit/tokens.test.ts` asserts this exception explicitly — that the hero
headings exceed the reduced scale and that the list stays under half the
headline while remaining above the readable floor — so it cannot be flattened
back by a future scale change without failing.

Below `lg` the script and list stack with the list right-aligned; from `lg` they
sit side by side, bottom-aligned, as the artboard has them.

### Multi-brand theming

One component set. Every token resolves through `[data-brand]` on `<html>`, so a
brand-scoped route re-themes the whole page with no prop passing.

```
:root, [data-brand='lemon-tree'] { --brand-forest: #2f4f3e; ... }
[data-brand='keys-select']       { --brand-forest: #24413c; ... }
[data-brand='aurika']            { --brand-forest: #1f2a2b; ... }
```

The reference defines exactly **one** palette — the six brands appear only as
eyebrow labels on cards, with no per-brand design tokens anywhere. `lemon-tree`
is the artboard's palette verbatim; `keys-select` and `aurika` demonstrate the
mechanism and **need design sign-off before use**.

### Accessibility-driven token pairs

Three of the artboard's colours fail WCAG AA as small text. The brand values are
unchanged and still used for fills, rules and display type; these pairs are used
where the colour carries small text.

| Token                 | Value     | Replaces               | Was      | Now               |
| --------------------- | --------- | ---------------------- | -------- | ----------------- |
| `--brand-sage-text`   | `#586945` | sage eyebrows on cream | 2.66 : 1 | 4.61 : 1          |
| `--brand-accent-text` | `#96512e` | terracotta small text  | 3.58 : 1 | 5.64 : 1          |
| `--brand-accent-cta`  | `#ac5c34` | solid button fill      | 3.58 : 1 | 4.57 : 1          |
| `--brand-muted`       | `#575f5a` | nudged 3% darker       | 4.66 : 1 | 5.09 : 1 (margin) |

`--brand-accent-cta` is the smallest darkening of the brand terracotta (13%) that
lets paper-coloured text clear 4.5:1, so primary CTAs stay recognisably
terracotta. **This is a visible change to the brand's primary CTA colour and
needs sign-off.**

## Motion

The reference's motion inventory is reproduced exactly. Two implementations, each
chosen for a reason:

**CSS keyframes** (`app/globals.css`) run the 2.4s load sequence — curtain,
progress bar, wordmark rise, the `clip-path` handwriting wipe on the script line,
15s hero Ken Burns, and a five-step hero stagger on a clean 200ms interval from
1550ms. It is a fixed composition with no interaction to coordinate, so it runs
off the main thread with zero JS in front of the LCP element.

**IntersectionObserver + CSS transition** (`components/primitives/Reveal.tsx`)
runs the 42 scroll reveals: opacity 0→1, translateY 34px→0, 1000ms,
`cubic-bezier(.2,.75,.25,1)`, one-shot, with the artboard's twelve discrete
`data-delay` values constrained to a typed union. The reference polls with a 30ms
scroll handler _plus_ a 180ms `setInterval` that never stops; this does neither.

**Motion** is used only for the booking sheet's entry and exit, and is therefore
code-split with it — it is not in the home page's first load.

Every animation has a `prefers-reduced-motion` path. The reference has none.

### Deliberate departures

| Change                                  | Why                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| Loader curtain: first visit per session | A 2.4s hold on every navigation is a direct conflict with the LCP budget         |
| Sticky 100vh stack: `md` and up only    | Four full-screen scroll-holds on a phone, and 100vh fights mobile browser chrome |
| Sheet animates out                      | The reference unmounts instantly; `AnimatePresence` plays the entry in reverse   |
| Smooth scroll off while a modal is open | Otherwise any `scrollIntoView` smooth-scrolls the page behind the sheet          |

## Responsive

**The reference artboard contains zero media queries.** Responsiveness there is
entirely `clamp()` on type and spacing, which means a 4-column grid stays 4
columns at 320px. The artboard has mobile _sizing_, not a mobile _layout_.

Mobile reference renders were supplied later, and the treatment below follows
them. Everything here is authored, not transcribed.

### Type has a mobile floor, not a scaled-down maximum

Scaling all three parts of every `clamp()` by the global 0.85 put body copy at
11px and form inputs at 12.8px on a phone — far below the reference's own mobile
design. The **minimum** is now a deliberate floor while the slope and maximum
keep the reduction, so desktop is unchanged and the small end is habitable.

| Role                 | Before     | Floor now   |
| -------------------- | ---------- | ----------- |
| Body / prose         | 11.0px     | 15.0–15.5px |
| Nav and footer links | 11.0px     | 14.4–15px   |
| Eyebrow / meta       | 10.2px     | 12–12.5px   |
| Section H2           | 28.9px     | 32px        |
| Hero H1              | 37.4px     | 40px        |
| **Form inputs**      | **12.8px** | **16px**    |

That last row is a bug fix, not taste: **iOS Safari zooms the whole page when a
focused input renders below 16px**. Every field in the booking sheet and both
forms was under it. `tests/unit/tokens.test.ts` now asserts the 16px threshold
and each floor.

### Layout

- 4-col → 2-col at `sm` → 1-col where the content needs it; 3-col → 1-col at `md`
- Asymmetric 2-col splits → stacked at `lg`
- Booking sheet field row: 6-col → 2-col at `sm` → stacked
- Footer: 4 link columns → 2; closing statement and its links centre below `lg`
- Hero: the script line and bullet list sit side by side from `lg`; below that
  they stack with the list right-aligned, as the reference does

### Mobile chrome

The header below `sm` is the wordmark and the menu button, nothing else. Three
routes to the same booking sheet were competing in one screenful, so:

- **Header "Book now"** is hidden below `sm` — it lives in the menu instead.
- **The floating bar** keeps one obvious action. Its "Day use" and "Offers"
  shortcuts are hidden below `sm`, where three buttons left each about 90px wide
  and none of them primary. Both remain one tap away inside the sheet: Day use is
  the stay toggle, Offers is a tab.
- **The menu** is an inset rounded card, not a full-height drawer — matching the
  reference, and keeping the page visible behind it so the overlay reads as
  temporary. It carries Investors, Sign in and Book now, which have no header
  slot at this width and were previously unreachable on a phone.

### The presence map on mobile

The projection is 1.72:1, but India is tall and narrow — so at phone width the
country rendered small with ocean either side. The whole drawing is now scaled
about India's centre on mobile, which enlarges the coastline, markers, labels and
the 500km scale bar together (so the bar stays truthful) and crops the empty
edges. India fills 83% × 89% of the frame at 375px, up from roughly half that,
with no second projection and no extra path data.

### The booking sheet on mobile

Three fixes, in order of how badly they read:

- **Tabs.** `grid-cols-3` gave each tab a third of the width and clipped "Last
  minute offers". A scrollable row fixed the clipping but hid tabs behind a
  scroll with no affordance. Three labels cannot fit on one line at 320px at a
  readable size, so below `md` they wrap and each grows to fill its row — two
  tidy rows, nothing hidden. From `md` the design's equal three-column row
  returns.
- **The close button** sat on the tab row. Motion applies a transform to
  `Dialog.Content`, and a transformed ancestor becomes the containing block for
  `position: fixed`, so its offset was measured from the sheet rather than the
  viewport. Moving it outside `Dialog.Content` fixed the geometry and broke
  accessibility instead — Radix marks everything outside the content
  `aria-hidden` while modal, so the only close affordance vanished from the
  accessibility tree. It now lives in the sheet chrome.
- **The fields** read as one loose list. They are separated by hairlines with a
  single vertical rhythm below `sm`, and the sheet is capped at `92svh` with
  internal scroll — it reaches ~780px once the fields have real spacing, and it
  is bottom-anchored, so on a short phone the tab row would otherwise clip off
  the top.

### Cover-crop image sizing

`object-fit: cover` fills whichever axis needs the most magnification. Where an
image is proportionally wider than its box, that axis is the height — so
`sizes="100vw"` under-requests badly. `offer-pool.jpg` is 1100×176 in a 4/3 card,
which needs 1569px of intrinsic width at 375px; `100vw` asked for 375 and the
browser upscaled it 4.2×, which read as a broken asset.

`CoverImage` now takes a `boxAspect` and scales the slot widths in `sizes` by
`imageAspect / boxAspect` (`lib/images.ts`, unit-tested). Media conditions are
left alone — the widths inside `(max-width: …)` are breakpoints, not slots.

`tests/e2e/home.spec.ts` asserts zero horizontal overflow at 320, 768 and 1440;
measured overflow is 0 at 320, 375, 430, 768 and 1470.

## Booking

`components/booking/` implements the sheet exactly as drawn — tab bar and
discount code on a forest strip, field row on paper, sliding up over a scrim —
and adds what the reference omits.

The reference is a display shell: `Arrival` and `Departure` render an em-dash,
there is no occupancy control, no autocomplete, and `Search` has no handler.
Added here: a real range calendar (single-date when the stay is day-use), a
guests/rooms stepper, and destination autocomplete built to the ARIA 1.2 combobox
pattern.

Radix supplies the semantics the reference lacks: `Dialog` (role, `aria-modal`,
focus trap), `Tabs` (`role="tab"`, `aria-selected`), `ToggleGroup` for the stay
type. Focus restore across all six entry points is owned by `BookingProvider`.

### The availability seam

```
BookingSheet ─validate─▶ POST /api/availability ─▶ AvailabilityAdapter
   (Zod)                      (same Zod schema)         └─ mock.ts (deterministic)
                                                        └─ <real CRS drops in here>
```

No UI imports a concrete adapter. Swapping the mock for Synxis/TravelClick means
adding one file and one env branch — no component changes. The mock is
deterministic (a stable hash, never `Math.random`), so Playwright can assert on
rates and screenshots stay stable.

Validated in both directions: the route parses the request, and the adapter
parses its own response.

**The funnel stops at step 1.** Room selection, guest details and payment have no
design in the reference and are deliberately not built.

## Data model

`lib/content/schema.ts` — `Brand → Property → RoomType → Offer → Amenity`, plus
`City`. Parsed at module load, with cross-collection referential integrity
checked explicitly, so a malformed record fails the build rather than a request.

`lib/content/` is the CMS seam. Content is served from typed modules today; when
Payload lands, its generated types are validated against these schemas at the
fetch boundary and nothing downstream changes.

Cities and coordinates come from `design/dc/map-india.html`, the only place in
the reference that states them.

> The reference is internally inconsistent about brand count: the hero says
> "seven brands", the presence stat says "6 brands", the grid lists six, and a
> card uses a seventh name ("Lemon Tree Resort"). Copy is reproduced verbatim;
> the data model carries all seven, because a property references the seventh.

## Rendering

| Route               | Strategy            | Why                             |
| ------------------- | ------------------- | ------------------------------- |
| `/`                 | SSG + ISR 1h        | Content only; hero image static |
| `/contact`          | SSG + ISR 1h        | Static                          |
| `/book/search`      | Dynamic, `no-store` | Live rates, never cached        |
| `/api/availability` | Dynamic, `no-store` | Boundary                        |

Nothing on `/` fetches on the client. TanStack Query is scoped to the funnel.

## The presence map

`components/map/IndiaMap.tsx` replaces the reference's lazy `<iframe>` — which
pulled D3 and topojson-client from unpkg at runtime and re-projected on every
resize — with a server component. The topology is bundled from npm, projection
happens at build time, and the output is static SVG with a `viewBox`.

That removes an iframe, two blocking third-party requests and all of the map's
client JavaScript from the critical path. Neighbour labels, the graticule, the
dotted fill, open/soon markers and the 500km scale bar all match the reference.

## Testing

```bash
npm run test        # 103 unit tests
npm run e2e         # 141 checks across 320 / 768 / 1440
npm run e2e:update  # re-baseline screenshots (review the diff first)
```

- **Unit** — token drift, booking validation rules, adapter determinism,
  portfolio integrity, search ranking, structured data, combobox keyboard
  interaction, reveal timings.
- **E2E** — section order, heading order, horizontal overflow, every in-page
  anchor resolving, no internal link 404ing, all 20 images loading with accessible
  names, header state change, load sequence, reduced-motion end state, the full
  booking flow, and the API contract.
- **axe** — `wcag2a wcag2aa wcag21a wcag21aa wcag22aa` on home, the open sheet,
  contact, search results and the mobile menu. **Zero violations.**
- **Visual** — 33 baselines. Per section rather than full-page: stitching a
  full-page shot of a document with three sticky 100vh sections took minutes per
  viewport and produced diffs too large to read.

Screenshot baselines are this implementation's own first render — the design
project ships no reference screenshots (see the audit). They still catch any
later change that moves layout, type or spacing.

## Performance

Measured on the production build with Lighthouse, median of three runs.

**Desktop — passing.**

| Page       | Perf | A11y | BP  | SEO | LCP    | CLS | TBT  |
| ---------- | ---- | ---- | --- | --- | ------ | --- | ---- |
| `/`        | 97   | 100  | 96  | 100 | 892 ms | 0   | 0 ms |
| `/contact` | 100  | 100  | 96  | 100 | 641 ms | 0   | 0 ms |

**Mobile, simulated 4G — LCP misses the budget.**

| Metric | Measured | Budget  | Status |
| ------ | -------- | ------- | ------ |
| LCP    | ~3160 ms | 2500 ms | ✗ fail |
| CLS    | 0.000    | 0.1     | ✓      |
| TBT    | 6 ms     | 200 ms  | ✓      |
| FCP    | ~1100 ms | —       | —      |

Conditions: 1638 kbps down, 150 ms RTT, 562 ms simulated per-request latency,
4× CPU slowdown.

This is enforced in CI (`lighthouserc.mobile.json`, `aggregationMethod: median`)
and **is currently red on purpose** — it should be fixed, not silenced.

### What was tried, and what it moved

LCP started at 4124 ms. Getting to ~3250 ms came almost entirely from one bug:

1. **The hero JPEG was corrupt** — the design API caps file reads at 256 KiB and
   the hero exceeded it, so it imported truncated at exactly 192 KiB with no EOI
   marker. Browsers render a truncated JPEG happily; sharp refuses it, so Next
   silently served the 192 KB original unoptimised for the largest asset on the
   page. Re-encoding the recoverable 78.5% dropped the hero to **14.5 KB AVIF**.
2. Map SVG: clipped the graticule to India's bbox and dropped off-frame
   countries — document 792 KB → 210 KB.
3. Fonts: removed two unused weights, moved the italic face off the preload set.
4. JS: gated the booking-sheet chunk on first interaction — script transfer
   272 KB → 186 KB, First Load JS 264 kB → **153 kB**.

Three plausible causes were **tested and eliminated**, which is worth recording
so nobody re-treads them:

| Hypothesis                               | Test                               | Result            |
| ---------------------------------------- | ---------------------------------- | ----------------- |
| The 2.4s curtain / staggered hero reveal | Disabled both, re-measured         | No change (3.99s) |
| Font swap blocking the LCP text paint    | `display: 'optional'` on all faces | No change (3.22s) |
| Script bytes starving the hero           | Cut 86 KB of script transfer       | No change (~3.2s) |

So the remaining ~2.1s gap between FCP (1092 ms) and LCP is not animation, not
font swap and not script weight. The next things to try are shortening the
HTML → CSS → image request chain (each hop costs 562 ms in this model) and
reducing the 210 KB document, most of which is markup and its duplicate in the
RSC flight payload rather than the map paths. That likely means moving the map
out of the initial document entirely — pre-rendering it to a static SVG asset at
build time, which also removes it from the RSC payload, at the cost of losing
`[data-brand]` theming on the map.

## Known gaps

- **Undesigned routes.** Only home and the property-detail artboard are designed.
  Footer informational links resolve to `/contact` rather than 404 — the full set
  is enumerated in `UNDESIGNED_DESTINATIONS` (`lib/content/site.ts`). Each needs
  its own template.
- **No CMS wired.** Payload needs a database decision. Schemas and the seam are
  in place.
- **No i18n runtime.** `en-IN` only; there is one locale of copy in existence.
  Marketing copy belongs in the CMS, not in message catalogs.
- **Newsletter and enquiry forms** validate fully but have no delivery endpoint.
  Both say so explicitly rather than implying a message was sent.
- **Social URLs** are the group's public profiles and should be verified.
- **Mobile LCP is over budget** at ~3250 ms against 2500 ms. See Performance
  above for the diagnosis and what has been ruled out. CI is red on this.
- **The hero photograph is incomplete.** The design API would only return the
  first 192 KiB of it; the usable 78.5% has been re-encoded to 1500×1050. The
  full-resolution original is needed. `tests/unit/assets.test.ts` now fails on any
  truncated or wrongly-declared image so this cannot recur silently.
- **The hero is upscaled on mobile.** `sizes="100vw"` picks a 768px candidate,
  but a `cover` fit on a tall viewport scales by height and needs roughly 2×
  that. Correcting `sizes` would sharpen it and cost bytes the LCP budget cannot
  currently spare — worth revisiting once LCP is fixed.
- **Three source images are low-resolution wide strips** (`offer-pool.jpg` is
  1100×176) rendered in 4/3 boxes, so they upscale. Replacements needed.
- **Sixteen source images arrived with a synthetic band across the top** and have
  been trimmed. The row count was identical within each family — 61 rows on all
  four destination photographs, 39 on all three event photographs, 6 on the
  upcoming set, 4 on the new-hotel set, 14 on the rewards photograph — which is
  what proved it was pasted on rather than photo content; on the event images it
  was pure white (mean 254). It read as a hard pale stripe along the top edge of
  every card. Originals from the design project still contain it.
