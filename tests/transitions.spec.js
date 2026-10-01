import { test, expect } from '@playwright/test';

test('horizontal transition handles interrupted navigation without stale pages or overlays', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('nav a[href="#dresscode"]').click();
  await expect(page.locator('.site-transition-old')).toHaveCount(1);
  await expect(page.locator('.site-transition-new')).toHaveCount(1);
  // A later explicit destination must win while the previous sheet is moving.
  await page.evaluate(() => { location.hash = 'note'; });
  await expect(page.locator('main')).toHaveAttribute('data-page', 'note');
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  await expect(page.locator('.site-transition-layer')).toHaveCount(0);
  await expect(page.locator('.page')).toHaveCount(1);
  await expect(page.locator('#page-title')).toBeFocused();
  await page.locator('nav a[href="#rsvp"]').click();
  await expect(page.locator('main')).toHaveAttribute('data-page', 'rsvp');
  await page.getByLabel('Nama penuh').fill('Tetamu Animasi');
  await page.locator('nav a[href="#home"]').click();
  await expect(page.locator('main')).toHaveAttribute('data-page', 'home');
  await page.locator('nav a[href="#rsvp"]').click();
  await expect(page.getByLabel('Nama penuh')).toHaveValue('Tetamu Animasi');
  expect(errors).toEqual([]);
});

test('dresscode sketch filter stays attached in the outgoing transition layer', async ({ page }) => {
  await page.goto('/#dresscode');
  await expect(page.locator('.filter-defs filter#dresscode-sketch')).toHaveCount(1);
  await page.locator('nav a[href="#location"]').click();
  const outgoing = page.locator('.site-transition-old');
  await expect(outgoing).toHaveCount(1);
  await expect(outgoing.locator('.filter-defs filter#dresscode-sketch')).toHaveCount(1);
  const filter = await outgoing.locator('.piece-art').first().evaluate(element => getComputedStyle(element).filter);
  expect(filter).toContain('dresscode-sketch');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'location');
});

test('reduced motion and resize settle a transition with the correct destination', async ({ page }) => {
  await page.goto('/');
  await page.locator('nav a[href="#note"]').click();
  await expect(page.locator('.site-transition-layer')).toHaveCount(2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('main')).toHaveAttribute('data-page', 'note');
  await expect(page.locator('.site-transition-layer')).toHaveCount(0);
  expect(await page.locator('main').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('nav a[href="#dresscode"]').click();
  await page.setViewportSize({ width: 390, height: 600 });
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await expect(page.locator('.site-transition-layer')).toHaveCount(0);
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
});
