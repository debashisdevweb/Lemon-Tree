import { describe, expect, it } from 'vitest';
import { breadcrumbNode, homeGraph, hotelNodes, serialise } from '@/lib/seo/jsonld';
import { PROPERTIES } from '@/lib/content/inventory';

type Node = Record<string, unknown>;

const graph = homeGraph();
const nodes = graph['@graph'] as Node[];
const typesOf = (type: string): Node[] => nodes.filter((n) => n['@type'] === type);

describe('home structured data', () => {
  it('declares a context and a graph', () => {
    expect(graph['@context']).toBe('https://schema.org');
    expect(Array.isArray(nodes)).toBe(true);
  });

  it('has exactly one organisation and one website', () => {
    expect(typesOf('HotelChain')).toHaveLength(1);
    expect(typesOf('WebSite')).toHaveLength(1);
  });

  it('emits a Hotel node per property', () => {
    expect(typesOf('Hotel')).toHaveLength(PROPERTIES.length);
  });

  it('gives every hotel an address and coordinates', () => {
    for (const hotel of typesOf('Hotel')) {
      expect(hotel['address']).toBeDefined();
      expect(hotel['geo']).toBeDefined();
    }
  });

  it('prices open hotels only', () => {
    const openSlugs = new Set(
      PROPERTIES.filter((p) => p.status === 'open').map((p) => p.name)
    );
    for (const hotel of typesOf('Hotel')) {
      const named = String(hotel['name']);
      if (openSlugs.has(named)) {
        expect(hotel['priceRange'], `${named} should be priced`).toBeDefined();
        expect(hotel['makesOffer']).toBeDefined();
      } else {
        expect(hotel['priceRange'], `${named} should not be priced`).toBeUndefined();
      }
    }
  });

  it('links hotels back to the chain', () => {
    for (const hotel of typesOf('Hotel')) {
      expect(hotel['parentOrganization']).toEqual({ '@id': expect.stringContaining('#organisation') });
    }
  });

  it('emits an Offer per offer card', () => {
    expect(typesOf('Offer')).toHaveLength(4);
  });

  it('includes a breadcrumb list', () => {
    expect(typesOf('BreadcrumbList')).toHaveLength(1);
  });

  it('numbers breadcrumb positions from one', () => {
    const crumb = breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Get in touch', path: '/contact' },
    ]);
    const items = crumb['itemListElement'] as Node[];
    expect(items.map((i) => i['position'])).toEqual([1, 2]);
  });

  it('serialises to valid JSON with undefined stripped', () => {
    const json = serialise(graph);
    expect(() => JSON.parse(json)).not.toThrow();
    expect(json).not.toContain('undefined');
  });

  it('uses absolute URLs for every @id', () => {
    for (const node of nodes) {
      if (typeof node['@id'] === 'string') {
        expect(node['@id']).toMatch(/^https?:\/\//);
      }
    }
  });

  it('does not leak an unopened hotel into search availability', () => {
    const opening = PROPERTIES.filter((p) => p.status === 'opening').map((p) => p.name);
    const priced = hotelNodes()
      .filter((n) => n['makesOffer'] !== undefined)
      .map((n) => String(n['name']));
    for (const name of opening) {
      expect(priced).not.toContain(name);
    }
  });
});
