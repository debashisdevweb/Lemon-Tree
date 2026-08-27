'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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

  /**
   * Focus restore is handled here rather than left to Radix.
   *
   * The sheet has six programmatic entry points and no Dialog.Trigger, and it
   * unmounts through AnimatePresence after a 600ms exit — between them, Radix's
   * own restore does not reliably land focus back where it started. Capturing
   * the element explicitly means a keyboard user always returns to the control
   * they pressed.
   */
  const restoreTo = useRef<HTMLElement | null>(null);

  const open = useCallback((options?: OpenOptions) => {
    const active = document.activeElement;
    restoreTo.current = active instanceof HTMLElement ? active : null;
    if (options?.tab) setTab(options.tab);
    if (options?.stay) setStay(options.stay);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    const target = restoreTo.current;
    restoreTo.current = null;
    if (!target || !target.isConnected) return;
    // Wait for the dialog's focus scope to release before taking focus back.
    requestAnimationFrame(() => target.focus());
  }, []);

  /**
   * Smooth scrolling and an open modal do not mix: any programmatic
   * scrollIntoView while the sheet is up starts a smooth scroll of the page
   * behind it, which the user never asked for and which fights the sheet's own
   * layout. The attribute below switches it off for as long as the sheet is
   * open (see app/globals.css).
   */
  useEffect(() => {
    const root = document.documentElement;
    if (isOpen) {
      root.dataset.modalOpen = 'true';
    } else {
      delete root.dataset.modalOpen;
    }
    return () => {
      delete root.dataset.modalOpen;
    };
  }, [isOpen]);

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
