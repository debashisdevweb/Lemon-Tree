import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingRoot } from '@/app/providers';
import { JsonLd } from '@/components/JsonLd';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SkipLink } from '@/components/chrome/SkipLink';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { breadcrumbNode, organisationNode } from '@/lib/seo/jsonld';
import { EnquiryForm } from './EnquiryForm';

export const metadata: Metadata = {
  title: 'Get in touch',
  description:
    'Send an enquiry about a stay, an event or a wedding, and the closest hotels will come back with dates, capacities and a quote.',
  alternates: { canonical: '/contact' },
};

export const revalidate = 3600;

export default function ContactPage() {
  return (
    <BookingRoot>
      <JsonLd
        graph={{
          '@context': 'https://schema.org',
          '@graph': [
            organisationNode(),
            breadcrumbNode([
              { name: 'Home', path: '/' },
              { name: 'Get in touch', path: '/contact' },
            ]),
          ],
        }}
      />
      <SkipLink />
      <SiteHeader />
      <main id="main" className="bg-cream pt-nav">
        <div className="max-w-shell py-section mx-auto px-gutter">
          <Eyebrow tone="sage">Get in touch</Eyebrow>
          <h1 className="mt-gap-eyebrow font-display text-h2 text-forest max-w-[24ch] leading-[1.04] font-normal tracking-[-0.018em]">
            Send one brief, hear from the closest hotels
          </h1>
          <p className="mt-gap-eyebrow text-prose-lg text-ink max-w-[52ch] leading-[1.66]">
            Tell us the shape of the thing — a stay, an offsite, a wedding — and the hotels that fit
            come back with dates, capacities and a quote.
          </p>
          <div className="mt-gap-heading max-w-[544px]">
            {/* EnquiryForm reads ?enquiry= to preselect the subject, so it needs
                a boundary to bail out to during prerender. */}
            <Suspense fallback={<div className="min-h-[442px]" />}>
              <EnquiryForm />
            </Suspense>
          </div>
        </div>
        <SiteFooter />
      </main>
    </BookingRoot>
  );
}
