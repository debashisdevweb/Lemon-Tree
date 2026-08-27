'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useState, type ReactNode } from 'react';
import { BookingProvider, useBooking } from '@/components/booking/BookingProvider';

/**
 * The booking sheet is code-split AND mount-gated.
 *
 * Splitting alone was not enough: rendering `<BookingSheet />` unconditionally
 * still fires its dynamic import on mount, so the chunk — Radix Dialog, Tabs,
 * ToggleGroup, Popover and react-day-picker, 77 KB over the wire — was being
 * fetched during initial load and competing with the hero for bandwidth on 4G.
 *
 * So it is not mounted until the sheet is first opened, and the chunk is warmed
 * during idle time instead. The user never waits for it, and it is off the
 * critical path.
 */
const BookingSheet = dynamic(
  () => import('@/components/booking/BookingSheet').then((m) => m.BookingSheet),
  { ssr: false },
);

const warmSheetChunk = (): void => {
  void import('@/components/booking/BookingSheet');
};

function BookingSheetGate() {
  const { isOpen } = useBooking();
  const [mounted, setMounted] = useState(false);

  // Once opened, stay mounted — remounting would lose the entered search.
  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  /**
   * Warm on the first sign of a real user, not on idle.
   *
   * requestIdleCallback fires within a second or so on a capable device, which
   * put the chunk right back into the load window and back in front of LCP.
   * Any of these events means someone is actually here, by which point the page
   * has painted and the bandwidth is free.
   */
  useEffect(() => {
    if (mounted) return;

    // Deliberately not 'scroll': scrolling is not a booking intent, and
    // including it meant the chunk was fetched during the initial reading pass,
    // back in front of the LCP paint.
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    let done = false;

    const warm = () => {
      if (done) return;
      done = true;
      warmSheetChunk();
      for (const event of events) window.removeEventListener(event, warm);
    };

    for (const event of events) {
      window.addEventListener(event, warm, { passive: true, once: true });
    }

    return () => {
      for (const event of events) window.removeEventListener(event, warm);
    };
  }, [mounted]);

  if (!mounted) return null;
  return <BookingSheet />;
}

/**
 * Content routes get this: booking state and the gated sheet, and nothing else.
 * No query client, because no content template fetches on the client.
 */
export function BookingRoot({ children }: { children: ReactNode }) {
  return (
    <BookingProvider>
      {children}
      <BookingSheetGate />
    </BookingProvider>
  );
}

/**
 * Only the funnel gets TanStack Query. `staleTime: 0` because a room rate must
 * never be served from cache without a refetch.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            gcTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
