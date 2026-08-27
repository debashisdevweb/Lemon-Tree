import Link from 'next/link';
import { CoverImage } from '@/components/primitives/CoverImage';
import { Reveal } from '@/components/primitives/Reveal';
import { SectionHeader } from '@/components/composites/SectionHeader';
import { DESTINATIONS } from '@/lib/content/home';
import type { RevealDelay } from '@/lib/tokens/motion';

/** Reveal stagger for the four cards, from the artboard's data-delay values. */
const CARD_DELAYS: readonly RevealDelay[] = [0, 90, 180, 270];

/**
 * Destinations — second card of the sticky stack, and the nav trigger.
 *
 * The reference points these cards at `#destinations`, the section they are
 * already inside. Each now goes to the real search route filtered by trip
 * theme, which is what "Explore" promises.
 *
 * Grid steps 4 -> 2 -> 1; the reference holds four columns even at 320px.
 */
export function Destinations() {
  return (
    <>
      {/* Sentinel the header observes to flip from transparent to solid. */}
      <div id="nav-trigger" aria-hidden="true" className="h-px" />

      <section
        id="destinations"
        aria-labelledby="destinations-heading"
        className="bg-cream pt-stack-pt pb-stack-pb md:min-h-stack-min-lg relative z-2 flex flex-col overflow-hidden px-[clamp(24px,4vw,64px)] md:sticky md:top-0 md:h-screen"
      >
        <div className="max-w-shell mx-auto flex min-h-0 w-full flex-auto flex-col">
          <SectionHeader
            fast
            eyebrow={DESTINATIONS.eyebrow}
            headline={DESTINATIONS.headline}
            standfirst={DESTINATIONS.standfirst}
            headingId="destinations-heading"
          />

          <div className="mt-gap-grid gap-gap-cards grid min-h-0 flex-auto grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {DESTINATIONS.cards.map((card, index) => (
              <Reveal
                key={card.slug}
                delay={CARD_DELAYS[index] ?? 0}
                className="min-h-[220px] md:min-h-0"
              >
                <Link
                  href={`/book/search?theme=${card.slug}`}
                  className="group relative flex h-full min-h-[220px] flex-col justify-end overflow-hidden md:min-h-0"
                >
                  <CoverImage
                    image={card.image}
                    zoom
                    sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--brand-card-scrim)/0.06),rgb(var(--brand-card-scrim)/0.76))]"
                  />
                  <span className="p-card-pad-sm relative flex flex-col">
                    <span className="font-display text-h3 text-cream leading-[1.1] font-medium">
                      {card.titleLines[0]}
                      <br />
                      {card.titleLines[1]}
                    </span>
                    <span className="mt-gap-tight text-meta text-cream/80 font-bold tracking-[0.1em] uppercase">
                      {DESTINATIONS.cta} <span aria-hidden="true">&rarr;</span>
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
