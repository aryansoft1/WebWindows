// Authorize only Cursor Manager's exact generated theme CSS, without unsafe-inline.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const pageUrl = new URL('../road.html', import.meta.url);
const style = { parentNode: null, textContent: '' };
const document = {
  readyState: 'loading',
  documentElement: { dataset: {}, toggleAttribute() {}, removeAttribute() {} },
  head: { appendChild(node) { node.parentNode = this; } },
  getElementById: () => style,
  querySelectorAll: () => [],
  addEventListener() {}
};
const window = {
  document, localStorage: { getItem() {}, setItem() {} },
  addEventListener() {}, dispatchEvent() {}
};
const context = vm.createContext({ window, document, CustomEvent: class {} });
vm.runInContext(await readFile(new URL('../assets/js/cursor-theme-inline.js', import.meta.url), 'utf8'), context);
vm.runInContext(await readFile(new URL('../assets/js/cursor-themes.js', import.meta.url), 'utf8'), context);
const hashes = Object.keys(window.WebWindows.cursor.themes).map((theme) => {
  window.WebWindows.cursor.setTheme(theme);
  return `'sha256-${createHash('sha256').update(style.textContent).digest('base64')}'`;
});
const source = await readFile(pageUrl, 'utf8');
const output = source.replace(/style-src[^;]+;/, `style-src 'self' https://unpkg.com ${hashes.join(' ')};`);
if (output === source && !source.includes(hashes[0])) throw new Error('Wendao style-src policy not found');
await writeFile(pageUrl, output);
console.log(`Authorized ${hashes.length} exact cursor theme styles in Wendao CSP`);
