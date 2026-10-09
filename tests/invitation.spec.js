import { test, expect } from '@playwright/test';
import { brideSite } from '../src/config/bride.js';
import { groomSite } from '../src/config/groom.js';

async function expectPageInViewport(page, id) {
  await expect(page.locator('main')).toHaveAttribute('data-page', id);
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
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
  await expect(page.locator('.home-flower')).toHaveAttribute('src', '/assets/home-daisies-transparent.png');
  await expect(page.locator('.home-flower')).toHaveAttribute('alt', '');
  expect(await page.locator('.home-flower').evaluate(async image => {
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, 1, 1, 0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data[3];
  })).toBe(0);

  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.png');
  const favicon = await page.request.get('/favicon.png');
  expect(favicon.ok()).toBe(true);
  expect(favicon.headers()['content-type']).toContain('image/png');
  expect(await page.locator('link[rel="icon"]').evaluate(async link => {
    const image = new Image();
    image.src = link.href;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, 128, 128).data;
    return pixels[3] === 0 && pixels.some((channel, index) => index % 4 === 3 && channel > 200);
  })).toBe(true);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe('rgb(229, 228, 226)');
  await expect(page.locator('.sidebar')).toHaveCSS('background-color', 'rgb(229, 228, 226)');
  await expect(page.locator('.desktop-header')).toHaveText('WALIMATULURUS');
  await expect(page.locator('.couple-names')).toContainText('Anis');
  await expect(page.locator('.venue-name')).toHaveText('Negeri Sembilan');
  await expect(page.locator('.venue-region')).toHaveCount(0);
  expect(await page.locator('.couple-names').evaluate(element => getComputedStyle(element).color)).toBe('rgb(45, 86, 138)');
  await expect(page.locator('.bride-name')).toHaveText('Anis');
  await expect(page.locator('.bride-initial')).toHaveCount(0);
  expect(await page.locator('.bride-name').evaluate(element => getComputedStyle(element).fontFamily)).toContain('Allura');
  await expect(page.locator('.full-names')).toHaveCount(0);
  await expect(page.locator('.home-intro, .parents, .home-rsvp, .sidebar-bottom, .mobile-date')).toHaveCount(0);
  await expect(page.locator('nav')).toContainText('Event Details');
  await expect(page.locator('nav')).toContainText('Jemputan');
  await expect(page.locator('nav')).toContainText('🤍');
  await page.locator('nav a[href="#invitation"]').click();
  await expect(page.locator('[data-page="invitation"][aria-current]')).toBeVisible();
  await page.locator('nav a[href="#dresscode"]').click();
  await expect(page.locator('[data-page="dresscode"][aria-current]')).toBeVisible();
  await expect(page.locator('.dress-piece')).toHaveCount(0);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'location');
  await page.goBack();
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await page.goto('/#note');
  await page.reload();
  await expect(page.locator('main .letter')).toHaveCSS('background-image', /letter-paper\.svg/);
  expect((await page.request.get('/assets/letter-paper.svg')).ok()).toBe(true);
  await expect(page.locator('.desktop-header')).toBeVisible();
  await expect(page.locator('.desktop-header')).toContainText('WALIMATULURUS');
  await expect(page.locator('.page-footer')).toHaveCount(0);
  await expect(page.locator('.scroll-hint')).toHaveCount(0);
  await expect(page.locator('.section-heading, .paper-tape, .flourish, .letter-greeting, .signature, .note-bottom')).toHaveCount(0);
  await expect(page.locator('.letter p')).toHaveText([
    'This day would not feel complete without you. Your doa, your prayers, your restu have made this day happen.',
    'Dalam setiap doa dan restu yang diterima, kami dipertemukan dan ditakdirkan sampai ke sini. Our takdir has always been cared for and guided in the most beautiful ways through you.',
    'Terima kasih daripada kami untuk semua doa-doa yang baik. Terima kasih sudi luangkan masa untuk raikan kami. Semoga hari kita nanti diberkati dan menjadi satu memori yang indah untuk semua.',
    'Jumpa nanti, we can’t wait to see you!',
    '🤍 Shahizwan & Anis Jamilah',
  ]);
  await expect(page.locator('.memory figcaption')).toHaveCount(0);
  await expect(page.locator('.memory img')).toHaveCount(6);
  await expect(page.locator('.memory img').first()).toHaveAttribute('src', '/assets/croped/shah1-trim-desktop.webp');
  expect(await page.locator('.memory img').evaluateAll(images => images.map(image => image.getAttribute('src').split('/').pop()))).toEqual([
    'shah1-trim-desktop.webp', 'anis3baru-trim-desktop.webp', 'shah2-trim-desktop.webp', 'anis2-trim-desktop.webp', 'shah3baru-trim-desktop.webp', 'anis1-trim-desktop.webp',
  ]);
  await page.locator('.memory-6').scrollIntoViewIfNeeded();
  await expect.poll(()=>page.locator('main img').evaluateAll(imgs=>imgs.every(img=>img.complete && img.naturalWidth>0))).toBe(true);
  await page.goto('/#missing');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'home');
  expect(errors).toEqual([]);
});

