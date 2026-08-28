import type { NextConfig } from 'next';

const config: NextConfig = {
  /**
   * Verification builds write somewhere else.
   *
   * `next build` rewrites .next with fresh content hashes. A server already
   * running against that directory keeps serving HTML that references the old
   * hashed CSS, which no longer exists — so the page loads with no styles at
   * all and nothing in the console explains why. Running the suite while `npm
   * run dev` is open used to do exactly that.
   *
   * The verify, e2e and lh scripts set NEXT_DIST_DIR so they build into
   * .next-verify and leave a running dev server alone.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  /* Lint runs as its own CI step (`npm run lint`) with the flat config in
   * eslint.config.mjs. eslint-config-next's eslintrc patch cannot run inside
   * next build under ESLint 9 flat config, so it is not invoked there. */
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536, 1920, 2560],
  },
  experimental: {
    optimizePackageImports: ['motion', 'react-day-picker'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default config;
