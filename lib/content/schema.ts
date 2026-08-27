import { z } from 'zod';

/**
 * Data model: Brand -> Property -> RoomType -> Offer -> Amenity.
 *
 * These schemas are the contract the CMS must satisfy. Content is currently
 * served from typed modules in this directory; when Payload (or Sanity) lands,
 * its generated types are validated against these schemas at the fetch
 * boundary and nothing downstream changes.
 */

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a lowercase kebab-case slug');

/** Tiers are taken from the reference's own brand grid captions. */
export const brandTierSchema = z.enum([
  'upscale',
  'premium',
  'upper-midscale',
  'midscale',
  'economy',
]);

export const brandSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  tier: brandTierSchema,
  /** Matches a [data-brand] palette in styles/tokens.css, when one exists. */
  themeKey: slugSchema.nullable(),
});

export const citySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  state: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  isOpen: z.boolean(),
});

export const propertyStatusSchema = z.enum(['open', 'opening']);

export const amenitySchema = z.object({
  slug: slugSchema,
  label: z.string().min(1),
  category: z.enum(['room', 'hotel', 'dining', 'wellness', 'business']),
});

export const roomTypeSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  occupancy: z.number().int().positive().max(8),
  baseRateInr: z.number().int().positive(),
  amenities: z.array(slugSchema),
});

export const propertySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  brandSlug: slugSchema,
  citySlug: slugSchema,
  status: propertyStatusSchema,
  roomTypes: z.array(roomTypeSchema),
});

/** Offer kinds are the four eyebrow labels used on the reference's offer cards. */
export const offerKindSchema = z.enum(['weekend', 'dayuse', 'happyhour', 'member']);

export const offerSchema = z.object({
  slug: slugSchema,
  kind: offerKindSchema,
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
});

export type Brand = z.infer<typeof brandSchema>;
export type BrandTier = z.infer<typeof brandTierSchema>;
export type City = z.infer<typeof citySchema>;
export type Amenity = z.infer<typeof amenitySchema>;
export type RoomType = z.infer<typeof roomTypeSchema>;
export type Property = z.infer<typeof propertySchema>;
export type PropertyStatus = z.infer<typeof propertyStatusSchema>;
export type Offer = z.infer<typeof offerSchema>;
export type OfferKind = z.infer<typeof offerKindSchema>;
