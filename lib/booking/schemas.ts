import { z } from 'zod';

/**
 * Every value that crosses the availability boundary is validated here, in both
 * directions. The UI never sees an unvalidated CRS payload and the CRS never
 * sees an unvalidated form submission.
 */

/** The reference's three sheet tabs. */
export const bookingTabSchema = z.enum(['online-booking', 'last-minute', 'special-offers']);

/** The reference's stay-type toggle, which also drives the check-out label. */
export const stayTypeSchema = z.enum(['overnight', 'day-use']);

export const TAB_LABELS: Record<BookingTab, string> = {
  'online-booking': 'Online booking',
  'last-minute': 'Last minute offers',
  'special-offers': 'Special offers',
};

export const STAY_LABELS: Record<StayType, string> = {
  overnight: 'Overnight',
  'day-use': 'Day use',
};

/** Overnight departs; a day-use stay checks out the same day. */
export const CHECK_OUT_LABELS: Record<StayType, string> = {
  overnight: 'Departure',
  'day-use': 'Check-out time',
};

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be an ISO date (YYYY-MM-DD)')
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), 'must be a real date');

export const MAX_STAY_NIGHTS = 30;
export const MAX_GUESTS_PER_ROOM = 4;
export const MAX_ROOMS = 5;

export const occupancySchema = z.object({
  adults: z.number().int().min(1).max(MAX_GUESTS_PER_ROOM * MAX_ROOMS),
  children: z.number().int().min(0).max(MAX_GUESTS_PER_ROOM * MAX_ROOMS),
  rooms: z.number().int().min(1).max(MAX_ROOMS),
});

/**
 * The search the user submits. Cross-field rules live here rather than in the
 * form component so the API route enforces exactly the same contract.
 */
export const availabilityRequestSchema = z
  .object({
    tab: bookingTabSchema.default('online-booking'),
    stay: stayTypeSchema,
    /** City slug or property slug chosen from the combobox. */
    destination: z.string().min(1, 'Choose a city or hotel'),
    checkIn: isoDate,
    checkOut: isoDate,
    occupancy: occupancySchema,
    discountCode: z
      .string()
      .trim()
      .max(24)
      .regex(/^[A-Za-z0-9-]*$/, 'Use letters, numbers and hyphens only')
      .optional()
      .or(z.literal('')),
  })
  .superRefine((value, ctx) => {
    const inMs = Date.parse(`${value.checkIn}T00:00:00Z`);
    const outMs = Date.parse(`${value.checkOut}T00:00:00Z`);

    if (value.stay === 'day-use') {
      if (outMs !== inMs) {
        ctx.addIssue({
          code: 'custom',
          path: ['checkOut'],
          message: 'A day-use stay checks out on the day it starts',
        });
      }
      return;
    }

    if (outMs <= inMs) {
      ctx.addIssue({
        code: 'custom',
        path: ['checkOut'],
        message: 'Departure must be after arrival',
      });
      return;
    }

    const nights = Math.round((outMs - inMs) / 86_400_000);
    if (nights > MAX_STAY_NIGHTS) {
      ctx.addIssue({
        code: 'custom',
        path: ['checkOut'],
        message: `Stays are up to ${MAX_STAY_NIGHTS} nights — call us for longer`,
      });
    }
  });

export const rateSchema = z.object({
  propertySlug: z.string().min(1),
  propertyName: z.string().min(1),
  brandName: z.string().min(1),
  cityName: z.string().min(1),
  roomTypeSlug: z.string().min(1),
  roomTypeName: z.string().min(1),
  /** Whole rupees, per night for overnight, per slot for day use. */
  amountInr: z.number().int().positive(),
  memberAmountInr: z.number().int().positive(),
  currency: z.literal('INR'),
  refundable: z.boolean(),
  roomsLeft: z.number().int().min(0),
});

export const availabilityResponseSchema = z.object({
  query: z.object({
    destination: z.string(),
    checkIn: isoDate,
    checkOut: isoDate,
    stay: stayTypeSchema,
    nights: z.number().int().min(0),
  }),
  rates: z.array(rateSchema),
  /** Present when a code was supplied and could not be applied. */
  discountNotice: z.string().nullable(),
});

export type BookingTab = z.infer<typeof bookingTabSchema>;
export type StayType = z.infer<typeof stayTypeSchema>;
export type Occupancy = z.infer<typeof occupancySchema>;
export type AvailabilityRequest = z.infer<typeof availabilityRequestSchema>;
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
export type Rate = z.infer<typeof rateSchema>;
