import { cn } from '@/lib/cn';
import { SITE } from '@/lib/content/site';

/**
 * The wordmark is set in type — there is no logo file anywhere in the design
 * project. Playfair for the name, a tracked-out uppercase suffix beside it,
 * baseline-aligned.
 */
export function Wordmark({
  size = 'header',
  className,
}: {
  size?: 'header' | 'footer' | 'nav';
  className?: string;
}) {
  const nameSize =
    size === 'footer' ? 'text-wordmark-lg' : size === 'nav' ? 'text-h4' : 'text-wordmark';
  const suffixSize = size === 'header' ? 'text-micro' : 'text-eyebrow-xs';

  return (
    <span className={cn('flex items-baseline gap-[--spacing(2)]', className)}>
      <span className={cn('font-display leading-[1.1] font-medium tracking-[-0.01em]', nameSize)}>
        {SITE.wordmark}
      </span>
      <span className={cn('font-bold tracking-[0.22em] uppercase', suffixSize)}>
        {SITE.wordmarkSuffix}
      </span>
    </span>
  );
}
