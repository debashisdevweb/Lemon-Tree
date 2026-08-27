import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/content/site';

/**
 * Only routes that actually exist are listed. The undesigned destinations in
 * lib/content/site.ts are deliberately absent — listing a route that redirects
 * to /contact would be a crawl trap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: new URL('/', SITE.url).toString(), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: new URL('/contact', SITE.url).toString(),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
