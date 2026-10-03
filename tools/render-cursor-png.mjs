// Rasterize the original SVG sources for the CSS cursor's first, broadly supported image format.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('../assets/cursors/', import.meta.url));
const themes = ['dreama', 'classic', 'soft', 'dark-pro', 'mono'];
const states = [
  'default', 'pointer', 'text', 'wait', 'progress', 'move', 'not-allowed',
  'crosshair', 'help', 'ew-resize', 'ns-resize', 'nwse-resize', 'nesw-resize'
];
const launchOptions = process.platform === 'win32'
  ? { executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' }
  : {};
const browser = await chromium.launch({ headless: true, ...launchOptions });
try {
  const page = await browser.newPage();
  for (const theme of themes) {
    for (const state of states) {
      const svg = await readFile(join(root, theme, `${state}.svg`), 'utf8');
      const encoded = await page.evaluate(async (source) => {
        const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));
        try {
          const image = new Image();
          image.src = url;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          canvas.getContext('2d').drawImage(image, 0, 0, 32, 32);
          return canvas.toDataURL('image/png').split(',')[1];
        } finally {
          URL.revokeObjectURL(url);
        }
      }, svg);
      await writeFile(join(root, theme, `${state}.png`), Buffer.from(encoded, 'base64'));
    }
  }
  console.log(`Rendered ${themes.length * states.length} PNG cursors`);
} finally {
  await browser.close();
}
