import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingRoot, QueryProvider } from '@/app/providers';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SkipLink } from '@/components/chrome/SkipLink';
import { SearchResults } from './SearchResults';

export const metadata: Metadata = {
  title: 'Availability',
  description: 'Live rates across Lemon Tree Hotels, Keys and Aurika.',
  robots: { index: false, follow: false },
};

/** Live rates are never cached. */
export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <QueryProvider>
      <BookingRoot>
        <SkipLink />
        <SiteHeader />
        <main id="main" className="bg-cream pt-nav min-h-screen">
          <Suspense fallback={<div className="py-section-y px-[clamp(24px,4vw,64px)]" />}>
            <SearchResults />
          </Suspense>
          <SiteFooter />
        </main>
      </BookingRoot>
    </QueryProvider>
  );
}
