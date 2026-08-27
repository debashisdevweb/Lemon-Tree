import { chromium, type FullConfig } from '@playwright/test';

/**
 * Warms Next's image optimizer.
 *
 * The first request for each of the 20 photographs runs sharp and writes to
 * .next/cache/images. On a cold cache that is slow enough to look like a
 * loading failure inside a parallel suite, so it is done once here rather than
 * being absorbed as flake by every spec.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://127.0.0.1:3100';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.6;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    });
    await page
      .waitForFunction(
        () => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
        undefined,
        { timeout: 90_000 }
      )
      .catch(() => undefined);
  } finally {
    await browser.close();
  }
}
