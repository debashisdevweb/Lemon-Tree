import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The project's type scale is named by role (`text-h2`, `text-eyebrow`), not by
 * size (`text-sm`). tailwind-merge cannot tell those apart from colour
 * utilities, so out of the box it treats `text-nav` as a colour and silently
 * drops the `text-paper` that came before it — which is how the "Book now"
 * button ended up rendering forest text on a terracotta ground.
 *
 * Registering every font-size token here keeps size and colour in separate
 * conflict groups, so a component can set both.
 */
const FONT_SIZE_TOKENS = [
  'micro',
  'eyebrow-xs',
  'eyebrow-sm',
  'label',
  'eyebrow',
  'meta',
  'field-label',
  'legal',
  'body-sm',
  'btn-sm',
  'nav',
  'btn-submit',
  'link',
  'prose',
  'body',
  'btn',
  'tab',
  'input',
  'prose-lg',
  'field-value',
  'hero-list',
  'bar-title',
  'h4',
  'closing-link',
  'h3-sm',
  'h3',
  'h3-offer',
  'h3-lg',
  'wordmark',
  'stat',
  'wordmark-lg',
  'infinity',
  'h2-rewards',
  'h2',
  'figure',
  'loader-word',
  'h1',
  'closing',
  'closing-script',
  'hero-script',
  'loader-script',
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...FONT_SIZE_TOKENS] }],
    },
  },
});

/** Merge Tailwind classes, last-wins on genuinely conflicting utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
