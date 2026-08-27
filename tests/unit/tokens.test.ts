import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DELAY, DURATION, EASE, TRANSFORM } from '@/lib/tokens/motion';
import { META_THEME_DARK, META_THEME_LIGHT } from '@/lib/tokens/meta-colors';

/**
 * styles/tokens.css and lib/tokens/motion.ts describe the same motion system in
 * two languages. If they drift, the CSS load sequence and the JS-driven sheet
 * stop agreeing with each other and with the motion inventory. This test is the
 * thing that stops that silently happening.
 */

const css = readFileSync(join(process.cwd(), 'styles/tokens.css'), 'utf8');

const readVar = (name: string): string => {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(css);
  if (!match?.[1]) throw new Error(`token --${name} not found in styles/tokens.css`);
  return match[1].trim();
};

const readMs = (name: string): number => {
  const raw = readVar(name);
  const ms = /^(\d+(?:\.\d+)?)ms$/.exec(raw);
  if (!ms?.[1]) throw new Error(`token --${name} is "${raw}", expected a value in ms`);
  return Number(ms[1]);
};

describe('motion tokens stay in sync with the CSS', () => {
  it.each([
    ['dur-curtain', DURATION.curtain],
    ['dur-zoom', DURATION.zoom],
    ['dur-hero-rise', DURATION.heroRise],
    ['dur-hero-rise-first', DURATION.heroRiseFirst],
    ['dur-reveal', DURATION.reveal],
    ['dur-reveal-fast', DURATION.revealFast],
    ['dur-scroll-cue', DURATION.scrollCue],
    ['dur-sheet', DURATION.sheet],
    ['dur-nav', DURATION.nav],
    ['dur-fade', DURATION.fade],
    ['dur-hover-img', DURATION.hoverImg],
    ['dur-hover-bg', DURATION.hoverBg],
    ['dur-hover-swap', DURATION.hoverSwap],
  ])('--%s matches its TS constant', (name, expected) => {
    expect(readMs(name)).toBe(expected);
  });

  it.each([
    ['delay-hero-eyebrow', DELAY.heroEyebrow],
    ['delay-hero-h1', DELAY.heroH1],
    ['delay-hero-script', DELAY.heroScript],
    ['delay-hero-list', DELAY.heroList],
    ['delay-hero-cta', DELAY.heroCta],
    ['delay-scroll-cue', DELAY.scrollCue],
    ['delay-zoom', DELAY.zoom],
    ['delay-loader-script', DELAY.loaderScript],
    ['delay-sheet-close', DELAY.sheetClose],
  ])('--%s matches its TS constant', (name, expected) => {
    expect(readMs(name)).toBe(expected);
  });

  it.each([
    ['ease-curtain', EASE.curtain],
    ['ease-bar', EASE.bar],
    ['ease-word', EASE.word],
    ['ease-rise', EASE.rise],
    ['ease-reveal', EASE.reveal],
    ['ease-sheet', EASE.sheet],
    ['ease-zoom', EASE.zoom],
  ])('--%s matches its TS control points', (name, expected) => {
    const raw = readVar(name);
    const numbers = raw
      .replace(/cubic-bezier\(|\)/g, '')
      .split(',')
      .map((part) => Number(part.trim()));
    expect(numbers).toEqual([...expected]);
  });

  it('transform distances match', () => {
    expect(readVar('reveal-y')).toBe(`${TRANSFORM.revealY}px`);
    expect(readVar('loader-y')).toBe(`${TRANSFORM.loaderY}px`);
    expect(readVar('hero-zoom-from')).toBe(String(TRANSFORM.heroZoomFrom));
    expect(readVar('card-zoom-to')).toBe(String(TRANSFORM.cardZoomTo));
  });
});

describe('the hero stagger is a clean 200ms step', () => {
  it('steps evenly from the h1 to the CTA', () => {
    const steps = [DELAY.heroH1, DELAY.heroScript, DELAY.heroList, DELAY.heroCta];
    const deltas = steps.slice(1).map((value, index) => value - (steps[index] as number));
    expect(deltas).toEqual([200, 200, 200]);
  });

  it('lifts the curtain before the hero eyebrow starts', () => {
    // The curtain holds until 58% of its duration, then translates away.
    const curtainLift = DURATION.curtain * 0.58;
    expect(curtainLift).toBeLessThan(DELAY.heroEyebrow);
  });
});

describe('meta theme colours mirror the palette', () => {
  it('matches --brand-cream and --brand-curtain', () => {
    expect(readVar('brand-cream')).toBe(META_THEME_LIGHT);
    expect(readVar('brand-curtain')).toBe(META_THEME_DARK);
  });
});

