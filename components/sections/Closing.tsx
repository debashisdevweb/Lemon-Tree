'use client';

import { Reveal } from '@/components/primitives/Reveal';
import { useBooking } from '@/components/booking/BookingProvider';
import { CLOSING } from '@/lib/content/home';

/**
 * Closing statement — the design's one mixed-family headline: Jakarta 800 for
 * "Come stay", Playfair for "with us,", Sacramento for the line beneath.
 *
 * All three parts belong to one sentence, so all three sit inside the h2 and
 * the script line is a span rather than a sibling div. That is a change from
 * the reference, which splits them across elements and reads as a fragment.
 */
export function Closing() {
  const { open } = useBooking();

  return (
    <div className="max-w-shell mx-auto px-[clamp(24px,4vw,64px)]">
      <h2
        id="closing-heading"
        className="text-closing text-forest text-center leading-none tracking-[-0.02em]"
      >
        <Reveal as="span" className="block">
          <span className="font-body font-extrabold tracking-[-0.035em]">
            {CLOSING.headlineBold}
          </span>{' '}
          <span className="font-display font-normal">{CLOSING.headlineSerif}</span>
        </Reveal>
      </h2>

      <div className="grid items-start gap-[clamp(10px,2vw,40px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Reveal delay={140}>
          <p className="font-script text-closing-script text-forest text-center leading-none">
            {CLOSING.script}
          </p>
        </Reveal>

        <Reveal delay={260}>
          <ul className="mt-gap-grid gap-gap-tight text-closing-link text-forest flex list-none flex-col p-0 pl-[clamp(0px,4vw,80px)] font-bold">
            {CLOSING.links.map((link) => (
              <li key={link.label}>
                {'intent' in link && link.intent === 'booking' ? (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="hover:text-accent cursor-pointer border-0 bg-transparent p-0 text-left text-inherit transition-colors duration-[var(--dur-hover-swap)]"
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    href={'href' in link ? link.href : '#top'}
                    className="hover:text-accent text-inherit transition-colors duration-[var(--dur-hover-swap)]"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
