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
  const rasterAssets = await page.evaluate(async () => {
    const manager = window.WebWindows.cursor;
    return Promise.all(Object.keys(manager.themes).flatMap((theme) => manager.states.map(async (state) => {
      const image = new Image();
      image.src = manager.getAsset(state, theme, 'png');
      try { await image.decode(); return image.naturalWidth === 32 && image.naturalHeight === 32; }
      catch { return false; }
    })));
  });
  assert.equal(rasterAssets.length, 65);
  assert.equal(rasterAssets.every(Boolean), true, 'all PNG cursor assets decode at 32px');
  const result = await page.evaluate(() => {
    const manager = window.WebWindows.cursor;
    const checks = {};
    const sample = document.createElement('div');
    sample.className = 'window';
    document.body.appendChild(sample);
    for (const theme of ['dreama', 'classic', 'soft']) {
      manager.setTheme(theme);
      checks[theme] = {};
      for (const state of manager.states) checks[theme][state] = manager.getCursor(state);
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
      assert.match(cursors[state], new RegExp(`/assets/cursors/${theme}/${state}\\.png.*?/assets/cursors/${theme}/${state}\\.svg`), `${theme}/${state}`);
    }
    for (const [direction, state] of Object.entries(directionState)) {
      assert.match(cursors[direction], new RegExp(`/assets/cursors/${theme}/${state}\\.png`), `${theme}/${direction}`);
    }
  }
  assert.equal(result.saved, 'dreama');
  await page.locator('[data-settings-tab="cursorTab"]').click();
  assert.equal(await page.locator('.cursor-preview-grid img').count(), 13);
  for (const [language, labels] of Object.entries({
    zh: ['鼠标指针', '默认'], tw: ['滑鼠指標', '預設'],
    en: ['Mouse Pointer', 'Default'], jp: ['マウスポインター', '標準']
  })) {
    await page.evaluate((value) => window.setLanguage(value), language);
    assert.equal(await page.locator('#cursorTab h3').textContent(), labels[0]);
    assert.equal(await page.locator('.cursor-preview-grid figcaption').first().textContent(), labels[1]);
  }
  await page.selectOption('#cursorThemeSelect', 'classic');
  assert.equal(await page.evaluate(() => localStorage.getItem('webwindows.cursor.theme')), 'classic');
  await page.waitForFunction(() => [...document.querySelectorAll('.cursor-preview-grid img')].every((image) => image.complete && image.naturalWidth > 0));
  const previewImages = await page.locator('.cursor-preview-grid img').evaluateAll((images) => images.map((image) => ({ state: image.dataset.cursorPreview, src: image.getAttribute('src'), loaded: image.complete && image.naturalWidth > 0 })));
  for (const image of previewImages) {
    assert.equal(image.src, `/assets/cursors/classic/${image.state}.svg`);
    assert.equal(image.loaded, true, `preview ${image.state}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator('#cursorTab').evaluate((tab) => tab.scrollWidth <= tab.clientWidth), true);
  await page.screenshot({ path: 'tmp/cursor-preview-mobile.png' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.inputValue('#cursorThemeSelect'), 'classic');
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.openWindow === 'function');
  const desktopBefore = await page.locator('.desktop').evaluate((element) => getComputedStyle(element).cursor);
  await page.evaluate(() => window.openWindow('cursor-smoke', 'Cursor smoke', 'about:blank'));
  await page.locator('.window .resizer').first().waitFor();
  const actualHandles = await page.locator('.window .resizer').evaluateAll((handles) =>
    Object.fromEntries(handles.map((handle) => [handle.dataset.resizeDir, getComputedStyle(handle).cursor]))
  );
  for (const [direction, state] of Object.entries(directionState)) {
    assert.match(actualHandles[direction], new RegExp(`/assets/cursors/classic/${state}\\.png`), `actual window ${direction}`);
  }
  assert.match(await page.locator('.window-header').first().evaluate((element) => getComputedStyle(element).cursor), /classic\/move\.png/);
  const titleButtons = await page.locator('.window-header .button').evaluateAll((buttons) => buttons.map((button) => getComputedStyle(button).cursor));
  assert.equal(titleButtons.length, 3);
  for (const cursor of titleButtons) assert.match(cursor, /classic\/pointer\.png/);
  const coverage = await page.evaluate(() => {
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; document.body.appendChild(checkbox);
    const radio = document.createElement('input'); radio.type = 'radio'; document.body.appendChild(radio);
    const range = document.createElement('input'); range.type = 'range'; document.body.appendChild(range);
    const task = document.createElement('div'); task.className = 'vw-task'; document.body.appendChild(task);
    const scroll = document.createElement('div'); scroll.style.cssText = 'width:100px;height:50px;overflow:auto';
    scroll.innerHTML = '<div style="height:200px"></div>'; document.body.appendChild(scroll);
    const frame = document.querySelector('.window iframe');
    const nested = frame.contentDocument.createElement('iframe'); frame.contentDocument.body.appendChild(nested);
    return {
      desktop: getComputedStyle(document.querySelector('.desktop')).cursor,
      checkbox: getComputedStyle(checkbox).cursor,
      radio: getComputedStyle(radio).cursor,
      range: getComputedStyle(range).cursor,
      task: getComputedStyle(task).cursor,
      scrollbar: getComputedStyle(scroll, '::-webkit-scrollbar-thumb').cursor
    };
  });
  assert.equal(coverage.desktop, desktopBefore);
  const desktopBlank = await page.evaluate(() => getComputedStyle(document.elementFromPoint(1200, 300)).cursor);
  assert.match(desktopBlank, /classic\/default\.png/, 'blank desktop after opening a window');
  await page.evaluate(() => {
    const lateStyle = document.createElement('style');
    lateStyle.textContent = '.desktop { cursor: default !important; }';
    document.head.appendChild(lateStyle);
  });
  await page.waitForFunction(() => document.head.lastElementChild?.id === 'ww-cursor-theme-style');
  assert.match(await page.locator('.desktop').evaluate((element) => getComputedStyle(element).cursor), /classic\/default\.png/, 'theme survives late styles');
  const dynamicCoverage = await page.evaluate(async () => {
    const samples = Object.fromEntries([
      ['plain', '<div style="cursor:default!important"><span>new</span></div>'],
      ['link', '<button style="cursor:default!important"><span>new</span></button>'],
      ['text', '<input type="text" style="cursor:pointer!important">'],
      ['disabled', '<button disabled style="cursor:pointer!important">new</button>'],
      ['wait', '<div aria-busy="true"><span>new</span></div>'],
      ['progress', '<div data-ww-cursor="progress">new</div>'],
      ['customState', '<div style="--ww-cursor-state:var(--ww-cursor-link)">new</div>'],
      ['legacyInline', '<div style="cursor:pointer!important">new</div>']
    ].map(([key, html]) => { const holder = document.createElement('div'); holder.innerHTML = html; document.body.appendChild(holder); return [key, holder.firstElementChild]; }));
    const host = document.createElement('div'); document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<button>shadow</button><div data-ww-cursor="ne-resize">resize</div>';
    const closedHost = document.createElement('div'); document.body.appendChild(closedHost);
    const closed = closedHost.attachShadow({ mode: 'closed' });
    closed.innerHTML = '<button>closed shadow</button>';
    const iframe = document.createElement('iframe'); iframe.srcdoc = '<button>frame</button>';
    const frameLoaded = new Promise((resolve) => iframe.addEventListener('load', resolve, { once: true }));
    document.body.appendChild(iframe);
    await frameLoaded;
    return {
      plain: getComputedStyle(samples.plain.firstElementChild).cursor,
      link: getComputedStyle(samples.link.firstElementChild).cursor,
      text: getComputedStyle(samples.text).cursor,
      disabled: getComputedStyle(samples.disabled).cursor,
      wait: getComputedStyle(samples.wait.firstElementChild).cursor,
      progress: getComputedStyle(samples.progress).cursor,
      customState: getComputedStyle(samples.customState).cursor,
      legacyInline: getComputedStyle(samples.legacyInline).cursor,
      shadowButton: getComputedStyle(shadow.querySelector('button')).cursor,
      shadowResize: getComputedStyle(shadow.querySelector('[data-ww-cursor]')).cursor,
      closedShadowButton: getComputedStyle(closed.querySelector('button')).cursor,
      iframeButton: getComputedStyle(iframe.contentDocument.querySelector('button')).cursor,
      tokens: Object.keys(window.WebWindows.cursor.tokenStates).every((key) =>
        getComputedStyle(document.documentElement).getPropertyValue(`--ww-cursor-${key}`).includes('/assets/cursors/classic/'))
    };
  });
  for (const [key, state] of Object.entries({ plain: 'default', link: 'pointer', text: 'text', disabled: 'not-allowed', wait: 'wait', progress: 'progress', customState: 'pointer', legacyInline: 'pointer', shadowButton: 'pointer', shadowResize: 'nesw-resize', closedShadowButton: 'pointer', iframeButton: 'pointer' })) {
    assert.match(dynamicCoverage[key], new RegExp(`classic/${state}\\.png`), key);
  }
  assert.equal(dynamicCoverage.tokens, true, 'all cursor tokens use theme assets');
  for (const state of ['checkbox', 'radio', 'range', 'task']) assert.match(coverage[state], /classic\/pointer\.png/, state);
  assert.match(coverage.scrollbar, /classic\/move\.png/);
  await page.waitForFunction(() => {
    const nested = document.querySelector('.window iframe')?.contentDocument?.querySelector('iframe');
    return !!nested?.contentDocument?.getElementById('ww-cursor-theme-style');
  });
  console.log('Cursor themes: 3 themes, semantic states, 8 resize handles, persistence OK');
} finally {
  await browser?.close();
  server.kill();
}
