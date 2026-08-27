'use client';

import Link from 'next/link';
import { CoverImage } from '@/components/primitives/CoverImage';
import { Reveal } from '@/components/primitives/Reveal';
import { Button, ButtonLink } from '@/components/primitives/Button';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { SectionHeader } from '@/components/composites/SectionHeader';
import { useBooking } from '@/components/booking/BookingProvider';
import { NEW_HOTELS, UPCOMING } from '@/lib/content/home';
import type { RevealDelay } from '@/lib/tokens/motion';

const CARD_DELAYS: readonly RevealDelay[] = [0, 90, 180, 270];

/**
 * New additions and Upcoming hotels — one section in the reference, two
 * headline blocks and two 4-up grids.
 *
 * The open hotels are bookable, so their primary action opens the sheet with
 * that city pre-filled in intent. The upcoming ones are not: they are 3/4
 * portrait cards with text over a scrim and no booking action, which is the
 * reference's way of showing they cannot be reserved yet.
 */
export function Hotels() {
  const { open } = useBooking();

  return (
    <section
      id="hotels"
      aria-labelledby="hotels-heading"
      className="bg-cream py-section-y relative z-20 px-[clamp(24px,4vw,64px)]"
    >
      <div className="max-w-shell mx-auto">
        <Reveal>
          <Eyebrow tone="sage">{NEW_HOTELS.eyebrow}</Eyebrow>
          <h2
            id="hotels-heading"
            className="mt-gap-tight font-display text-h2 text-forest leading-[1.04] font-normal tracking-[-0.018em]"
          >
            {NEW_HOTELS.headline}
          </h2>
        </Reveal>

        <div className="mt-gap-grid gap-gap-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {NEW_HOTELS.cards.map((card, index) => (
            <Reveal key={`${card.brand}-${card.city}`} delay={CARD_DELAYS[index] ?? 0} as="article">
              <div className="bg-paper flex h-full flex-col">
                <div className="relative aspect-4/3 overflow-hidden">
                  <CoverImage
                    image={card.image}
                    sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                  />
                </div>
                <div className="p-card-pad-sm flex flex-auto flex-col">
                  <Eyebrow tone="sage" track="tight">
                    {card.brand}
                  </Eyebrow>
                  <h3 className="font-display text-h4 text-forest mt-[--spacing(2)] leading-[1.12] font-medium">
                    {card.city}
                  </h3>
                  <div className="pt-gap-grid mt-auto flex flex-wrap gap-[--spacing(2.5)]">
                    <Button
                      slot="card"
                      onClick={() => open({ tab: 'online-booking' })}
                      aria-label={`Book now at ${card.brand} ${card.city}`}
                    >
                      {NEW_HOTELS.bookCta}
                    </Button>
                    <ButtonLink
                      slot="card"
                      variant="outline"
                      href={`/book/search?destination=${card.citySlug}`}
                      aria-label={`Know more about ${card.brand} ${card.city}`}
                    >
                      {NEW_HOTELS.moreCta}
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <SectionHeader
          className="mt-[clamp(56px,7vw,120px)]"
          eyebrow={UPCOMING.eyebrow}
          headline={UPCOMING.headline}
          headingId="upcoming-heading"
          standfirst={UPCOMING.standfirst}
        />

        <div className="mt-gap-grid gap-gap-grid grid grid-cols-2 xl:grid-cols-4">
          {UPCOMING.cards.map((card, index) => (
            <Reveal key={`${card.brand}-${card.city}-${index}`} delay={CARD_DELAYS[index] ?? 0}>
              <Link
                href={`/book/search?destination=${card.citySlug}`}
                className="group relative block aspect-3/4 overflow-hidden"
                aria-label={`${card.brand} ${card.city}, opening soon`}
              >
                <CoverImage image={card.image} zoom sizes="(max-width:1280px) 50vw, 25vw" />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--brand-card-scrim)/0.08),rgb(var(--brand-card-scrim)/0.82))]"
                />
                <span className="p-card-pad-sm relative flex h-full flex-col justify-end">
                  <span className="text-eyebrow-sm text-cream/80 font-bold tracking-[0.12em] uppercase">
                    {card.brand}
                  </span>
                  <span className="font-display text-h3-sm text-cream mt-[--spacing(2)] leading-[1.1] font-medium">
                    {card.city}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
