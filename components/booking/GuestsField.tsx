'use client';

import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { MAX_GUESTS_PER_ROOM, MAX_ROOMS, type Occupancy } from '@/lib/booking/schemas';

/**
 * Guests and rooms.
 *
 * Net-new: the reference has no occupancy control at all, yet no CRS can price
 * a stay without one. Stepper rows rather than selects, because the counts are
 * small and a stepper needs no menu on touch.
 */

const summarise = ({ adults, children, rooms }: Occupancy): string => {
  const guests = adults + children;
  return `${guests} ${guests === 1 ? 'guest' : 'guests'}, ${rooms} ${rooms === 1 ? 'room' : 'rooms'}`;
};

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const id = `${label.toLowerCase()}-count`;
  return (
    <div className="gap-gap-grid flex items-center justify-between">
      <span>
        <span id={id} className="text-body-sm text-forest block font-bold">
          {label}
        </span>
        {hint && <span className="text-meta text-muted block">{hint}</span>}
      </span>
      <span className="flex items-center gap-[--spacing(2)]">
        <button
          type="button"
          aria-label={`One fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={cn(
            'inline-flex size-9 items-center justify-center rounded-xs',
            'border-forest/40 text-forest border-[length:var(--border-hair)] border-solid',
            'cursor-pointer transition-colors duration-[var(--dur-hover-swap)]',
            'hover:bg-forest hover:text-cream disabled:cursor-not-allowed disabled:opacity-35',
          )}
        >
          <span aria-hidden="true">&minus;</span>
        </button>
        <output
          aria-labelledby={id}
          className="text-body-sm text-ink-strong w-6 text-center font-bold tabular-nums"
        >
          {value}
        </output>
        <button
          type="button"
          aria-label={`One more ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={cn(
            'inline-flex size-9 items-center justify-center rounded-xs',
            'border-forest/40 text-forest border-[length:var(--border-hair)] border-solid',
            'cursor-pointer transition-colors duration-[var(--dur-hover-swap)]',
            'hover:bg-forest hover:text-cream disabled:cursor-not-allowed disabled:opacity-35',
          )}
        >
          <span aria-hidden="true">+</span>
        </button>
      </span>
    </div>
  );
}

export function GuestsField({
  occupancy,
  onChange,
}: {
  occupancy: Occupancy;
  onChange: (next: Occupancy) => void;
}) {
  const [open, setOpen] = useState(false);
  const capacity = occupancy.rooms * MAX_GUESTS_PER_ROOM;
  const overCapacity = occupancy.adults + occupancy.children > capacity;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="min-w-0 cursor-pointer rounded-xs bg-transparent p-0 text-left">
        <span className="text-field-label text-muted block">Guests</span>
        <span className="text-field-value text-ink-strong mt-[--spacing(1)] block truncate font-bold">
          {summarise(occupancy)}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={12}
          align="start"
          className={cn(
            'bg-paper p-card-pad-sm shadow-bar z-[320] w-[min(320px,84vw)] rounded-md',
            'gap-gap-tight flex flex-col',
          )}
        >
          <Stepper
            label="Adults"
            value={occupancy.adults}
            min={1}
            max={capacity}
            onChange={(adults) => onChange({ ...occupancy, adults })}
          />
          <Stepper
            label="Children"
            hint="Under 12"
            value={occupancy.children}
            min={0}
            max={Math.max(0, capacity - occupancy.adults)}
            onChange={(children) => onChange({ ...occupancy, children })}
          />
          <Stepper
            label="Rooms"
            value={occupancy.rooms}
            min={1}
            max={MAX_ROOMS}
            onChange={(rooms) => {
              const nextCapacity = rooms * MAX_GUESTS_PER_ROOM;
              onChange({
                rooms,
                adults: Math.min(occupancy.adults, nextCapacity),
                children: Math.min(
                  occupancy.children,
                  Math.max(0, nextCapacity - occupancy.adults),
                ),
              });
            }}
          />
          {overCapacity && (
            <p role="alert" className="text-meta text-accent-deep">
              That is more than {MAX_GUESTS_PER_ROOM} guests per room — add a room to continue.
            </p>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
