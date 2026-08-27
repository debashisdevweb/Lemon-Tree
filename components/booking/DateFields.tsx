'use client';

import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { cn } from '@/lib/cn';
import { CHECK_OUT_LABELS, MAX_STAY_NIGHTS, type StayType } from '@/lib/booking/schemas';

/**
 * Arrival and departure.
 *
 * The reference renders both as an em-dash with no picker at all, so this is
 * net-new: a real calendar, driven by the stay type. Overnight picks a range;
 * day use picks a single day, because a day-use stay checks out the day it
 * starts — which is also why the second label swaps between "Departure" and
 * "Check-out time".
 */

const DAY = 86_400_000;

export const toIso = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const fromIso = (iso: string): Date | undefined => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const parts = iso.split('-').map(Number);
  const [y, m, d] = parts as [number, number, number];
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const fmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
const fmtLong = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const display = (iso: string): string => {
  const date = fromIso(iso);
  return date ? fmt.format(date) : '—';
};

const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const pickerClassNames = {
  months: 'flex flex-col gap-items',
  month_caption: 'flex items-center justify-center py-[--spacing(2)]',
  caption_label: 'text-body-sm font-bold text-forest',
  nav: 'flex items-center gap-4xs',
  button_previous:
    'inline-flex size-8 items-center justify-center rounded-xs text-forest hover:bg-cream-2',
  button_next:
    'inline-flex size-8 items-center justify-center rounded-xs text-forest hover:bg-cream-2',
  weekday: 'text-meta font-bold uppercase tracking-[0.08em] text-muted',
  day: 'p-0',
  day_button:
    'inline-flex size-9 items-center justify-center rounded-xs text-body-sm text-ink ' +
    'hover:bg-cream-2 disabled:cursor-not-allowed disabled:opacity-35',
  selected: '[&>button]:bg-forest [&>button]:text-cream [&>button]:font-bold',
  range_middle: '[&>button]:bg-cream-2 [&>button]:text-forest',
  today: '[&>button]:underline [&>button]:underline-offset-4',
  outside: 'opacity-40',
} as const;

function FieldShell({
  label,
  value,
  longValue,
  invalid,
  describedBy,
}: {
  label: string;
  value: string;
  longValue: string;
  invalid: boolean;
  describedBy?: string | undefined;
}) {
  return (
    <Popover.Trigger
      className={cn(
        'min-w-0 cursor-pointer rounded-xs bg-transparent p-0 text-left',
        'transition-colors duration-[var(--dur-hover-swap)]',
      )}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
    >
      <span className="text-field-label text-muted block">{label}</span>
      <span className="text-field-value text-ink-strong mt-label block font-bold">
        {/* The abbreviated date is for the eye only. Assistive tech gets the
            unambiguous long form instead, so the accessible name reads
            "Arrival, Thursday, 27 August 2026" rather than repeating itself. */}
        <span aria-hidden="true">{value}</span>
        {/* No leading comma: accessible-name computation already joins the
            label and this value with a space. */}
        <span className="sr-only">{longValue !== '—' ? longValue : 'no date chosen'}</span>
      </span>
    </Popover.Trigger>
  );
}

const popoverContent =
  'z-[320] rounded-md bg-paper p-pad-card-sm shadow-bar ' +
  'data-[state=open]:animate-[lt-fade_var(--dur-hover-swap)_ease_both]';

export function ArrivalField({
  checkIn,
  checkOut,
  stay,
  onChange,
  error,
  errorId,
}: {
  checkIn: string;
  checkOut: string;
  stay: StayType;
  onChange: (next: { checkIn: string; checkOut: string }) => void;
  error?: string | undefined;
  errorId?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const selectedIn = fromIso(checkIn);
  const selectedOut = fromIso(checkOut);
  const today = startOfToday();

  const range: DateRange | undefined = selectedIn
    ? { from: selectedIn, ...(selectedOut ? { to: selectedOut } : {}) }
    : undefined;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <FieldShell
        label="Arrival"
        value={display(checkIn)}
        longValue={selectedIn ? fmtLong.format(selectedIn) : '—'}
        invalid={Boolean(error)}
        describedBy={errorId}
      />
      <Popover.Portal>
        <Popover.Content
          className={popoverContent}
          sideOffset={12}
          align="start"
          /* Escape must dismiss only the calendar. Without this the key also
             reaches the booking dialog behind it and closes the whole sheet. */
          onEscapeKeyDown={(event) => event.stopPropagation()}
        >
          {stay === 'day-use' ? (
            <DayPicker
              mode="single"
              autoFocus
              selected={selectedIn}
              disabled={{ before: today }}
              classNames={pickerClassNames}
              onSelect={(date) => {
                if (!date) return;
                const iso = toIso(date);
                onChange({ checkIn: iso, checkOut: iso });
                setOpen(false);
              }}
            />
          ) : (
            <DayPicker
              mode="range"
              autoFocus
              numberOfMonths={1}
              selected={range}
              disabled={{ before: today }}
              max={MAX_STAY_NIGHTS + 1}
              classNames={pickerClassNames}
              onSelect={(next) => {
                if (!next?.from) return;

                // react-day-picker reports the first click of a range as
                // { from: day, to: day }. Taking that literally would set an
                // overnight departure equal to the arrival, which the schema
                // correctly rejects — so a single-day selection becomes a
                // one-night stay and the user adjusts the departure if needed.
                const sameDay = next.to !== undefined && next.to.getTime() === next.from.getTime();
                const departure =
                  next.to && !sameDay ? next.to : new Date(next.from.getTime() + DAY);

                onChange({ checkIn: toIso(next.from), checkOut: toIso(departure) });

                // Close once both ends are real; stay open while the user is
                // still extending the range.
                if (next.to) setOpen(false);
              }}
            />
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function DepartureField({
  checkIn,
  checkOut,
  stay,
  onChange,
  error,
  errorId,
}: {
  checkIn: string;
  checkOut: string;
  stay: StayType;
  onChange: (next: { checkIn: string; checkOut: string }) => void;
  error?: string | undefined;
  errorId?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const selectedIn = fromIso(checkIn);
  const selectedOut = fromIso(checkOut);
  const label = CHECK_OUT_LABELS[stay];

  // A day-use stay has no separate departure date to choose.
  if (stay === 'day-use') {
    return (
      <div className="min-w-0">
        <span className="text-field-label text-muted block">{label}</span>
        <span className="text-field-value text-ink-strong mt-label block font-bold">Same day</span>
      </div>
    );
  }

  const earliest = selectedIn ? new Date(selectedIn.getTime() + DAY) : startOfToday();

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <FieldShell
        label={label}
        value={display(checkOut)}
        longValue={selectedOut ? fmtLong.format(selectedOut) : '—'}
        invalid={Boolean(error)}
        describedBy={errorId}
      />
      <Popover.Portal>
        <Popover.Content
          className={popoverContent}
          sideOffset={12}
          align="start"
          /* Escape must dismiss only the calendar. Without this the key also
             reaches the booking dialog behind it and closes the whole sheet. */
          onEscapeKeyDown={(event) => event.stopPropagation()}
        >
          <DayPicker
            mode="single"
            autoFocus
            selected={selectedOut}
            disabled={{ before: earliest }}
            classNames={pickerClassNames}
            onSelect={(date) => {
              if (!date) return;
              onChange({ checkIn, checkOut: toIso(date) });
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
