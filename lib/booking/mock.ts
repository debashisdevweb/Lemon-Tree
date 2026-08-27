import { brandBySlug, cityBySlug, PROPERTIES, propertiesInCity } from '../content/inventory';
import type { AvailabilityAdapter } from './adapter';
import {
  availabilityResponseSchema,
  type AvailabilityRequest,
  type AvailabilityResponse,
  type Rate,
} from './schemas';

/**
 * Mock CRS.
 *
 * Deterministic: the same query always yields the same rates, so Playwright can
 * assert on numbers and screenshot diffs stay stable. Rates vary by date and
 * property via a small hash rather than Math.random.
 */

const VALID_DISCOUNT_CODES = new Set(['INFINITY2X', 'DAYUSE20', 'WEEKEND15']);
const MEMBER_DISCOUNT = 0.12;
const DAY_USE_FACTOR = 0.45;

/** Stable 32-bit hash so pricing is repeatable across runs and machines. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`);
  return Math.max(0, Math.round(ms / 86_400_000));
}

function resolveProperties(destination: string) {
  const byCity = propertiesInCity(destination);
  if (byCity.length > 0) return byCity;
  const exact = PROPERTIES.filter((p) => p.slug === destination);
  if (exact.length > 0) return exact;
  // Fall back to a name match so a typed-but-unselected value still returns.
  const needle = destination.trim().toLowerCase();
  return PROPERTIES.filter(
    (p) =>
      p.name.toLowerCase().includes(needle) ||
      (cityBySlug(p.citySlug)?.name.toLowerCase().includes(needle) ?? false)
  );
}

export function createMockAvailabilityAdapter(): AvailabilityAdapter {
  return {
    name: 'mock',

    async search(request: AvailabilityRequest): Promise<AvailabilityResponse> {
      const nights =
        request.stay === 'day-use' ? 0 : nightsBetween(request.checkIn, request.checkOut);

      const rates: Rate[] = [];

      for (const property of resolveProperties(request.destination)) {
        // Hotels that have not opened cannot be booked.
        if (property.status !== 'open') continue;

        const city = cityBySlug(property.citySlug);
        const brand = brandBySlug(property.brandSlug);
        if (!city || !brand) continue;

        for (const room of property.roomTypes) {
          if (room.occupancy < request.occupancy.adults) continue;

          const seed = hash(`${property.slug}:${room.slug}:${request.checkIn}`);
          // +/- 10% seasonal movement, then the day-use reduction.
          const seasonal = 0.9 + seed * 0.2;
          const base = room.baseRateInr * seasonal;
          const amount = Math.round(
            (request.stay === 'day-use' ? base * DAY_USE_FACTOR : base) / 10
          ) * 10;

          rates.push({
            propertySlug: property.slug,
            propertyName: property.name,
            brandName: brand.name,
            cityName: city.name,
            roomTypeSlug: room.slug,
            roomTypeName: room.name,
            amountInr: amount,
            memberAmountInr: Math.round((amount * (1 - MEMBER_DISCOUNT)) / 10) * 10,
            currency: 'INR',
            refundable: seed > 0.35,
            roomsLeft: 1 + Math.floor(seed * 8),
          });
        }
      }

      rates.sort((a, b) => a.amountInr - b.amountInr);

      const code = request.discountCode?.trim().toUpperCase() ?? '';
      const discountNotice =
        code.length > 0 && !VALID_DISCOUNT_CODES.has(code)
          ? `We could not apply “${code}”. The rates below are our standard direct rates.`
          : null;

      // Validated on the way out as well as the way in: a bad adapter is a
      // boundary failure, not a rendering bug.
      return availabilityResponseSchema.parse({
        query: {
          destination: request.destination,
          checkIn: request.checkIn,
          checkOut: request.checkOut,
          stay: request.stay,
          nights,
        },
        rates,
        discountNotice,
      });
    },
  };
}

let cached: AvailabilityAdapter | null = null;

/**
 * Single place that decides which CRS is live. When the real one arrives it is
 * selected here by env; nothing else in the app changes.
 */
export function getAvailabilityAdapter(): AvailabilityAdapter {
  cached ??= createMockAvailabilityAdapter();
  return cached;
}
