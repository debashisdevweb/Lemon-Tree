import type { SocialPlatform } from '@/lib/content/site';

/**
 * Social glyphs, transcribed from the reference's inline SVGs. Each is a filled
 * shape in currentColor with the mark knocked out in cream, so the whole set
 * inherits hover colour from its parent.
 */
export function SocialIcon({ platform }: { platform: SocialPlatform }) {
  const common = {
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
    className: 'size-social-icon',
  };

  if (platform === 'facebook') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="11" fill="currentColor" />
        <path
          d="M13.6 12.2h2l.3-2.4h-2.3V8.5c0-.7.2-1.1 1.2-1.1h1.1V5.2c-.2 0-1-.1-1.8-.1-1.9 0-3.1 1.1-3.1 3.2v1.5H9v2.4h2v6.6h2.6z"
          className="fill-cream"
        />
      </svg>
    );
  }

  if (platform === 'instagram') {
    return (
      <svg {...common}>
        <rect x="1" y="1" width="22" height="22" rx="6.5" fill="currentColor" />
        <circle cx="12" cy="12" r="4.6" fill="none" strokeWidth="1.9" className="stroke-cream" />
        <circle cx="17.4" cy="6.6" r="1.3" className="fill-cream" />
      </svg>
    );
  }

  if (platform === 'x') {
    return (
      <svg {...common}>
        <rect x="1" y="1" width="22" height="22" rx="4" fill="currentColor" />
        <path
          d="M6.5 6.5h2.8l3 4 3.3-4h1.9l-4.2 5.1 4.6 5.9h-2.8l-3.2-4.2-3.5 4.2H6.5l4.5-5.4z"
          className="fill-cream"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="1" y="4" width="22" height="16" rx="4.5" fill="currentColor" />
      <path d="M10 8.7l6 3.3-6 3.3z" className="fill-cream" />
    </svg>
  );
}
