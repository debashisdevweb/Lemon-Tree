import { describe, expect, it } from 'vitest';
import { BRANDS, CITIES, PROPERTIES, cityBySlug, propertiesInCity } from '@/lib/content/inventory';
import { PRESENCE } from '@/lib/content/home';

describe('portfolio data', () => {
  it('matches the stats the page prints', () => {
    // The artboard states "11 cities", "8 states" and "4 opening".
    expect(CITIES).toHaveLength(11);
    expect(new Set(CITIES.map((c) => c.state)).size).toBe(8);
    expect(CITIES.filter((c) => !c.isOpen)).toHaveLength(4);

    const statText = PRESENCE.stats.map((s) => s.figure);
    expect(statText).toContain('11 cities');
    expect(statText).toContain('8 states');
    expect(statText).toContain('4 opening');
  });

  it('names the four upcoming cities the copy names', () => {
    const opening = CITIES.filter((c) => !c.isOpen).map((c) => c.name);
    expect(new Set(opening)).toEqual(new Set(['Naldehra', 'Pali', 'Ujjain', 'Nasik']));
  });

  it('has every property pointing at a real brand and city', () => {
    const brands = new Set(BRANDS.map((b) => b.slug));
    const cities = new Set(CITIES.map((c) => c.slug));
    for (const property of PROPERTIES) {
      expect(brands.has(property.brandSlug)).toBe(true);
      expect(cities.has(property.citySlug)).toBe(true);
    }
  });

  it('uses unique slugs throughout', () => {
    expect(new Set(PROPERTIES.map((p) => p.slug)).size).toBe(PROPERTIES.length);
    expect(new Set(CITIES.map((c) => c.slug)).size).toBe(CITIES.length);
    expect(new Set(BRANDS.map((b) => b.slug)).size).toBe(BRANDS.length);
  });

  it('marks a city open only when it has an open property', () => {
    for (const city of CITIES.filter((c) => c.isOpen)) {
      const open = propertiesInCity(city.slug).filter((p) => p.status === 'open');
      expect(open.length, `${city.name} is flagged open`).toBeGreaterThan(0);
    }
  });

  it('never marks an unopened city as having bookable rooms', () => {
    for (const city of CITIES.filter((c) => !c.isOpen)) {
      expect(propertiesInCity(city.slug).every((p) => p.status === 'opening')).toBe(true);
    }
  });

  it('gives every room type a positive rate and sane occupancy', () => {
    for (const property of PROPERTIES) {
      expect(property.roomTypes.length).toBeGreaterThan(0);
      for (const room of property.roomTypes) {
        expect(room.baseRateInr).toBeGreaterThan(0);
        expect(room.occupancy).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('resolves a city by slug', () => {
    expect(cityBySlug('siliguri')?.state).toBe('West Bengal');
    expect(cityBySlug('nowhere')).toBeUndefined();
  });
});