test('bride invitation uses supplied wording and preview query remains separate', async ({ page }) => {
  await page.goto('/?invite=perempuan#invitation');
  await expect(page.locator('nav a[href="#invitation"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('nav a')).toHaveCount(6);
  await expect(page.locator('.bismillah')).toHaveText('بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ');
  await expect(page.locator('.bismillah')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#page-title')).toHaveText('Jemputan');
  await expect(page.locator('#page-title')).toHaveClass(/sr-only/);
  await expect(page.locator('.invitation-copy p')).toHaveText([
    'Dengan penuh kesyukuran dan rasa hormat',
    "Dato' Ir. Jamlus Aziz&Datin Hamidah Mansor",
    'menjemput',
    'Tan Sri / Puan Sri / Dato’ / Datin / Tuan / Puan / Encik / Cik',
    'ke majlis walimatulurus puteri kesayangan kami bersama pasangan pilihan hatinya',
    'Mohd Shahizwan Mohammad Shahari&Anis Jamilah Jamlus',
  ]);
  expect(await page.locator('.invitation-hosts').evaluate(element => getComputedStyle(element).textTransform)).toBe('uppercase');
  expect(await page.locator('.invitation-name-bride').evaluate(element => getComputedStyle(element).fontFamily)).toContain('Great Vibes');
  expect(await page.locator('.invitation-name-groom').evaluate(element => getComputedStyle(element).fontFamily)).toContain('Great Vibes');
  await expect(page.locator('.invitation-couple > span')).toHaveText([
    'Mohd Shahizwan Mohammad Shahari',
    '&',
    'Anis Jamilah Jamlus',
  ]);
  await page.setViewportSize({width:390,height:844});
  expect(await page.locator('.invitation-hosts').evaluate(element => getComputedStyle(element).textTransform)).toBe('uppercase');
  expect(await page.locator('.invitation-name-bride').evaluate(element => getComputedStyle(element).fontFamily)).toContain('Great Vibes');
  expect(await page.locator('.invitation-name-groom').evaluate(element => getComputedStyle(element).fontFamily)).toContain('Great Vibes');
  expect(await page.locator('.invitation-couple > span').evaluateAll(elements => elements.every(element => getComputedStyle(element).whiteSpace === 'nowrap'))).toBe(true);
  expect(await page.locator('.invitation-couple').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.setViewportSize({width:320,height:844});
  expect(await page.locator('.invitation-couple').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.goto('/?invite=lelaki#home');
  await expect(page.locator('nav a[href="#invitation"]')).toHaveCount(0);
  await expect(page.locator('nav a')).toHaveCount(5);
  await page.setViewportSize({width:1440,height:900});
  await page.locator('nav a[href="#dresscode"]').click();
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await page.goto('/?invite=lelaki#invitation');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'home');
});

test('bride and groom site configs contain their own invitation copy', () => {
  expect(brideSite.showInvitationPage).toBe(true);
  expect(brideSite.invitation.hosts).toEqual(["Dato' Ir. Jamlus Aziz", 'Datin Hamidah Mansor']);
  expect(brideSite.invitation.event).toContain('puteri kesayangan kami');
  expect(brideSite.invitation.firstName).toBe('Mohd Shahizwan Mohammad Shahari');
  expect(brideSite.invitation.firstNameRole).toBe('groom');
  expect(brideSite.invitation.secondName).toBe('Anis Jamilah Jamlus');
  expect(brideSite.invitation.secondNameRole).toBe('bride');
  expect(groomSite.showInvitationPage).toBe(true);
  expect(groomSite.inviteSide).toBe('lelaki');
  expect(groomSite.invitation.hosts).toEqual(['Mohammad Shahari Ludin', 'Sariah Datok Gempa Borhan']);
  expect(groomSite.invitation.event).toBe('ke majlis walimatulurus putera kesayangan kami bersama pasangan pilihan hatinya');
  expect(groomSite.invitation.firstName).toBe('Mohd Shahizwan Mohammad Shahari');
  expect(groomSite.invitation.firstNameRole).toBe('groom');
  expect(groomSite.invitation.secondName).toBe('Anis Jamilah Jamlus');
  expect(groomSite.invitation.secondNameRole).toBe('bride');
});

test('venue and contact links use supplied values', async ({ page }) => {
  await page.goto('/#location');
  await expect(page.locator('.contact')).toHaveCount(2);
  await expect(page.locator('.location-details')).not.toContainText('Majlis resepsi');
  await expect(page.locator('.venue-lineart')).toHaveAttribute('src', '/assets/dewan_sketch-transparent.png');
  await expect(page.locator('.venue-lineart')).toBeVisible();
  await expect(page.locator('.venue-lineart')).toHaveJSProperty('naturalWidth', 1526);
  await expect(page.locator('.fan')).toHaveCount(0);
  const map = page.getByRole('link',{name:'Buka Google Maps'});
  await expect(map).toHaveAttribute('href', /query=Dewan%20Perdana%2C%20Tampin%2C%20Negeri%20Sembilan/);
  await expect(page.locator('a[href^="https://wa.me/60192767122"]')).toContainText('Azfar Jamil');
  await expect(page.locator('a[href^="https://wa.me/60123245122"]')).toContainText('Aiman Jamil');
  await expect(page.locator('a[href^="https://wa.me/601129922304"]')).toHaveCount(0);
  await page.goto('/?invite=lelaki#location');
  await expect(page.locator('.contact')).toHaveCount(1);
  await expect(page.locator('.contact')).toContainText('Wan');
  await page.goto('/?invite=perempuan#location');
  await expect(page.locator('.contact')).toHaveCount(2);
  await expect(page.locator('a[href^="https://wa.me/60123245122"]')).toContainText('Aiman Jamil');
  await expect(page.locator('a[href^="https://wa.me/60192767122"]')).toContainText('Azfar Jamil');
  await page.goto('/?invite=lelaki#location');
  await expect(page.locator('.contact')).toHaveCount(1);
  await expect(page.locator('.contact')).toContainText('Wan');
});

test('desktop note portraits stay clear of the letter and within main', async ({ page }) => {
  for (const { width, height } of [{ width: 1151, height: 768 }, { width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize({ width, height });
    await page.goto('/#note');
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.locator('main .memory img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    const result = await page.evaluate(() => {
      const paragraphs = [...document.querySelectorAll('main .letter p')].map(element => element.getBoundingClientRect());
      const portraits = [...document.querySelectorAll('main .memory img')].map(image => image.getBoundingClientRect());
      const main = document.querySelector('#main').getBoundingClientRect();
      return {
        overlapsText: portraits.some(image => paragraphs.some(line => image.left < line.right && image.right > line.left && image.top < line.bottom && image.bottom > line.top)),
        overflowsMain: portraits.some(image => image.bottom > main.bottom),
        photoWidths: portraits.map(image => image.width),
      };
    });
    expect(result.overlapsText, `${width}px text`).toBe(false);
    expect(result.overflowsMain, `${width}px main`).toBe(false);
    if (width === 1920) {
      expect(result.photoWidths[0]).toBeGreaterThan(100);
      expect(result.photoWidths[1]).toBeGreaterThan(150);
    }
  }
});

test('RSVP validates, preserves drafts, and never sends or persists responses', async ({ page }) => {
  const requests=[];
  page.on('request', request=>{if(['fetch','xhr'].includes(request.resourceType())) requests.push(request.url());});
  await page.goto('/#rsvp');
  await expect(page.locator('#page-title')).toHaveText('RSVP');
  await expect(page.locator('.desktop-header')).toBeVisible();
  await expect(page.locator('.desktop-header')).toContainText('WALIMATULURUS');
  await expect(page.locator('.page-footer')).toHaveCount(0);
  await expect(page.locator('.demo-notice, .rsvp-signoff, .option-subtitle')).toHaveCount(0);
  await expect(page.getByLabel('Saya akan hadir')).toBeVisible();
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
    for(const id of ['home','invitation','dresscode','location','rsvp','note']) {
      await page.goto(`/#${id}`);
      await page.evaluate(()=>document.fonts.ready);
      await expect(page.locator('#page-title')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect.poll(()=>page.locator('main img').evaluateAll(imgs=>imgs.every(img=>img.complete && img.naturalWidth>0))).toBe(true);
      if (id === 'note' && width <= 767) {
        const overlaps = await page.evaluate(() => {
          const text = [...document.querySelectorAll('main .letter p')].map(element => element.getBoundingClientRect());
          return [...document.querySelectorAll('main .memory')].map(image => {
            const box = image.getBoundingClientRect();
            return text.some(line => box.left < line.right && box.right > line.left && box.top < line.bottom && box.bottom > line.top);
          });
        });
        expect(overlaps).toEqual([false, false, false, false, false, false]);
        const portraitWidths = await page.locator('main .memory img').evaluateAll(images => images.map(image => image.getBoundingClientRect().width));
        expect(Math.min(...portraitWidths)).toBeGreaterThan(width === 320 ? 80 : 100);
        expect(portraitWidths[4]).toBeGreaterThan(portraitWidths[3] * 1.08);
        expect(Math.abs(portraitWidths[5] - portraitWidths[3])).toBeLessThan(3);
        expect(await page.locator('main .memory-6').evaluate(element => getComputedStyle(element).maskImage)).toBe('none');
        const lowerPhotoGap = await page.evaluate(() => {
          const middle = document.querySelector('main .memory-5').getBoundingClientRect();
          const right = document.querySelector('main .memory-6').getBoundingClientRect();
          return right.left - middle.right;
        });
        expect(lowerPhotoGap).toBeGreaterThan(0);
      }
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
  await expect(page.locator('.sidebar.is-open')).toHaveCSS('background-color', 'rgb(229, 228, 226)');
  await page.locator('nav a[href="#dresscode"]').click();
  await expect(page.locator('main')).toHaveAttribute('data-page','dresscode');
  await expect(page.locator('#site-nav')).toBeHidden();
  await expect(page.locator('h1')).toBeFocused();
  expect(await page.locator('.page').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('button',{name:'Buka menu'}).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#site-nav')).toBeHidden();
});

test('mobile shows the official monogram and uses menu without a footer', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#home');
  await expect(page.locator('.mobile-header .wordmark img')).toHaveAttribute('src', '/assets/monogram-bold-transparent.png');
  await expect(page.locator('.mobile-header .wordmark')).toBeVisible();
  expect(await page.locator('.mobile-header .wordmark').evaluate(element => {
    const logo = element.getBoundingClientRect();
    const header = element.closest('.mobile-header').getBoundingClientRect();
    return {left: Math.abs(logo.left - header.left), width: logo.width};
  })).toEqual({left:0, width:64});
  await expect(page.getByRole('button',{name:'Buka menu'})).toBeVisible();
  await expect(page.locator('.page-footer')).toHaveCount(0);
  for (const next of ['invitation','dresscode','location','rsvp','note']) {
    await page.getByRole('button',{name:'Buka menu'}).click();
    await page.locator(`nav a[href="#${next}"]`).click();
    await expect(page.locator('main')).toHaveAttribute('data-page',next);
  }
  await page.setViewportSize({width:1440,height:900});
  await expect(page.locator('.page-footer')).toHaveCount(0);
});

test('wheel turns one page per gesture without skipping or wrapping', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.mouse.move(1000, 35);
  await page.mouse.wheel(0, 35);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'invitation');
  // Simulate a continuous trackpad momentum tail across the transition.
  for (let i = 0; i < 9; i++) {
    await page.mouse.wheel(0, 85);
    await page.waitForTimeout(80);
  }
  await expect(page.locator('main')).toHaveAttribute('data-page', 'invitation');
  await page.waitForTimeout(400);
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
  test(`all six pages are fully visible at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const id of ['home', 'invitation', 'dresscode', 'location', 'rsvp', 'note']) {
      await page.goto(`/#${id}`);
      await expectPageInViewport(page, id);
      if (viewport.width > 767) {
        await expect(page.locator('.desktop-header')).toBeVisible();
        await expect(page.locator('.desktop-header')).toContainText('WALIMATULURUS');
      }
      await expect(page.locator('.page-footer')).toHaveCount(0);
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
  const clearances = await page.evaluate(() => {
    const portraits = [...document.querySelectorAll('main .memory')].map(image => image.getBoundingClientRect());
    const paragraphs = [...document.querySelectorAll('main .letter p')].map(text => text.getBoundingClientRect());
    const header = document.querySelector('.mobile-header').getBoundingClientRect();
    const main = document.querySelector('#main').getBoundingClientRect();
    return {
      text: portraits.some(image => paragraphs.some(text => image.left < text.right && image.right > text.left && image.top < text.bottom && image.bottom > text.top)),
      header: portraits.some(image => image.top < header.bottom),
      main: portraits.some(image => image.bottom > main.bottom),
    };
  });
  expect(clearances).toEqual({text:false, header:false, main:false});
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

test('horizontal swipes navigate both ways while vertical swipes stay on the page', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#dresscode');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 740 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 700 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 280, y: 740 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 170, y: 740 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('main')).toHaveAttribute('data-page', 'location');
  await page.waitForTimeout(700);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 100, y: 740 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 210, y: 740 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await page.waitForTimeout(700);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'location');
  await page.waitForTimeout(700);
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
});

test('mobile note preloads lightweight portraits and uses the clean mobile cutout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const portraitRequests = new Set();
  page.on('request', request => {
    if (request.url().includes('/assets/croped/')) portraitRequests.add(request.url().split('/').pop());
  });
  await page.goto('/#home');
  await expect.poll(() => portraitRequests.size).toBe(6);
  expect([...portraitRequests].every(name => name.endsWith('-mobile.webp'))).toBe(true);
  expect(portraitRequests.has('anis3baru-clean-mobile.webp')).toBe(true);
  await page.evaluate(() => { location.hash = 'note'; });
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  const images = page.locator('main .memory img');
  await expect(images).toHaveCount(6);
  await images.evaluateAll(images => Promise.all(images.map(image => image.decode())));
  expect(await images.evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0 && image.currentSrc.endsWith('-mobile.webp') && image.loading === 'eager'))).toBe(true);
});
