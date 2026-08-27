'use client';

import dynamic from 'next/dynamic';

/**
 * The newsletter form is the only thing on the home page that needs React Hook
 * Form and Zod on the client, and it sits in the footer — far below the fold.
 * Loading it on demand keeps roughly 60 KB off the critical path, which matters
 * on a throttled connection where LCP is bandwidth-bound.
 *
 * The placeholder reserves the form's height so deferring it cannot cause a
 * layout shift.
 */
const NewsletterForm = dynamic(() => import('./NewsletterForm').then((m) => m.NewsletterForm), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="min-h-[143px]" />,
});

export function NewsletterFormLazy() {
  return <NewsletterForm />;
}
