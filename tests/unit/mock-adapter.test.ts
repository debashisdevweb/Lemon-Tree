import { describe, expect, it } from 'vitest';
import { createMockAvailabilityAdapter } from '@/lib/booking/mock';
import { PROPERTIES } from '@/lib/content/inventory';
import type { AvailabilityRequest } from '@/lib/booking/schemas';

const adapter = createMockAvailabilityAdapter();

const request = (overrides: Partial<AvailabilityRequest> = {}): AvailabilityRequest =>
  ({
    tab: 'online-booking',
    stay: 'overnight',
    destination: 'siliguri',
    checkIn: '2026-09-01',
    checkOut: '2026-09-03',
    occupancy: { adults: 2, children: 0, rooms: 1 },
    discountCode: '',
    ...overrides,
  }) as AvailabilityRequest;

describe('mock availability adapter', () => {
  it('returns rates for an open city', async () => {
    const result = await adapter.search(request());
    expect(result.rates.length).toBeGreaterThan(0);
    expect(result.query.nights).toBe(2);
  });

  it('is deterministic across calls', async () => {
    const a = await adapter.search(request());
    const b = await adapter.search(request());
    expect(a).toEqual(b);
  });

  it('never offers a hotel that has not opened', async () => {
    // Nasik has two properties, both status: 'opening'.
    const nasik = PROPERTIES.filter((p) => p.citySlug === 'nasik');
    expect(nasik.length).toBeGreaterThan(0);
    expect(nasik.every((p) => p.status === 'opening')).toBe(true);

    const result = await adapter.search(request({ destination: 'nasik' }));
    expect(result.rates).toEqual([]);
  });

  it('prices day use below the overnight rate', async () => {
    const night = await adapter.search(request());
    const day = await adapter.search(
      request({ stay: 'day-use', checkOut: '2026-09-01' })
    );
    const cheapestNight = night.rates[0]?.amountInr ?? 0;
    const cheapestDay = day.rates[0]?.amountInr ?? 0;
    expect(cheapestDay).toBeGreaterThan(0);
    expect(cheapestDay).toBeLessThan(cheapestNight);
    expect(day.query.nights).toBe(0);
  });

  it('sorts rates cheapest first', async () => {
    const result = await adapter.search(request({ destination: 'mumbai' }));
    const amounts = result.rates.map((r) => r.amountInr);
    expect(amounts).toEqual([...amounts].sort((a, b) => a - b));
  });

  it('prices members below the public rate', async () => {
    const result = await adapter.search(request());
    for (const rate of result.rates) {
      expect(rate.memberAmountInr).toBeLessThan(rate.amountInr);
    }
  });

  it('excludes rooms that cannot hold the party', async () => {
    const result = await adapter.search(
      request({ occupancy: { adults: 4, children: 0, rooms: 1 } })
    );
    expect(result.rates.every((r) => r.roomTypeSlug === 'suite')).toBe(true);
  });

  it('reports an unusable discount code without failing the search', async () => {
    const result = await adapter.search(request({ discountCode: 'NOPE' }));
    expect(result.discountNotice).toMatch(/NOPE/);
    expect(result.rates.length).toBeGreaterThan(0);
  });

  it('says nothing when a valid code is used', async () => {
    const result = await adapter.search(request({ discountCode: 'infinity2x' }));
    expect(result.discountNotice).toBeNull();
  });

  it('finds a city by typed name as well as by slug', async () => {
    const result = await adapter.search(request({ destination: 'Bhubaneswar' }));
    expect(result.rates.length).toBeGreaterThan(0);
  });
});
