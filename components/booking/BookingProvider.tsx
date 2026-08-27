'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { BookingTab, StayType } from '@/lib/booking/schemas';

/**
 * Booking sheet state.
 *
 * The reference keeps `tab`, `stay` and `booking` on one component and passes
 * six pre-bound openers down (`openBooking`, `openSpecial`, `openDayUse`, ...).
 * Same model here, lifted into context so the six entry points scattered across
 * the page — header, floating bar x3, presence, closing links — can each open
 * the sheet in the state their label promises without prop drilling.
 */

type OpenOptions = { tab?: BookingTab; stay?: StayType };

type BookingContextValue = {
  isOpen: boolean;
  tab: BookingTab;
  stay: StayType;
  open: (options?: OpenOptions) => void;
  close: () => void;
  setTab: (tab: BookingTab) => void;
  setStay: (stay: StayType) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  children,
  defaultStay = 'overnight',
}: {
  children: ReactNode;
  defaultStay?: StayType;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<BookingTab>('online-booking');
  const [stay, setStay] = useState<StayType>(defaultStay);

  const open = useCallback((options?: OpenOptions) => {
    if (options?.tab) setTab(options.tab);
    if (options?.stay) setStay(options.stay);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<BookingContextValue>(
    () => ({ isOpen, tab, stay, open, close, setTab, setStay }),
    [isOpen, tab, stay, open, close],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used inside <BookingProvider>');
  }
  return context;
}
