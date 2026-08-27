import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, Sacramento } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { SITE } from '@/lib/content/site';
import { META_THEME_DARK, META_THEME_LIGHT } from '@/lib/tokens/meta-colors';

/**
 * Fonts are self-hosted through next/font rather than linked from
 * fonts.googleapis.com as the reference does. That removes two cross-origin
 * round trips from the critical path and lets the CSS variables below feed the
 * --font-* tokens directly.
 *
 * `display: swap` plus a real fallback stack means text paints on the first
 * frame, which matters because the hero headline is the LCP element.
 */
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const sacramento = Sacramento({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-sacramento',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Lemon Tree Hotels — warm Indian hospitality, wherever you go',
    template: '%s · Lemon Tree Hotels',
  },
  description:
    'One of the largest hotel chains in India. Upscale to smart-value across six brands, in cities, hills, wildlife country and on the coast. Book direct for the best rate.',
  applicationName: SITE.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_IN',
    url: '/',
    title: 'Lemon Tree Hotels — warm Indian hospitality, wherever you go',
    description:
      'Upscale to smart-value across six brands, in cities, hills, wildlife country and on the coast.',
    images: [{ url: '/images/home/hero-hills.jpg', width: 1500, height: 1344 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: META_THEME_LIGHT },
    { media: '(prefers-color-scheme: dark)', color: META_THEME_DARK },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-IN"
      /* Multi-brand theming: every token in styles/tokens.css resolves through
         this attribute, so a brand-scoped route can set it to "keys-select" or
         "aurika" and the entire component set re-themes with no prop passing. */
      data-brand="lemon-tree"
      className={`${playfair.variable} ${jakarta.variable} ${sacramento.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
