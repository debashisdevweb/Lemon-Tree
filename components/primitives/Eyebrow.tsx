import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Uppercase label above a headline. The reference uses six tracking values
 * (.08 to .22em) and four colours for this one element, always at weight 700.
 */
export type EyebrowTone = 'sage' | 'accent' | 'forest' | 'onDark' | 'onDarkSoft';

const tones: Record<EyebrowTone, string> = {
  sage: 'text-sage',
  accent: 'text-accent',
  forest: 'text-forest',
  onDark: 'text-cream',
  onDarkSoft: 'text-cream/72',
};

const tracking = {
  tight: 'tracking-[0.08em]',
  base: 'tracking-[0.1em]',
  wide: 'tracking-[0.12em]',
  wider: 'tracking-[0.16em]',
  widest: 'tracking-[0.2em]',
  ultra: 'tracking-[0.22em]',
} as const;

export type EyebrowTracking = keyof typeof tracking;

export function Eyebrow({
  children,
  tone = 'sage',
  track = 'base',
  size = 'text-eyebrow',
  as: Tag = 'p',
  className,
}: {
  children: ReactNode;
  tone?: EyebrowTone;
  track?: EyebrowTracking;
  size?: string;
  as?: 'p' | 'span' | 'div' | 'h2' | 'h3';
  className?: string;
}) {
  return (
    <Tag className={cn('font-bold uppercase', size, tones[tone], tracking[track], className)}>
      {children}
    </Tag>
  );
}
