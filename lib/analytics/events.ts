import { z } from 'zod';

/**
 * Analytics.
 *
 * One typed event map, so a component cannot invent an event name or forget a
 * parameter, and so the GA4 schema is reviewable in one file. Nothing is sent
 * until a container id is configured — the site works identically with
 * analytics absent, which is what keeps local and CI runs clean.
 */

export const ANALYTICS_EVENTS = {
  booking_sheet_opened: z.object({
    entry_point: z.enum([
      'header',
      'floating_bar',
      'floating_bar_day_use',
      'floating_bar_offers',
      'presence',
      'closing',
      'hotel_card',
      'offer_card',
      'rewards',
      'search_page',
    ]),
    tab: z.string(),
    stay: z.string(),
  }),
  booking_search_submitted: z.object({
    destination: z.string(),
    stay: z.string(),
    nights: z.number().int().min(0),
    adults: z.number().int(),
    children: z.number().int(),
    rooms: z.number().int(),
    has_discount_code: z.boolean(),
  }),
  booking_search_rejected: z.object({
    first_error_field: z.string(),
  }),
  availability_returned: z.object({
    destination: z.string(),
    rate_count: z.number().int().min(0),
  }),
  newsletter_signup: z.object({ placement: z.literal('footer') }),
  enquiry_submitted: z.object({ kind: z.string(), city: z.string() }),
} as const;

export type AnalyticsEventName = keyof typeof ANALYTICS_EVENTS;
export type AnalyticsPayload<K extends AnalyticsEventName> = z.infer<
  (typeof ANALYTICS_EVENTS)[K]
>;

type DataLayerEntry = { event: AnalyticsEventName } & Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
  }
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? '';
export const analyticsEnabled = (): boolean => GTM_ID.length > 0;

/**
 * Push a validated event onto the GTM dataLayer.
 *
 * The payload is parsed before it is sent, so a malformed event fails loudly in
 * development instead of arriving silently broken in GA4. In production a bad
 * payload is dropped rather than thrown — analytics must never break a booking.
 */
export function track<K extends AnalyticsEventName>(name: K, payload: AnalyticsPayload<K>): void {
  const parsed = ANALYTICS_EVENTS[name].safeParse(payload);

  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `Invalid analytics payload for "${name}": ${parsed.error.issues
          .map((i) => `${i.path.join('.')} ${i.message}`)
          .join('; ')}`
      );
    }
    return;
  }

  if (typeof window === 'undefined' || !analyticsEnabled()) return;

  window.dataLayer ??= [];
  window.dataLayer.push({ event: name, ...(parsed.data as Record<string, unknown>) });
}
