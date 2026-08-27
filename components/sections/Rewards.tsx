'use client';

import { CoverImage } from '@/components/primitives/CoverImage';
import { Reveal } from '@/components/primitives/Reveal';
import { Button, ButtonLink } from '@/components/primitives/Button';
import { useBooking } from '@/components/booking/BookingProvider';
import { REWARDS } from '@/lib/content/home';

/**
 * Infinity Rewards — third and last card of the sticky stack.
 *
 * Split 1.05fr / 1fr on the reference: copy on forest, photograph on the right
 * under a horizontal scrim. Stacks below lg, where a two-up at 100vh leaves the
 * copy column too narrow to read.
 *
 * The benefit tiles are a 3x2 grid whose 1px gaps show the cream background
 * through — the reference draws its rules with `gap` and a parent background
 * rather than with borders, and that is kept.
 */
export function Rewards() {
  const { open } = useBooking();

  return (
    <section
      id="rewards"
      aria-labelledby="rewards-heading"
      className="on-dark bg-forest md:min-h-stack-min-lg relative z-3 grid overflow-hidden md:sticky md:top-0 md:h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
    >
      <div className="pt-stack-pt pb-stack-pb flex flex-col justify-center px-[clamp(24px,4vw,64px)] lg:pr-[clamp(24px,3vw,56px)]">
        <Reveal fast className="gap-gap-tight flex items-baseline">
          <span className="font-display text-infinity text-cream leading-none font-normal italic">
            {REWARDS.logoWord}
          </span>
          <span className="text-eyebrow-xs text-cream/80 font-bold tracking-[0.16em] uppercase">
            {REWARDS.logoSuffix}
          </span>
        </Reveal>

        <Reveal delay={110}>
          <h2
            id="rewards-heading"
            className="mt-gap-grid font-display text-h2-rewards text-cream leading-[1.06] font-normal tracking-[-0.015em]"
          >
            {REWARDS.headlineLines[0]}
            <br />
            {REWARDS.headlineLines[1]}
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-gap-grid text-body text-cream/82 max-w-[38ch] leading-[1.62]">
            {REWARDS.body}
          </p>
        </Reveal>

        <Reveal delay={280}>
          <ul className="mt-gap-grid bg-cream/20 grid list-none grid-cols-1 gap-px p-0 sm:grid-cols-2 xl:grid-cols-3">
            {REWARDS.benefits.map((benefit) => (
              <li
                key={benefit}
                className="bg-forest px-tile-pad-x py-tile-pad-y font-display text-h4 text-cream leading-[1.1]"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={360}>
          <div className="mt-gap-grid gap-gap-tight flex flex-wrap items-center">
            <Button slot="prominent" onClick={() => open({ tab: 'special-offers' })}>
              {REWARDS.joinCta}
            </Button>
            <ButtonLink href="/contact" slot="prominent" variant="onDark">
              {REWARDS.signInCta}
            </ButtonLink>
            <p className="text-meta text-cream/80">{REWARDS.disclaimer}</p>
          </div>
        </Reveal>
      </div>

      <div className="relative min-h-[280px] overflow-hidden lg:min-h-0">
        <CoverImage image={REWARDS.image} sizes="(max-width:1024px) 100vw, 50vw" />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-forest)_72%,transparent),color-mix(in_srgb,var(--color-forest)_6%,transparent)_42%,color-mix(in_srgb,var(--color-forest)_18%,transparent))]"
        />
      </div>
    </section>
  );
}
