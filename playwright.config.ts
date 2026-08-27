import { defineConfig, devices } from '@playwright/test';

/**
 * The reference has no breakpoints at all, so the three viewports below are the
 * ones this implementation introduces collapse behaviour at. Every visual and
 * a11y check runs at all three.
 */
export const VIEWPORTS = {
  mobile: { width: 320, height: 720 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
} as const;

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      // Font rasterisation differs slightly between machines; this tolerance
      // catches layout regressions without failing on sub-pixel text.
      maxDiffPixelRatio: 0.012,
      animations: 'disabled',
      scale: 'css',
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: VIEWPORTS.desktop } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: VIEWPORTS.tablet } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: VIEWPORTS.mobile } },
  ],
  webServer: {
    command: 'npx next start --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
