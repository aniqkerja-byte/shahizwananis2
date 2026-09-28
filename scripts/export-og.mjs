// Resize and encode the approved imagegen artwork; does not alter its design.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

const source = new URL('../references/og-kenangan-source.png', import.meta.url);
const target = new URL('../public/assets/og-kenangan-v1.jpg', import.meta.url);
const data = await readFile(source);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const jpg = await page.evaluate(async base64 => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext('2d');
    context.fillStyle = '#F7F5EE';
    context.fillRect(0, 0, 1200, 630);
    // Contain the source so no photo, lettering, or frame is cropped.
    const scale = Math.min(1200 / image.width, 630 / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.drawImage(image, (1200 - width) / 2, (630 - height) / 2, width, height);
    return canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
  }, data.toString('base64'));
  const output = Buffer.from(jpg, 'base64');
  await writeFile(target, output);
  console.log(`Open Graph: 1200 x 630 JPEG, ${(output.length / 1024).toFixed(1)} KiB`);
} finally {
  await browser.close();
}
