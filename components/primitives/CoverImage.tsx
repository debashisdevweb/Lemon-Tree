import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { Img } from '@/lib/content/home';

/**
 * A cover-cropped photograph.
 *
 * The reference paints all 20 photographs as CSS `background-image`, which
 * means no accessible name, no responsive candidates and no lazy loading.
 * These become real <img> elements through next/image, keeping the same
 * object-position focal points the artboard set.
 *
 * `zoom` reproduces the card hover: scale(1.05) over 1100ms. It is applied to
 * the image itself rather than a wrapper so only `transform` animates. The
 * parent must carry `.hover-zoom` and `overflow-hidden`.
 */
/**
 * 62 rather than next/image's default 75. These are large photographic crops
 * behind scrims and gradients, where the difference is not visible, and it
 * removes roughly a quarter of the page's image bytes — which on a throttled
 * connection is bandwidth the hero needs.
 */
const IMAGE_QUALITY = 62;

export function CoverImage({
  image,
  priority = false,
  sizes,
  zoom = false,
  className,
}: {
  image: Img;
  priority?: boolean;
  sizes: string;
  zoom?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      quality={IMAGE_QUALITY}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      className={cn(
        'absolute inset-0 h-full w-full object-cover',
        zoom &&
          'transition-transform duration-[var(--dur-hover-img)] ease-[var(--ease-rise)] ' +
            'group-hover:scale-[var(--card-zoom-to)] group-focus-visible:scale-[var(--card-zoom-to)]',
        className,
      )}
      style={image.position ? { objectPosition: image.position } : undefined}
    />
  );
}
