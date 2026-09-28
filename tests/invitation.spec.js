import { test, expect } from '@playwright/test';

async function expectPageInViewport(page, id) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await page.evaluate(() => new Promise(requestAnimationFrame));
  const bounds = await page.locator('.page').evaluate(el => {
    const pageRect = el.getBoundingClientRect();
    const mainRect = el.parentElement.getBoundingClientRect();
    return {
      top: pageRect.top - mainRect.top,
      bottom: pageRect.bottom - mainRect.top,
      mainHeight: mainRect.height,
      overflow: getComputedStyle(el.parentElement).overflowY,
    };
  });
  expect(bounds.top, id).toBeGreaterThanOrEqual(-1);
  expect(bounds.bottom, id).toBeLessThanOrEqual(bounds.mainHeight + 1);
  expect(bounds.overflow, id).toBe('hidden');
}

test('navigation, direct links, history and assets work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'home');
  await expect(page.getByText('Mohd Shahizwan Mohammad Shahari', {exact:true})).toBeVisible();
  await page.getByRole('button', {name:'Halaman seterusnya: Pakaian'}).click();
  await expect(page.locator('[data-page="dresscode"][aria-current]')).toBeVisible();
  await expect(page.locator('.dress-piece')).toHaveCount(16);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'location');
  await page.goBack();
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await page.goto('/#note');
  await page.reload();
  await expect(page.locator('.letter')).toContainText('Takdir kami sentiasa dipelihara');
  await expect(page.locator('.memory img')).toHaveCount(6);
  await page.locator('.memory-6').scrollIntoViewIfNeeded();
  await expect.poll(()=>page.locator('main img').evaluateAll(imgs=>imgs.every(img=>img.complete && img.naturalWidth>0))).toBe(true);
  await page.goto('/#missing');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'home');
  expect(errors).toEqual([]);
});

test('venue and contact links use supplied values', async ({ page }) => {
  await page.goto('/#location');
  const map = page.getByRole('link',{name:'Buka Google Maps'});
  await expect(map).toHaveAttribute('href', /query=Dewan%20Perdana%2C%20Tampin%2C%20Negeri%20Sembilan/);
  await expect(page.locator('a[href^="https://wa.me/60192767122"]')).toContainText('Azfar Jamil');
  await expect(page.locator('a[href^="https://wa.me/601129922304"]')).toContainText('Wan');
});

test('RSVP validates, preserves drafts, and never sends or persists responses', async ({ page }) => {
  const requests=[];
  page.on('request', request=>{if(['fetch','xhr'].includes(request.resourceType())) requests.push(request.url());});
  await page.goto('/#rsvp');
  await page.getByRole('button',{name:'Hantar RSVP'}).click();
  await expect(page.locator('#name-error')).toBeVisible();
  await expect(page.locator('#attendance-error')).toBeVisible();
  await page.getByLabel('Nama penuh').fill('   ');
  await page.getByRole('button',{name:'Hantar RSVP'}).click();
  await expect(page.getByLabel('Nama penuh')).toBeFocused();
  await page.getByLabel('Nama penuh').fill('Tetamu Ujian');
  await page.locator('input[value="yes"]').check();
  await page.getByRole('spinbutton').fill('0');
  await page.getByRole('button',{name:'Hantar RSVP'}).click();
  await expect(page.locator('#pax-error')).toBeVisible();
  await page.getByRole('spinbutton').fill('2.5');
  await page.getByRole('button',{name:'Hantar RSVP'}).click();
  await expect(page.locator('#pax-error')).toBeVisible();
  await page.getByRole('spinbutton').fill('100');
  await page.getByRole('button',{name:'Hantar RSVP'}).click();
  await expect(page.locator('#pax-error')).toBeVisible();
  await page.getByRole('spinbutton').fill('2');
  await page.getByLabel('Nama penuh').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main')).toHaveAttribute('data-page','rsvp');
  await page.locator('nav a[href="#home"]').click();
  await page.locator('nav a[href="#rsvp"]').click();
  await expect(page.getByLabel('Nama penuh')).toHaveValue('Tetamu Ujian');
  await expect(page.getByRole('spinbutton')).toHaveValue('2');
  await page.getByRole('button',{name:'Hantar RSVP'}).click();
  await expect(page.locator('.demo-confirmation')).toContainText('belum disimpan atau dihantar');
  await page.getByRole('button',{name:'Kembali ke borang'}).click();
  await page.locator('input[value="no"]').check();
  await expect(page.locator('.pax-field')).toBeHidden();
  await page.getByRole('button',{name:'Hantar RSVP'}).click();
  await expect(page.locator('h1')).toContainText('dalam doa');
  expect(requests).toEqual([]);
  expect(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length}))).toEqual({local:0,session:0});
  await page.reload();
  await expect(page.getByLabel('Nama penuh')).toHaveValue('');
});

