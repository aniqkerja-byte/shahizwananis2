import { test, expect } from '@playwright/test';
import { wedding } from '../src/content.js';

for (const side of ['perempuan', 'lelaki']) {
  test('Location copy and contact filtering for ' + side, async ({ page }) => {
    await page.goto('/?invite=' + side + '#location');
    await expect(page.locator('.assistance-heading')).toHaveText('Untuk Sebarang Bantuan / Pertanyaan Berkaitan Majlis');
    await expect(page.locator('.parking-note')).toHaveText('Tempat Letak Kenderaan: ' + wedding.parkingNote);
    await expect(page.locator('.contact .eyebrow')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText(/Pihak (perempuan|lelaki)/i);
    const contacts = wedding.contacts.filter(c => c.side === 'Pihak ' + side);
    await expect(page.locator('.contact-name')).toHaveText(contacts.map(c => c.name));
    for (const contact of contacts) {
      const link = page.locator('a[href^="https://wa.me/' + contact.international + '"]');
      await expect(link).toContainText(contact.phone);
      await expect(link).toHaveAttribute('href', 'https://wa.me/' + contact.international + '?text=' + encodeURIComponent('Assalamualaikum, saya ingin bertanya tentang majlis Shahizwan & Anis pada 9 Januari 2027.'));
    }
  });
}

for (const viewport of [{width:1440,height:900},{width:1366,height:768},{width:390,height:844},{width:320,height:640}]) {
  test('Parking note remains readable and reachable at ' + viewport.width, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/#location');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
    const layout = await page.locator('main .location-page').evaluate(el => {
      const note=el.querySelector('.parking-note'), heading=el.querySelector('.assistance-heading');
      return {scale:el.style.getPropertyValue('--page-scale'),overflow:el.scrollWidth>el.clientWidth,scrollbar:getComputedStyle(el).scrollbarWidth,noteSize:getComputedStyle(note).fontSize,headingSize:getComputedStyle(heading).fontSize,noteWidth:note.getBoundingClientRect().width,noteTop:note.getBoundingClientRect().top,contactsBottom:el.querySelector('.contacts').getBoundingClientRect().bottom};
    });
    expect(layout.scale).toBe('1');
    expect(layout.overflow).toBe(false);
    expect(layout.scrollbar).toBe('none');
    expect(layout.noteSize).toBe(viewport.width<768?'13px':'14px');
    expect(layout.headingSize).toBe(viewport.width<768?'12px':'14px');
    expect(layout.noteWidth).toBeLessThanOrEqual(560);
    expect(layout.noteTop).toBeGreaterThan(layout.contactsBottom);
    await page.locator('main [data-page-scroll]').evaluate(el=>{el.scrollTop=el.scrollHeight;});
    await expect(page.locator('.parking-note')).toBeInViewport({ratio:1});
  });
}

test('short Location scroll does not change pages and horizontal swipe still does', async ({ page, context }) => {
  await page.setViewportSize({width:320,height:480});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#location');
  const region=page.locator('main [data-page-scroll]');
  await region.hover(); await page.mouse.wheel(0,350);
  await expect.poll(()=>region.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  await region.evaluate(el=>{el.scrollTop=el.scrollHeight;});
  await page.mouse.wheel(0,400);
  await expect(page.locator('main')).toHaveAttribute('data-page','location');
  await region.focus(); await page.keyboard.press('PageUp');
  await expect.poll(()=>region.evaluate(el=>el.scrollTop<el.scrollHeight-el.clientHeight)).toBe(true);
  const cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:240,y:440}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y:440}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(page.locator('main')).toHaveAttribute('data-page','rsvp');
});

test('Location transition preserves scroll; returning starts at the top', async ({page})=>{
  await page.setViewportSize({width:320,height:480}); await page.goto('/#location');
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  const offset=await page.locator('main [data-page-scroll]').evaluate(el=>{el.scrollTop=200;return el.scrollTop;});
  expect(offset).toBeGreaterThan(0);
  await page.evaluate(()=>{location.hash='rsvp';});
  await expect(page.locator('.site-transition-old')).toHaveCount(1);
  expect(await page.locator('.site-transition-old [data-page-scroll]').evaluate(el=>el.scrollTop)).toBe(offset);
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  await page.evaluate(()=>{location.hash='location';});
  await expect(page.locator('main')).toHaveAttribute('data-page','location');
  expect(await page.locator('main [data-page-scroll]').evaluate(el=>el.scrollTop)).toBe(0);
});
