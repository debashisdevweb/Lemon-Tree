'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useState, type ReactNode } from 'react';
import { BookingProvider } from '@/components/booking/BookingProvider';

/**
 * The booking sheet is code-split.
 *
 * It pulls in Radix Dialog/Tabs/ToggleGroup/Popover and react-day-picker, none
 * of which is needed until someone actually opens it. Loading it on demand keeps
 * that weight off the home page's first load, which is what the LCP budget
 * needs. `ssr: false` is correct here: the sheet is closed on first paint, so
 * there is nothing to server-render.
 */
const BookingSheet = dynamic(
  () => import('@/components/booking/BookingSheet').then((m) => m.BookingSheet),
  { ssr: false },
);

/**
 * Content routes get this: booking state and the lazy sheet, and nothing else.
 * No query client, because no content template fetches on the client.
 */
export function BookingRoot({ children }: { children: ReactNode }) {
  return (
    <BookingProvider>
      {children}
      <BookingSheet />
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
