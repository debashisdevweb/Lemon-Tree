'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { getSearchAdapter, type SearchHit } from '@/lib/search/adapter';

/**
 * "Where to next?" — the reference's plain text input, given the autocomplete
 * its placeholder ("City or hotel") already promises.
 *
 * Built to the ARIA 1.2 combobox pattern rather than with a library: input
 * keeps focus throughout, `aria-activedescendant` moves the virtual cursor,
 * and the listbox is a sibling so it never traps a screen reader inside.
 */
export function DestinationCombobox({
  value,
  label,
  onChange,
  error,
  describedBy,
}: {
  /** The resolved slug, or '' when nothing is chosen yet. */
  value: string;
  /** The human-readable text in the field. */
  label: string;
  onChange: (next: { value: string; label: string }) => void;
  error?: string | undefined;
  describedBy?: string | undefined;
}) {
  const adapter = getSearchAdapter();
  const listId = useId();
  const inputId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hits = useMemo(() => adapter.suggest(label), [adapter, label]);

  const commit = (hit: SearchHit) => {
    onChange({ value: hit.value, label: hit.label });
    setIsOpen(false);
    setActive(0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActive(0);
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => {
        if (hits.length === 0) return 0;
        return (current + step + hits.length) % hits.length;
      });
      return;
    }

    if (event.key === 'Enter' && isOpen) {
      const hit = hits[active];
      if (hit) {
        event.preventDefault();
        commit(hit);
      }
      return;
    }

    if (event.key === 'Escape' && isOpen) {
      // Swallow it so the dialog does not also close.
      event.stopPropagation();
      setIsOpen(false);
    }
  };

  const activeId = isOpen && hits[active] ? `${listId}-${active}` : undefined;

  return (
    <div className="relative min-w-0">
      <label htmlFor={inputId} className="text-field-label text-muted block">
        Where to next?
      </label>
      <input
        id={inputId}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        placeholder="City or hotel"
        value={label}
        onChange={(event) => {
          onChange({ value: '', label: event.target.value });
          setIsOpen(true);
          setActive(0);
        }}
        /* Deliberately not onFocus. The sheet moves focus here when it opens,
           and a suggestion list that appears unasked covers the fields below
           it — at 320px it lands directly on top of the Search button. It
           opens on a click, on typing, or on an arrow key instead. */
        onClick={() => setIsOpen(true)}
        onBlur={() => {
          // Let a click on an option land before the list unmounts.
          blurTimer.current = setTimeout(() => setIsOpen(false), 120);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          'text-field-value mt-[--spacing(1)] w-full border-0 bg-transparent p-0 font-bold',
          'text-ink-strong placeholder:text-muted outline-none placeholder:font-normal',
        )}
      />
      {value === '' && label.trim() !== '' && (
        <span className="sr-only" aria-live="polite">
          {hits.length} suggestions available
        </span>
      )}

      {isOpen && hits.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Cities and hotels"
          className={cn(
            'absolute top-full left-0 z-10 mt-[--spacing(2)] max-h-[238px] w-[min(306px,80vw)]',
            'bg-paper shadow-bar list-none overflow-y-auto rounded-sm p-[--spacing(1)]',
          )}
          onMouseDown={(event) => {
            // Prevent the input's blur from firing before onClick.
            event.preventDefault();
            if (blurTimer.current) clearTimeout(blurTimer.current);
          }}
        >
          {hits.map((hit, index) => (
            <li
              key={`${hit.kind}-${hit.value}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onClick={() => commit(hit)}
              onMouseEnter={() => setActive(index)}
              className={cn(
                'cursor-pointer rounded-xs px-[--spacing(3)] py-[--spacing(2)]',
                index === active ? 'bg-cream-2 text-forest' : 'text-ink',
              )}
            >
              <span className="text-body-sm block font-bold">{hit.label}</span>
              <span className="text-meta text-muted block">
                {hit.detail}
                {!hit.isOpen && ' · opening soon'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
