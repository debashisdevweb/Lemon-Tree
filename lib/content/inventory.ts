import {
  brandSchema,
  citySchema,
  propertySchema,
  type Brand,
  type City,
  type Property,
} from './schema';

/**
 * Portfolio data.
 *
 * Cities and coordinates come from design/dc/map-india.html, which is the only
 * place in the reference that states them. Properties and their brands come
 * from the home artboard's "New additions" and "Upcoming hotels" cards, plus
 * Siliguri from the property-detail artboard.
 *
 * NOTE — the reference is internally inconsistent about brand count: the hero
 * says "seven brands", the presence stat says "6 brands", the brand grid lists
 * six, and a card uses a seventh name ("Lemon Tree Resort"). The grid and the
 * stat are reproduced verbatim as copy; the data model below carries all seven
 * real brands, because a property references the seventh.
 */

const BRANDS_RAW: readonly Brand[] = [
  { slug: 'aurika', name: 'Aurika', tier: 'upscale', themeKey: 'aurika' },
  { slug: 'lemon-tree-premier', name: 'Lemon Tree Premier', tier: 'premium', themeKey: null },
  { slug: 'lemon-tree-hotels', name: 'Lemon Tree Hotels', tier: 'midscale', themeKey: 'lemon-tree' },
  { slug: 'lemon-tree-resort', name: 'Lemon Tree Resort', tier: 'midscale', themeKey: 'lemon-tree' },
  { slug: 'keys-prima', name: 'Keys Prima', tier: 'upper-midscale', themeKey: null },
  { slug: 'keys-select', name: 'Keys Select', tier: 'midscale', themeKey: 'keys-select' },
  { slug: 'keys-lite', name: 'Keys Lite', tier: 'economy', themeKey: null },
];

const CITIES_RAW: readonly City[] = [
  { slug: 'amritsar', name: 'Amritsar', state: 'Punjab', lat: 31.634, lon: 74.872, isOpen: true },
  {
    slug: 'naldehra',
    name: 'Naldehra',
    state: 'Himachal Pradesh',
    lat: 31.086,
    lon: 77.212,
    isOpen: false,
  },
  { slug: 'ajmer', name: 'Ajmer', state: 'Rajasthan', lat: 26.449, lon: 74.639, isOpen: true },
  { slug: 'pali', name: 'Pali', state: 'Rajasthan', lat: 25.773, lon: 73.323, isOpen: false },
  { slug: 'udaipur', name: 'Udaipur', state: 'Rajasthan', lat: 24.585, lon: 73.712, isOpen: true },
  {
    slug: 'ujjain',
    name: 'Ujjain',
    state: 'Madhya Pradesh',
    lat: 23.179,
    lon: 75.785,
    isOpen: false,
  },
  { slug: 'bharuch', name: 'Bharuch', state: 'Gujarat', lat: 21.706, lon: 72.997, isOpen: true },
  { slug: 'nasik', name: 'Nasik', state: 'Maharashtra', lat: 19.997, lon: 73.79, isOpen: false },
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lon: 72.878, isOpen: true },
  {
    slug: 'bhubaneswar',
    name: 'Bhubaneswar',
    state: 'Odisha',
    lat: 20.296,
    lon: 85.825,
    isOpen: true,
  },
  {
    slug: 'siliguri',
    name: 'Siliguri',
    state: 'West Bengal',
    lat: 26.727,
    lon: 88.395,
    isOpen: true,
  },
];

/** Standard room mix. Rates are indicative and belong to the CRS in production. */
const roomMix = (base: number) => [
  {
    slug: 'superior',
    name: 'Superior Room',
    occupancy: 2,
    baseRateInr: base,
    amenities: ['wifi', 'air-conditioning', 'work-desk'],
  },
  {
    slug: 'deluxe',
    name: 'Deluxe Room',
    occupancy: 3,
    baseRateInr: Math.round(base * 1.28),
    amenities: ['wifi', 'air-conditioning', 'work-desk', 'city-view'],
  },
  {
    slug: 'suite',
    name: 'Executive Suite',
    occupancy: 4,
    baseRateInr: Math.round(base * 1.95),
    amenities: ['wifi', 'air-conditioning', 'work-desk', 'city-view', 'lounge-access'],
  },
];

