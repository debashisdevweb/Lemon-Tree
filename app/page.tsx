import { JsonLd } from '@/components/JsonLd';
import { FloatingBookingBar } from '@/components/chrome/FloatingBookingBar';
import { LoaderCurtain } from '@/components/chrome/LoaderCurtain';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SkipLink } from '@/components/chrome/SkipLink';
import { IndiaMap } from '@/components/map/IndiaMap';
import { Brands } from '@/components/sections/Brands';
import { Closing } from '@/components/sections/Closing';
import { Destinations } from '@/components/sections/Destinations';
import { Events } from '@/components/sections/Events';
import { Hero } from '@/components/sections/Hero';
import { Hotels } from '@/components/sections/Hotels';
import { Offers } from '@/components/sections/Offers';
import { Presence } from '@/components/sections/Presence';
import { Rewards } from '@/components/sections/Rewards';
import { BookingRoot } from './providers';
import { homeGraph } from '@/lib/seo/jsonld';

/**
 * Home — the implementation of design/dc/Lemon Tree Home.dc.html.
 *
 * Statically generated and revalidated hourly. Nothing on this route fetches on
 * the client; the only client components are the ones that must be (scroll
 * reveals, the booking sheet, the scroll-reactive header).
 *
 * Section order and anchor ids match the artboard exactly:
 * hero, destinations, rewards, offers, events, hotels, presence, brands, contact.
 */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <BookingRoot>
      <JsonLd graph={homeGraph()} />
      <SkipLink />
      <LoaderCurtain />
      <SiteHeader />

      <div id="top" className="bg-cream relative overflow-x-clip">
        <main id="main" className="relative z-1">
          <Hero />
          <Destinations />
          <Rewards />
          <Offers />
          <Events />
          <Hotels />
          <Presence map={<IndiaMap />} />
          <Brands />

          <section
            id="contact"
            aria-labelledby="closing-heading"
            className="bg-cream pt-closing-pt relative z-20"
          >
            <Closing />
            <div aria-hidden="true" className="h-[clamp(68px,12.75vh,187px)]" />
            <SiteFooter />
          </section>
        </main>

        <FloatingBookingBar />
      </div>
    </BookingRoot>
  );
}
