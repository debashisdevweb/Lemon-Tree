/**
 * Site chrome: navigation, footer and social links.
 *
 * LINK POLICY — the reference artboard uses hash placeholders (`#awards`,
 * `#investors`, `#facebook`) for every destination it does not itself contain.
 * Shipping those verbatim would mean dead links, so each one is resolved here:
 *
 *  - Section anchors that exist on the home page stay as anchors.
 *  - Anything that is really a search or booking intent routes to /book/search
 *    with real query parameters, which is the behaviour the label promises.
 *  - Informational destinations that have no design yet route to /contact,
 *    the one real non-home page in this deliverable. They are listed in
 *    UNDESIGNED_DESTINATIONS so the set is auditable rather than implicit.
 *  - Social handles are the group's public profiles and are marked external.
 */

export type NavLink = { readonly href: string; readonly label: string };

export const SECTION_IDS = [
  'hero',
  'destinations',
  'rewards',
  'offers',
  'events',
  'hotels',
  'presence',
  'brands',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const PRIMARY_NAV: readonly NavLink[] = [
  { href: '#destinations', label: 'Destinations' },
  { href: '#presence', label: 'Presence' },
  { href: '#offers', label: 'Offers' },
  { href: '#rewards', label: 'Rewards' },
  { href: '#brands', label: 'Brands' },
  { href: '#events', label: 'Events' },
  { href: '#hotels', label: 'New hotels' },
] as const;

export const FOOTER_COLUMNS = [
  {
    heading: 'Our presence',
    links: [
      { href: '/contact', label: 'Awards' },
      { href: '/contact', label: 'About us' },
      { href: '/contact', label: 'Careers' },
      { href: '#contact', label: 'Contact us' },
      { href: '/contact', label: 'Privacy policy' },
    ],
  },
  {
    heading: 'Stay',
    links: [
      { href: '/contact', label: 'Blogs' },
      { href: '/book/search?stay=day-use', label: 'Day use' },
      { href: '/contact', label: 'Cookies policy' },
      { href: '/contact', label: 'Non affiliation' },
      { href: '/contact', label: 'Terms & conditions' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/contact', label: 'Media' },
      { href: '/contact', label: 'Site map' },
      { href: '/contact', label: 'Travel guidelines' },
      { href: '/contact', label: 'Sustainability' },
      { href: '/contact', label: 'Investors' },
    ],
  },
  {
    heading: 'Initiatives',
    links: [
      { href: '/contact', label: 'Nidhi' },
      { href: '/contact', label: 'Utsav' },
      { href: '/contact', label: 'Saathi' },
      { href: '#rewards', label: 'Loyalty programme' },
    ],
  },
] as const;

export const SOCIAL_LINKS = [
  { platform: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/lemontreehotels' },
  { platform: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/lemontreehotels' },
  { platform: 'x', label: 'X', href: 'https://x.com/lemontreehotels' },
  { platform: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@lemontreehotels' },
] as const;

export type SocialPlatform = (typeof SOCIAL_LINKS)[number]['platform'];

/**
 * Destinations the reference implies but never designs. Every one currently
 * resolves to /contact. Each needs its own template before launch.
 */
export const UNDESIGNED_DESTINATIONS = [
  'awards',
  'about-us',
  'careers',
  'privacy-policy',
  'blogs',
  'cookies-policy',
  'non-affiliation',
  'terms-and-conditions',
  'media',
  'site-map',
  'travel-guidelines',
  'sustainability',
  'investors',
  'nidhi',
  'utsav',
  'saathi',
  'sign-in',
] as const;

export const SITE = {
  name: 'Lemon Tree Hotels',
  wordmark: 'Lemon Tree',
  wordmarkSuffix: 'Hotels',
  legalName: 'Lemon Tree Hotels Ltd.',
  copyrightYear: 2026,
  note: 'Redesign concept',
  /**
   * Public origin, used for canonicals, the sitemap and every JSON-LD @id.
   *
   * Only NEXT_PUBLIC_* is read: this module is imported by client components
   * too, and a server-only variable would be undefined on the client, so the
   * two sides could disagree. Set NEXT_PUBLIC_SITE_URL on the host.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  locale: 'en-IN',
} as const;
