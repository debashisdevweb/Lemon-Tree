import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Eyebrow, type EyebrowTone } from '@/components/primitives/Eyebrow';
import { Reveal } from '@/components/primitives/Reveal';
import type { RevealDelay } from '@/lib/tokens/motion';

/**
 * Eyebrow + H2, optionally with prose and an action to its right.
 *
 * The most reused composite in the design — nine instances on the home page.
 * The reference lays it out as a wrapping flex row with the two ends baseline-
 * aligned at the bottom, which collapses to a stack on narrow viewports for
 * free because of `flex-wrap`.
 */
export function SectionHeader({
  eyebrow,
  headline,
  headingId,
  standfirst,
  action,
  tone = 'sage',
  fast = false,
  delay = 0,
  headlineClassName,
  className,
}: {
  eyebrow: string;
  headline: ReactNode;
  headingId?: string;
  standfirst?: string;
  action?: ReactNode;
  tone?: EyebrowTone;
  fast?: boolean;
  delay?: RevealDelay;
  headlineClassName?: string;
  className?: string;
}) {
  return (
    <Reveal
      fast={fast}
      delay={delay}
      className={cn(
        'gap-x-gap-grid gap-y-gap-tight flex flex-wrap items-end justify-between',
        className,
      )}
    >
      <div>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h2
          id={headingId}
          className={cn(
            'mt-gap-tight font-display text-h2 text-forest leading-[1.04] font-normal tracking-[-0.018em]',
            headlineClassName,
          )}
        >
          {headline}
        </h2>
      </div>
      {(standfirst || action) && (
        <div className="gap-gap-grid flex flex-wrap items-end">
          {standfirst && (
            <p className="text-prose text-muted max-w-[32ch] leading-[1.6]">{standfirst}</p>
          )}
          {action}
        </div>
      )}
    </Reveal>
  );
}
