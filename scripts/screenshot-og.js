import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { unlinkSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlPath = join(__dirname, '..', 'og-image.html');
const outputPath = join(__dirname, '..', 'public', 'img', 'og-image.png');

async function captureOGImage() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ],
    timeout: 60000
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });

  console.log('Loading HTML...');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');

  console.log('Capturing screenshot...');
  await page.screenshot({
    path: outputPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1200, height: 630 }
  });

  await browser.close();

  // Clean up HTML file
  try {
    unlinkSync(htmlPath);
    console.log('Cleaned up temporary HTML file');
  } catch (e) {
    console.log('Could not clean up HTML file:', e.message);
  }

  console.log(`✅ OG Image saved to: ${outputPath}`);
}

captureOGImage().catch(console.error);
