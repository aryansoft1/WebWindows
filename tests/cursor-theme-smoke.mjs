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
  const pickerCoverage = await page.locator('#cursorThemeSelect').evaluate((select) => ({
    supported: CSS.supports('appearance', 'base-select'),
    appearance: getComputedStyle(select).appearance,
    popupAppearance: getComputedStyle(select, '::picker(select)').appearance,
    optionCursor: getComputedStyle(select.options[0]).cursor
  }));
  assert.equal(pickerCoverage.supported, true, 'Chromium supports styleable select popups');
  assert.equal(pickerCoverage.appearance, 'base-select');
  assert.equal(pickerCoverage.popupAppearance, 'base-select');
  assert.match(pickerCoverage.optionCursor, /^url\("data:image\/png;base64,/);
  assert.match(pickerCoverage.optionCursor, /dreama\/pointer\.png/);
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
      assert.match(cursors[state], /^url\("data:image\/png;base64,/);
      assert.match(cursors[state], new RegExp(`/assets/cursors/${theme}/${state}\\.png.*?/assets/cursors/${theme}/${state}\\.svg`), `${theme}/${state}`);
    }
    for (const [direction, state] of Object.entries(directionState)) {
      assert.match(cursors[direction], new RegExp(`/assets/cursors/${theme}/${state}\\.png`), `${theme}/${direction}`);
    }
  }
  assert.equal(result.saved, 'dreama');
  await page.locator('[data-settings-tab="cursorTab"]').click();
  assert.equal(await page.locator('.cursor-preview-grid img').count(), 13);
  await page.locator('#cursorThemeSelect').click();
  assert.match(await page.locator('#cursorThemeSelect').evaluate((select) =>
    getComputedStyle(select, '::picker(select)').cursor
  ), /^url\("data:image\/png;base64,/);
  await page.locator('#cursorThemeSelect option[value="classic"]').click();
  assert.equal(await page.inputValue('#cursorThemeSelect'), 'classic', 'styleable picker selects a theme by mouse');
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
  await page.waitForFunction(() => !!document.getElementById('ww-cursor-theme-style'));
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
  let releaseFrame;
  let frameRequestStarted;
  const frameRequest = new Promise((resolve) => { frameRequestStarted = resolve; });
  let releaseSlowResource;
  let slowResourceStarted;
  const slowResource = new Promise((resolve) => { slowResourceStarted = resolve; });
  await page.route('**/cursor-slow-resource.png', (route) => {
    releaseSlowResource = () => route.abort();
    slowResourceStarted();
  });
  await page.route('**/cursor-pending-frame.html', (route) => {
    releaseFrame = () => route.fulfill({ status: 200, contentType: 'text/html', body: '<button>loaded frame</button><img src="/cursor-slow-resource.png">' });
    frameRequestStarted();
  });
  await page.evaluate(() => {
    const frame = document.createElement('iframe');
    frame.src = '/cursor-pending-frame.html';
    document.body.appendChild(frame);
  });
  await frameRequest;
  await page.mouse.move(1200, 100);
  await page.waitForSelector('#ww-navigation-pointer');
  assert.equal(await page.locator('.desktop').evaluate((element) => getComputedStyle(element).cursor), 'none', 'native loading cursor is hidden');
  assert.match(await page.locator('#ww-navigation-pointer').getAttribute('src'), /^data:image\/png;base64,/);
  await page.evaluate(() => {
    const control = document.createElement('button');
    control.id = 'cursor-navigation-control';
    control.style.cssText = 'position:fixed;left:1100px;top:40px;width:100px;height:60px;z-index:2147483646';
    document.body.appendChild(control);
  });
  await page.mouse.move(1150, 70);
  assert.equal(await page.locator('#ww-navigation-pointer').getAttribute('data-ww-cursor-state'), 'pointer', 'temporary pointer preserves button semantics');
  await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' })));
  assert.equal(await page.locator('#ww-navigation-pointer').count(), 0, 'touch does not use the temporary pointer');
  await page.locator('#cursor-navigation-control').evaluate((element) => element.remove());
  await page.mouse.move(1200, 100);
  assert.equal(await page.locator('iframe[src="/cursor-pending-frame.html"]').evaluate((frame) =>
    frame.contentDocument?.getElementById('ww-cursor-theme-style') ?? null
  ), null, 'pending iframe does not start cursor requests in its temporary about:blank document');
  assert.equal(await page.locator('iframe[src="/cursor-pending-frame.html"]').evaluate((frame) =>
    getComputedStyle(frame).pointerEvents
  ), 'none', 'pending iframe cannot expose its system cursor');
  assert.equal(await page.locator('iframe[src="/cursor-pending-frame.html"]').evaluate((frame) =>
    getComputedStyle(frame).visibility
  ), 'hidden', 'pending iframe is not painted during navigation');
  await releaseFrame();
  await slowResource;
  await page.waitForFunction(() => document.querySelector('iframe[src="/cursor-pending-frame.html"]')?.contentDocument?.readyState === 'interactive');
  await page.waitForFunction(() => {
    const frame = document.querySelector('iframe[src="/cursor-pending-frame.html"]');
    return frame?.contentDocument?.getElementById('ww-cursor-theme-style') && !frame.hasAttribute('data-ww-cursor-loading');
  });
  assert.equal(await page.locator('iframe[src="/cursor-pending-frame.html"]').evaluate((frame) =>
    getComputedStyle(frame).visibility
  ), 'visible', 'prepared iframe is painted without waiting for slow subresources');
  const frameButton = page.frameLocator('iframe[src="/cursor-pending-frame.html"]').locator('button');
  await frameButton.hover();
  assert.equal(await frameButton.evaluate((element) => getComputedStyle(element).cursor), 'none', 'loading iframe suppresses Chromium native loading cursor');
  assert.equal(await page.locator('#ww-navigation-pointer').getAttribute('data-ww-cursor-state'), 'pointer', 'temporary pointer tracks button semantics inside the iframe');
  const buttonBounds = await frameButton.boundingBox();
  const pointerBounds = await page.locator('#ww-navigation-pointer').boundingBox();
  assert.ok(Math.abs(pointerBounds.x + 10 - (buttonBounds.x + buttonBounds.width / 2)) < 2, 'iframe pointer is positioned in top-level coordinates');
  assert.ok(Math.abs(pointerBounds.y + 5 - (buttonBounds.y + buttonBounds.height / 2)) < 2, 'iframe pointer vertical hotspot is correct');
  await releaseSlowResource();
  await page.waitForFunction(() => !!document.querySelector('iframe[src="/cursor-pending-frame.html"]')?.contentDocument?.getElementById('ww-cursor-theme-style'));
  await page.waitForFunction(() => {
    const frame = document.querySelector('iframe[src="/cursor-pending-frame.html"]');
    return frame && !frame.hasAttribute('data-ww-cursor-loading');
  });
  assert.equal(await page.locator('iframe[src="/cursor-pending-frame.html"]').evaluate((frame) =>
    getComputedStyle(frame).pointerEvents
  ), 'auto', 'iframe receives pointer input after its theme cursor decodes');
  assert.equal(await page.locator('iframe[src="/cursor-pending-frame.html"]').evaluate((frame) =>
    getComputedStyle(frame).visibility
  ), 'visible', 'iframe is painted after loading and cursor preparation');
  assert.equal(await page.locator('iframe[src="/cursor-pending-frame.html"]').evaluate((frame) =>
    frame.contentDocument.readyState
  ), 'complete', 'iframe load completes normally');
  await page.waitForFunction(() => !document.getElementById('ww-navigation-pointer'));
  assert.equal(await page.locator('#ww-navigation-pointer').count(), 0, 'temporary pointer is removed after load');
  assert.match(await frameButton.evaluate((element) => getComputedStyle(element).cursor), /classic\/pointer\.png/, 'iframe returns to themed native cursor after load');
  assert.match(await page.locator('.desktop').evaluate((element) => getComputedStyle(element).cursor), /classic\/default\.png/, 'native CSS cursor returns after load');
  for (const state of ['checkbox', 'radio', 'range', 'task']) assert.match(coverage[state], /classic\/pointer\.png/, state);
  assert.match(coverage.scrollbar, /classic\/move\.png/);
  await page.waitForFunction(() => {
    const nested = document.querySelector('.window iframe')?.contentDocument?.querySelector('iframe');
    return !!nested?.contentDocument?.getElementById('ww-cursor-theme-style');
  });
  // Exercise Wendao's real CSP instead of a permissive synthetic iframe document.
  await page.route('https://unpkg.com/**', (route) => route.abort());
  await page.evaluate(() => {
    const frame = document.createElement('iframe');
    frame.id = 'cursor-wendao';
    frame.src = '/road.html';
    document.body.appendChild(frame);
  });
  await page.waitForFunction(() => document.querySelector('#cursor-wendao')?.contentDocument?.readyState === 'complete');
  for (const theme of ['dreama', 'classic', 'soft', 'dark-pro', 'mono']) {
    await page.evaluate((id) => window.WebWindows.cursor.setTheme(id), theme);
    const cursors = await page.locator('#cursor-wendao').evaluate((frame) => {
      const doc = frame.contentDocument;
      return ['.navigation-shell', '#locate-button', '#start-input'].map((selector) => {
        const element = doc.querySelector(selector);
        return element ? doc.defaultView.getComputedStyle(element).cursor : null;
      });
    });
    for (const [index, state] of ['default', 'pointer', 'text'].entries()) {
      assert.match(cursors[index], new RegExp(`${theme}/${state}\\.png`), `Wendao CSP permits ${theme} ${state}`);
    }
  }
  console.log('Cursor themes: semantic states, 8 resize handles, persistence, 5 Wendao CSP themes OK');
} finally {
  await browser?.close();
  server.kill();
}
