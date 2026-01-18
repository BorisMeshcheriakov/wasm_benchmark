import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const start = performance.now();
  page.on('console', msg => { const type = msg.type(); const text = msg.text(); console.log(`[browser:${type}] ${text}`); });
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  const end = performance.now();

  console.log(`Load time: ${(end - start).toFixed(2)} ms`);

  await browser.close();
}

run();
