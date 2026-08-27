import { geoGraticule, geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import topology from 'world-atlas/countries-110m.json';
import { CITIES } from '@/lib/content/inventory';

/**
 * "Where you'll find us" — the presence map.
 *
 * The reference embeds design/dc/map-india.html in a lazy iframe, which pulls
 * D3 and topojson-client from unpkg at runtime and re-projects on every resize.
 * This is the same map, rebuilt as a server component: the topology is bundled
 * from npm, projection happens at build time, and the result is static SVG.
 *
 * That removes an iframe, two blocking third-party requests and all of the
 * map's client JavaScript from the critical path, and the SVG scales sharply
 * because it carries a viewBox rather than a pixel projection.
 *
 * Neighbour labels, the graticule, the dotted India fill, the open/soon markers
 * and the 500km scale bar all match the reference.
 */

const WIDTH = 1200;
const HEIGHT = Math.round(WIDTH / 1.72); // the artboard's aspect-ratio
const PAD = Math.max(16, Math.min(WIDTH, HEIGHT) * 0.055);

const NEIGHBOURS = [
  { label: 'PAKISTAN', lon: 69.6, lat: 28.6 },
  { label: 'NEPAL', lon: 83.6, lat: 28.9 },
  { label: 'CHINA', lon: 79.5, lat: 33.6 },
  { label: 'BANGLADESH', lon: 90.4, lat: 23.9 },
  { label: 'SRI LANKA', lon: 80.8, lat: 7.6 },
  { label: 'MYANMAR', lon: 95.6, lat: 21.5 },
] as const;

/** Label offsets, transcribed from the reference's per-city dx/dy/anchor. */
const LABEL_OFFSETS: Record<string, { dx: number; dy: number; anchor: 'start' | 'end' }> = {
  amritsar: { dx: 9, dy: -3, anchor: 'start' },
  naldehra: { dx: 9, dy: 4, anchor: 'start' },
  ajmer: { dx: 9, dy: -4, anchor: 'start' },
  pali: { dx: -9, dy: 0, anchor: 'end' },
  udaipur: { dx: -9, dy: 9, anchor: 'end' },
  ujjain: { dx: 9, dy: 4, anchor: 'start' },
  bharuch: { dx: -9, dy: -2, anchor: 'end' },
  nasik: { dx: 9, dy: -3, anchor: 'start' },
  mumbai: { dx: -9, dy: 6, anchor: 'end' },
  bhubaneswar: { dx: 9, dy: 3, anchor: 'start' },
  siliguri: { dx: 9, dy: -2, anchor: 'start' },
};

type NamedFeature = Feature<Geometry, { name?: string }>;

const topo = topology as unknown as Topology;
const countries = topo.objects.countries;
if (!countries) {
  throw new Error('world-atlas topology is missing its "countries" object');
}

const collection = feature(topo, countries) as unknown as FeatureCollection<
  Geometry,
  { name?: string }
>;

const india = collection.features.filter((f) => f.properties?.name === 'India');
const others = collection.features.filter((f) => f.properties?.name !== 'India');

const projection = geoMercator().fitExtent(
  [
    [PAD, PAD],
    [WIDTH - PAD, HEIGHT - PAD],
  ],
  { type: 'FeatureCollection', features: india } as FeatureCollection<Geometry>,
);

/**
 * Two size controls, because this SVG is inlined into the HTML document and so
 * sits on the critical path.
 *
 * `digits(1)` rounds path coordinates to a tenth of a pixel — invisible at any
 * display size, and it removes most of the bytes, since geoPath otherwise emits
 * full float precision.
 *
 * `visible()` drops every country that does not intersect the drawn frame. The
 * world-atlas topology carries 177 of them; at this projection only India and a
 * handful of neighbours are on screen, and the rest were costing hundreds of
 * kilobytes of path data for nothing.
 */
const path = geoPath(projection).digits(1);
const project = (lon: number, lat: number): [number, number] => projection([lon, lat]) ?? [0, 0];

/** Generous margin so coastlines running just off-frame still render. */
const FRAME_MARGIN = 80;

const visible = (feature: NamedFeature): boolean => {
  const [[x0, y0], [x1, y1]] = path.bounds(feature);
  if (!Number.isFinite(x0) || !Number.isFinite(y0)) return false;
  return (
    x1 >= -FRAME_MARGIN &&
    x0 <= WIDTH + FRAME_MARGIN &&
    y1 >= -FRAME_MARGIN &&
    y0 <= HEIGHT + FRAME_MARGIN
  );
};

/**
 * The graticule is clipped to India's own bounding box. Left at its default
 * extent it draws the entire globe — 80 KB of path data for grid lines that are
 * thousands of pixels off-frame, and it appears twice in the response because
 * the RSC payload carries a second copy.
 */
const graticulePath =
  path(
    geoGraticule()
      .extent([
        [66, 5],
        [98, 38],
      ])
      .step([5, 5])()
  ) ?? '';

const drawn = (features: NamedFeature[]): string[] =>
  features
    .filter(visible)
    .map((f) => path(f) ?? '')
    .filter((d) => d.length > 0);

const otherPaths = drawn(others);
const indiaPaths = drawn(india);

/** 500km scale bar, computed at latitude 22 exactly as the reference does. */
const SCALE_KM = 500;
const scaleLatitude = 22;
const [ax] = project(78, scaleLatitude);
const [bx] = project(79, scaleLatitude);
const pxPerKm = Math.abs(bx - ax) / (111.32 * Math.cos((scaleLatitude * Math.PI) / 180));
const scaleWidth = SCALE_KM * pxPerKm;

const openCount = CITIES.filter((c) => c.isOpen).length;
const stateCount = new Set(CITIES.map((c) => c.state)).size;

export function IndiaMap() {
  return (
    <div className="bg-map-ground flex h-full w-full flex-col md:flex-row">
      <div className="relative min-w-0 flex-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-labelledby="india-map-title india-map-desc"
          className="block h-full w-full"
        >
          <title id="india-map-title">Map of India showing Lemon Tree Hotels locations</title>
          <desc id="india-map-desc">
            {openCount} cities open across {stateCount} states, and {CITIES.length - openCount}{' '}
            opening soon. The full list is in the text beside the map.
          </desc>

          <defs>
            <pattern id="lt-map-dots" width="7" height="7" patternUnits="userSpaceOnUse">
              <rect width="7" height="7" className="fill-forest/40" />
              <circle cx="3.5" cy="3.5" r="0.85" className="fill-sage/50" />
            </pattern>
          </defs>

          <path d={graticulePath} fill="none" strokeWidth={0.7} className="stroke-cream/[0.06]" />

          <g>
            {otherPaths.map((d, index) => (
              <path
                key={`other-${index}`}
                d={d}
                strokeWidth={0.7}
                className="fill-hero-ground stroke-sage/40"
              />
            ))}
          </g>

          <g>
            {indiaPaths.map((d, index) => (
              <path
                key={`india-${index}`}
                d={d}
                fill="url(#lt-map-dots)"
                strokeWidth={1.1}
                className="stroke-sage/80"
              />
            ))}
          </g>

          <g aria-hidden="true">
            {NEIGHBOURS.map((n) => {
              const [x, y] = project(n.lon, n.lat);
              return (
                <text
                  key={n.label}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  letterSpacing="0.18em"
                  className="fill-cream/45"
                >
                  {n.label}
                </text>
              );
            })}
          </g>

          <g aria-hidden="true">
            {CITIES.map((city) => {
              const [x, y] = project(city.lon, city.lat);
              const offset = LABEL_OFFSETS[city.slug] ?? {
                dx: 9,
                dy: -3,
                anchor: 'start' as const,
              };
              return (
                <g key={city.slug} transform={`translate(${x},${y})`}>
                  {city.isOpen && <circle r={9} className="fill-accent" opacity={0.2} />}
                  <circle
                    r={city.isOpen ? 4.4 : 3.6}
                    strokeWidth={1.5}
                    className={
                      city.isOpen ? 'fill-accent stroke-none' : 'stroke-cream/80 fill-transparent'
                    }
                  />
                  <text
                    x={offset.dx}
                    y={offset.dy}
                    textAnchor={offset.anchor}
                    fontSize={13}
                    fontWeight={city.isOpen ? 700 : 500}
                    className={city.isOpen ? 'fill-cream' : 'fill-cream/70'}
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}
          </g>

          <g transform={`translate(${PAD + 2},${HEIGHT - PAD + 4})`} aria-hidden="true">
            <path
              d={`M0,-5 V0 H${scaleWidth.toFixed(1)} V-5`}
              fill="none"
              strokeWidth={1}
              className="stroke-cream/50"
            />
            <text x={scaleWidth + 9} y={1} fontSize={11} className="fill-cream/50">
              {SCALE_KM} km
            </text>
          </g>
        </svg>
      </div>

      <aside className="on-dark gap-gap-tight border-cream/16 flex shrink-0 flex-col border-t-[length:var(--border-hair)] border-solid p-[clamp(15.3px,2.04vw,27.2px)] md:w-[clamp(216px,26%,320px)] md:border-t-0 md:border-l-[length:var(--border-hair)]">
        <p className="text-eyebrow-xs text-cream/80 font-bold tracking-[0.18em] uppercase">
          Our presence
        </p>
        <p className="font-display text-h4 text-cream leading-[1.08] font-normal tracking-[-0.01em]">
          Across India,
          <br />
          coast to hills
        </p>
        <dl className="flex gap-[clamp(15.3px,1.53vw,23.8px)]">
          <div className="border-accent border-l-2 border-solid pl-[--spacing(3)]">
            <dd className="font-display text-h4 text-cream leading-none">{CITIES.length}</dd>
            <dt className="text-meta text-cream/80 mt-[--spacing(1)]">Cities</dt>
          </div>
          <div className="border-accent border-l-2 border-solid pl-[--spacing(3)]">
            <dd className="font-display text-h4 text-cream leading-none">{stateCount}</dd>
            <dt className="text-meta text-cream/80 mt-[--spacing(1)]">States</dt>
          </div>
        </dl>
        <hr className="border-cream/16 border-0 border-t-[length:var(--border-hair)] border-solid" />
        <ul className="text-body-sm flex list-none flex-col gap-[--spacing(2.5)] p-0">
          <li className="flex items-center gap-[--spacing(2.5)]">
            <span className="bg-accent size-3 shrink-0 rounded-full" />
            <span className="text-cream">Open now</span>
          </li>
          <li className="flex items-center gap-[--spacing(2.5)]">
            <span className="border-cream/75 size-3 shrink-0 rounded-full border-[length:var(--border-hair)] border-solid" />
            <span className="text-cream/80">Opening soon</span>
          </li>
        </ul>
        <p className="text-meta text-cream/80 mt-auto leading-[1.5]">
          A selection of the portfolio. Boundaries: Natural Earth via world-atlas (public domain).
        </p>
      </aside>
    </div>
  );
}
