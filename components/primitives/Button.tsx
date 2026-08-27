import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The reference has four button treatments, distinguished by colour and hover
 * target, and six paddings distinguished by where the button sits. Both axes
 * are enumerated rather than parameterised, so a component cannot invent a
 * treatment or a padding the design does not contain.
 *
 *  solid    — terracotta fill, hovers to accent-deep (8 instances)
 *  outline  — hairline border, inverts to forest on hover (6 instances)
 *  ghost    — transparent, fills cream-2 on hover (booking bar, 2 instances)
 *  onDark   — cream hairline on forest, inverts to cream (rewards CTA)
 */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'onDark';

/** Named for the slot each padding actually occupies in the artboard. */
export type ButtonSlot =
  'card' | 'nav' | 'navline' | 'section' | 'prominent' | 'bar' | 'barCta' | 'sheet' | 'submit';

const base =
  'inline-flex items-center justify-center rounded-sm font-bold cursor-pointer ' +
  'transition-[background-color,color,transform] duration-[var(--dur-hover-bg)] ease-out ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<ButtonVariant, string> = {
  solid: 'border-0 bg-accent text-paper hover:bg-accent-deep',
  outline:
    'bg-transparent text-forest border-[length:var(--border-hair)] border-solid ' +
    'border-forest/40 hover:bg-forest hover:text-cream',
  ghost: 'border-0 bg-transparent text-ink hover:bg-cream-2 hover:text-forest',
  onDark:
    'on-dark bg-transparent text-cream border-[length:var(--border-hair)] border-solid ' +
    'border-cream/50 hover:bg-cream hover:text-forest',
};

const slots: Record<ButtonSlot, string> = {
  card: 'text-meta py-btn-card-y px-btn-card-x gap-gap-tight',
  nav: 'text-nav py-btn-nav-y px-btn-nav-x gap-gap-tight',
  navline: 'text-nav py-btn-navline-y px-btn-navline-x gap-gap-tight',
  section: 'text-btn-sm py-btn-section-y px-btn-section-x gap-gap-tight',
  prominent: 'text-body py-btn-prominent-y px-btn-prominent-x gap-gap-tight rounded-md',
  bar: 'text-body py-btn-bar-y px-btn-bar-x gap-gap-tight rounded-md',
  barCta: 'text-body py-btn-bar-y px-btn-barcta-x gap-gap-tight rounded-md',
  sheet: 'text-btn py-btn-sheet-y px-btn-sheet-x gap-gap-tight',
  submit: 'text-btn-submit py-btn-submit-y px-btn-submit-x gap-gap-tight',
};

type Common = {
  variant?: ButtonVariant;
  slot?: ButtonSlot;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = 'solid',
  slot = 'nav',
  className,
  children,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn(base, variants[variant], slots[slot], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'solid',
  slot = 'nav',
  className,
  children,
  href,
  external = false,
  ...rest
}: Common & { href: string; external?: boolean; 'aria-label'?: string }) {
  const classes = cn(base, variants[variant], slots[slot], className);

  if (external) {
    return (
      <a href={href} rel="noreferrer noopener" target="_blank" className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
