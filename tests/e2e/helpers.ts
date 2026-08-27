import type { Page } from '@playwright/test';

/** Wait past the 2.4s load curtain, or skip it entirely on repeat visits. */
export async function settleHome(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  const curtain = page.getByTestId('loader-curtain');
  if (await curtain.count()) {
    await curtain.waitFor({ state: 'detached', timeout: 8_000 }).catch(() => undefined);
  }
  // The hero entrance is CSS keyframes with delays, so "curtain gone" does not
  // mean "hero visible". Waiting for it here is what stops a screenshot
  // baseline being captured against an empty hero.
  await page.waitForFunction(
    () => {
      const hero = document.querySelector('#hero h1');
      return hero !== null && Number(getComputedStyle(hero).opacity) >= 0.999;
    },
    undefined,
    { timeout: 10_000 },
  );
  await page.waitForTimeout(150);
}

/** Suppress the curtain so a test starts on a settled page. */
export async function skipLoader(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('lt.loader.seen', '1');
    } catch {
      /* private mode */
    }
  });
}

/** Reveal every scroll-triggered element by walking the page bottom to top. */
export async function revealAll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
}

/**
 * Wait for every <img> to finish decoding.
 *
 * Most photographs are lazy, and three sticky 100vh sections make a single fast
 * scroll pass unreliable at bringing the ones below them into view. So this
 * keeps scrolling until either everything has decoded or the budget runs out,
 * rather than scrolling once and hoping.
 */
export async function imagesSettled(page: Page, budgetMs = 45_000): Promise<void> {
  const deadline = Date.now() + budgetMs;

  while (Date.now() < deadline) {
    const pending = await page.evaluate(
      () =>
        Array.from(document.images).filter((img) => !img.complete || img.naturalWidth === 0).length,
    );
    if (pending === 0) return;

    // Nudge the remaining ones into view, then give the network a moment.
    await page.evaluate(() => {
      const next = Array.from(document.images).find(
        (img) => !img.complete || img.naturalWidth === 0,
      );
      next?.scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(400);
  }

  const stuck = await page.$$eval('img', (images) =>
    images
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute('src') ?? '(no src)'),
  );
  throw new Error(`Images never finished loading: ${stuck.join(', ')}`);
}

export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

/**
 * Wait until every reveal has finished transitioning.
 *
 * axe computes contrast from the *rendered* colour, so scanning while an
 * element is at opacity 0.95 blends it with the background and reports a false
 * positive. This waits for the real end state.
 */
export async function revealsSettled(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll('[data-revealed]')).every((node) => {
        if (node.getAttribute('data-revealed') !== 'true') return true;
        return Number(getComputedStyle(node).opacity) >= 0.999;
      }),
    undefined,
    { timeout: 15_000 },
  );
}

/**
 * Wait until no CSS animation or transition is still running.
 *
 * axe reads rendered colour, so scanning an element mid-fade blends it with
 * whatever is behind and reports contrast failures that do not exist in the
 * settled state. The hero's 15s Ken Burns is excluded: it runs for the whole
 * visit by design and never affects colour.
 */
export async function animationsSettled(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        .filter((animation) => {
          const name = (animation as CSSAnimation).animationName;
          return name !== 'lt-zoom-out';
        })
        .every((animation) => animation.playState !== 'running'),
    undefined,
    { timeout: 10_000 },
  );
}
