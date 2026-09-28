import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('review', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const id of ['home', 'dresscode', 'location', 'rsvp', 'note']) {
    await page.goto(`http://127.0.0.1:5173/#${id}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.page-footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(image => image.complete));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `review/desktop-${id}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of ['home', 'dresscode', 'note', 'rsvp']) {
    await page.goto(`http://127.0.0.1:5173/#${id}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.page-footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(image => image.complete));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `review/mobile-${id}.png`, fullPage: true });
  }
  console.log('Review screenshots saved in review/.');
} finally {
  await browser.close();
}
