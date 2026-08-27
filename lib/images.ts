/**
 * Sizing help for cover-cropped images.
 *
 * `object-fit: cover` fills the box on whichever axis needs the most
 * magnification. When the image is proportionally *wider* than its box, that
 * axis is the height — so the browser needs an intrinsic width far larger than
 * the box's own width, and a `sizes` of `100vw` under-requests badly.
 *
 * The offers row made this visible: `offer-pool.jpg` is 1100x176 rendered in a
 * 4/3 card. At 375px the card is about 335x251, so covering by height needs
 * 251 x (1100/176) = 1569px of intrinsic width. `sizes="100vw"` asked for 375px
 * and the browser then scaled it up 4.2x, which looked like a broken asset.
 */

/** How much wider than its box an image must be requested to cover by height. */
export function coverBoost(
  image: { readonly width: number; readonly height: number },
  boxAspect: number,
): number {
  if (image.height <= 0 || boxAspect <= 0) return 1;
  const imageAspect = image.width / image.height;
  // Below 1 the crop is width-driven and `sizes` is already correct.
  return Math.max(1, imageAspect / boxAspect);
}

const LENGTH = /(\d+(?:\.\d+)?)(vw|vh|px)/g;

/**
 * Scale every length in a `sizes` attribute by `factor`, leaving media
 * conditions untouched.
 *
 * Only the lengths after each condition describe the slot width; the widths
 * inside `(max-width: ...)` are breakpoints and must not move. This relies on
 * media conditions being parenthesised, which they always are.
 */
export function scaleSizes(sizes: string, factor: number): string {
  if (!Number.isFinite(factor) || factor <= 1) return sizes;

  return sizes
    .split(',')
    .map((part) => {
      // Split off any parenthesised media condition and scale only the rest.
      const match = /^(\s*\([^)]*\)\s*)(.*)$/.exec(part);
      const condition = match?.[1] ?? '';
      const slot = match?.[2] ?? part;

      const scaled = slot.replace(LENGTH, (_all, value: string, unit: string) => {
        const next = Number(value) * factor;
        return `${Number(next.toFixed(2))}${unit}`;
      });

      return `${condition}${scaled}`;
    })
    .join(',');
}
