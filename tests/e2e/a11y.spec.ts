import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import {
  animationsSettled,
  revealAll,
  revealsSettled,
  settleHome,
  skipLoader,
} from './helpers';

/**
 * WCAG 2.2 AA. The reference fails a number of these (no focus styles, no
 * dialog semantics, no alt text, no reduced motion); this asserts they stay
 * fixed.
 */
const scan = (page: Parameters<typeof AxeBuilder>[0]['page']) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']);

test('home page has no axe violations', async ({ page }) => {
  await skipLoader(page);
  await page.goto('/');
  await settleHome(page);
  await revealAll(page);
  await revealsSettled(page);
  await animationsSettled(page);

  const results = await scan(page).analyze();
  expect(results.violations).toEqual([]);
});

test('the open booking sheet has no axe violations', async ({ page }) => {
  await skipLoader(page);
  await page.goto('/');
  await settleHome(page);

  await page.getByRole('button', { name: /check availability/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await animationsSettled(page);

  const results = await scan(page).analyze();
  expect(results.violations).toEqual([]);
});

test('contact page has no axe violations', async ({ page }) => {
  await skipLoader(page);
  await page.goto('/contact');
  await page.waitForLoadState('domcontentloaded');

  const results = await scan(page).analyze();
  expect(results.violations).toEqual([]);
});

test('search results have no axe violations', async ({ page }) => {
  await skipLoader(page);
  await page.goto(
    '/book/search?destination=siliguri&checkIn=2026-09-01&checkOut=2026-09-03&stay=overnight&adults=2&children=0&rooms=1&tab=online-booking'
  );
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/rates/i);

  const results = await scan(page).analyze();
  expect(results.violations).toEqual([]);
});

test('the mobile menu has no axe violations', async ({ page }) => {
  await skipLoader(page);
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  await settleHome(page);

  await page.getByRole('button', { name: /open menu/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await animationsSettled(page);

  const results = await scan(page).analyze();
  expect(results.violations).toEqual([]);
});
