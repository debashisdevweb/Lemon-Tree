'use client';

import type { ReactNode } from 'react';
import { Reveal } from '@/components/primitives/Reveal';
import { Button } from '@/components/primitives/Button';
import { SectionHeader } from '@/components/composites/SectionHeader';
import { useBooking } from '@/components/booking/BookingProvider';
import { PRESENCE } from '@/lib/content/home';

/**
 * Our presence — headline, the India map, then a 4-up stat row whose figures
 * sit under hairline rules.
 *
 * The map arrives as a server-rendered child so this client component carries
 * no map code; see components/map/IndiaMap.tsx.
 */
export function Presence({ map }: { map: ReactNode }) {
  const { open } = useBooking();

  return (
    <section
      id="presence"
      aria-labelledby="presence-heading"
      className="bg-cream py-section px-gutter relative z-20"
    >
      <div className="max-w-shell mx-auto">
        <SectionHeader
          eyebrow={PRESENCE.eyebrow}
          headline={PRESENCE.headline}
          headingId="presence-heading"
          standfirst={PRESENCE.standfirst}
          action={
            <Button slot="section" variant="outline" onClick={() => open()}>
              {PRESENCE.cta}
            </Button>
          }
        />

        <Reveal delay={120} className="mt-gap-heading">
          <div className="bg-map-ground overflow-hidden md:aspect-[1.72/1] md:min-h-[clamp(361.2px,36.125vw,637.5px)]">
            {map}
          </div>
        </Reveal>

        <Reveal delay={200} className="mt-gap-heading">
          <dl className="gap-cards grid grid-cols-2 xl:grid-cols-4">
            {PRESENCE.stats.map((stat) => (
              <div
                key={stat.figure}
                className="border-forest/28 pt-gap-tight border-t-[length:var(--border-hair)] border-solid"
              >
                <dt className="font-display text-stat text-forest leading-none">{stat.figure}</dt>
                <dd className="text-meta text-muted mt-label">{stat.caption}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
