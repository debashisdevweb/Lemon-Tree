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

  it.each([
    ['spacing-gutter', 24, 4, 64],
    ['spacing-nav', 64, 5.9, 96],
    ['text-h1', 44, 7.625, 140],
    ['text-h2', 34, 4.3, 76],
    ['text-nav', 13, 1.15, 17],
  ])('--%s is the recovered triple x0.85', (name, min, vw, max) => {
    const [gotMin, gotVw, gotMax] = parseClamp(readVar(name));
    expect(gotMin).toBeCloseTo(shipped(min), 1);
    expect(gotVw).toBeCloseTo(vw * UI_SCALE, 2);
    expect(gotMax).toBeCloseTo(shipped(max), 1);
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
