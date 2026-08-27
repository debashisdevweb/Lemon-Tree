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
        'h-nav gap-gap-grid fixed inset-x-0 top-0 z-60 flex items-center px-[clamp(20px,3.2vw,54px)]',
        'transition-[background-color,color,box-shadow] duration-[var(--dur-nav)] ease-in-out',
        isSolid ? 'bg-cream text-forest shadow-nav' : 'on-dark text-cream bg-transparent',
      )}
    >
      <Link href="/#top" className="shrink-0 text-inherit" aria-label="Lemon Tree Hotels, home">
        <Wordmark />
      </Link>

      <nav
        aria-label="Sections"
        className="text-nav hidden flex-auto justify-center gap-[clamp(14px,1.9vw,30px)] font-bold xl:flex"
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

      <div className="text-nav ml-auto flex shrink-0 items-center gap-[clamp(12px,1.6vw,26px)] font-bold">
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

        <Button slot="nav" onClick={() => open({ tab: 'online-booking' })}>
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
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </g>
            </svg>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[340] bg-[rgb(var(--brand-sheet-scrim)/0.52)] data-[state=open]:animate-[lt-fade_var(--dur-fade)_ease_both]" />
            <Dialog.Content
              className={cn(
                'gap-gap-grid fixed inset-y-0 right-0 z-[350] flex w-[min(360px,86vw)] flex-col',
                'bg-cream overflow-y-auto p-[clamp(20px,3.2vw,40px)]',
                'data-[state=open]:animate-[lt-fade_var(--dur-fade)_ease_both]',
              )}
            >
              <Dialog.Title className="font-display text-h4 text-forest font-normal">
                Menu
              </Dialog.Title>
              <nav aria-label="Sections" className="gap-gap-tight flex flex-col">
                {PRIMARY_NAV.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-closing-link text-forest hover:text-accent-text font-bold transition-colors duration-[var(--dur-hover-swap)]"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="gap-gap-tight mt-auto flex flex-col">
                <ButtonLink href="/contact" slot="section" variant="outline">
                  Sign in
                </ButtonLink>
                <Dialog.Close asChild>
                  <Button slot="section" variant="outline">
                    Close
                  </Button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
