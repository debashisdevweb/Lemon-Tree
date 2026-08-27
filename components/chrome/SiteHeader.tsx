'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button, ButtonLink } from '@/components/primitives/Button';
import { useBooking } from '@/components/booking/BookingProvider';
import { PRIMARY_NAV } from '@/lib/content/site';
import { Wordmark } from './Wordmark';

/**
 * Fixed header, transparent over the hero and solid cream once the Destinations
 * section reaches it.
 *
 * The reference computes that with a scroll handler that reads
 * getBoundingClientRect() every 30ms plus a 180ms interval. Here it is one
 * IntersectionObserver on a sentinel, with rootMargin set from the header's own
 * measured height — same trigger point (navHeight x 0.9), no per-frame layout
 * reads, no polling.
 *
 * The seven nav links stop fitting below roughly 1080px, and the reference has
 * no mobile navigation at all, so the link row collapses into a sheet. That
 * sheet is net-new and built from the same tokens.
 */
export function SiteHeader() {
  const { open } = useBooking();
  const headerRef = useRef<HTMLElement>(null);
  const [isSolid, setIsSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById('nav-trigger');
    const header = headerRef.current;
    if (!sentinel || !header) return;

    let observer: IntersectionObserver | null = null;

    const attach = () => {
      observer?.disconnect();
      const offset = Math.round((header.offsetHeight || 76) * 0.9);
      observer = new IntersectionObserver(
        ([entry]) => setIsSolid(!(entry?.isIntersecting ?? true)),
        { rootMargin: `-${offset}px 0px 0px 0px`, threshold: 0 },
      );
      observer.observe(sentinel);
    };

    attach();
    const onResize = () => attach();
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      data-solid={isSolid || undefined}
      className={cn(
        'h-nav gap-cards px-md fixed inset-x-0 top-0 z-60 flex items-center',
        'transition-[background-color,color,box-shadow] duration-[var(--dur-nav)] ease-in-out',
        isSolid ? 'bg-cream text-forest shadow-nav' : 'on-dark text-cream bg-transparent',
      )}
    >
      <Link href="/#top" className="shrink-0 text-inherit" aria-label="Lemon Tree Hotels, home">
        <Wordmark />
      </Link>

      <nav
        aria-label="Sections"
        className="text-nav gap-sm hidden flex-auto justify-center font-bold xl:flex"
      >
        {PRIMARY_NAV.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hover:text-accent-text text-inherit transition-colors duration-[var(--dur-hover-swap)]"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="text-nav gap-xs ml-auto flex shrink-0 items-center font-bold">
        <Link
          href="/contact"
          className="hover:text-accent-text hidden text-inherit transition-colors duration-[var(--dur-hover-swap)] lg:inline"
        >
          Investors
        </Link>

        <ButtonLink
          href="/contact"
          slot="navline"
          variant={isSolid ? 'outline' : 'onDark'}
          className="hidden sm:inline-flex"
        >
          Sign in
        </ButtonLink>

        {/*
          Hidden below sm. The reference's mobile header is just the wordmark
          and the menu button, and on a phone this competed with both the
          floating bar's "Check availability" and the menu's own "Book now" —
          three routes to the same sheet, in one screenful.
        */}
        <Button
          slot="nav"
          className="hidden sm:inline-flex"
          onClick={() => open({ tab: 'online-booking' })}
        >
          Book now
        </Button>

        {/* Menu button replaces the link row below xl. */}
        <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Dialog.Trigger
            aria-label="Open menu"
            className={cn(
              'inline-flex size-11 cursor-pointer items-center justify-center rounded-sm',
              'border-[length:var(--border-hair)] border-solid border-current bg-transparent',
              'text-inherit transition-colors duration-[var(--dur-hover-swap)] xl:hidden',
            )}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
              {/*
                Two rules, as the reference draws it. At 6 units apart in a 24
                viewBox they merged into a single thick line once scaled to
                17px; 9 apart reads as two at every size.
              */}
              <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="3.5" y1="7.5" x2="20.5" y2="7.5" />
                <line x1="3.5" y1="16.5" x2="20.5" y2="16.5" />
              </g>
            </svg>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay
              className={cn(
                'fixed inset-0 z-[340] bg-[rgb(var(--brand-sheet-scrim)/0.52)] backdrop-blur-[3px]',
                'data-[state=open]:animate-[lt-fade_var(--dur-fade)_ease_both]',
              )}
            />
            {/*
              An inset card rather than a full-height drawer: it matches the
              reference's mobile menu, keeps the page visible behind it so the
              overlay reads as temporary, and puts every link within thumb
              reach of the top of the screen instead of spreading them over
              the full height.
            */}
            <Dialog.Content
              aria-describedby={undefined}
              className={cn(
                'fixed top-[--spacing(3)] right-[--spacing(3)] left-[--spacing(3)] z-[350]',
                'max-h-[calc(100svh-var(--spacing)*6)] overflow-y-auto',
                'bg-cream shadow-bar p-pad-card rounded-lg',
                'data-[state=open]:animate-[lt-menu_var(--dur-fade)_var(--ease-rise)_both]',
                'sm:right-auto sm:w-[min(360px,calc(100vw-var(--spacing)*6))]',
              )}
            >
              <div className="gap-cards flex items-start justify-between">
                <Dialog.Title asChild>
                  <p className="text-forest">
                    <Wordmark />
                  </p>
                </Dialog.Title>
                <Dialog.Close
                  aria-label="Close menu"
                  className={cn(
                    'text-forest -mt-label -mr-[--spacing(1)] inline-flex size-11 shrink-0',
                    'cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent',
                    'hover:text-accent-text transition-colors duration-[var(--dur-hover-swap)]',
                  )}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
                    <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <line x1="5" y1="5" x2="19" y2="19" />
                      <line x1="19" y1="5" x2="5" y2="19" />
                    </g>
                  </svg>
                </Dialog.Close>
              </div>

              <nav aria-label="Sections" className="mt-gap-heading gap-items flex flex-col">
                {PRIMARY_NAV.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-h4 text-forest hover:text-accent-text font-bold transition-colors duration-[var(--dur-hover-swap)]"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <hr className="border-forest/18 mt-gap-heading border-0 border-t-[length:var(--border-hair)] border-solid" />

              {/* Investors and Sign in are hidden in the header at this width,
                  so without this they would be unreachable on a phone. */}
              <div className="gap-items mt-xs flex flex-col">
                <Link
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="text-link text-forest hover:text-accent-text font-bold transition-colors duration-[var(--dur-hover-swap)]"
                >
                  Investors
                </Link>
                <ButtonLink
                  href="/contact"
                  slot="section"
                  variant="outline"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </ButtonLink>
                <Button
                  slot="section"
                  onClick={() => {
                    setMenuOpen(false);
                    open({ tab: 'online-booking' });
                  }}
                >
                  Book now
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
