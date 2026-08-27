'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  availabilityRequestSchema,
  bookingTabSchema,
  STAY_LABELS,
  TAB_LABELS,
  type AvailabilityRequest,
  type BookingTab,
  type Occupancy,
  type StayType,
} from '@/lib/booking/schemas';
import { DURATION, EASE, sec } from '@/lib/tokens/motion';
import { useBooking } from './BookingProvider';
import { DestinationCombobox } from './DestinationCombobox';
import { ArrivalField, DepartureField } from './DateFields';
import { GuestsField } from './GuestsField';
import { Button } from '@/components/primitives/Button';

/**
 * The booking sheet.
 *
 * Reproduces the reference exactly — tab bar plus discount code on a forest
 * strip, then a field row on paper, sliding up from the bottom over a scrim —
 * and fills the four gaps the reference leaves:
 *
 *  - It is a real dialog. Radix supplies role, aria-modal, focus trap and
 *    focus restore; the reference has none of these, only a keydown listener.
 *  - Tabs and the stay toggle get real roles via Radix Tabs / ToggleGroup.
 *  - Arrival and departure get real pickers, and occupancy exists at all.
 *  - It animates out. The reference unmounts instantly on close; AnimatePresence
 *    plays the entry in reverse.
 *
 * Search validates through the same Zod schema the API route uses, then routes
 * to /book/search. Only transform and opacity animate.
 */

const TAB_ORDER: readonly BookingTab[] = [
  'online-booking',
  'last-minute',
  'special-offers',
] as const;

const STAY_ORDER: readonly StayType[] = ['overnight', 'day-use'] as const;

type FieldErrors = Partial<Record<'destination' | 'checkIn' | 'checkOut' | 'discountCode', string>>;

function TicketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-[clamp(17px,1.445vw,22.9px)] shrink-0"
    >
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <line
        x1="8"
        y1="16"
        x2="16"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="9" cy="9" r="1.6" fill="currentColor" />
      <circle cx="15" cy="15" r="1.6" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[clamp(13.6px,1.02vw,17px)]">
      <circle cx="10.5" cy="10.5" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <line
        x1="15.6"
        y1="15.6"
        x2="21"
        y2="21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[42%]">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <line x1="4" y1="4" x2="20" y2="20" />
        <line x1="20" y1="4" x2="4" y2="20" />
      </g>
    </svg>
  );
}

