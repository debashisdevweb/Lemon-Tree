import { CoverImage } from '@/components/primitives/CoverImage';
import { HERO } from '@/lib/content/home';

/**
 * Hero — first card of the sticky stack.
 *
 * The reference pins this and the next two sections at 100vh with ascending
 * z-index, so later sections slide over them. That is kept from md upward and
 * dropped below it: on a phone, four full-height scroll-holds is a lot of
 * scrolling for no payoff, and 100vh fights mobile browser chrome. Below md the
 * hero is 100svh in normal flow.
 *
 * The load sequence is CSS-only (see app/globals.css) so no JavaScript sits in
 * front of the LCP element. The headline is the LCP text; the photograph is
 * `priority` and is the only preloaded image on the page.
 */
export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="bg-hero-ground md:min-h-stack-min relative z-1 min-h-[100svh] overflow-hidden md:sticky md:top-0 md:h-screen"
    >
      <div className="anim-hero-zoom absolute inset-0">
        <CoverImage image={HERO.image} priority sizes="100vw" />
      </div>

      {/* Scrim: exact three-stop gradient from the artboard. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--brand-scrim)/0.56),rgb(var(--brand-scrim)/0.18)_40%,rgb(var(--brand-scrim)/0.7))]"
      />

      <div className="on-dark pt-hero-pt pb-hero-pb relative flex h-full min-h-[100svh] flex-col justify-center px-[clamp(20.4px,3.4vw,54.4px)] md:min-h-0">
        <div className="max-w-shell mx-auto w-full">
          <p className="anim-hero-eyebrow text-eyebrow-xs text-cream/90 font-bold tracking-[0.2em] uppercase">
            {HERO.eyebrow}
          </p>

          {/*
            The headline is one sentence split across two typefaces, and the
            script half shares a row with the bullet list — so the two halves
            cannot be nested in one element without losing that layout. The h1
            carries the whole sentence as its accessible name and the script is
            hidden from assistive tech, so it is announced once and completely
            rather than as the fragment the reference would produce.
          */}
          <h1
            id="hero-heading"
            aria-label={`${HERO.headline} ${HERO.script}`}
            className="anim-hero-h1 mt-gap-tight font-display text-h1 text-cream leading-[0.98] font-normal tracking-[-0.022em]"
          >
            {HERO.headline}
          </h1>

          <div className="gap-y-gap-grid flex flex-wrap items-end justify-between gap-x-[clamp(16.3px,3.4vw,68px)]">
            <p
              aria-hidden="true"
              data-testid="hero-script"
              className="anim-hero-script font-script text-hero-script text-cream m-0 leading-none"
            >
              {HERO.script}
            </p>
            <ul className="anim-hero-list text-hero-list text-cream mb-[clamp(4.1px,0.68vw,10.9px)] flex list-none flex-col gap-[--spacing(2.5)] p-0 font-medium">
              {HERO.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="anim-hero-cta gap-gap-grid mt-[clamp(23.8px,2.89vw,47.6px)] flex flex-wrap items-center">
            <a
              href={HERO.promo.href}
              className="group bg-paper/94 px-hero-pill-x py-hero-pill-y text-body-sm text-forest hover:bg-paper hover:text-accent-text inline-flex flex-wrap items-center gap-[clamp(8.5px,0.935vw,15.3px)] rounded-full transition-colors duration-[var(--dur-hover-bg)]"
            >
              <span className="text-eyebrow-xs text-accent-text font-bold tracking-[0.1em] uppercase">
                {HERO.promo.tag}
              </span>
              {HERO.promo.label}
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="anim-scroll-cue text-eyebrow-xs text-cream/75 absolute bottom-[clamp(89.2px,8.925vh,123.2px)] left-[clamp(20.4px,3.4vw,54.4px)] hidden items-center gap-[--spacing(3)] font-bold tracking-[0.2em] uppercase md:flex"
      >
        {HERO.scrollCue}
        <span className="w-scroll-rule bg-cream/50 block h-px" />
      </p>
    </section>
  );
}
