import { expect, test } from '@playwright/test';
import { horizontalOverflow, imagesSettled, revealAll, settleHome, skipLoader } from './helpers';

test.describe('home page', () => {
  test('renders every section from the artboard, in order', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);

    // Section order and ids are the artboard's own.
    const ids = await page.$$eval('main section[id]', (nodes) => nodes.map((node) => node.id));
    expect(ids).toEqual([
      'hero',
      'destinations',
      'rewards',
      'offers',
      'events',
      'hotels',
      'presence',
      'brands',
      'contact',
    ]);
  });

  test('has exactly one h1 and no skipped heading levels', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);
    await revealAll(page);

    const h1s = await page.locator('h1').allTextContents();
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toContain('Warm Indian hospitality');

    const levels = await page.$$eval('h1,h2,h3,h4,h5,h6', (nodes) =>
      nodes.map((node) => Number(node.tagName.slice(1))),
    );
    let previous = levels[0] ?? 1;
    for (const level of levels) {
      expect(level - previous, `heading jumped from h${previous} to h${level}`).toBeLessThanOrEqual(
        1,
      );
      previous = level;
    }
  });

  test('never scrolls horizontally', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);
    await revealAll(page);

    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });

  test('every in-page anchor resolves to a real element', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);

    const hrefs = await page.$$eval('a[href^="#"]', (nodes) =>
      Array.from(new Set(nodes.map((node) => node.getAttribute('href') ?? ''))),
    );
    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      const id = href.slice(1);
      if (id === '') continue;
      await expect(page.locator(`#${id}`), `anchor ${href} has no target`).toHaveCount(1);
    }
  });

  test('no link points at a 404', async ({ page, request }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);
    await revealAll(page);

    const internal = await page.$$eval('a[href^="/"]', (nodes) =>
      Array.from(new Set(nodes.map((node) => node.getAttribute('href') ?? ''))),
    );

    for (const href of internal) {
      const response = await request.get(href);
      expect(response.status(), `${href} returned ${response.status()}`).toBeLessThan(400);
    }
  });

  test('all 20 photographs load', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);
    await revealAll(page);
    await imagesSettled(page);

    const broken = await page.$$eval('img', (images) =>
      images
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src') ?? '(no src)'),
    );
    expect(broken).toEqual([]);
  });

  test('every image has an accessible name or is marked decorative', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);
    await revealAll(page);

    const missing = await page.$$eval('img', (images) =>
      images
        .filter((img) => img.getAttribute('alt') === null)
        .map((img) => img.getAttribute('src') ?? '(no src)'),
    );
    expect(missing).toEqual([]);
  });

  test('the header turns solid when Destinations reaches it', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);

    const header = page.locator('header');
    await expect(header).not.toHaveAttribute('data-solid', 'true');

    await page.locator('#destinations').scrollIntoViewIfNeeded();
    await expect(header).toHaveAttribute('data-solid', 'true');
  });

  test('emits Hotel, Offer and BreadcrumbList structured data', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');

    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(raw).toBeTruthy();

    const parsed = JSON.parse(raw as string) as { '@graph': { '@type': string }[] };
    const types = parsed['@graph'].map((node) => node['@type']);
    expect(types).toContain('HotelChain');
    expect(types).toContain('Hotel');
    expect(types).toContain('Offer');
    expect(types).toContain('BreadcrumbList');
  });

  test('the skip link is the first thing a keyboard reaches', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText(/skip to content/i);
  });

  test('scroll reveals fire once and stay visible', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);

    const card = page.locator('#offers [data-revealed]').first();
    // Starts hidden, before it has ever been in view.
    await expect(card).toHaveAttribute('data-revealed', 'false');

    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveAttribute('data-revealed', 'true');

    // Scroll away and back — it must not reset to hidden.
    await page.locator('#hero').scrollIntoViewIfNeeded();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveAttribute('data-revealed', 'true');
  });
});

test.describe('load sequence', () => {
  test('shows the curtain on a first visit and removes it after 2.4s', async ({ page }) => {
    await page.goto('/');

    const curtain = page.getByTestId('loader-curtain');
    await expect(curtain).toBeVisible();
    await expect(curtain).toHaveCount(0, { timeout: 8_000 });
  });

  test('does not replay the curtain on the next navigation', async ({ page }) => {
    await page.goto('/');
    await settleHome(page);

    await page.goto('/contact');
    await page.goto('/');
    await expect(page.getByTestId('loader-curtain')).toHaveCount(0);
  });
});

test.describe('reduced motion', () => {
  test.use({ colorScheme: 'light' });

  test('skips the curtain and lands content in its final state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(page.getByTestId('loader-curtain')).toHaveCount(0);
    await expect(page.locator('h1')).toBeVisible();

    // Reveals must not leave anything stranded at opacity 0.
    await revealAll(page);
    const hidden = await page.$$eval(
      '[data-revealed], .motion-safe\\:opacity-0',
      (nodes) => nodes.filter((node) => Number(getComputedStyle(node).opacity) < 0.99).length,
    );
    expect(hidden).toBe(0);
  });
});

test.describe('hero entrance', () => {
  /**
   * Regression guard.
   *
   * The hero's entrance delays (1.45-2.15s) were written to sit behind the 2.4s
   * loader curtain. The curtain plays once per session, so on every later visit
   * those delays left the hero blank over the photograph for ~1.5s with nothing
   * covering it. Screenshot baselines were being captured against that empty
   * hero, so nothing failed.
   */
  test('is visible almost immediately when the curtain does not play', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-loader', 'skipped');

    // Well inside the old 1450ms first delay.
    await page.waitForTimeout(800);

    for (const selector of ['#hero h1', '#hero ul', '#hero p']) {
      const opacity = await page
        .locator(selector)
        .first()
        .evaluate((node) => Number(getComputedStyle(node).opacity));
      expect(opacity, `${selector} is still transparent`).toBeGreaterThan(0.95);
    }
  });

  test('still plays the full staggered entrance on a first visit', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-loader', 'playing');

    // The curtain is up and the hero has not started yet.
    await page.waitForTimeout(600);
    const early = await page
      .locator('#hero h1')
      .evaluate((node) => Number(getComputedStyle(node).opacity));
    expect(early).toBeLessThan(0.05);

    // And it does arrive.
    await settleHome(page);
    const settled = await page
      .locator('#hero h1')
      .evaluate((node) => Number(getComputedStyle(node).opacity));
    expect(settled).toBeGreaterThan(0.99);
  });

  test('lays the script line and the bullet list side by side', async ({ page }) => {
    await skipLoader(page);
    await page.setViewportSize({ width: 1470, height: 900 });
    await page.goto('/');
    await settleHome(page);

    const script = await page.getByTestId('hero-script').boundingBox();
    const list = await page.locator('#hero ul').boundingBox();
    expect(script).not.toBeNull();
    expect(list).not.toBeNull();

    // The list sits to the right of the script, not underneath it.
    expect(list!.x).toBeGreaterThan(script!.x + script!.width);
    // And their vertical ranges overlap, bottom-aligned as the artboard has it.
    expect(list!.y).toBeLessThan(script!.y + script!.height);
  });

  test('announces the whole headline sentence once', async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);

    await expect(page.locator('#hero h1')).toHaveAccessibleName(
      'Warm Indian hospitality, wherever you go.',
    );
    // The script is visible but must not be announced twice.
    await expect(page.getByTestId('hero-script')).toBeVisible();
  });
});
