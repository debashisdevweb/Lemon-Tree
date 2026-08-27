import { describe, expect, it } from 'vitest';
import {
  availabilityRequestSchema,
  CHECK_OUT_LABELS,
  MAX_STAY_NIGHTS,
} from '@/lib/booking/schemas';

const base = {
  tab: 'online-booking' as const,
  stay: 'overnight' as const,
  destination: 'siliguri',
  checkIn: '2026-09-01',
  checkOut: '2026-09-03',
  occupancy: { adults: 2, children: 0, rooms: 1 },
  discountCode: '',
};

const issuesFor = (input: unknown): string[] => {
  const result = availabilityRequestSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('availability request validation', () => {
  it('accepts a well-formed overnight search', () => {
    expect(availabilityRequestSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a missing destination', () => {
    expect(issuesFor({ ...base, destination: '' })).toContain(
      'destination: Choose a city or hotel',
    );
  });

  it('rejects a departure on or before arrival', () => {
    expect(issuesFor({ ...base, checkOut: '2026-09-01' })).toContain(
      'checkOut: Departure must be after arrival',
    );
    expect(issuesFor({ ...base, checkOut: '2026-08-31' })).toContain(
      'checkOut: Departure must be after arrival',
    );
  });

  it(`rejects stays longer than ${MAX_STAY_NIGHTS} nights`, () => {
    const issues = issuesFor({ ...base, checkIn: '2026-09-01', checkOut: '2026-10-05' });
    expect(issues.join(' ')).toMatch(/up to 30 nights/);
  });

  it('accepts exactly the maximum stay', () => {
    // 1 Sept + 30 nights = 1 Oct
    expect(
      availabilityRequestSchema.safeParse({
        ...base,
        checkIn: '2026-09-01',
        checkOut: '2026-10-01',
      }).success,
    ).toBe(true);
  });

  it('requires a day-use stay to check out the same day', () => {
    expect(issuesFor({ ...base, stay: 'day-use', checkOut: '2026-09-02' })).toContain(
      'checkOut: A day-use stay checks out on the day it starts',
    );
    expect(
      availabilityRequestSchema.safeParse({
        ...base,
        stay: 'day-use',
        checkOut: base.checkIn,
      }).success,
    ).toBe(true);
  });

  it('rejects a malformed date', () => {
    expect(issuesFor({ ...base, checkIn: '01-09-2026' }).join(' ')).toMatch(/ISO date/);
    expect(issuesFor({ ...base, checkIn: '2026-02-31' }).join(' ')).toMatch(/real date/);
  });

  it('rejects a discount code with punctuation', () => {
    expect(issuesFor({ ...base, discountCode: 'SAVE!!' }).join(' ')).toMatch(
      /letters, numbers and hyphens/,
    );
  });

  it('requires at least one adult and one room', () => {
    expect(
      issuesFor({ ...base, occupancy: { adults: 0, children: 1, rooms: 1 } }).length,
    ).toBeGreaterThan(0);
    expect(
      issuesFor({ ...base, occupancy: { adults: 1, children: 0, rooms: 0 } }).length,
    ).toBeGreaterThan(0);
  });

  it('defaults the tab when it is absent', () => {
    const { tab: _tab, ...withoutTab } = base;
    const result = availabilityRequestSchema.safeParse(withoutTab);
    expect(result.success && result.data.tab).toBe('online-booking');
  });
});

describe('stay type drives the check-out label', () => {
  it('matches the reference wording', () => {
    expect(CHECK_OUT_LABELS.overnight).toBe('Departure');
    expect(CHECK_OUT_LABELS['day-use']).toBe('Check-out time');
  });
});
