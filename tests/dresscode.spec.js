import { test, expect } from '@playwright/test';
import { wedding } from '../src/content.js';

test('Event Details retains the old link and shows all client content without sketches', async ({ page }) => {
  await page.goto('/#dresscode');
  await expect(page.locator('main #page-title')).toHaveText('Dress Code');
  await expect(page).toHaveTitle('Event Details · Shahizwan & Anis');
  await expect(page.locator('nav a[href="#dresscode"]')).toContainText('Event Details');
  await expect(page.locator('.event-dress-code p')).toHaveText([wedding.eventDetails.dressCode, wedding.eventDetails.dressCodeNote]);
  await expect(page.locator('#schedule-title')).toHaveText('Atur Cara Majlis');
  await expect(page.locator('.event-schedule dt')).toHaveText(['11:00 am', '12:30 pm', '11:00 am – 4:30 pm']);
  await expect(page.locator('.event-schedule dd')).toHaveText(['Ketibaan para tetamu', 'Ketibaan pengantinBacaan doa & salam restu', 'Jamuan makan & beramah mesra']);
  await expect(page.locator('.event-menu h2')).toHaveText('Hidangan');
  await expect(page.locator('.event-menu dt')).toHaveCount(0);
  await expect(page.locator('.event-menu li')).toHaveText(['Biryani', 'Hidangan Sampingan & Pembuka Selera', 'Buah-buahan', 'Kuih-muih Melayu & Manisan', 'Minuman sejuk & panas', 'Air mineral']);
  await expect(page.locator('.dress-piece, .outfit-board, .outfit-tabs, .filter-defs')).toHaveCount(0);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
  test('Event Details responsive layout at ' + viewport.width, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/#dresscode');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
    const layout = await page.locator('main .event-details-page').evaluate(el => {
      const schedule = el.querySelector('.event-schedule').getBoundingClientRect();
      const menu = el.querySelector('.event-menu').getBoundingClientRect();
      return { scheduleTop: schedule.top, scheduleBottom: schedule.bottom, menuTop: menu.top, menuLeft: menu.left, scheduleRight: schedule.right, scale: el.style.getPropertyValue('--page-scale'), horizontalOverflow: el.scrollWidth > el.clientWidth, scheduleSize: getComputedStyle(el.querySelector('.event-schedule')).fontSize };
    });
    expect(layout.scale).toBe('1');
    expect(layout.horizontalOverflow).toBe(false);
    const sides = await page.locator('.event-timeline').evaluate(el => {
      const center = el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2;
      return [...el.querySelectorAll('dt')].map(dt => {
        const box = dt.getBoundingClientRect();
        return box.right < center ? 'left' : box.left > center ? 'right' : 'overlap';
      });
    });
    expect(sides).toEqual(['left', 'right', 'left']);
    const iconSides = await page.locator('.event-timeline').evaluate(el => {
      const center = el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2;
      return [...el.querySelectorAll('.event-timeline-icon')].map(icon => {
        const box = icon.getBoundingClientRect();
        return box.right < center ? 'left' : box.left > center ? 'right' : 'overlap';
      });
    });
    expect(iconSides).toEqual(['left', 'right', 'left']);
    expect(layout.menuTop).toBeGreaterThan(layout.scheduleBottom);
    if (viewport.width < 768) {
      expect(layout.scheduleSize).toBe('16px');
    }
    await page.locator('main [data-page-scroll]').evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect(page.getByText('Air mineral', { exact: true })).toBeInViewport();
  });
}

test('vertical scrolling stays in Event Details at both ends; horizontal navigation still works', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#dresscode');
  const region = page.locator('main [data-page-scroll]');
  await region.hover();
  await page.mouse.wheel(0, 350);
  await expect.poll(() => region.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await region.evaluate(el => { el.scrollTop = el.scrollHeight; });
  await page.mouse.wheel(0, 400);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await region.focus();
  await page.keyboard.press('PageUp');
  await expect.poll(() => region.evaluate(el => el.scrollTop < el.scrollHeight - el.clientHeight)).toBe(true);
  await region.evaluate(el => { el.scrollTop = 0; });
  await page.mouse.wheel(0, -400);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'location');
});

test('native vertical touch scroll reveals the menu and does not switch pages', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#dresscode');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 450 }] });
  for (const y of [400, 340, 280, 220, 150]) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.locator('main [data-page-scroll]').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
});
