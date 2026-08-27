import { describe, expect, it } from 'vitest';
import { MemorySearchAdapter } from '@/lib/search/adapter';

const adapter = new MemorySearchAdapter();

describe('destination search', () => {
  it('offers open cities when nothing is typed', () => {
    const hits = adapter.suggest('');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.kind === 'city' && h.isOpen)).toBe(true);
  });

  it('matches a city by prefix', () => {
    const hits = adapter.suggest('sil');
    expect(hits[0]?.label).toBe('Siliguri');
    expect(hits[0]?.value).toBe('siliguri');
  });

  it('matches a property by its brand name', () => {
    const hits = adapter.suggest('aurika');
    expect(hits.some((h) => h.kind === 'property' && h.label.includes('Aurika'))).toBe(true);
  });

  it('matches on state as well as city', () => {
    const hits = adapter.suggest('rajasthan');
    expect(hits.map((h) => h.label)).toContain('Ajmer');
  });

  it('ranks a prefix match above a mid-string match', () => {
    const hits = adapter.suggest('pali');
    // "Pali" the city should outrank "Keys Select Hotel Pali".
    expect(hits[0]?.kind).toBe('city');
  });

  it('ranks open destinations above ones opening soon', () => {
    const hits = adapter.suggest('na');
    const firstOpenIndex = hits.findIndex((h) => h.isOpen);
    const firstClosedIndex = hits.findIndex((h) => !h.isOpen);
    if (firstOpenIndex !== -1 && firstClosedIndex !== -1) {
      expect(firstOpenIndex).toBeLessThan(firstClosedIndex);
    }
  });

  it('is case and accent insensitive', () => {
    expect(adapter.suggest('MUMBAI').length).toBeGreaterThan(0);
    expect(adapter.suggest('nāsik').map((h) => h.label)).toContain('Nasik');
  });

  it('returns nothing for a miss', () => {
    expect(adapter.suggest('zzzzz')).toEqual([]);
  });

  it('honours the limit', () => {
    expect(adapter.suggest('a', 3).length).toBeLessThanOrEqual(3);
  });
});
