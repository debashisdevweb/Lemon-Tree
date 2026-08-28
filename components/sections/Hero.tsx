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

      <div className="on-dark pt-hero-top pb-hero-bottom px-gutter relative flex h-full min-h-[100svh] flex-col justify-center md:min-h-0">
        <div className="max-w-shell mx-auto w-full">
          <p className="anim-hero-eyebrow text-eyebrow-xs text-on-photo font-bold tracking-[0.2em] uppercase">
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
            className="anim-hero-h1 mt-gap-eyebrow font-display text-h1 text-on-photo leading-[0.98] font-medium tracking-[-0.022em]"
          >
            {HERO.headline}
          </h1>

          {/*
            Rhythm, in scale steps rather than one-off values:
              eyebrow -> headline   gap-eyebrow  (10 -> 16)
              headline -> script    4xs          (4 -> 8)   one sentence, so tight
              script -> list        md           (24 -> 40)  different content
              list -> promo pill    lg           (30 -> 56)  new idea
            The headline and script are two halves of one sentence, so they sit
            almost flush; everything after is a real separation. Previously all
            four gaps came from unrelated clamps and the sequence read as
            arbitrary on a phone.
          */}
          <div className="mt-4xs gap-y-md gap-x-columns flex flex-wrap items-start justify-between lg:items-end">
            <p
              aria-hidden="true"
              data-testid="hero-script"
              className="anim-hero-script font-script text-hero-script text-on-photo m-0 leading-none"
            >
              {HERO.script}
            </p>
            {/* Right-aligned and right-hugging below the script on a phone,
                which is how the reference stacks these two; from lg they sit
                side by side and the alignment no longer matters. */}
            <ul className="anim-hero-list text-hero-list text-on-photo mb-4xs gap-3xs ml-auto flex list-none flex-col p-0 text-right font-normal lg:ml-0 lg:text-left">
              {HERO.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="anim-hero-cta gap-cards mt-lg flex flex-wrap items-center">
            <a
              href={HERO.promo.href}
              className="group bg-paper/94 px-hero-pill-x py-hero-pill-y text-hero-badge text-forest hover:bg-paper hover:text-accent-text gap-3xs sm:gap-items inline-flex max-w-full items-center rounded-full transition-colors duration-[var(--dur-hover-bg)]"
            >
              <span className="text-hero-badge-tag text-accent-text shrink-0 font-bold tracking-[0.1em] uppercase">
                {HERO.promo.tag}
              </span>
              {/* One line from 360px up. Wrapping is still allowed below that,
                  where 41 characters cannot fit at any readable size — a wrapped
                  badge beats a clipped or 10px one. */}
              <span className="min-w-0 [@media(min-width:360px)]:whitespace-nowrap">
                {HERO.promo.label}
              </span>
              <span aria-hidden="true" className="shrink-0">
                &rarr;
              </span>
            </a>
          </div>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="anim-scroll-cue text-eyebrow-xs text-on-photo/80 left-gutter gap-inline absolute bottom-[clamp(89.2px,8.925vh,123.2px)] hidden items-center font-bold tracking-[0.2em] uppercase md:flex"
      >
        {HERO.scrollCue}
        <span className="w-scroll-rule bg-on-photo/60 block h-px" />
      </p>
    </section>
  );
}
