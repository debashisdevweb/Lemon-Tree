import Link from 'next/link';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { BRANDS } from '@/lib/content/home';

/**
 * Our brands — asymmetric 0.9fr / 1.1fr split: headline left, prose and the
 * six brand tiles right. Tiles use the same 1px-gap rule trick as the rewards
 * benefits, over a forest-tinted background.
 */
export function Brands() {
  return (
    <section
      id="brands"
      aria-labelledby="brands-heading"
      className="bg-paper py-section-y relative z-20 px-[clamp(20.4px,3.4vw,54.4px)]"
    >
      <div className="max-w-shell mx-auto grid items-start gap-[clamp(20.4px,3.4vw,68px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Reveal>
          <Eyebrow tone="sage">{BRANDS.eyebrow}</Eyebrow>
          <h2
            id="brands-heading"
            className="mt-gap-tight font-display text-h2 text-forest leading-[1.04] font-normal tracking-[-0.018em]"
          >
            {BRANDS.headline}
          </h2>
        </Reveal>

        <div>
          {BRANDS.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 24)} delay={index === 0 ? 110 : 180}>
              <p
                className={`text-prose-lg text-ink max-w-[52ch] leading-[1.66] ${
                  index === 0 ? '' : 'mt-gap-tight'
                }`}
              >
                {paragraph}
              </p>
            </Reveal>
          ))}

          <Reveal delay={260}>
            <ul className="mt-gap-grid bg-forest/18 grid list-none grid-cols-1 gap-px p-0 sm:grid-cols-2 xl:grid-cols-3">
              {BRANDS.tiles.map((tile) => (
                <li key={tile.name} className="bg-paper px-tile-pad-x py-tile-pad-y">
                  <span className="font-display text-h4 text-forest block leading-[1.1]">
                    {tile.name}
                  </span>
                  <span className="text-meta text-muted mt-[--spacing(1)] block">{tile.tier}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={340}>
            <p className="mt-gap-grid">
              <Link
                href="/contact"
                className="text-body hover:text-accent-text font-bold underline underline-offset-[0.2em] transition-colors duration-[var(--dur-hover-swap)]"
              >
                {BRANDS.moreCta}
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
