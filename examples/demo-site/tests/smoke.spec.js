// Smoke tests: the page loads clean, navigation and the form behave, dark mode persists, 404 works.
const { test, expect } = require('@playwright/test');

test('home loads without console errors or failed requests', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('fonts.g')) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Kiln & Bean/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test('menu link navigates and the mobile menu closes', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    const toggle = page.getByRole('button', { name: 'Menu' });
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
  await page.getByRole('link', { name: 'Menu', exact: true }).click();
  await expect(page).toHaveURL(/#menu$/);
  if (isMobile) await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
});

test('contact form validates, then submits through the labelled mock', async ({ page }) => {
  await page.goto('/#contact');
  await expect(page.getByText('Demo site: messages are not sent anywhere.')).toBeVisible();
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('#name-error')).toHaveText(/name/i);
  await expect(page.locator('#name')).toBeFocused();
  await page.fill('#name', 'Asha Patel');
  await page.fill('#email', 'not-an-email');
  await page.fill('#message', 'Two seats for the 10:00 wheel class on Saturday, please.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('#email-error')).toHaveText(/email/i);
  await page.fill('#email', 'asha@example.com');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('.form__status')).toHaveText(/within a working day/, { timeout: 5000 });
  await expect(page.locator('#name')).toHaveValue('');
});

test('dark mode toggles and survives a reload', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#1c1613');
});

test('404 page has a way back', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('menu');
  await expect(page.getByRole('link', { name: 'Back to the front' })).toHaveAttribute('href', '/');
});

test('reduced motion collapses the motion tokens and reveals are visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const tokens = await page.evaluate(() => { const c = getComputedStyle(document.documentElement); return [c.getPropertyValue('--duration-3').trim(), c.getPropertyValue('--rise').trim()]; });
  expect(tokens).toEqual(['1ms', '0px']);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-form')).toHaveCSS('opacity', '1');
});

test('sections below the fold reveal once scrolled to', async ({ page }) => {
  await page.goto('/');
  await page.locator('#menu').scrollIntoViewIfNeeded();
  await expect(page.locator('.menu-group').first()).toHaveCSS('opacity', '1', { timeout: 3000 });
});
