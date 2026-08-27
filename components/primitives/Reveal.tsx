'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { RevealDelay } from '@/lib/tokens/motion';

/**
 * Scroll reveal — opacity 0 -> 1 and translateY 34px -> 0, one shot.
 *
 * Matches the reference exactly: 1000ms (900ms for the two Destinations
 * elements), cubic-bezier(.2,.75,.25,1), per-element delay, fires when the
 * element's top passes 94% of the viewport, and never re-runs once played.
 *
 * Implemented with IntersectionObserver plus a CSS transition rather than an
 * animation library, for three reasons:
 *
 *  - It is what the design actually is. These are two transitioned properties;
 *    there is no spring, no gesture, no interruption to coordinate.
 *  - It keeps Motion off the home page's first load entirely. Motion now ships
 *    only with the booking sheet, which is itself code-split.
 *  - The transition runs on the compositor, so a page with 42 of these does not
 *    hand the main thread 42 animation loops.
 *
 * The reference polls with a 30ms scroll handler and a 180ms setInterval that
 * never stops. This does neither, and disconnects as soon as it has fired.
 *
 * Reduced motion is handled in CSS (see app/globals.css), which collapses the
 * transition to 1ms — the element still starts hidden and ends visible, so
 * nothing is ever stranded at opacity 0.
 */

type RevealProps = {
  children: ReactNode;
  /** Stagger in ms. Constrained to the values present in the motion inventory. */
  delay?: RevealDelay;
  /** Two Destinations elements reveal over 900ms rather than 1000ms. */
  fast?: boolean;
  as?: ElementType;
  className?: string;
};

export function Reveal({ children, delay = 0, fast = false, as, className }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (or a very old browser): show immediately rather
    // than leaving content invisible.
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      // -6% bottom margin reproduces the reference's `top < viewport * 0.94`.
      { rootMargin: '0px 0px -6% 0px', threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-revealed={shown || undefined}
      className={cn(
        'motion-safe:translate-y-[var(--reveal-y)] motion-safe:opacity-0',
        'transition-[opacity,transform] ease-[var(--ease-reveal)]',
        fast ? 'duration-[var(--dur-reveal-fast)]' : 'duration-[var(--dur-reveal)]',
        shown && 'motion-safe:translate-y-0 motion-safe:opacity-100',
        className
      )}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
