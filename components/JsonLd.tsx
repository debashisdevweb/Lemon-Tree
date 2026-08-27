import { serialise } from '@/lib/seo/jsonld';

/**
 * Structured data is inlined at render time. The payload is built from our own
 * content modules, never from user input, so there is nothing to escape beyond
 * the closing-tag guard below.
 */
export function JsonLd({ graph }: { graph: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serialise(graph).replace(/</g, '\\u003c'),
      }}
    />
  );
}
