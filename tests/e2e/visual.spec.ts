import { expect, test } from '@playwright/test';
import { animationsSettled, revealAll, settleHome, skipLoader } from './helpers';

/**
 * Screenshot baselines.
 *
 * The design project ships no reference screenshots (see the audit's Q2), so
 * these baseline against this implementation's own first render. They still do
 * the job that matters day to day: any later change that moves layout,
 * typography or spacing fails until it is reviewed and the baseline is updated
 * deliberately with `npm run e2e:update`.
 */

const SECTIONS = [
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

test.describe('home page @visual', () => {
  test.beforeEach(async ({ page }) => {
    await skipLoader(page);
    await page.goto('/');
    await settleHome(page);
    await revealAll(page);
  });

  /**
   * Diffs are per section rather than one full-page capture. Stitching a
   * full-page shot of a document with three sticky 100vh sections took minutes
   * per viewport and produced an image so large that a one-line change was
   * hard to read in the diff. Section shots are fast and point straight at
   * whatever moved.
   */
  for (const id of SECTIONS) {
    test(`${id} section matches its baseline`, async ({ page }) => {
      const section = page.locator(`#${id}`);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toHaveScreenshot(`home-${id}.png`);
    });
  }
});

test('the booking sheet matches its baseline @visual', async ({ page }) => {
  await skipLoader(page);
  await page.goto('/');
  await settleHome(page);

  await page
    .getByRole('button', { name: /check availability/i })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(700); // let the 600ms slide finish

  await expect(page).toHaveScreenshot('booking-sheet.png');
});

test('the contact page matches its baseline @visual', async ({ page }) => {
  await skipLoader(page);
  await page.goto('/contact');
  await page.waitForLoadState('domcontentloaded');

  // The footer's newsletter form is code-split and mounts after hydration, so
  // waiting for it is what makes this shot deterministic rather than a race.
  await expect(page.getByPlaceholder('Email address')).toBeVisible();
  await animationsSettled(page);

  await expect(page).toHaveScreenshot('contact-full.png', { fullPage: true });
});
