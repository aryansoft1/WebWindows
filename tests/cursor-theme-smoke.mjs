import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const port = 4187;
const server = spawn(process.execPath, ['tools/static-server.mjs', String(port)], { stdio: 'ignore' });
let browser;
try {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/settings.html`);
      if (response.ok) break;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/settings.html`, { waitUntil: 'domcontentloaded' });
  const result = await page.evaluate(() => {
    const manager = window.WebWindows.cursor;
    const checks = {};
    const inspect = (selector) => getComputedStyle(document.querySelector(selector)).cursor;
    const selectors = {
      default: '.cursor-preview [data-cursor-state="default"]',
      pointer: '.cursor-preview button:not(:disabled)',
      text: '.cursor-preview input',
      move: '.cursor-preview [data-cursor-state="move"]',
      'not-allowed': '.cursor-preview button:disabled',
      wait: '.cursor-preview [data-cursor-state="wait"]',
      progress: '.cursor-preview [data-cursor-state="progress"]',
      crosshair: '.cursor-preview [data-cursor-state="crosshair"]',
      help: '.cursor-preview [data-cursor-state="help"]',
      'ew-resize': '.cursor-preview [data-cursor-state="ew-resize"]',
      'ns-resize': '.cursor-preview [data-cursor-state="ns-resize"]',
      'nwse-resize': '.cursor-preview [data-cursor-state="nwse-resize"]',
      'nesw-resize': '.cursor-preview [data-cursor-state="nesw-resize"]'
    };
    const sample = document.createElement('div');
    sample.className = 'window';
    document.body.appendChild(sample);
    for (const theme of ['dreama', 'classic', 'soft']) {
      manager.setTheme(theme);
      checks[theme] = {};
      for (const [state, selector] of Object.entries(selectors)) checks[theme][state] = inspect(selector);
      for (const direction of ['n', 's', 'e', 'w', 'nw', 'se', 'ne', 'sw']) {
        const handle = document.createElement('div');
        handle.className = `resizer ${direction}`;
        sample.appendChild(handle);
        checks[theme][direction] = getComputedStyle(handle).cursor;
        handle.remove();
      }
    }
    manager.setTheme('dreama');
    return { checks, saved: localStorage.getItem('webwindows.cursor.theme'), states: manager.states };
  });
  const directionState = { n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize', nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize' };
  for (const [theme, cursors] of Object.entries(result.checks)) {
    for (const state of result.states) {
      assert.match(cursors[state], new RegExp(`/assets/cursors/${theme}/${state}\\.svg`), `${theme}/${state}`);
    }
    for (const [direction, state] of Object.entries(directionState)) {
      assert.match(cursors[direction], new RegExp(`/assets/cursors/${theme}/${state}\\.svg`), `${theme}/${direction}`);
    }
  }
  assert.equal(result.saved, 'dreama');
  await page.locator('[data-settings-tab="cursorTab"]').click();
  await page.selectOption('#cursorThemeSelect', 'classic');
  assert.equal(await page.evaluate(() => localStorage.getItem('webwindows.cursor.theme')), 'classic');
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.inputValue('#cursorThemeSelect'), 'classic');
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.openWindow === 'function');
  await page.evaluate(() => window.openWindow('cursor-smoke', 'Cursor smoke', 'about:blank'));
  await page.locator('.window .resizer').first().waitFor();
  const actualHandles = await page.locator('.window .resizer').evaluateAll((handles) =>
    Object.fromEntries(handles.map((handle) => [handle.dataset.resizeDir, getComputedStyle(handle).cursor]))
  );
  for (const [direction, state] of Object.entries(directionState)) {
    assert.match(actualHandles[direction], new RegExp(`/assets/cursors/classic/${state}\\.svg`), `actual window ${direction}`);
  }
  assert.match(await page.locator('.window-header').first().evaluate((element) => getComputedStyle(element).cursor), /classic\/move\.svg/);
  console.log('Cursor themes: 3 themes, semantic states, 8 resize handles, persistence OK');
} finally {
  await browser?.close();
  server.kill();
}
