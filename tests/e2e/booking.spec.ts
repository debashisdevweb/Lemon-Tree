import { expect, test, type Page } from '@playwright/test';
import { settleHome, skipLoader } from './helpers';

const sheet = (page: Page) => page.getByRole('dialog');

/** True below the `sm` breakpoint, where the mobile chrome applies. */
const isNarrow = (page: Page): boolean => (page.viewportSize()?.width ?? 0) < 640;

async function openSheet(page: Page, name: RegExp): Promise<void> {
  await page.getByRole('button', { name }).first().click();
  await expect(sheet(page)).toBeVisible();
}

/**
 * Opens the sheet by a route that exists at every width.
 *
 * The floating bar's primary action is the one constant: the header's "Book
 * now" and the bar's "Day use" / "Offers" are hidden below `sm`, where three
 * competing buttons left none of them clearly primary.
 */
async function openSheetAnywhere(page: Page): Promise<void> {
  await openSheet(page, /check availability/i);
}

test.beforeEach(async ({ page }) => {
  await skipLoader(page);
  await page.goto('/');
  await settleHome(page);
});

test.describe('booking sheet', () => {
  test('opens from the header as a real modal dialog', async ({ page }) => {
    test.skip(isNarrow(page), 'The header CTA is hidden below sm; see the mobile chrome tests.');
    await openSheet(page, /^book now$/i);

    const dialog = sheet(page);
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAccessibleName(/check availability/i);
  });

  test('lands focus on the destination field', async ({ page }) => {
    await openSheetAnywhere(page);
    await expect(page.getByRole('combobox', { name: /where to next/i })).toBeFocused();
  });

  test('the floating bar Day use button preselects the day-use toggle', async ({ page }) => {
    test.skip(isNarrow(page), 'Hidden below sm; the stay toggle inside the sheet covers it.');
    await openSheet(page, /^day use$/i);

    const dayUse = page.getByRole('radio', { name: 'Day use' });
    await expect(dayUse).toHaveAttribute('data-state', 'on');
    // The check-out label follows the stay type.
    await expect(sheet(page).getByText('Check-out time')).toBeVisible();
  });

  test('the floating bar Offers button preselects the special offers tab', async ({ page }) => {
    test.skip(
      isNarrow(page),
      'Hidden below sm; the Special offers tab inside the sheet covers it.',
    );
    await openSheet(page, /^offers$/i);
    await expect(page.getByRole('tab', { name: 'Special offers' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('tabs are real tabs and switch with the arrow keys', async ({ page }) => {
    await openSheet(page, /check availability/i);

    const list = page.getByRole('tablist', { name: /booking type/i });
    await expect(list).toBeVisible();

    const first = page.getByRole('tab', { name: 'Online booking' });
    await expect(first).toHaveAttribute('aria-selected', 'true');

    await first.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Last minute offers' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('the stay toggle swaps the second date label', async ({ page }) => {
    await openSheet(page, /check availability/i);

    await expect(sheet(page).getByText('Departure')).toBeVisible();
    await page.getByRole('radio', { name: 'Day use' }).click();
    await expect(sheet(page).getByText('Check-out time')).toBeVisible();
    await page.getByRole('radio', { name: 'Overnight' }).click();
    await expect(sheet(page).getByText('Departure')).toBeVisible();
  });

  test('closes on Escape, and restores focus to the trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /check availability/i }).first();
    await trigger.click();
    await expect(sheet(page)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(sheet(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('closes on the close button and on a scrim click', async ({ page }) => {
    await openSheet(page, /check availability/i);
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(sheet(page)).toHaveCount(0);

    await openSheet(page, /check availability/i);
    await page.mouse.click(8, 8);
    await expect(sheet(page)).toHaveCount(0);
  });

  test('refuses to search without a destination', async ({ page }) => {
    await openSheet(page, /check availability/i);
    await page.getByRole('button', { name: /^search$/i }).click();

    await expect(page.getByRole('alert')).toContainText(/choose a city or hotel/i);
    await expect(page).toHaveURL('/');
  });

  test('refuses to search without an arrival date', async ({ page }) => {
    await openSheet(page, /check availability/i);

    const combo = page.getByRole('combobox', { name: /where to next/i });
    await combo.fill('siligu');
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: /^search$/i }).click();
    await expect(page.getByRole('alert')).toContainText(/arrival date/i);
  });

  test('completes a search and shows rates', async ({ page }) => {
    await openSheet(page, /check availability/i);

    const combo = page.getByRole('combobox', { name: /where to next/i });
    await combo.fill('siligu');
    await page.getByRole('option').first().click();

    // Picking an arrival seeds a one-night departure and closes the calendar,
    // so the search is valid after a single click.
    await page.getByRole('button', { name: /^Arrival/ }).click();
    await page.getByRole('gridcell').locator('button:not([disabled])').first().click();
    await expect(sheet(page)).toBeVisible();

    // Both dates now read as real dates rather than the em-dash placeholder.
    // A chosen date reads as a full long-form date, so it carries a year.
    await expect(page.getByRole('button', { name: /^Arrival/ })).toHaveAccessibleName(
      /Arrival\s+\w+,\s+\d+\s+\w+\s+\d{4}/,
    );
    await expect(page.getByRole('button', { name: /^Departure/ })).toHaveAccessibleName(
      /Departure\s+\w+,\s+\d+\s+\w+\s+\d{4}/,
    );

    await page.getByRole('button', { name: /^search$/i }).click();

    await expect(page).toHaveURL(/\/book\/search\?/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/rates/i);
    await expect(page.getByRole('listitem').first()).toContainText(/Lemon Tree/);
  });

  test('the guests stepper enforces occupancy limits', async ({ page }) => {
    await openSheet(page, /check availability/i);

    await page.getByRole('button', { name: /^Guests/ }).click();
    const fewerAdults = page.getByRole('button', { name: /one fewer adults/i });
    const moreAdults = page.getByRole('button', { name: /one more adults/i });

    // Default is 2 adults, 1 room -> capacity 4.
    await moreAdults.click();
    await moreAdults.click();
    await expect(moreAdults).toBeDisabled();

    await fewerAdults.click();
    await fewerAdults.click();
    await fewerAdults.click();
    await expect(fewerAdults).toBeDisabled();
  });
});

test.describe('availability API', () => {
  test('rejects an invalid search with 422 and field issues', async ({ request }) => {
    const response = await request.post('/api/availability', {
      data: { stay: 'overnight', destination: '', checkIn: 'nope', checkOut: 'nope' },
    });
    expect(response.status()).toBe(422);

    const body = (await response.json()) as { issues: { path: string }[] };
    expect(body.issues.map((i) => i.path)).toContain('destination');
  });

  test('rejects an unparseable body with 400', async ({ request }) => {
    const response = await request.post('/api/availability', {
      headers: { 'Content-Type': 'application/json' },
      // Deliberately malformed JSON — request.json() must throw, not validate.
      data: Buffer.from('{"stay":'),
    });
    expect(response.status()).toBe(400);
  });

  test('returns validated rates and forbids caching', async ({ request }) => {
    const response = await request.post('/api/availability', {
      data: {
        tab: 'online-booking',
        stay: 'overnight',
        destination: 'siliguri',
        checkIn: '2026-09-01',
        checkOut: '2026-09-03',
        occupancy: { adults: 2, children: 0, rooms: 1 },
      },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toContain('no-store');

    const body = (await response.json()) as {
      rates: { currency: string }[];
      query: { nights: number };
    };
    expect(body.query.nights).toBe(2);
    expect(body.rates.length).toBeGreaterThan(0);
    expect(body.rates.every((rate) => rate.currency === 'INR')).toBe(true);
  });
});

test.describe('date selection', () => {
  test('a single calendar click yields a one-night stay, not a same-day one', async ({ page }) => {
    await page
      .getByRole('button', { name: /check availability/i })
      .first()
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /^Arrival/ }).click();
    await page.getByRole('gridcell').locator('button:not([disabled])').first().click();

    // Departure must be a different day, or the overnight schema rejects it.
    const arrival = await page.getByRole('button', { name: /^Arrival/ }).getAttribute('aria-label');
    const arrivalText = await page.getByRole('button', { name: /^Arrival/ }).textContent();
    const departureText = await page.getByRole('button', { name: /^Departure/ }).textContent();
    expect(arrival ?? arrivalText).toBeTruthy();
    expect(departureText).not.toEqual(arrivalText);
  });

  test('switching to day use collapses departure to the same day', async ({ page }) => {
    // Via the stay toggle inside the sheet, which is the one route that exists
    // at every width — the bar's Day use shortcut is desktop and tablet only.
    await openSheetAnywhere(page);
    await page.getByRole('radio', { name: 'Day use' }).click();
    await expect(page.getByRole('dialog').getByText('Same day')).toBeVisible();
  });
});

test.describe('mobile chrome', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 640, 'Mobile layout only.');

  test('the floating bar offers exactly one action', async ({ page }) => {
    const buttons = page.getByTestId('booking-bar').getByRole('button');
    await expect(buttons).toHaveCount(1);
    await expect(buttons.first()).toHaveText(/check availability/i);
  });

  test('the header is just the wordmark and the menu', async ({ page }) => {
    const header = page.locator('header');
    await expect(header.getByRole('button', { name: /^book now$/i })).toBeHidden();
    await expect(header.getByRole('button', { name: /open menu/i })).toBeVisible();
  });

  test('the menu carries the actions the header drops', async ({ page }) => {
    await page.getByRole('button', { name: /open menu/i }).click();
    const menu = page.getByRole('dialog');
    await expect(menu).toBeVisible();

    // Investors and Sign in have no header slot at this width.
    await expect(menu.getByRole('link', { name: 'Investors' })).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(menu.getByRole('button', { name: /^book now$/i })).toBeVisible();

    // And every section link.
    await expect(menu.getByRole('link', { name: 'Destinations' })).toBeVisible();
  });

  test('the menu opens the booking sheet and closes itself', async ({ page }) => {
    await page.getByRole('button', { name: /open menu/i }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^book now$/i })
      .click();

    // One dialog remains, and it is the booking sheet.
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(page.getByRole('combobox', { name: /where to next/i })).toBeVisible();
  });

  test('the menu is an inset card, not a full-height drawer', async ({ page }) => {
    await page.getByRole('button', { name: /open menu/i }).click();
    const box = await page.getByRole('dialog').boundingBox();
    const viewport = page.viewportSize()!;

    expect(box).not.toBeNull();
    // Inset on every side the card does not need to fill.
    expect(box!.y).toBeGreaterThan(0);
    expect(box!.x).toBeGreaterThan(0);
    expect(box!.height).toBeLessThan(viewport.height);
  });

  test('every form field is at least 16px, so iOS does not zoom on focus', async ({ page }) => {
    await openSheetAnywhere(page);

    const sizes = await page
      .getByRole('dialog')
      .locator('input')
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          name: node.getAttribute('aria-label') ?? node.getAttribute('placeholder') ?? '?',
          px: parseFloat(getComputedStyle(node).fontSize),
        })),
      );

    expect(sizes.length).toBeGreaterThan(0);
    for (const field of sizes) {
      expect(field.px, `${field.name} is ${field.px}px`).toBeGreaterThanOrEqual(16);
    }
  });
});
