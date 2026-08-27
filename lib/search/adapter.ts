import { CITIES, PROPERTIES, brandBySlug, cityBySlug } from '../content/inventory';

/**
 * Destination search.
 *
 * The corpus is 11 cities and 12 properties, so this is an in-memory index
 * rather than a Typesense cluster — see the audit's stack note. The interface
 * is what matters: when the portfolio outgrows this, `MemorySearchAdapter` is
 * replaced and callers do not change.
 */

export type SearchHit = {
  readonly kind: 'city' | 'property';
  /** City slug or property slug — what the availability request carries. */
  readonly value: string;
  readonly label: string;
  readonly detail: string;
  readonly isOpen: boolean;
};

export interface SearchAdapter {
  readonly name: string;
  suggest(query: string, limit?: number): readonly SearchHit[];
}

/** Fold accents and case so "nasik" matches "Nāsik". */
function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

const INDEX: readonly (SearchHit & { readonly haystack: string })[] = [
  ...CITIES.map((city) => {
    const count = PROPERTIES.filter((p) => p.citySlug === city.slug).length;
    return {
      kind: 'city' as const,
      value: city.slug,
      label: city.name,
      detail: `${city.state} · ${count} ${count === 1 ? 'hotel' : 'hotels'}`,
      isOpen: city.isOpen,
      haystack: normalise(`${city.name} ${city.state}`),
    };
  }),
  ...PROPERTIES.map((property) => {
    const city = cityBySlug(property.citySlug);
    const brand = brandBySlug(property.brandSlug);
    return {
      kind: 'property' as const,
      value: property.slug,
      label: property.name,
      detail: [brand?.name, city?.name].filter(Boolean).join(' · '),
      isOpen: property.status === 'open',
      haystack: normalise(`${property.name} ${brand?.name ?? ''} ${city?.name ?? ''}`),
    };
  }),
];

export const DEFAULT_SUGGESTION_LIMIT = 7;

export class MemorySearchAdapter implements SearchAdapter {
  readonly name = 'memory';

  suggest(query: string, limit: number = DEFAULT_SUGGESTION_LIMIT): readonly SearchHit[] {
    const needle = normalise(query);

    // Empty query offers open cities — a useful default, not an empty menu.
    if (needle.length === 0) {
      return INDEX.filter((hit) => hit.kind === 'city' && hit.isOpen)
        .slice(0, limit)
        .map(strip);
    }

    const scored: { hit: SearchHit; score: number }[] = [];

    for (const entry of INDEX) {
      const at = entry.haystack.indexOf(needle);
      if (at === -1) continue;
      // Prefix beats substring; cities beat properties; open beats opening.
      const score =
        (at === 0 ? 0 : 10) + (entry.kind === 'city' ? 0 : 1) + (entry.isOpen ? 0 : 20);
      scored.push({ hit: strip(entry), score });
    }

    scored.sort((a, b) => a.score - b.score || a.hit.label.localeCompare(b.hit.label));
    return scored.slice(0, limit).map((s) => s.hit);
  }
}

function strip(entry: SearchHit & { haystack?: string }): SearchHit {
  return {
    kind: entry.kind,
    value: entry.value,
    label: entry.label,
    detail: entry.detail,
    isOpen: entry.isOpen,
  };
}

let cached: SearchAdapter | null = null;

export function getSearchAdapter(): SearchAdapter {
  cached ??= new MemorySearchAdapter();
  return cached;
}
