import { expect, test, type Page } from '@playwright/test';
import { settleHome, skipLoader } from './helpers';

const sheet = (page: Page) => page.getByRole('dialog');

async function openSheet(page: Page, name: RegExp): Promise<void> {
  await page.getByRole('button', { name }).first().click();
  await expect(sheet(page)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await skipLoader(page);
  await page.goto('/');
  await settleHome(page);
});

test.describe('booking sheet', () => {
  test('opens from the header as a real modal dialog', async ({ page }) => {
    await openSheet(page, /^book now$/i);

    const dialog = sheet(page);
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAccessibleName(/check availability/i);
  });

  test('lands focus on the destination field', async ({ page }) => {
    await openSheet(page, /^book now$/i);
    await expect(page.getByRole('combobox', { name: /where to next/i })).toBeFocused();
  });

  test('the floating bar Day use button preselects the day-use toggle', async ({ page }) => {
    await openSheet(page, /^day use$/i);

    const dayUse = page.getByRole('radio', { name: 'Day use' });
    await expect(dayUse).toHaveAttribute('data-state', 'on');
    // The check-out label follows the stay type.
    await expect(sheet(page).getByText('Check-out time')).toBeVisible();
  });

  test('the floating bar Offers button preselects the special offers tab', async ({ page }) => {
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
    const trigger = page.getByRole('button', { name: /^book now$/i }).first();
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
    await page
      .getByRole('button', { name: /^day use$/i })
      .first()
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /^Check-out time/ }).count();
    await expect(page.getByRole('dialog').getByText('Same day')).toBeVisible();
  });
});
