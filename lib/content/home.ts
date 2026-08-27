import type { OfferKind } from './schema';

/**
 * Home page content, transcribed verbatim from design/dc/Lemon Tree Home.dc.html.
 *
 * Copy is unchanged from the artboard. The one thing added is `alt` text on
 * every image: the reference paints all 20 photographs as CSS backgrounds with
 * no accessible name at all, which fails WCAG 2.2 AA. Decorative images carry
 * alt: '' and are marked so.
 *
 * This module is the CMS seam. When Payload lands, these shapes are what its
 * generated types must satisfy.
 */

export type Img = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  /** Background focal point, from the artboard's background-position. */
  readonly position?: string;
};

const img = (
  file: string,
  width: number,
  height: number,
  alt: string,
  position?: string
): Img => ({ src: `/images/home/${file}`, width, height, alt, ...(position ? { position } : {}) });

/* ---------------------------------------------------------------- loader --- */

export const LOADER = {
  word: 'Lemon Tree Hotels',
  script: 'all over India.',
} as const;

/* ------------------------------------------------------------------ hero --- */

export const HERO = {
  eyebrow: 'One of the largest hotel chains in India',
  headline: 'Warm Indian hospitality,',
  script: 'wherever you go.',
  points: [
    'Upscale to smart-value, seven brands.',
    'Cities, hills, wildlife and coast.',
    'Day rooms for the in-between hours.',
    'Book direct for the best rate.',
  ],
  promo: {
    tag: 'Now on',
    label: 'Book direct for 2× Infinity reward points',
    href: '#offers',
  },
  scrollCue: 'Scroll',
  /**
   * 1500x1050 rather than the source's 1500x1344: the design project's copy of
   * this file exceeds the 256 KiB the design API will return, so the import
   * arrived truncated at 192 KiB with no EOI marker. Browsers tolerate that but
   * sharp does not, which silently disabled image optimisation for the single
   * largest asset on the page. The recoverable 78.5% has been re-encoded as a
   * valid progressive JPEG. The full-resolution original is still needed.
   */
  image: img(
    'hero-hills.jpg',
    1500,
    1050,
    'Terraced tea slopes falling away into layered hills at dawn',
    'center 52%'
  ),
} as const;

/* ---------------------------------------------------------- destinations --- */

export type DestinationCard = {
  readonly slug: string;
  readonly titleLines: readonly [string, string];
  readonly image: Img;
};

export const DESTINATIONS = {
  eyebrow: 'Where to next',
  headline: 'Pick the kind of trip',
  standfirst: 'Not a city list — four ways to travel, each with the hotels that suit it.',
  cta: 'Explore',
  cards: [
    {
      slug: 'mountains-hill-stations',
      titleLines: ['Mountains &', 'hill stations'],
      image: img('dest-mountains.jpg', 700, 499, 'Pine ridges above a hill-station valley'),
    },
    {
      slug: 'wildlife-nature',
      titleLines: ['Wildlife &', 'nature'],
      image: img('dest-wildlife.jpg', 700, 499, 'Dense sal forest at the edge of a reserve'),
    },
    {
      slug: 'heritage-spiritual',
      titleLines: ['Heritage &', 'spiritual'],
      image: img('dest-heritage.jpg', 700, 499, 'Carved sandstone temple steps in low sun'),
    },
    {
      slug: 'beaches-backwaters',
      titleLines: ['Beaches &', 'backwaters'],
      image: img('dest-beach.jpg', 700, 499, 'Palm-fringed shoreline meeting still backwater'),
    },
  ] satisfies readonly DestinationCard[],
} as const;

/* --------------------------------------------------------------- rewards --- */

export const REWARDS = {
  logoWord: 'infinity',
  logoSuffix: 'Rewards by Lemon Tree',
  headlineLines: ['Make every stay', 'more rewarding'],
  body: 'Earn coins on the room, spend them like cash on the next stay. Free to join, and the member rate is always below the public one.',
  benefits: [
    'Member-only rates',
    'Earn & redeem points',
    'Dining & spa privileges',
    'Early check-in, late check-out',
    'Complimentary room upgrade',
    'Tier-based benefits',
  ],
  joinCta: 'Join free',
  signInCta: 'Sign in',
  disclaimer: 'Upgrade and check-out benefits subject to availability.',
  image: img(
    'rewards-beach.jpg',
    1000,
    618,
    'Loungers on a quiet resort beach at golden hour',
    'center 40%'
  ),
} as const;

