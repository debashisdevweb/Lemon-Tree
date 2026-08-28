import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guard against spacing classes that resolve to nothing.
 *
 * Tailwind builds a utility name from the token name, so `--spacing-gap-items`
 * produces `gap-gap-items` and *not* `gap-items`. Writing `gap-items` against
 * that token compiles cleanly, passes typecheck, passes lint, and silently
 * applies no spacing at all — which is how the footer wordmark ended up reading
 * "Lemon TreeHOTELS" with the gap collapsed to zero.
 *
 * Nothing else in the toolchain catches it, so this reads the compiled CSS and
 * asserts every token-based spacing utility written in a component was actually
 * emitted.
 */

/**
 * Verification builds write to .next-verify (see next.config.ts), so read from
 * whichever directory the current run produced. Falling back to .next keeps
 * this working after a plain `next build`.
 */
const DIST = process.env.NEXT_DIST_DIR || '.next';
const CSS_DIR = join(process.cwd(), DIST, 'static/css');

const PROPS = [
  'gap-x',
  'gap-y',
  'gap',
  'px',
  'py',
  'pt',
  'pb',
  'pl',
  'pr',
  'p',
  'mx',
  'my',
  'mt',
  'mb',
  'ml',
  'mr',
  'm',
  'top',
  'right',
  'bottom',
  'left',
  'size',
  'w',
  'h',
  'max-w',
  'min-h',
].join('|');

const USAGE = new RegExp(
  `(?:^|[\\s"'\`])((?:[a-z0-9-]+:)*)((?:${PROPS})-([a-z0-9][a-z0-9-]*))(?=[\\s"'\`]|$)`,
  'g',
);

function readSources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(process.cwd(), dir), { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...readSources(path));
    else if (entry.name.endsWith('.tsx')) out.push(readFileSync(join(process.cwd(), path), 'utf8'));
  }
  return out;
}

const tokenNames = new Set(
  [
    ...readFileSync(join(process.cwd(), 'styles/tokens.css'), 'utf8').matchAll(
      /--spacing-([a-z0-9-]+):/g,
    ),
  ].map((m) => m[1] as string),
);

let compiledCss = '';
try {
  const collect = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? collect(join(dir, entry.name))
        : entry.name.endsWith('.css')
          ? [readFileSync(join(dir, entry.name), 'utf8')]
          : [],
    );
  compiledCss = collect(CSS_DIR).join('');
} catch {
  compiledCss = '';
}

const used = new Map<string, Set<string>>();
for (const source of [...readSources('components'), ...readSources('app')]) {
  for (const match of source.matchAll(USAGE)) {
    const [, variants = '', className = '', token = ''] = match;
    if (tokenNames.has(token)) {
      const set = used.get(className) ?? new Set<string>();
      set.add(variants);
      used.set(className, set);
    }
  }
}

const emitted = (full: string): boolean => {
  // Tailwind escapes the variant colon in the emitted selector.
  const escaped = full.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:/g, '\\\\:');
  return new RegExp(`\\.${escaped}(?![a-zA-Z0-9_-])`).test(compiledCss);
};

describe('token-based spacing utilities are actually emitted', () => {
  it('has a production CSS bundle to read (run `next build` first)', () => {
    expect(compiledCss.length, 'no compiled CSS found in .next/static/css').toBeGreaterThan(1000);
  });

  it('found spacing utilities to check', () => {
    expect(used.size).toBeGreaterThan(20);
  });

  it('emits every one of them', () => {
    const missing: string[] = [];
    for (const [className, variants] of used) {
      for (const variant of variants) {
        const full = `${variant}${className}`;
        if (!emitted(full)) missing.push(full);
      }
    }
    expect(missing, 'these classes compile but apply nothing').toEqual([]);
  });
});
