import type { NextConfig } from 'next';

const config: NextConfig = {
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
