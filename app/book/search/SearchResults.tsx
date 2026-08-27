'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Button } from '@/components/primitives/Button';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { useBooking } from '@/components/booking/BookingProvider';
import {
  availabilityRequestSchema,
  availabilityResponseSchema,
  STAY_LABELS,
  type AvailabilityRequest,
  type AvailabilityResponse,
} from '@/lib/booking/schemas';

/**
 * Step 1 of the funnel: results for the search the sheet submitted.
 *
 * This is the one place in the app that fetches on the client, and it is the
 * reason TanStack Query is installed — rates are volatile, must never come from
 * cache, and need a real retry and error path.
 *
 * Everything past this point (room selection, guest details, payment) has no
 * design in the reference and is deliberately not built. The adapter and
 * schemas are what the next step will attach to.
 */

const isoToday = (): string => new Date().toISOString().slice(0, 10);

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

async function fetchAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
  const response = await fetch('/api/availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const payload: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : 'We could not load rates.';
    throw new Error(message);
  }

  // The client validates too — a wrong shape is a boundary failure, not a crash
  // half way down the render.
  return availabilityResponseSchema.parse(payload);
}

export function SearchResults() {
  const params = useSearchParams();
  const { open } = useBooking();

  const parsed = useMemo(() => {
    const stay = params.get('stay') === 'day-use' ? 'day-use' : 'overnight';
    const checkIn = params.get('checkIn') ?? isoToday();
    const fallbackOut =
      stay === 'day-use'
        ? checkIn
        : new Date(Date.parse(`${checkIn}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

    return availabilityRequestSchema.safeParse({
      tab: params.get('tab') ?? 'online-booking',
      stay,
      destination: params.get('destination') ?? params.get('theme') ?? '',
      checkIn,
      checkOut: params.get('checkOut') ?? fallbackOut,
      occupancy: {
        adults: Number(params.get('adults') ?? 2),
        children: Number(params.get('children') ?? 0),
        rooms: Number(params.get('rooms') ?? 1),
      },
      discountCode: params.get('discountCode') ?? '',
    });
  }, [params]);

  const request = parsed.success ? parsed.data : null;

  const { data, error, isPending, isError, refetch } = useQuery({
    queryKey: ['availability', request],
    queryFn: () => fetchAvailability(request as AvailabilityRequest),
    enabled: request !== null,
  });

  const shell = 'mx-auto max-w-shell px-gutter py-section';

  if (!parsed.success || !request) {
    return (
      <div className={shell}>
        <Eyebrow tone="accent">Nothing to search yet</Eyebrow>
        <h1 className="mt-gap-eyebrow font-display text-h2 text-forest leading-[1.04] font-normal">
          Tell us where you’re going
        </h1>
        <p className="mt-gap-eyebrow text-prose text-muted max-w-[46ch] leading-[1.6]">
          {(parsed.success ? undefined : parsed.error.issues[0]?.message) ??
            'Choose a city or hotel and a pair of dates, and we’ll show live rates.'}
        </p>
        <Button slot="prominent" className="mt-gap-heading" onClick={() => open()}>
          Check availability
        </Button>
      </div>
    );
  }

  return (
    <div className={shell}>
      <Eyebrow tone="sage">
        {STAY_LABELS[request.stay]} · {request.checkIn}
        {request.stay === 'overnight' ? ` to ${request.checkOut}` : ''} ·{' '}
        {request.occupancy.adults + request.occupancy.children} guests
      </Eyebrow>

      <h1 className="mt-gap-eyebrow font-display text-h2 text-forest leading-[1.04] font-normal tracking-[-0.018em]">
        {data ? `${data.rates.length} rates` : 'Finding rates'}
      </h1>

      <div className="mt-gap-heading gap-items flex flex-wrap items-center">
        <Button slot="section" variant="outline" onClick={() => open({ stay: request.stay })}>
          Change search
        </Button>
      </div>

      {data?.discountNotice && (
        <p
          role="status"
          className="mt-gap-heading bg-paper p-pad-card-sm text-body-sm text-ink max-w-[60ch]"
        >
          {data.discountNotice}
        </p>
      )}

      {isPending && (
        <ul className="mt-gap-heading gap-cards grid list-none p-0" aria-hidden="true">
          {[0, 1, 2].map((row) => (
            <li key={row} className="bg-paper h-[88px] animate-pulse rounded-sm" />
          ))}
        </ul>
      )}
      <span className="sr-only" aria-live="polite">
        {isPending ? 'Loading rates' : data ? `${data.rates.length} rates found` : ''}
      </span>

      {isError && (
        <div className="mt-gap-heading bg-paper p-pad-card max-w-[60ch]">
          <p className="text-body text-accent-text font-bold">
            {error instanceof Error ? error.message : 'We could not load rates.'}
          </p>
          <Button
            slot="section"
            variant="outline"
            className="mt-gap-eyebrow"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </div>
      )}

      {data && data.rates.length === 0 && (
        <div className="mt-gap-heading bg-paper p-pad-card max-w-[60ch]">
          <p className="text-body text-ink">
            Nothing available for those dates at {request.destination}. Try different dates, or
            search a nearby city.
          </p>
        </div>
      )}

      {data && data.rates.length > 0 && (
        <ul className="mt-gap-heading gap-cards grid list-none p-0">
          {data.rates.map((rate) => (
            <li
              key={`${rate.propertySlug}-${rate.roomTypeSlug}`}
              className="gap-cards bg-paper p-pad-card-sm flex flex-wrap items-center justify-between"
            >
              <div className="min-w-0">
                <Eyebrow tone="sage" track="tight">
                  {rate.brandName} · {rate.cityName}
                </Eyebrow>
                <h2 className="font-display text-h4 text-forest mt-label leading-[1.12] font-medium">
                  {rate.propertyName}
                </h2>
                <p className="text-body-sm text-muted mt-label">
                  {rate.roomTypeName} · {rate.refundable ? 'Free cancellation' : 'Non-refundable'} ·{' '}
                  {rate.roomsLeft} left
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-stat text-forest leading-none tabular-nums">
                  {money.format(rate.amountInr)}
                </p>
                <p className="text-meta text-muted mt-label">
                  Members {money.format(rate.memberAmountInr)}
                  {request.stay === 'overnight' ? ' per night' : ' per slot'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
