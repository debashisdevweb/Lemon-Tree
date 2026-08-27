import { describe, expect, it } from 'vitest';
import { coverBoost, scaleSizes } from '@/lib/images';
import { OFFERS } from '@/lib/content/home';

describe('coverBoost', () => {
  it('is 1 when the image is narrower than its box (crop is width-driven)', () => {
    expect(coverBoost({ width: 700, height: 600 }, 4 / 3)).toBe(1); // 1.17 < 1.33
    expect(coverBoost({ width: 1000, height: 1000 }, 4 / 3)).toBe(1);
  });

  it('asks for a little more when the image is only slightly wider', () => {
    // The destination cards are 700x499 (1.40) in a 4/3 box — a 5% boost, which
    // usually resolves to the same candidate but costs nothing to be right.
    expect(coverBoost({ width: 700, height: 499 }, 4 / 3)).toBeCloseTo(1.052, 3);
  });

  it('matches the height-driven requirement for a wide strip in a 4/3 box', () => {
    // offer-pool.jpg: 1100x176 in a 4/3 card needs 4.69x the box width.
    expect(coverBoost({ width: 1100, height: 176 }, 4 / 3)).toBeCloseTo(4.6875, 3);
  });

  it('handles a portrait box', () => {
    expect(coverBoost({ width: 800, height: 400 }, 3 / 4)).toBeCloseTo(2.667, 3);
  });

  it('never returns a value that would shrink the request', () => {
    expect(coverBoost({ width: 100, height: 900 }, 4 / 3)).toBe(1);
  });

  it('is safe against degenerate input', () => {
    expect(coverBoost({ width: 100, height: 0 }, 4 / 3)).toBe(1);
    expect(coverBoost({ width: 100, height: 100 }, 0)).toBe(1);
  });
});

describe('scaleSizes', () => {
  it('scales slot widths and leaves media conditions alone', () => {
    expect(scaleSizes('(max-width:640px) 100vw, 25vw', 2)).toBe('(max-width:640px) 200vw, 50vw');
  });

  it('does not touch the breakpoint inside a condition', () => {
    const out = scaleSizes('(max-width:1280px) 50vw, 25vw', 3);
    expect(out).toContain('max-width:1280px');
    expect(out).toContain('150vw');
    expect(out).toContain('75vw');
  });

  it('handles a bare slot with no condition', () => {
    expect(scaleSizes('100vw', 1.5)).toBe('150vw');
  });

  it('is a no-op at or below 1', () => {
    expect(scaleSizes('100vw', 1)).toBe('100vw');
    expect(scaleSizes('100vw', 0.5)).toBe('100vw');
    expect(scaleSizes('100vw', Number.NaN)).toBe('100vw');
  });

  it('scales px slots too', () => {
    expect(scaleSizes('(min-width:900px) 300px, 100vw', 2)).toBe('(min-width:900px) 600px, 200vw');
  });
});

describe('the offer photographs are the ones that needed this', () => {
  it('every offer image with a picture is wider than the 4/3 card', () => {
    const withImages = OFFERS.cards.filter((card) => card.image !== null);
    expect(withImages.length).toBe(3);
    for (const card of withImages) {
      const image = card.image!;
      expect(coverBoost(image, 4 / 3), `${image.src} should need a boost`).toBeGreaterThan(1.5);
    }
  });
});