describe('the global size scale', () => {
  /**
   * Sizes are the artboard's values un-scaled by 0.8 (it was authored at 80%),
   * then reduced by a global 0.85 at the client's request. These assertions are
   * written as that arithmetic rather than as literal strings, so the intent
   * survives the next scale change and a stray edit still fails.
   */
  const UI_SCALE = 0.85;
  const shipped = (recovered: number): number => Number((recovered * UI_SCALE).toFixed(1));

  const parseClamp = (raw: string): [number, number, number] => {
    const m = /clamp\(\s*([\d.]+)px\s*,\s*([\d.]+)v[wh]\s*,\s*([\d.]+)px\s*\)/.exec(raw);
    if (!m) throw new Error(`not a px/vw clamp triple: ${raw}`);
    return [Number(m[1]), Number(m[2]), Number(m[3])];
  };

  it('--spacing-nav is the recovered triple x0.85', () => {
    const [gotMin, gotVw, gotMax] = parseClamp(readVar('spacing-nav'));
    expect(gotMin).toBeCloseTo(shipped(64), 1);
    expect(gotVw).toBeCloseTo(5.9 * UI_SCALE, 2);
    expect(gotMax).toBeCloseTo(shipped(96), 1);
  });

  /**
   * The gutter moved onto the shared spacing anchors, so it no longer has the
   * `clamp(min, vw, max)` shape the rest of this block parses. Its endpoints
   * still land where the 0.85 reduction put them (20.4 -> 20, 54.4 -> 54); the
   * point of moving it was to make it compress in step with every other gap.
   */
  it('--spacing-gutter keeps its endpoints on the shared anchors', () => {
    const raw = readVar('spacing-gutter');
    const m = /clamp\(\s*([\d.]+)px,\s*([\d.]+)px \+ ([\d.]+)vw,\s*([\d.]+)px\s*\)/.exec(raw);
    expect(m, `gutter is not a fluid clamp: ${raw}`).not.toBeNull();
    expect(Number(m![1])).toBeCloseTo(20, 0);
    expect(Number(m![4])).toBeCloseTo(54, 0);
  });

  /**
   * Type is different from spacing: the slope and maximum carry the 0.85
   * reduction, but the minimum is a deliberate mobile floor rather than the
   * maximum times a factor. Scaling all three linearly put body copy at 11px
   * and inputs at 12.8px on a phone.
   */
  it.each([
    ['text-h2', 4.3, 76],
    ['text-nav', 1.15, 17],
    ['text-body-sm', 1.05, 18],
  ])('--%s keeps the reduced slope and maximum', (name, vw, max) => {
    const [, gotVw, gotMax] = parseClamp(readVar(name));
    expect(gotVw).toBeCloseTo(vw * UI_SCALE, 2);
    expect(gotMax).toBeCloseTo(shipped(max), 1);
  });

  /**
   * The hero's two headings sit deliberately above the global reduction, at the
   * client's direction: they carry the page, so they were enlarged and the
   * supporting copy around them was stepped down to sharpen the hierarchy.
   * Asserted rather than left implicit so the exception stays visible.
   */
  it('keeps the hero headings larger than the reduced scale would give', () => {
    const h1 = parseClamp(readVar('text-h1'));
    const script = parseClamp(readVar('text-hero-script'));

    expect(h1[0]).toBeGreaterThan(shipped(44)); // above the un-scaled artboard floor
    expect(script[0]).toBeGreaterThan(h1[0]); // the script line is the larger of the two
  });

  it('keeps the hero supporting copy below its headings', () => {
    const list = parseClamp(readVar('text-hero-list'));
    const h1 = parseClamp(readVar('text-h1'));

    expect(list[0]).toBeLessThan(h1[0] / 2);
    // Still readable: above the small-text floor.
    expect(list[0]).toBeGreaterThanOrEqual(14);
  });

  it.each([
    ['text-body-sm', 15],
    ['text-prose', 15],
    ['text-body', 15],
    ['text-link', 15],
    ['text-nav', 14],
    ['text-legal', 13],
    ['text-meta', 12.5],
    ['text-eyebrow', 12],
  ])('--%s has a readable mobile floor of at least %spx', (name, floor) => {
    const [gotMin] = parseClamp(readVar(name));
    expect(gotMin).toBeGreaterThanOrEqual(floor);
  });

  /**
   * iOS Safari zooms the whole page when a focused input renders below 16px.
   * Every field the booking sheet and the forms use must clear it.
   */
  it.each([['text-input'], ['text-field-value'], ['text-tab'], ['text-btn']])(
    '--%s is at least 16px so iOS does not zoom on focus',
    (name) => {
      const [gotMin] = parseClamp(readVar(name));
      expect(gotMin).toBeGreaterThanOrEqual(16);
    },
  );

  it('never lets a floor exceed its own maximum', () => {
    const names = [...css.matchAll(/--(text-[a-z0-9-]+): clamp\(/g)].map((m) => m[1] as string);
    expect(names.length).toBeGreaterThan(30);
    for (const name of names) {
      const [min, , max] = parseClamp(readVar(name));
      expect(min, `--${name} floor is above its ceiling`).toBeLessThanOrEqual(max);
    }
  });

  it.each([
    ['radius-xs', 6],
    ['radius-sm', 8],
    ['radius-md', 11],
    ['radius-lg', 16],
    ['border-hair', 1.5],
  ])('--%s is its recovered value x0.85', (name, recovered) => {
    expect(Number(readVar(name).replace('px', ''))).toBeCloseTo(shipped(recovered), 1);
  });

  it('scales Tailwind\u2019s spacing base once, rather than at each use', () => {
    // 0.25rem is Tailwind's default; every p-*, gap-*, size-* multiplies it.
    expect(readVar('spacing')).toBe('0.2125rem');
    expect(0.2125).toBeCloseTo(0.25 * UI_SCALE, 4);
  });

  it('leaves every duration and delay untouched by the size scale', () => {
    // Motion is time. A size change must never alter the motion inventory.
    expect(readMs('dur-reveal')).toBe(DURATION.reveal);
    expect(readMs('dur-curtain')).toBe(DURATION.curtain);
    expect(readMs('delay-hero-h1')).toBe(DELAY.heroH1);
  });

  it('scales the reveal travel distance with the rest of the sizes', () => {
    expect(Number(readVar('reveal-y').replace('px', ''))).toBeCloseTo(shipped(34), 1);
    expect(Number(readVar('loader-y').replace('px', ''))).toBeCloseTo(shipped(22), 1);
  });

  it('keeps unitless zoom factors unscaled', () => {
    // These are ratios, not lengths.
    expect(readVar('hero-zoom-from')).toBe('1.14');
    expect(readVar('card-zoom-to')).toBe('1.05');
  });
});

describe('the spacing scale shares one set of viewport anchors', () => {
  /**
   * This is the property that makes it a scale rather than a pile of values.
   *
   * Spacing used to be 37 independent clamps, each with its own floor and its
   * own slope, so they crossed their floors at different viewport widths and
   * the ratios between gaps drifted as the screen narrowed. Every step here
   * interpolates 360px -> 1440px, so the rhythm stays proportional at every
   * width. If someone adds a step by hand with a different slope, this fails.
   */
  const MIN_VP = 360;
  const MAX_VP = 1440;

  const STEPS = ['4xs', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

  const parse = (raw: string) => {
    const m = /clamp\(\s*([\d.]+)px,\s*(-?[\d.]+)px \+ ([\d.]+)vw,\s*([\d.]+)px\s*\)/.exec(raw);
    if (!m) throw new Error(`not a fluid clamp: ${raw}`);
    return {
      min: Number(m[1]),
      intercept: Number(m[2]),
      slope: Number(m[3]),
      max: Number(m[4]),
    };
  };

  it.each([...STEPS])('--spacing-%s reaches its floor and ceiling at the anchors', (step) => {
    const { min, intercept, slope, max } = parse(readVar(`spacing-${step}`));

    // At the lower anchor the fluid term equals the minimum, and at the upper
    // anchor it equals the maximum — that is what "shares the anchors" means.
    const atMin = intercept + (slope / 100) * MIN_VP;
    const atMax = intercept + (slope / 100) * MAX_VP;

    expect(atMin).toBeCloseTo(min, 1);
    expect(atMax).toBeCloseTo(max, 1);
  });

  it('increases monotonically', () => {
    const mins = STEPS.map((s) => parse(readVar(`spacing-${s}`)).min);
    const maxes = STEPS.map((s) => parse(readVar(`spacing-${s}`)).max);
    expect(mins).toEqual([...mins].sort((a, b) => a - b));
    expect(maxes).toEqual([...maxes].sort((a, b) => a - b));
  });

  it('keeps the ratio between any two steps stable across the range', () => {
    const at = (step: string, vp: number) => {
      const { min, intercept, slope, max } = parse(readVar(`spacing-${step}`));
      return Math.min(max, Math.max(min, intercept + (slope / 100) * vp));
    };
    // A gap that is 2.4x another on desktop must stay near that on mobile.
    for (const [a, b] of [
      ['md', '2xs'],
      ['lg', 'xs'],
      ['3xl', 'sm'],
    ] as const) {
      const wide = at(a, MAX_VP) / at(b, MAX_VP);
      const narrow = at(a, MIN_VP) / at(b, MIN_VP);
      // Steps are not linear multiples of each other, so allow some drift —
      // but nothing like the 3x swings the old independent clamps produced.
      expect(narrow / wide, `${a}:${b} ratio drifts too far`).toBeGreaterThan(0.6);
      expect(narrow / wide, `${a}:${b} ratio drifts too far`).toBeLessThan(1.4);
    }
  });

  /**
   * The semantic aliases repeat their step's clamp rather than referencing it,
   * because the extra var() hop cost about 350ms of style recalculation on a
   * throttled mobile profile. This is what keeps that duplication honest: every
   * alias must still equal the step it is named after.
   */
  it.each([
    ['gap-eyebrow', '2xs'],
    ['gap-heading', 'md'],
    ['gap-body', 'md'],
    ['items', '2xs'],
    ['inline', '3xs'],
    ['cards', 'xs'],
    ['columns', 'xl'],
    ['field', 'md'],
    ['label', '4xs'],
    ['pad-card', 'sm'],
    ['pad-card-sm', 'xs'],
    ['pad-tile', 'xs'],
    ['pad-sheet', 'sm'],
  ])('--spacing-%s still equals --spacing-%s exactly', (alias, step) => {
    expect(readVar(`spacing-${alias}`)).toBe(readVar(`spacing-${step}`));
  });
});