/* ---------------------------------------------------------------- offers --- */

export type OfferCardContent = {
  readonly kind: OfferKind;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly action: { readonly label: string; readonly intent: 'offers' | 'day-use' | 'rewards' };
  readonly image: Img | null;
  readonly figure?: string;
};

export const OFFERS = {
  eyebrow: 'Offers & promotions',
  headline: 'Worth booking direct',
  allCta: 'All offers',
  cards: [
    {
      kind: 'weekend',
      eyebrow: 'Weekends',
      title: 'Curated city escapes',
      body: 'Two nights in a city you keep meaning to visit, with breakfast and a late check-out.',
      action: { label: 'Explore more', intent: 'offers' },
      image: img(
        'offer-room.jpg',
        900,
        236,
        'Corner of a guest room with morning light across the bed',
        'center 55%'
      ),
    },
    {
      kind: 'dayuse',
      eyebrow: 'By the hour',
      title: 'Day rooms',
      body: 'A room, a shower and the pool between a morning flight and an evening meeting.',
      action: { label: 'Check day rates', intent: 'day-use' },
      image: img('offer-pool.jpg', 1100, 176, 'Rooftop pool deck with city haze beyond'),
    },
    {
      kind: 'happyhour',
      eyebrow: 'Evenings',
      title: 'Happy hour',
      body: 'Handcrafted elixirs and a laid-back hour at the bar, across participating hotels.',
      action: { label: 'Explore more', intent: 'offers' },
      image: img('offer-cocktail.jpg', 700, 253, 'Two cocktails on a dark bar counter'),
    },
    {
      kind: 'member',
      eyebrow: 'Members only',
      title: 'Double reward points, every stay',
      body: 'Book direct as an Infinity Rewards member and earn twice the points on the same room — plus 5,000 bonus points on long-weekend stays.',
      action: { label: 'Read the offer', intent: 'rewards' },
      image: null,
      figure: '2×',
    },
  ] satisfies readonly OfferCardContent[],
} as const;

/* ---------------------------------------------------------------- events --- */

export const EVENTS = {
  eyebrow: 'Events & conferences',
  headline: 'Rooms that hold a room',
  standfirst: 'Send one brief and the closest hotels come back with dates, capacities and a quote.',
  cta: 'Send a brief',
  cards: [
    {
      slug: 'corporate-events',
      title: 'Corporate events',
      body: 'Board meetings, training days and offsites, with AV and catering handled.',
      image: img('event-corporate.jpg', 800, 391, 'Boardroom table set for a morning meeting'),
    },
    {
      slug: 'weddings-social',
      title: 'Weddings & social',
      body: 'Banquet halls and lawns, room blocks for the family, one coordinator throughout.',
      image: img('event-wedding.jpg', 800, 390, 'Marigold-strung wedding mandap on a hotel lawn'),
    },
    {
      slug: 'conference-rooms',
      title: 'Conference rooms',
      body: 'Smaller, quieter rooms by the half-day when you only need the table.',
      image: img('event-conference.jpg', 800, 391, 'Small conference room with daylight and screen'),
    },
  ],
} as const;

/* --------------------------------------------------- new & upcoming hotels --- */

