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
        className="bg-cream pt-section pb-hero-bottom md:min-h-stack-min-lg px-gutter relative z-2 flex flex-col overflow-hidden md:sticky md:top-0 md:h-screen"
      >
        <div className="max-w-shell mx-auto flex min-h-0 w-full flex-auto flex-col">
          <SectionHeader
            fast
            eyebrow={DESTINATIONS.eyebrow}
            headline={DESTINATIONS.headline}
            standfirst={DESTINATIONS.standfirst}
            headingId="destinations-heading"
          />

          {/*
            The cards hold a card proportion rather than absorbing whatever the
            100vh section leaves over. Stretching them swung the aspect ratio
            from 0.57 at a 900px-tall window to 0.36 at 1200px — narrow columns
            rather than cards — and it wrecked the photographs too, because a
            cover crop into a very tall box is height-driven and the 700x499
            sources were being upscaled about 3x.

            2/3 is the proportion, `max-h-full` keeps them inside a short
            viewport, and the row centres in the leftover space so the sticky
            section still reads as a full screen.
          */}
          <div className="mt-gap-heading flex min-h-0 flex-auto items-center">
            <div className="gap-cards grid w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              {DESTINATIONS.cards.map((card, index) => (
                <Reveal key={card.slug} delay={CARD_DELAYS[index] ?? 0}>
                  <Link
                    href={`/book/search?theme=${card.slug}`}
                    className="group relative flex aspect-2/3 max-h-full flex-col justify-end overflow-hidden"
                  >
                    <CoverImage
                      image={card.image}
                      zoom
                      boxAspect={2 / 3}
                      sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--brand-card-scrim)/0.06),rgb(var(--brand-card-scrim)/0.76))]"
                    />
                    <span className="p-pad-card-sm relative flex flex-col">
                      <span className="font-display text-h3 text-cream leading-[1.1] font-medium">
                        {card.titleLines[0]}
                        <br />
                        {card.titleLines[1]}
                      </span>
                      <span className="mt-gap-eyebrow text-meta text-cream/80 font-bold tracking-[0.1em] uppercase">
                        {DESTINATIONS.cta} <span aria-hidden="true">&rarr;</span>
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
