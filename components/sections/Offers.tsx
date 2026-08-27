'use client';

import Link from 'next/link';
import { CoverImage } from '@/components/primitives/CoverImage';
import { Reveal } from '@/components/primitives/Reveal';
import { ButtonLink } from '@/components/primitives/Button';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { SectionHeader } from '@/components/composites/SectionHeader';
import { useBooking } from '@/components/booking/BookingProvider';
import { OFFERS } from '@/lib/content/home';
import type { RevealDelay } from '@/lib/tokens/motion';

const CARD_DELAYS: readonly RevealDelay[] = [0, 90, 180, 270];

/**
 * Offers — the first section that scrolls normally over the sticky stack, hence
 * z-20 in the reference and here.
 *
 * Three photo cards on paper plus one forest card carrying the "2x" figure.
 * The member card has no image in the reference, which is what makes the row
 * read as three plus one rather than four of a kind.
 */
export function Offers() {
  const { open } = useBooking();

  return (
    <section
      id="offers"
      aria-labelledby="offers-heading"
      className="bg-cream py-section-y relative z-20 px-[clamp(20.4px,3.4vw,54.4px)]"
    >
      <div className="max-w-shell mx-auto">
        <SectionHeader
          eyebrow={OFFERS.eyebrow}
          headline={OFFERS.headline}
          headingId="offers-heading"
          action={
            <ButtonLink href="/book/search?tab=special-offers" slot="section" variant="outline">
              {OFFERS.allCta}
            </ButtonLink>
          }
        />

        <div className="mt-gap-grid gap-gap-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {OFFERS.cards.map((card, index) => {
            const isMember = card.image === null;

            return (
              <Reveal key={card.kind} delay={CARD_DELAYS[index] ?? 0} as="article">
                <div
                  className={`flex h-full flex-col ${isMember ? 'on-dark bg-forest' : 'bg-paper'}`}
                >
                  {card.image && (
                    <div className="relative aspect-4/3 overflow-hidden">
                      <CoverImage
                        image={card.image}
                        sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                        boxAspect={4 / 3}
                      />
                    </div>
                  )}

                  <div className="p-card-pad flex flex-auto flex-col">
                    {/* The member card sits on forest, where the artboard's
                        sage is 2.65:1 — this keeps the sage hue at 4.55:1. */}
                    <Eyebrow tone={isMember ? 'sageOnDark' : 'accent'}>{card.eyebrow}</Eyebrow>

                    <h3
                      className={`mt-gap-tight font-display text-h3-offer leading-[1.1] font-medium ${
                        isMember ? 'text-cream' : 'text-forest'
                      }`}
                    >
                      {card.title}
                    </h3>

                    <p
                      className={`mt-gap-tight text-body-sm leading-[1.6] ${
                        isMember ? 'text-cream/82' : 'text-ink'
                      }`}
                    >
                      {card.body}
                    </p>

                    <div className="gap-gap-tight pt-gap-grid mt-auto flex flex-col">
                      {card.figure && (
                        <span className="font-display text-figure text-cream leading-none">
                          {card.figure}
                        </span>
                      )}

                      {card.action.intent === 'day-use' ? (
                        <button
                          type="button"
                          onClick={() => open({ tab: 'online-booking', stay: 'day-use' })}
                          className="text-body-sm text-forest hover:text-accent-text cursor-pointer self-start border-0 bg-transparent p-0 font-bold underline underline-offset-[0.2em] transition-colors duration-[var(--dur-hover-swap)]"
                        >
                          {card.action.label}
                        </button>
                      ) : (
                        <Link
                          href={
                            card.action.intent === 'rewards'
                              ? '#rewards'
                              : '/book/search?tab=special-offers'
                          }
                          className={`text-body-sm hover:text-accent-text self-start font-bold underline underline-offset-[0.2em] transition-colors duration-[var(--dur-hover-swap)] ${
                            isMember ? 'text-cream' : 'text-forest'
                          }`}
                        >
                          {card.action.label}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
