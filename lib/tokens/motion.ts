/**
 * Motion tokens, mirrored from styles/tokens.css.
 *
 * The CSS file is the source of truth for anything the browser animates on its
 * own (the load sequence). These constants are the source of truth for anything
 * driven by Motion in JS (scroll reveals, the booking sheet). They must stay in
 * lockstep — tests/unit/motion-tokens.test.ts parses tokens.css and asserts
 * every value here matches, so drift fails CI rather than shipping.
 *
 * Durations are in milliseconds and are reproduced verbatim from the reference
 * artboard. Unlike sizes, they are NOT rescaled.
 */

export const DURATION = {
  curtain: 2400,
  zoom: 15000,
  heroRise: 1400,
  heroRiseFirst: 1300,
  reveal: 1000,
  revealFast: 900,
  scrollCue: 1000,
  sheet: 600,
  nav: 550,
  fade: 450,
  hoverImg: 1100,
  hoverBg: 350,
  hoverSwap: 300,
} as const;

export const DELAY = {
  heroEyebrow: 1450,
  heroH1: 1550,
  heroScript: 1750,
  heroList: 1950,
  heroCta: 2150,
  scrollCue: 2400,
  zoom: 1300,
  loaderScript: 120,
  sheetClose: 150,
} as const;

/** Cubic-bezier control points, matching the --ease-* tokens. */
export const EASE = {
  curtain: [0.76, 0, 0.24, 1],
  bar: [0.3, 0.7, 0.3, 1],
  word: [0.4, 0.5, 0.2, 1],
  rise: [0.2, 0.8, 0.2, 1],
  reveal: [0.2, 0.75, 0.25, 1],
  sheet: [0.2, 0.85, 0.2, 1],
  zoom: [0.2, 0.6, 0.2, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/**
 * Travel distances, in px. These are sizes, so they carry the same global 0.85
 * reduction as everything else: authored 27px -> /0.8 = 34px -> x0.85 = 28.9px.
 */
export const TRANSFORM = {
  revealY: 28.9,
  loaderY: 18.7,
  heroZoomFrom: 1.14,
  cardZoomTo: 1.05,
} as const;

/**
 * Per-element reveal delays used across the page, in ms.
 *
 * The reference stamps these on elements as `data-delay`. The full set present
 * in the artboard is 90, 110, 120, 140, 180, 200, 220, 260, 270, 280, 340, 360.
 * Keeping them as a named union means a component cannot invent a delay that
 * the motion inventory does not contain.
 */
export const REVEAL_DELAYS = [
  0, 90, 110, 120, 140, 180, 200, 220, 260, 270, 280, 340, 360,
] as const;

export type RevealDelay = (typeof REVEAL_DELAYS)[number];

/** Viewport trigger point for scroll reveals: element top < 94% of viewport. */
export const REVEAL_VIEWPORT_MARGIN = '0px 0px -6% 0px';

/** Seconds helpers — Motion takes seconds, CSS takes ms. */
export const sec = (ms: number): number => ms / 1000;