for(const width of [320,390,768,1440]) {
  test(`all pages fit at ${width}px with no broken images`, async ({ page })=>{
    await page.setViewportSize({width,height:900});
    for(const id of ['home','dresscode','location','rsvp','note']) {
      await page.goto(`/#${id}`);
      await page.evaluate(()=>document.fonts.ready);
      await expect(page.locator('#page-title')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect.poll(()=>page.locator('main img').evaluateAll(imgs=>imgs.every(img=>img.complete && img.naturalWidth>0))).toBe(true);
      await expectPageInViewport(page, id);
    }
  });
}

test('mobile menu and reduced motion',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('#site-nav')).toBeHidden();
  await page.getByRole('button',{name:'Buka menu'}).click();
  await expect(page.locator('#site-nav')).toBeVisible();
  await page.locator('nav a[href="#dresscode"]').click();
  await expect(page.locator('main')).toHaveAttribute('data-page','dresscode');
  await expect(page.locator('#site-nav')).toBeHidden();
  await expect(page.locator('h1')).toBeFocused();
  expect(await page.locator('.page').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('button',{name:'Buka menu'}).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#site-nav')).toBeHidden();
});

test('wheel turns one page per gesture without skipping or wrapping', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.mouse.move(1000, 35);
  await page.mouse.wheel(0, 120);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  // Simulate a continuous trackpad momentum tail across the transition.
  for (let i = 0; i < 9; i++) {
    await page.mouse.wheel(0, 85);
    await page.waitForTimeout(80);
  }
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await page.waitForTimeout(250);
  await page.mouse.wheel(0, -120);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'home');
  await page.waitForTimeout(700);
  await page.mouse.wheel(0, -150);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'home');
  await page.goto('/#note');
  await page.waitForTimeout(700);
  await page.mouse.wheel(0, 150);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'note');
});

for (const viewport of [{ width: 1366, height: 768 }, { width: 1440, height: 900 }]) {
  test(`all five pages are fully visible at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const id of ['home', 'dresscode', 'location', 'rsvp', 'note']) {
      await page.goto(`/#${id}`);
      await expectPageInViewport(page, id);
      const footer = await page.locator('.page-footer').boundingBox();
      expect(footer.y + footer.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(viewport.height);
    }
  });
}

test('short-screen content scales and one downward scroll opens the next page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto('/#rsvp');
  await expectPageInViewport(page, 'rsvp');
  await page.mouse.move(200, 100);
  await page.mouse.wheel(0, 200);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'note');
  await expectPageInViewport(page, 'note');
});

test('scroll does not navigate from form controls or an open menu', async ({ page }) => {
  await page.goto('/#rsvp');
  await page.getByLabel('Nama penuh').hover();
  await page.mouse.wheel(0, 250);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'rsvp');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await page.mouse.move(200, 300);
  await page.mouse.wheel(0, 250);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'rsvp');
});

test('touch swipe changes pages and vertical keyboard navigation works', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#dresscode');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 790 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 690 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('main')).toHaveAttribute('data-page', 'location');
  await page.waitForTimeout(700);
  await page.keyboard.press('PageUp');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
});