export function BookingSheet() {
  const { isOpen, close, tab, setTab, stay, setStay } = useBooking();
  const router = useRouter();
  const reduced = useReducedMotion();
  const errorId = useId();
  const titleId = useId();

  const [destination, setDestination] = useState({ value: '', label: '' });
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [occupancy, setOccupancy] = useState<Occupancy>({ adults: 2, children: 0, rooms: 1 });
  const [discountCode, setDiscountCode] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const candidate: Record<string, unknown> = {
      tab,
      stay,
      // Fall back to the typed text so a user who never opened the list still
      // gets a search rather than a validation dead end.
      destination: destination.value || destination.label.trim(),
      checkIn: dates.checkIn,
      checkOut: stay === 'day-use' ? dates.checkIn : dates.checkOut,
      occupancy,
      discountCode,
    };

    const parsed = availabilityRequestSchema.safeParse(candidate);

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (
          key === 'destination' ||
          key === 'checkIn' ||
          key === 'checkOut' ||
          key === 'discountCode'
        ) {
          next[key] ??= issue.message;
        }
      }
      // Missing dates read as a schema regex failure; say something useful.
      if (!dates.checkIn) next.checkIn = 'Choose an arrival date';
      setErrors(next);
      return;
    }

    setErrors({});
    router.push(toSearchHref(parsed.data));
    close();
  };

  const firstError = errors.destination ?? errors.checkIn ?? errors.checkOut ?? errors.discountCode;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(next) => (next ? undefined : close())}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-[300] bg-[rgb(var(--brand-sheet-scrim)/0.52)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : sec(DURATION.fade), ease: 'easeOut' }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              aria-labelledby={titleId}
              onOpenAutoFocus={(event) => {
                // Land focus on the destination field, not the close button.
                event.preventDefault();
                const root = event.currentTarget as HTMLElement;
                root.querySelector<HTMLInputElement>('input[role="combobox"]')?.focus();
              }}
            >
              <motion.div
                /* Radix does not forward aria-modal through asChild in this
                   composition, and a modal dialog must declare it. */
                aria-modal="true"
                className="fixed inset-x-0 bottom-0 z-[310] will-change-transform"
                initial={{ y: reduced ? 0 : '102%' }}
                animate={{ y: 0 }}
                exit={{ y: reduced ? 0 : '102%' }}
                transition={{ duration: reduced ? 0 : sec(DURATION.sheet), ease: EASE.sheet }}
              >
                <Dialog.Title id={titleId} className="sr-only">
                  Check availability
                </Dialog.Title>

                <form onSubmit={onSubmit} className="max-w-sheet-max px-sm pb-xs mx-auto">
                  <div className="shadow-sheet overflow-hidden rounded-lg">
                    <Tabs.Root
                      value={tab}
                      onValueChange={(next) => setTab(bookingTabSchema.parse(next))}
                    >
                      {/* Forest strip: tabs + discount code */}
                      <div className="bg-forest grid gap-px md:grid-cols-[minmax(0,2.1fr)_minmax(0,0.9fr)]">
                        {/*
                          Content-width tabs in a scrollable row, not three
                          equal columns. `grid-cols-3` gave each tab a third of
                          the width, which clipped "Last minute offers" on a
                          phone. They fit at 375px; below that the row scrolls.
                        */}
                        <Tabs.List
                          aria-label="Booking type"
                          className={cn(
                            'bg-forest flex gap-px overflow-x-auto',
                            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                            'md:grid md:grid-cols-3 md:overflow-visible',
                          )}
                        >
                          {TAB_ORDER.map((value) => (
                            <Tabs.Trigger
                              key={value}
                              value={value}
                              className={cn(
                                'on-dark px-btn-tab-x py-btn-tab-y text-tab shrink-0 cursor-pointer',
                                'border-0 whitespace-nowrap md:shrink',
                                'transition-colors duration-[var(--dur-hover-swap)]',
                                'text-cream bg-transparent font-normal',
                                'data-[state=active]:bg-cream data-[state=active]:font-bold',
                                'data-[state=active]:text-ink',
                              )}
                            >
                              {TAB_LABELS[value]}
                            </Tabs.Trigger>
                          ))}
                        </Tabs.List>

                        <div className="on-dark gap-items bg-forest px-2xs flex items-center">
                          <span className="text-cream">
                            <TicketIcon />
                          </span>
                          <input
                            aria-label="Discount code"
                            aria-invalid={errors.discountCode ? true : undefined}
                            aria-describedby={errors.discountCode ? errorId : undefined}
                            placeholder="Discount code"
                            value={discountCode}
                            onChange={(event) => setDiscountCode(event.target.value)}
                            className={cn(
                              'py-btn-tab-y text-tab min-w-0 flex-auto border-0 bg-transparent',
                              'text-cream placeholder:text-cream/80 outline-none',
                            )}
                          />

                          {/*
                            Inside the sheet, not floating over the page.
                            The artboard floats an X near the top of the
                            viewport, but that cannot work here: Motion puts a
                            transform on Dialog.Content, and a transformed
                            ancestor becomes the containing block for
                            `position: fixed`, so the button measured its offset
                            from the sheet and landed on the tab row. Moving it
                            outside Dialog.Content fixed the geometry and broke
                            accessibility instead — Radix marks everything
                            outside the content aria-hidden while modal, so the
                            only close affordance disappeared from the
                            accessibility tree. In the sheet chrome it is
                            correct on both counts at every width.
                          */}
                          <Dialog.Close
                            aria-label="Close"
                            className={cn(
                              'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full',
                              'bg-cream/12 text-cream border-0',
                              'hover:bg-cream/24 transition-colors duration-[var(--dur-hover-swap)]',
                            )}
                          >
                            <CloseIcon />
                          </Dialog.Close>
                        </div>
                      </div>

                      {/* Paper row: the fields. One panel, because all three
                          tabs in the reference render the same fields. */}
                      {TAB_ORDER.map((value) => (
                        <Tabs.Content
                          key={value}
                          value={value}
                          forceMount={value === tab || undefined}
                        >
                          {value === tab && (
                            <div
                              className={cn(
                                'bg-paper gap-x-xs grid',
                                'px-sm py-sm',
                                /*
                                  Stacked, each field separated by a hairline
                                  and given the same vertical rhythm. Without
                                  the rules the six fields read as one loose
                                  list on a phone, with no way to tell where
                                  one stops and the next begins.
                                */
                                'grid-cols-1 gap-y-0',
                                '[&>*]:py-field',
                                '[&>*:not(:first-child)]:border-t-[length:var(--border-hair)]',
                                '[&>*:not(:first-child)]:border-forest/14 [&>*]:border-solid',
                                // From sm the rules come off and it is a grid again.
                                'sm:gap-y-field sm:grid-cols-2 sm:[&>*]:border-t-0 sm:[&>*]:py-0',
                                'lg:grid-cols-[auto_minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] lg:items-center',
                              )}
                            >
                              <div>
                                <span className="text-field-label text-muted block">Stay type</span>
                                <ToggleGroup.Root
                                  type="single"
                                  value={stay}
                                  onValueChange={(next) => {
                                    if (next === 'overnight' || next === 'day-use') setStay(next);
                                  }}
                                  aria-label="Stay type"
                                  className="bg-cream-2 mt-label gap-4xs p-4xs flex rounded-xs"
                                >
                                  {STAY_ORDER.map((value2) => (
                                    <ToggleGroup.Item
                                      key={value2}
                                      value={value2}
                                      className={cn(
                                        'px-btn-toggle-x py-btn-toggle-y cursor-pointer rounded-xs border-0',
                                        'text-btn-sm font-bold whitespace-nowrap',
                                        'transition-colors duration-[var(--dur-hover-swap)]',
                                        'text-forest bg-transparent',
                                        'data-[state=on]:bg-forest data-[state=on]:text-paper',
                                      )}
                                    >
                                      {STAY_LABELS[value2]}
                                    </ToggleGroup.Item>
                                  ))}
                                </ToggleGroup.Root>
                              </div>

                              <DestinationCombobox
                                value={destination.value}
                                label={destination.label}
                                onChange={setDestination}
                                error={errors.destination}
                                describedBy={errors.destination ? errorId : undefined}
                              />

                              <ArrivalField
                                checkIn={dates.checkIn}
                                checkOut={dates.checkOut}
                                stay={stay}
                                onChange={setDates}
                                error={errors.checkIn}
                                errorId={errors.checkIn ? errorId : undefined}
                              />

                              <DepartureField
                                checkIn={dates.checkIn}
                                checkOut={dates.checkOut}
                                stay={stay}
                                onChange={setDates}
                                error={errors.checkOut}
                                errorId={errors.checkOut ? errorId : undefined}
                              />

                              <GuestsField occupancy={occupancy} onChange={setOccupancy} />

                              <Button type="submit" slot="sheet" className="w-full lg:w-auto">
                                Search
                                <SearchIcon />
                              </Button>
                            </div>
                          )}
                        </Tabs.Content>
                      ))}
                    </Tabs.Root>

                    {firstError && (
                      <p
                        id={errorId}
                        role="alert"
                        className="bg-paper text-body-sm text-accent-text px-sm pb-2xs font-bold"
                      >
                        {firstError}
                      </p>
                    )}
                  </div>
                </form>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/** Serialise a validated request into the search route's query string. */
export function toSearchHref(request: AvailabilityRequest): string {
  const params = new URLSearchParams({
    destination: request.destination,
    checkIn: request.checkIn,
    checkOut: request.checkOut,
    stay: request.stay,
    adults: String(request.occupancy.adults),
    children: String(request.occupancy.children),
    rooms: String(request.occupancy.rooms),
    tab: request.tab,
  });
  const code = request.discountCode?.trim();
  if (code) params.set('discountCode', code);
  return `/book/search?${params.toString()}`;
}
