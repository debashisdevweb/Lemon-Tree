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
      className={cn(
        'fixed bottom-[clamp(12px,1.8vw,26px)] left-1/2 z-55 -translate-x-1/2',
        'flex w-[min(calc(100vw-24px),720px)] items-center justify-center',
        'bg-paper shadow-bar gap-[clamp(8px,1vw,16px)] rounded-lg p-[clamp(7px,0.7vw,11px)]',
      )}
    >
      <div className="hidden px-[clamp(8px,1vw,16px)] leading-[1.25] sm:block">
        <span className="text-label text-muted block">Where to next</span>
        <span className="text-bar-title text-forest block font-bold">Find a hotel</span>
      </div>

      <Button
        slot="bar"
        variant="ghost"
        className="flex-1 sm:flex-none"
        onClick={() => open({ tab: 'online-booking', stay: 'day-use' })}
      >
        Day use
      </Button>
      <Button
        slot="bar"
        variant="ghost"
        className="flex-1 sm:flex-none"
        onClick={() => open({ tab: 'special-offers' })}
      >
        Offers
      </Button>
      <Button
        slot="barCta"
        className="flex-1 whitespace-nowrap sm:flex-none"
        onClick={() => open({ tab: 'online-booking' })}
      >
        Check availability
      </Button>
    </div>
  );
}