export const NEW_HOTELS = {
  eyebrow: 'Now open',
  headline: 'New additions',
  bookCta: 'Book now',
  moreCta: 'Know more',
  cards: [
    {
      city: 'Ajmer',
      brand: 'Keys Lite',
      citySlug: 'ajmer',
      image: img('new-ajmer.jpg', 700, 500, 'Keys Lite Ajmer seen from the forecourt'),
    },
    {
      city: 'Amritsar',
      brand: 'Keys Select',
      citySlug: 'amritsar',
      image: img('new-amritsar.jpg', 700, 503, 'Keys Select Amritsar entrance at dusk'),
    },
    {
      city: 'Bharuch',
      brand: 'Lemon Tree Hotel',
      citySlug: 'bharuch',
      image: img('new-bharuch.jpg', 700, 505, 'Lemon Tree Hotel Bharuch exterior'),
    },
    {
      city: 'Bhubaneswar',
      brand: 'Lemon Tree Hotel',
      citySlug: 'bhubaneswar',
      image: img('new-bhubaneswar.jpg', 700, 509, 'Lemon Tree Hotel Bhubaneswar frontage'),
    },
  ],
} as const;

export const UPCOMING = {
  eyebrow: 'Opening soon',
  headline: 'Upcoming hotels',
  standfirst:
    'Four more places to stay, in towns people travel to for reasons older than hotels.',
  cards: [
    {
      city: 'Ujjain',
      brand: 'Lemon Tree Hotel',
      citySlug: 'ujjain',
      image: img('up-ujjain.jpg', 700, 493, 'Ghats and temple spires at Ujjain'),
    },
    {
      city: 'Nasik',
      brand: 'Keys Prima',
      citySlug: 'nasik',
      image: img('up-caves.jpg', 700, 495, 'Rock-cut cave colonnade near Nasik'),
    },
    {
      city: 'Nasik',
      brand: 'Lemon Tree Resort',
      citySlug: 'nasik',
      image: img('up-temple.jpg', 700, 497, 'Stone temple tower against monsoon sky'),
    },
    {
      city: 'Pali',
      brand: 'Keys Select Hotel',
      citySlug: 'pali',
      image: img('up-pali.jpg', 700, 501, 'Desert-edge fort walls outside Pali'),
    },
  ],
} as const;

/* -------------------------------------------------------------- presence --- */

export const PRESENCE = {
  eyebrow: 'Our presence',
  headline: 'Where you’ll find us',
  standfirst:
    'From Amritsar to Bhubaneswar, and up into the hills at Naldehra — with four more opening.',
  cta: 'Find a hotel',
  stats: [
    { figure: '11 cities', caption: 'Open and opening' },
    { figure: '8 states', caption: 'Punjab to Odisha' },
    { figure: '6 brands', caption: 'Upscale to economy' },
    { figure: '4 opening', caption: 'Ujjain, Nasik, Pali, Naldehra' },
  ],
} as const;

/* ---------------------------------------------------------------- brands --- */

export const BRANDS = {
  eyebrow: 'Our brands',
  headline: 'One of the largest hotel chains in India',
  paragraphs: [
    'Whether you are planning a business trip, a family holiday or a weekend escape, the portfolio is built to fit: upscale at one end, smart value at the other, and the same warm Indian hospitality throughout.',
    'From bustling cityscapes to quiet natural escapes, our presence across the country brings consistency with a personal touch — and booking direct is always the best way to stay.',
  ],
  tiles: [
    { name: 'Aurika', tier: 'Upscale' },
    { name: 'Lemon Tree Premier', tier: 'Premium' },
    { name: 'Lemon Tree Hotels', tier: 'Midscale' },
    { name: 'Keys Prima', tier: 'Upper midscale' },
    { name: 'Keys Select', tier: 'Midscale' },
    { name: 'Keys Lite', tier: 'Economy' },
  ],
  moreCta: 'Read more about the group',
} as const;

/* --------------------------------------------------------------- closing --- */

export const CLOSING = {
  headlineBold: 'Come stay',
  headlineSerif: 'with us,',
  script: 'anywhere in India.',
  links: [
    { label: 'Find a hotel.', intent: 'booking' },
    { label: 'Join Infinity Rewards.', href: '#rewards' },
    { label: 'Plan an event.', href: '#events' },
  ],
} as const;

/* ---------------------------------------------------------------- footer --- */

export const FOOTER = {
  newsletterHeading: 'Join our newsletter',
  emailPlaceholder: 'Email address',
  submitLabel: 'Submit',
  consentPrefix: 'I agree to the',
  consentLinkLabel: 'privacy policy',
  contactHeading: 'Get in touch',
} as const;
