import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/content/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Rate pages are per-query and must not be crawled.
        disallow: ['/book/', '/api/'],
      },
    ],
    sitemap: new URL('/sitemap.xml', SITE.url).toString(),
  };
}
