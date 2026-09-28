// Bundle the unchanged source photos into one labelled reference for imagegen.
import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';

const sources = ['shah-1.jpg', 'shah-2.jpg', 'shah-3.jpg', 'anis-1.jpg', 'anis-2.jpg', 'anis-3.jpg', 'monogram.jpeg'];
const pictures = await Promise.all(sources.map(async (name, index) => {
  const data = await readFile(new URL(`../public/assets/${name}`, import.meta.url));
  return `<figure><figcaption>${index + 1}: ${name}</figcaption><img src="data:image/jpeg;base64,${data.toString('base64')}" /></figure>`;
}));
await mkdir(new URL('../review/', import.meta.url), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1500, height: 1280 }, deviceScaleFactor: 1 });
  await page.setContent(`<style>body{margin:0;background:#fff;font-family:Arial}main{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px}figure{margin:0;height:500px;display:flex;flex-direction:column;align-items:center}figcaption{padding:6px;font-size:20px}img{width:100%;height:460px;object-fit:contain}figure:last-child{height:180px;grid-column:1/4}figure:last-child img{height:140px}</style><main>${pictures.join('')}</main>`);
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
  await page.screenshot({ path: 'review/og-source-reference.png', fullPage: true });
} finally {
  await browser.close();
}
