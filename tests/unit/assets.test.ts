import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as home from '@/lib/content/home';

const DIR = join(process.cwd(), 'public/images/home');
const files = readdirSync(DIR).filter((f) => f.endsWith('.jpg'));

/**
 * The design API caps file reads at 256 KiB, and the hero photograph exceeded
 * it — so it imported truncated, with no end-of-image marker. Browsers render a
 * truncated JPEG happily, but sharp refuses it, which silently turned off image
 * optimisation for the largest asset on the page and cost ~168 KB on the
 * critical path. Nothing surfaced that except a Lighthouse run.
 *
 * This asserts every JPEG is structurally complete, so it can never happen
 * quietly again.
 */
describe('image assets are structurally complete', () => {
  it('imported all 20 photographs', () => {
    expect(files).toHaveLength(20);
  });

  it.each(files)('%s starts with SOI and ends with EOI', (file) => {
    const bytes = readFileSync(join(DIR, file));
    expect(bytes.subarray(0, 2).toString('hex'), 'missing JPEG SOI marker').toBe('ffd8');
    expect(bytes.subarray(-2).toString('hex'), 'truncated: missing JPEG EOI marker').toBe('ffd9');
  });

  it.each(files)('%s is not suspiciously a round power of two', (file) => {
    // A file landing exactly on 64 KiB boundaries is the signature of a
    // transfer cap rather than a real encode.
    const { length } = readFileSync(join(DIR, file));
    expect(length % 65_536, `${file} is exactly ${length / 1024} KiB`).not.toBe(0);
  });
});

describe('declared image dimensions match the files', () => {
  const declared = new Map<string, { width: number; height: number }>();

  const collect = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }
    if (value === null || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    if (
      typeof record['src'] === 'string' &&
      typeof record['width'] === 'number' &&
      typeof record['height'] === 'number'
    ) {
      declared.set(record['src'].split('/').pop() as string, {
        width: record['width'],
        height: record['height'],
      });
      return;
    }
    Object.values(record).forEach(collect);
  };

  collect(home);

  /** Reads width/height straight out of the JPEG's SOF segment. */
  const jpegSize = (file: string): { width: number; height: number } => {
    const b = readFileSync(join(DIR, file));
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = b[i + 1] as number;
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
    throw new Error(`no SOF marker in ${file}`);
  };

  it('declares every image used on the page', () => {
    expect(declared.size).toBe(20);
  });

  /**
   * A wrong width/height is a guaranteed CLS regression, because next/image
   * reserves space from these numbers.
   */
  it.each([...declared.keys()])('%s matches its declared size', (file) => {
    expect(jpegSize(file)).toEqual(declared.get(file));
  });
});

describe('screenshot baselines are decodable', () => {
  /**
   * Five baselines were silently corrupt — truncated PNG writes from an
   * interrupted --update-snapshots run. Playwright reports that as
   * "Could not decode expected image as PNG" only when the test runs, and a
   * corrupt baseline can never match, so the diff was permanently broken
   * rather than merely stale.
   */
  const dir = join(process.cwd(), 'tests/e2e/visual.spec.ts-snapshots');
  const shots = readdirSync(dir).filter((f) => f.endsWith('.png'));

  it('has baselines to check', () => {
    expect(shots.length).toBeGreaterThan(0);
  });

  it.each(shots)('%s is a complete PNG', (file) => {
    const bytes = readFileSync(join(dir, file));
    // PNG signature, then the 12-byte IEND chunk that terminates the stream:
    // length (0x00000000) + type ("IEND") + CRC (0xAE426082).
    expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(bytes.subarray(-12).toString('hex')).toBe('0000000049454e44ae426082');
  });
});
