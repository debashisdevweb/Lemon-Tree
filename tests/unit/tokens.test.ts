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

describe('the recovered scale lands on clean values', () => {
  it('un-scales the artboard gutter and nav height by 1.25', () => {
    expect(readVar('spacing-gutter')).toBe('clamp(24px, 4vw, 64px)');
    expect(readVar('spacing-nav')).toBe('clamp(64px, 5.9vw, 96px)');
  });

  it('keeps radii on whole pixels', () => {
    expect(readVar('radius-xs')).toBe('6px');
    expect(readVar('radius-sm')).toBe('8px');
    expect(readVar('radius-md')).toBe('11px');
    expect(readVar('radius-lg')).toBe('16px');
  });
});
