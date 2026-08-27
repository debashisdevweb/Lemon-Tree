'use client';

import { cn } from '@/lib/cn';
import { Button } from '@/components/primitives/Button';
import { useBooking } from '@/components/booking/BookingProvider';

/**
 * The floating bar, pinned bottom-centre.
 *
 * Three entry points into the same sheet, each opening it in the state its
 * label promises: Day use flips the stay toggle, Offers selects the special
 * offers tab, Check availability opens the default.
 *
 * On narrow viewports the caption block is dropped and the row becomes a
 * three-up of equal buttons — the reference has no mobile treatment, and at
 * 320px the caption plus three buttons cannot fit without overflow.
 */
export function FloatingBookingBar() {
  const { open } = useBooking();

  return (
    <div
      data-testid="booking-bar"
      aria-label="Find a hotel"
      className={cn(
        'fixed bottom-[clamp(10.2px,1.53vw,22.1px)] left-1/2 z-55 -translate-x-1/2',
        'flex w-[min(calc(100vw-20.4px),612px)] items-center justify-center',
        'bg-paper shadow-bar gap-inline p-4xs rounded-lg',
      )}
    >
      <div className="px-2xs leading-[1.25]">
        <span className="text-label text-muted block">Where to next</span>
        <span className="text-bar-title text-forest block font-bold">Find a hotel</span>
      </div>

      {/*
        Hidden below sm. Three competing buttons at 320px left each one about
        90px wide and none of them clearly primary. Both actions still exist
        one tap away inside the sheet — Day use is the stay toggle, Offers is a
        tab — so nothing is lost and the bar has a single obvious action.
      */}
      <Button
        slot="bar"
        variant="ghost"
        className="hidden sm:inline-flex"
        onClick={() => open({ tab: 'online-booking', stay: 'day-use' })}
      >
        Day use
      </Button>
      <Button
        slot="bar"
        variant="ghost"
        className="hidden sm:inline-flex"
        onClick={() => open({ tab: 'special-offers' })}
      >
        Offers
      </Button>
      <Button
        slot="barCta"
        className="ml-auto flex-1 whitespace-nowrap sm:flex-none"
        onClick={() => open({ tab: 'online-booking' })}
      >
        Check availability
      </Button>
    </div>
  );
}
