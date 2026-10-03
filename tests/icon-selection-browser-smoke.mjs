import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const port = 4192;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['tools/static-server.mjs', String(port)], { stdio: 'ignore' });
let browser;
try {
  for (let attempt = 0; attempt < 20; attempt++) {
    try { if ((await fetch(`${origin}/index.html`)).ok) break; } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const icons = Array.from({ length: 8 }, (_, i) => `<div class="icon" id="icon-${i}" onclick="window.opened++"><img src="/assets/icons/cloud.png"><label>Icon ${i}</label></div>`).join('');
  await page.route('**/icon-fixture.html', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><link rel="stylesheet" href="/assets/css/main.css"><div class="desktop">${icons}</div><div id="window-root"></div><input id="editor" style="position:fixed;right:0;top:0"><script>window.opened=0</script><script src="/cloud/browser/file-selection.js"></script><script src="/dist-window/window-manager-widget.js"></script>` }));
  await page.goto(`${origin}/icon-fixture.html`);
  await page.waitForFunction(() => document.querySelector('#icon-7')?.dataset.wwGridSlot);
  await page.locator('#icon-0').click();
  await page.locator('#icon-1').click({ modifiers: ['Control'] });
  assert.equal(await page.locator('.icon.selected').count(), 2);
  assert.equal(await page.evaluate(() => window.opened), 0, 'selection must not launch apps');
  await page.locator('#icon-3').click({ modifiers: ['Shift'] });
  assert.equal(await page.locator('.icon.selected').count(), 4, 'Shift extends from the retained anchor');
  await page.keyboard.press('Control+a');
  assert.equal(await page.locator('.icon.selected').count(), 8);
  await page.locator('.desktop').focus();
  assert.equal(await page.locator('.desktop').evaluate(node => getComputedStyle(node).outlineStyle), 'none', 'desktop selection has no viewport-wide focus border');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.icon.selected').count(), 0);
  // Lasso the first two cells, starting on bare desktop padding.
  const first = await page.locator('#icon-0').boundingBox();
  const second = await page.locator('#icon-1').boundingBox();
  await page.mouse.move(first.x - 10, first.y - 10);
  await page.mouse.down();
  await page.mouse.move(second.x + second.width + 2, second.y + second.height - 1, { steps: 8 });
  await page.mouse.up();
  assert.equal(await page.locator('.icon.selected').count(), 2, 'desktop marquee selects multiple cells');
  assert.equal(await page.locator('.selection-marquee').count(), 0);
  const before = await page.locator('.icon.selected').evaluateAll(nodes => nodes.map(node => ({ id: node.id, x: parseFloat(node.style.left), y: parseFloat(node.style.top) })));
  await page.mouse.move(first.x + first.width / 2, first.y + 25);
  await page.mouse.down();
  await page.mouse.move(first.x + first.width / 2 + 200, first.y + 25 + 40, { steps: 8 });
  assert.equal(await page.locator('.icon.dragging').count(), 2, 'whole selected group moves');
  await page.mouse.up();
  const after = await page.locator('.icon').evaluateAll(nodes => nodes.map(node => ({ id: node.id, x: parseFloat(node.style.left), y: parseFloat(node.style.top), slot: node.dataset.wwGridSlot })));
  assert.equal(new Set(after.map(item => item.slot)).size, 8, 'drop assigns distinct grid cells');
  for (const item of before) assert.notEqual(after.find(other => other.id === item.id).x, item.x, 'both selected icons move');
  assert.equal(await page.evaluate(() => window.opened), 0, 'dragging must not launch apps');
  assert.equal(await page.locator('.icon.dragging').count(), 0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('webwindows.desktop.iconPositions')));
  for (const item of after) assert.deepEqual(saved[item.id], { x: item.x, y: item.y });
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#icon-7')?.dataset.wwGridSlot);
  assert.deepEqual(await page.locator('.icon').evaluateAll(nodes => nodes.map(node => ({ id: node.id, x: parseFloat(node.style.left), y: parseFloat(node.style.top), slot: node.dataset.wwGridSlot }))), after, 'saved desktop layout restores');
  await page.locator('#icon-0').dblclick();
  assert.equal(await page.evaluate(() => window.opened), 1, 'double click launches once');
  await page.locator('#editor').fill('unchanged');
  await page.keyboard.press('Control+a');
  assert.equal(await page.locator('.icon.selected').count(), 1, 'text editing does not select desktop icons');
  assert.equal(await page.locator('#editor').evaluate(node => node.selectionEnd - node.selectionStart), 9);
  // A newly installed icon participates without rebinding existing items.
  await page.evaluate(() => { const node = document.createElement('div'); node.className = 'icon'; node.id = 'dynamic-icon'; node.innerHTML = '<label>New</label>'; document.querySelector('.desktop').appendChild(node); });
  await page.waitForFunction(() => document.getElementById('dynamic-icon').dataset.wwPointerDragBound === '1');
  await page.locator('#dynamic-icon').click({ modifiers: ['Control'] });
  assert.equal(await page.locator('.icon.selected').count(), 2);
  await page.keyboard.press('Escape');
  await page.mouse.move(1000, 700);
  await page.locator('.desktop > .icon img').evaluateAll(nodes => Promise.all(nodes.map(node => node.decode())));
  const imageNodes = page.locator('.desktop > .icon img');
  const beforeCloseImages = [];
  for (const image of await imageNodes.all()) beforeCloseImages.push(await image.screenshot());
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.evaluate(() => window.openWindow('paint-regression', 'Visual regression', 'about:blank', '/assets/icons/cloud.png', true));
    await page.locator('#win-paint-regression .button.close').click();
    await page.mouse.move(1000, 700);
    assert.equal(await page.locator('#win-paint-regression').count(), 0);
    const images = await imageNodes.all();
    for (let index = 0; index < images.length; index++) {
      assert.deepEqual(await images[index].screenshot(), beforeCloseImages[index], 'desktop icon pixels survive window close');
    }
  }

  // Render the real ASP client shell with deterministic file data; retain its
  // actual toolbar/controller so folder links and click handlers are covered.
  const asp = await readFile(new URL('../cloud/browser/files.asp', import.meta.url), 'utf8');
  let cloud = asp.slice(asp.indexOf('<!DOCTYPE html>'), asp.indexOf('</html>') + 7).replace(/<%[\s\S]*?%>/g, '');
  cloud = cloud.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g, (tag, src) => /^(file-selection|toolbar)\.js/.test(src) ? tag : '');
  const files = Array.from({ length: 5 }, (_, i) => i === 0
    ? '<a class="file-item folder" id="file-0" data-kind="folder" data-path="Folder" data-name="Folder" href="files.asp?path=Folder"><span class="file-name">Folder</span></a>'
    : `<button class="file-item file" id="file-${i}" data-kind="file" data-path="File${i}.txt" data-name="File${i}.txt"><span class="file-name">File ${i}</span></button>`).join('');
  cloud = cloud.replace('<script src="file-selection.js', `<script>document.querySelector('.file-list').className='file-list large';document.querySelector('.file-list').innerHTML=${JSON.stringify(files)};document.querySelector('#device-panel').hidden=true;</script><script src="file-selection.js`);
  await page.route('**/getFolders.asp?*', route => route.fulfill({ json: [{name:'Documents',path:'Documents',children:[]}] }));
  await page.route('**/cloud/browser/selection-fixture.html', route => route.fulfill({ contentType: 'text/html', body: cloud }));
  await page.goto(`${origin}/cloud/browser/selection-fixture.html`);
  await page.locator('.file-list').focus();
  assert.equal(await page.locator('.file-list').evaluate(node => getComputedStyle(node).outlineStyle), 'none', 'cloud grid has no black focus border');
  await page.waitForSelector('#folder-tree button');
  assert.equal(await page.evaluate(() => window.WebWindowsCloudI18n), undefined, 'real page has no external language adapter');
  assert.match(await page.locator('#folder-tree').innerText(), /官方文档/, 'directory tree initializes without external language adapter');
  await page.locator('#file-0').click();
  assert.match(page.url(), /selection-fixture/, 'folder single click selects without navigation');
  await page.locator('#file-1').click({ modifiers: ['Control'] });
  assert.equal(await page.locator('.file-item.selected').count(), 2);
  await page.locator('#file-0').dragTo(page.locator('#file-4'));
  assert.deepEqual(await page.locator('.file-item').evaluateAll(nodes => nodes.map(node => node.id)), ['file-2', 'file-3', 'file-0', 'file-1', 'file-4'], 'cloud group drop reorders grid');
  assert.equal(await page.locator('.file-item.selected').count(), 2, 'cloud selection survives drop');
  assert.equal(await page.locator('.file-item').evaluateAll(nodes => nodes.every(node => !node.style.transform && !node.style.position)), true, 'cloud CSS grid arranges dropped icons');
  await page.keyboard.press('Control+a');
  assert.equal(await page.locator('.file-item.selected').count(), 5);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.file-item.selected').count(), 0);
  await page.route('**/selection-fixture.html?*', route => route.fulfill({ contentType: 'text/html', body: '<p>folder opened</p>' }));
  await page.locator('#file-0').dblclick();
  await page.waitForURL(/path=Folder/);
  assert.match(page.url(), /path=Folder/, 'folder double click opens');
  const privateAsp = await readFile(new URL('../cloud/browser/private-files.asp', import.meta.url), 'utf8');
  let privatePage = privateAsp.slice(privateAsp.toLowerCase().indexOf('<!doctype html>'), privateAsp.indexOf('</html>') + 7).replace(/<%[\s\S]*?%>/g, '');
  privatePage = privatePage.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g, (tag, src) => /^file-selection\.js/.test(src) ? tag : '');
  const privateItems = Array.from({ length: 4 }, (_, i) => `<button class="item" id="private-${i}" data-file="Private${i}.txt" data-name="Private${i}.txt">Private ${i}</button>`).join('');
  privatePage = privatePage.replace('(function(){', `document.querySelector('.files').innerHTML=${JSON.stringify(privateItems)};document.querySelector('.login').remove();document.querySelector('.picker-bar').remove();(function(){`);
  await page.route('**/cloud/browser/private-selection-fixture.html', route => route.fulfill({ contentType: 'text/html', body: privatePage }));
  await page.goto(`${origin}/cloud/browser/private-selection-fixture.html`);
  await page.locator('.files').focus();
  assert.equal(await page.locator('.files').evaluate(node => getComputedStyle(node).outlineStyle), 'none', 'private cloud has no black focus border');
  await page.locator('#private-0').click();
  await page.locator('#private-1').click({ modifiers: ['Control'] });
  assert.equal(await page.locator('.files .selected').count(), 2);
  await page.locator('#private-0').dragTo(page.locator('#private-3'));
  assert.deepEqual(await page.locator('.files .item').evaluateAll(nodes => nodes.map(node => node.id)), ['private-2', 'private-0', 'private-1', 'private-3']);
  assert.equal(await page.locator('.files .selected').count(), 2, 'private cloud keeps group selection');
  assert.deepEqual(errors, [], 'no runtime errors');
  console.log('Desktop/public/private cloud multiselect, group drag, grid placement, persistence, open gestures and keyboard scope OK');
} finally {
  await browser?.close();
  server.kill();
}
