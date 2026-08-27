import Link from 'next/link';
import { CoverImage } from '@/components/primitives/CoverImage';
import { Reveal } from '@/components/primitives/Reveal';
import { SectionHeader } from '@/components/composites/SectionHeader';
import { EVENTS } from '@/lib/content/home';
import type { RevealDelay } from '@/lib/tokens/motion';

const CARD_DELAYS: readonly RevealDelay[] = [0, 110, 220];

/**
 * Events & conferences — three tall photo cards with the copy sitting in the
 * dark end of a vertical scrim.
 *
 * "Send a brief" routes to /contact, which is where an enquiry actually goes;
 * the reference points it at its own section.
 */
export function Events() {
  return (
    <section
      id="events"
      aria-labelledby="events-heading"
      className="bg-paper py-section px-gutter relative z-20"
    >
      <div className="max-w-shell mx-auto">
        <SectionHeader
          eyebrow={EVENTS.eyebrow}
          headline={EVENTS.headline}
          headingId="events-heading"
          standfirst={EVENTS.standfirst}
        />

        <div className="mt-gap-heading gap-cards grid grid-cols-1 md:grid-cols-3">
          {EVENTS.cards.map((card, index) => (
            <Reveal key={card.slug} delay={CARD_DELAYS[index] ?? 0} as="article">
              <div className="min-h-event-min relative flex h-full overflow-hidden">
                <CoverImage
                  image={card.image}
                  sizes="(max-width:768px) 100vw, 33vw"
                  boxAspect={1.4}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--brand-card-scrim)/0.1),rgb(var(--brand-card-scrim)/0.8))]"
                />
                <div className="on-dark p-pad-card relative flex w-full flex-col justify-end">
                  <h3 className="font-display text-h3-lg text-cream leading-[1.08] font-medium">
                    {card.title}
                  </h3>
                  <p className="mt-gap-eyebrow text-body-sm text-cream/86 max-w-[30ch] leading-[1.55]">
                    {card.body}
                  </p>
                  <div className="mt-gap-heading">
                    <Link
                      href={`/contact?enquiry=${card.slug}`}
                      className="text-meta text-cream hover:text-accent-text font-bold tracking-[0.1em] uppercase transition-colors duration-[var(--dur-hover-swap)]"
                    >
                      {EVENTS.cta} <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
