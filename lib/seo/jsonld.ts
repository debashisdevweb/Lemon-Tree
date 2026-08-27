import { BRANDS, CITIES, PROPERTIES, brandBySlug, cityBySlug } from '@/lib/content/inventory';
import { OFFERS } from '@/lib/content/home';
import { SITE } from '@/lib/content/site';

/**
 * Structured data. Emitted as one @graph so the crawler sees the organisation,
 * every hotel, the offers and the breadcrumb trail as a connected set rather
 * than as unrelated islands.
 */

type Json = Record<string, unknown>;

const abs = (path: string): string => new URL(path, SITE.url).toString();

export function organisationNode(): Json {
  return {
    '@type': 'HotelChain',
    '@id': abs('/#organisation'),
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    numberOfRooms: undefined,
    brand: BRANDS.map((brand) => ({ '@type': 'Brand', name: brand.name })),
    areaServed: { '@type': 'Country', name: 'India' },
  };
}

export function hotelNodes(): Json[] {
  return PROPERTIES.map((property) => {
    const city = cityBySlug(property.citySlug);
    const brand = brandBySlug(property.brandSlug);
    const cheapest = property.roomTypes.reduce(
      (min, room) => Math.min(min, room.baseRateInr),
      Number.POSITIVE_INFINITY
    );

    return {
      '@type': 'Hotel',
      '@id': abs(`/#hotel-${property.slug}`),
      name: property.name,
      parentOrganization: { '@id': abs('/#organisation') },
      ...(brand ? { brand: { '@type': 'Brand', name: brand.name } } : {}),
      ...(city
        ? {
            address: {
              '@type': 'PostalAddress',
              addressLocality: city.name,
              addressRegion: city.state,
              addressCountry: 'IN',
            },
            geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lon },
          }
        : {}),
      // An unopened hotel has no bookable rate, so it gets no priceRange.
      ...(property.status === 'open' && Number.isFinite(cheapest)
        ? {
            priceRange: `From ₹${cheapest.toLocaleString('en-IN')}`,
            makesOffer: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: cheapest,
              availability: 'https://schema.org/InStock',
            },
          }
        : { openingHoursSpecification: undefined }),
    };
  });
}

export function offerNodes(): Json[] {
  return OFFERS.cards.map((card) => ({
    '@type': 'Offer',
    '@id': abs(`/#offer-${card.kind}`),
    name: card.title,
    description: card.body,
    category: card.eyebrow,
    offeredBy: { '@id': abs('/#organisation') },
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
  }));
}

export function breadcrumbNode(
  trail: readonly { name: string; path: string }[]
): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

export function homeGraph(): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organisationNode(),
      {
        '@type': 'WebSite',
        '@id': abs('/#website'),
        url: SITE.url,
        name: SITE.name,
        inLanguage: SITE.locale,
        publisher: { '@id': abs('/#organisation') },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: abs('/book/search?destination={search_term_string}'),
          },
          'query-input': 'required name=search_term_string',
        },
      },
      ...hotelNodes(),
      ...offerNodes(),
      breadcrumbNode([{ name: 'Home', path: '/' }]),
      {
        '@type': 'ItemList',
        '@id': abs('/#cities'),
        name: 'Cities',
        numberOfItems: CITIES.length,
        itemListElement: CITIES.map((city, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: city.name,
        })),
      },
    ],
  };
}

/** Strips undefined so the emitted JSON stays valid and compact. */
export function serialise(graph: Json): string {
  return JSON.stringify(graph, (_key, value) => (value === undefined ? undefined : value));
}