const PROPERTIES_RAW: readonly Property[] = [
  {
    slug: 'keys-lite-ajmer',
    name: 'Keys Lite Ajmer',
    brandSlug: 'keys-lite',
    citySlug: 'ajmer',
    status: 'open',
    roomTypes: roomMix(3200),
  },
  {
    slug: 'keys-select-amritsar',
    name: 'Keys Select Amritsar',
    brandSlug: 'keys-select',
    citySlug: 'amritsar',
    status: 'open',
    roomTypes: roomMix(4600),
  },
  {
    slug: 'lemon-tree-hotel-bharuch',
    name: 'Lemon Tree Hotel Bharuch',
    brandSlug: 'lemon-tree-hotels',
    citySlug: 'bharuch',
    status: 'open',
    roomTypes: roomMix(5100),
  },
  {
    slug: 'lemon-tree-hotel-bhubaneswar',
    name: 'Lemon Tree Hotel Bhubaneswar',
    brandSlug: 'lemon-tree-hotels',
    citySlug: 'bhubaneswar',
    status: 'open',
    roomTypes: roomMix(5400),
  },
  {
    slug: 'lemon-tree-hotel-siliguri',
    name: 'Lemon Tree Hotel Siliguri',
    brandSlug: 'lemon-tree-hotels',
    citySlug: 'siliguri',
    status: 'open',
    roomTypes: roomMix(4900),
  },
  {
    slug: 'aurika-mumbai',
    name: 'Aurika Mumbai Skycity',
    brandSlug: 'aurika',
    citySlug: 'mumbai',
    status: 'open',
    roomTypes: roomMix(11500),
  },
  {
    slug: 'lemon-tree-premier-udaipur',
    name: 'Lemon Tree Premier Udaipur',
    brandSlug: 'lemon-tree-premier',
    citySlug: 'udaipur',
    status: 'open',
    roomTypes: roomMix(8200),
  },
  {
    slug: 'lemon-tree-hotel-ujjain',
    name: 'Lemon Tree Hotel Ujjain',
    brandSlug: 'lemon-tree-hotels',
    citySlug: 'ujjain',
    status: 'opening',
    roomTypes: roomMix(4800),
  },
  {
    slug: 'keys-prima-nasik',
    name: 'Keys Prima Nasik',
    brandSlug: 'keys-prima',
    citySlug: 'nasik',
    status: 'opening',
    roomTypes: roomMix(5600),
  },
  {
    slug: 'lemon-tree-resort-nasik',
    name: 'Lemon Tree Resort Nasik',
    brandSlug: 'lemon-tree-resort',
    citySlug: 'nasik',
    status: 'opening',
    roomTypes: roomMix(6900),
  },
  {
    slug: 'keys-select-pali',
    name: 'Keys Select Hotel Pali',
    brandSlug: 'keys-select',
    citySlug: 'pali',
    status: 'opening',
    roomTypes: roomMix(4100),
  },
  {
    slug: 'lemon-tree-resort-naldehra',
    name: 'Lemon Tree Resort Naldehra',
    brandSlug: 'lemon-tree-resort',
    citySlug: 'naldehra',
    status: 'opening',
    roomTypes: roomMix(7400),
  },
];

/**
 * Parsed once at module load. A malformed record is a build-time failure rather
 * than a runtime surprise, and referential integrity is checked explicitly
 * because Zod cannot see across collections.
 */
export const BRANDS: readonly Brand[] = BRANDS_RAW.map((b) => brandSchema.parse(b));
export const CITIES: readonly City[] = CITIES_RAW.map((c) => citySchema.parse(c));
export const PROPERTIES: readonly Property[] = PROPERTIES_RAW.map((p) => propertySchema.parse(p));

const brandSlugs = new Set(BRANDS.map((b) => b.slug));
const citySlugs = new Set(CITIES.map((c) => c.slug));

for (const property of PROPERTIES) {
  if (!brandSlugs.has(property.brandSlug)) {
    throw new Error(`Property "${property.slug}" references unknown brand "${property.brandSlug}"`);
  }
  if (!citySlugs.has(property.citySlug)) {
    throw new Error(`Property "${property.slug}" references unknown city "${property.citySlug}"`);
  }
}

export const brandBySlug = (slug: string): Brand | undefined =>
  BRANDS.find((b) => b.slug === slug);

export const cityBySlug = (slug: string): City | undefined => CITIES.find((c) => c.slug === slug);

export const propertyBySlug = (slug: string): Property | undefined =>
  PROPERTIES.find((p) => p.slug === slug);

export const propertiesInCity = (citySlug: string): readonly Property[] =>
  PROPERTIES.filter((p) => p.citySlug === citySlug);
