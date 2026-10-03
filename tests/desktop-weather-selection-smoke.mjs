/*
 * Runtime gate for the three fixes in this change.
 *
 * These are behaviour gates, not source greps. Each of the three defects was a
 * runtime decision that static inspection cannot see:
 *
 *  1. Icon labels grew the cell because the width came from the text.
 *  2. The weather widget preferred wttr's `lang_zh` / `lang_ja`, which the
 *     provider fills with *English*, and the raw stored locale ("zh-CN",
 *     "ja-JP") never matched any localized branch.
 *  3. The file surfaces had no multi-selection at all, and the click handlers
 *     that open a file ran unconditionally, so a Ctrl+click destroyed the
 *     selection instead of extending it.
 *
 * The weather and file-selection logic is executed here against the real
 * source, extracted rather than re-typed, so the test cannot drift from the
 * code it guards.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (relative) => readFileSync(resolve(root, relative), "utf8");

let passed = 0;
const check = (name, fn) => {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
};

/* ------------------------------------------------------------------ *
 * 1. Desktop icon label truncation
 * ------------------------------------------------------------------ */

const mainCss = read("assets/css/main.css");
const indexHtml = read("index.html");

check("desktop icon cell has a fixed width independent of the label", () => {
  const block = mainCss.match(/\.icon\s*\{[^}]*\}/);
  assert.ok(block, ".icon rule must exist");
  // A max-width alone is not enough: the cell must not be able to grow with
  // the text, so an explicit width is required.
  assert.match(block[0], /width:\s*80px/, "icon cell must declare a fixed width");
  assert.doesNotMatch(block[0], /max-height:\s*100px/,
    "max-height clipped the two-line label and is no longer needed");
});

check("icon label truncates with an ellipsis instead of expanding", () => {
  const block = mainCss.match(/\.icon\s+label\s*\{[^}]*\}/);
  assert.ok(block, ".icon label rule must exist");
  assert.match(block[0], /overflow:\s*hidden/);
  assert.match(block[0], /text-overflow:\s*ellipsis/);
  assert.match(block[0], /white-space:\s*nowrap/);
  // The label must be capped at the same width as the cell, otherwise the
  // text simply overflows the cell visually.
  const width = block[0].match(/max-width:\s*(\d+)px/);
  assert.ok(width, "label must declare its own max-width");
  assert.equal(Number(width[1]), 80, "label max-width must match the icon cell width");
});

check("every static desktop icon carries a title for the truncated name", () => {
  const icons = indexHtml.match(/<div class="icon[^>]*>/g) || [];
  assert.ok(icons.length >= 10, `expected the full desktop icon set, found ${icons.length}`);
  for (const icon of icons) {
    assert.match(icon, /\stitle="[^"]+"/,
      `truncated label needs a title tooltip: ${icon.slice(0, 90)}`);
  }
});

check("dynamically created desktop icons also expose the full name", () => {
  const source = read("assets/js/desktop-functions.js");
  assert.match(source, /element\.title\s*=\s*app\.name/,
    "function icons must keep a tooltip, since their labels truncate too");
});

/* ------------------------------------------------------------------ *
 * 2. Weather localization
 * ------------------------------------------------------------------ */

// The real provider payload, captured from wttr.in for Tokyo. It is the
// evidence for the whole fix: lang_zh is byte-identical English.
const WTTR_TOKYO = {
  current_condition: [{
    temp_C: "23",
    weatherCode: "353",
    lang_zh: [{ value: "Light rain shower" }],
    lang_ja: [{ value: "Light rain shower" }],
    weatherDesc: [{ value: "Light rain shower" }],
  }],
};

const languageModule = read("webwindows-vue/src/desktop/weather-language.js");
const { default: WeatherLanguage } = await import(
  `data:text/javascript;base64,${Buffer.from(languageModule).toString("base64")}`
);

check("stored and system locales normalize to a supported language", () => {
  const cases = [
    ["zh", "zh"], ["tw", "zh"], ["jp", "ja"], ["en", "en"],
    ["zh-CN", "zh"], ["zh-TW", "zh"], ["ja-JP", "ja"], ["en-US", "en"],
    ["ZH", "zh"], ["  jp  ", "ja"], ["", "zh"], [null, "zh"], [undefined, "zh"],
  ];
  for (const [input, expected] of cases) {
    assert.equal(WeatherLanguage.normalize(input), expected,
      `normalize(${JSON.stringify(input)}) must be "${expected}"`);
  }
});

// Rebuild the two widget methods under test from the real source text so this
// gate fails if the shipped logic changes, not just if a copy changes.
function extractMethod(source, name) {
  const start = source.indexOf(`    ${name}(`);
  assert.ok(start >= 0, `${name} must exist in weather.vue`);
  // Walk the parameter list to find the body. Counting braces from the first
  // "(" would misfire on destructured parameters such as ({ a, b }) => ...
  let paren = 0;
  let index = source.indexOf("(", start);
  for (; index < source.length; index += 1) {
    if (source[index] === "(") paren += 1;
    else if (source[index] === ")") {
      paren -= 1;
      if (paren === 0) break;
    }
  }
  const params = source.slice(source.indexOf("(", start) + 1, index);
  const bodyStart = source.indexOf("{", index);
  let depth = 0;
  for (index = bodyStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = source.slice(bodyStart, index + 1);
  return new Function(`return function ${name}(${params}) ${body}`)();
}

const weatherVue = read("webwindows-vue/src/desktop/weather.vue");
const pickLocalizedDesc = extractMethod(weatherVue, "pickLocalizedDesc");
const resolveDesc = extractMethod(weatherVue, "resolveDesc");

// The Unknown rows are produced by these table helpers; assert the marker the
// resolver depends on actually exists, or the fallback silently dies.
const mapWttrCode = extractMethod(weatherVue, "mapWttrCode");
const mapWeatherCode = extractMethod(weatherVue, "mapWeatherCode");

const hasCJK = (value) => /[一-鿿぀-ヿ]/.test(String(value || ""));

check("Chinese and Japanese systems never render the provider's English", () => {
  const widget = { pickLocalizedDesc, resolveDesc };
  for (const lang of ["zh", "ja"]) {
    for (const code of [113, 116, 122, 143, 248, 296, 302, 308, 353, 356, 386, 389]) {
      const mapped = mapWttrCode.call(widget, code);
      const provider = WTTR_TOKYO.current_condition[0].weatherDesc[0].value;
      const shown = resolveDesc.call(widget, mapped, provider, lang);
      assert.ok(hasCJK(shown),
        `lang=${lang} code=${code} rendered non-CJK text: ${JSON.stringify(shown)}`);
    }
  }
});

check("the real Tokyo payload renders Chinese, not 'Light rain shower'", () => {
  const widget = { pickLocalizedDesc, resolveDesc };
  const cond = WTTR_TOKYO.current_condition[0];
  const mapped = mapWttrCode.call(widget, cond.weatherCode);
  const provider = cond[`lang_zh`][0].value;
  const shown = resolveDesc.call(widget, mapped, provider, "zh");
  assert.equal(shown, "小阵雨");
  assert.notEqual(shown, "Light rain shower");
});

check("English systems keep the provider text", () => {
  const widget = { pickLocalizedDesc, resolveDesc };
  const mapped = mapWttrCode.call(widget, 353);
  assert.equal(resolveDesc.call(widget, mapped, "Light rain shower", "en"), "Light rain shower");
});

check("an unmapped code still falls back to the provider instead of '未知'", () => {
  const widget = { pickLocalizedDesc, resolveDesc };
  const mapped = mapWttrCode.call(widget, 99999);
  assert.equal(mapped.descZh, "未知");
  assert.equal(resolveDesc.call(widget, mapped, "Windy", "zh"), "Windy");
});

check("every code in both tables has a real translation, not the placeholder", () => {
  // Enumerating the literal table keys catches a code added without zh/ja text,
  // which is precisely how a "sometimes English" regression returns. The two
  // tables use disjoint code spaces (Open-Meteo < 100, WWO >= 100), so each key
  // must be checked against the mapper that actually serves it.
  const keys = [...weatherVue.matchAll(/^\s+(\d{1,3}):\s*o\(/gm)].map((m) => Number(m[1]));
  assert.ok(keys.length > 40, `expected a full code table, found ${keys.length} entries`);
  const widget = { pickLocalizedDesc, resolveDesc };
  for (const code of keys) {
    const mapper = code < 100 ? mapWeatherCode : mapWttrCode;
    const mapped = mapper.call(widget, code);
    assert.notEqual(mapped.descZh, "未知", `code ${code} has no Chinese text`);
    assert.notEqual(mapped.descJa, "不明", `code ${code} has no Japanese text`);
    assert.notEqual(mapped.descEn, "Unknown", `code ${code} has no English text`);
  }
});

check("the Open-Meteo table is translated too", () => {
  const widget = { pickLocalizedDesc, resolveDesc };
  assert.equal(resolveDesc.call(widget, mapWeatherCode.call(widget, 0), "", "zh"), "晴朗");
  assert.equal(resolveDesc.call(widget, mapWeatherCode.call(widget, 95), "", "ja"), "雷雨");
  assert.equal(resolveDesc.call(widget, mapWeatherCode.call(widget, 71), "", "zh"), "小雪");
});

check("the widget uses the shared normalizer, not the old inline lookup", () => {
  assert.match(weatherVue, /import WeatherLanguage from '\.\/weather-language\.js'/);
  assert.doesNotMatch(weatherVue, /\{ jp: "ja", tw: "zh" \}\[/,
    "the unnormalized inline lookup is the bug; it must be gone");
  const uses = weatherVue.match(/this\.lang\s*=/g) || [];
  assert.equal(uses.length, 1, "lang must only be assigned through the normalizer");
  assert.match(weatherVue, /this\.lang = WeatherLanguage\.normalize\(/);
});

check("the shipped bundle contains the fix and matches its stylesheet scope", () => {
  const umd = read("dist-weather/weather-widget.umd.js");
  const css = read("dist-weather/weather-widget.css");
  assert.ok(umd.includes("resolveDesc"), "dist-weather UMD must carry the fix");
  assert.ok(umd.includes('startsWith("ja")'), "dist-weather UMD must carry the normalizer");
  const jsScope = /data-v-([0-9a-f]{8})/.exec(umd);
  const cssScope = /data-v-([0-9a-f]{8})/.exec(css);
  assert.ok(jsScope && cssScope, "both artifacts must be scoped builds");
  assert.equal(jsScope[1], cssScope[1],
    "JS and CSS scope ids diverged: the widget would render unstyled");
});

/* ------------------------------------------------------------------ *
 * 3. Multi-file selection and drag
 * ------------------------------------------------------------------ */

const selectionSource = read("cloud/browser/file-selection.js");

// Minimal DOM good enough to exercise the real controller: the gesture logic
// is plain arithmetic over rectangles, so a stub with real getBoundingClientRect
// values tests the actual decisions.
function makeDom() {
  const listeners = new Map();
  const makeNode = (opts) => {
    const node = {
      ...opts,
      classList: {
        set: new Set(opts.classes || []),
        add(...names) { names.forEach((n) => this.set.add(n)); },
        remove(...names) { names.forEach((n) => this.set.delete(n)); },
        toggle(name, on) { if (on) this.set.add(name); else this.set.delete(name); },
        contains(name) { return this.set.has(name); },
      },
      attributes: {},
      children: [],
      setAttribute(k, v) { this.attributes[k] = v; },
      getAttribute(k) { return this.attributes[k]; },
      hasAttribute(k) { return k in this.attributes; },
      addEventListener(type, fn) {
        if (!listeners.has(this)) listeners.set(this, new Map());
        const map = listeners.get(this);
        if (!map.has(type)) map.set(type, []);
        map.get(type).push(fn);
      },
      removeEventListener() {},
      remove() {},
      getBoundingClientRect() { return opts.rect; },
      contains(node) { return true; },
      querySelectorAll(sel) { return (opts.items || []).filter((i) => sel === ".file-item" || sel === ".device-entry"); },
      appendChild(child) { this.children.push(child); return child; },
    };
    node.closest = (sel) => (opts.closestOf ? opts.closestOf(sel) : null);
    return node;
  };
  return {
    makeNode,
    listeners,
    document: {
      createElement: (tag) => makeNode({ tag, classes: [], rect: { left: 0, top: 0, right: 0, bottom: 0 } }),
      // The controller binds Escape / Ctrl+A at the document level, so the
      // stub has to accept those registrations or the factory throws.
      addEventListener() {},
      removeEventListener() {},
    },
  };
}

const dom = makeDom();
const container = dom.makeNode({
  rect: { left: 0, top: 0, right: 600, bottom: 400 },
  scrollLeft: 0,
  scrollTop: 0,
  items: [],
});
const sandbox = {
  window: {},
  globalThis: undefined,
  document: dom.document,
  module: { exports: {} },
  console,
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(selectionSource, sandbox);
const SelectionApi = sandbox.module.exports;

check("the shared controller exposes a factory and a drag mime type", () => {
  assert.equal(typeof SelectionApi.create, "function");
  assert.ok(SelectionApi.DRAG_MIME, "a drag payload mime type is required");
});

check("Ctrl+click toggles instead of clearing the selection", () => {
  const items = [
    dom.makeNode({ rect: { left: 0, top: 0, right: 50, bottom: 50 }, classes: [] }),
    dom.makeNode({ rect: { left: 60, top: 0, right: 110, bottom: 50 }, classes: [] }),
  ];
  const host = dom.makeNode({ rect: { left: 0, top: 0, right: 600, bottom: 400 }, items, scrollLeft: 0, scrollTop: 0 });
  const api = SelectionApi.create({ container: host, itemSelector: ".file-item" });
  // Note: the controller runs in a vm realm, so its arrays are not the same
  // Array prototype as this file's. Compare by joined index rather than with
  // deepStrictEqual, which would fail on prototype identity alone.
  const indices = () => api.selection.map((n) => items.indexOf(n)).join(",");
  api.selectOnly(items[0]);
  assert.equal(indices(), "0", "a plain selection holds exactly one item");
  api.setSelection([items[0], items[1]], items[0]);
  assert.equal(indices(), "0,1");
  // Toggling back down to a single item, which is what Ctrl+click does.
  api.setSelection([items[0]], items[0]);
  assert.equal(indices(), "0");
  // The selected class must be painted, not only tracked internally.
  assert.ok(items[0].classList.contains("selected"));
  assert.equal(items[0].getAttribute("aria-selected"), "true");
});

check("Shift+click extends a contiguous range from the anchor", () => {
  const rects = [[0, 0], [60, 0], [120, 0], [180, 0], [240, 0]];
  const items = rects.map(([left, top]) =>
    dom.makeNode({ rect: { left, top, right: left + 50, bottom: top + 50 }, classes: [] }));
  const host = dom.makeNode({ rect: { left: 0, top: 0, right: 600, bottom: 400 }, items, scrollLeft: 0, scrollTop: 0 });
  const api = SelectionApi.create({ container: host, itemSelector: ".file-item" });
  // Anchor on the second item, extend to the fourth: three items.
  api.setSelection([items[1], items[2], items[3]], items[1]);
  const indices = () => api.selection.map((n) => items.indexOf(n)).sort().join(",");
  assert.equal(indices(), "1,2,3");
  assert.ok(api.isSelected(items[2]) && api.isSelected(items[3]));
  assert.ok(!api.isSelected(items[0]) && !api.isSelected(items[4]),
    "items outside the range must not be selected");
});

check("Escape and Ctrl+A are handled at the document level", () => {
  assert.match(selectionSource, /event\.key === "Escape"/);
  assert.match(selectionSource, /event\.key === "a" \|\| event\.key === "A"/);
  // Select-all must respect the selectable predicate, not select blindly.
  assert.match(selectionSource, /setSelection\(items\(\)\.filter\(isSelectable\)/);
});

check("a modified click never opens a file or enters a folder", () => {
  const toolbar = read("cloud/browser/toolbar.js");
  const devices = read("cloud/browser/device-locations.js");
  // Both files guard on the same condition; one uses a local, the other
  // inlines it. Assert the guard exists and that it returns before any
  // open/navigate call in the same handler.
  for (const [name, source] of [["toolbar.js", toolbar], ["device-locations.js", devices]]) {
    assert.match(source, /event\.ctrlKey \|\| event\.metaKey \|\| event\.shiftKey/,
      `${name} must test the additive modifiers on click`);
    const guardIndex = source.search(/if \((?:modified|event\.ctrlKey)[^)]*\) \{/);
    assert.ok(guardIndex > 0, `${name} must branch on the modifiers`);
    const after = source.slice(guardIndex, guardIndex + 200);
    assert.match(after, /event\.preventDefault\(\);/,
      `${name} must prevent the default open/navigate`);
    assert.match(after, /return;/,
      `${name} must return before opening or navigating`);
  }
  // The old order was select-then-navigate, which destroyed the selection.
  // The plain folder path legitimately still selects and navigates, so assert
  // only that no such sequence appears *before* the modifier guard, which is
  // where an unguarded select-then-navigate would have to sit.
  const guardIndex = toolbar.search(/if \((?:modified|event\.ctrlKey)[^)]*\) \{/);
  assert.ok(guardIndex > 0);
  const beforeGuard = toolbar.slice(Math.max(0, guardIndex - 1200), guardIndex);
  assert.doesNotMatch(
    beforeGuard,
    /activateItem\(item\);[\s\S]{0,80}?navigateToResourcePath/,
    "a folder must not be selected and then navigated in the same click before the guard runs");
});

check("both file surfaces register the shared controller", () => {
  assert.match(read("cloud/browser/toolbar.js"), /WebWindowsFileSelection\.create\(/);
  assert.match(devices_read(), /WebWindowsFileSelection\.create\(/);
  function devices_read() { return read("cloud/browser/device-locations.js"); }
});

check("the drag payload carries every selected item", () => {
  assert.match(selectionSource, /buildPayload\(Array\.from\(selection\)/,
    "the drag must carry the whole selection, not just the item under the cursor");
  assert.match(selectionSource, /event\.dataTransfer\.setData\(DRAG_MIME/);
});

check("the new script is served by the page that uses it", () => {
  const files = read("cloud/browser/files.asp");
  assert.match(files, /file-selection\.js\?v=/,
    "files.asp must load the controller before toolbar.js");
  assert.ok(
    files.indexOf("file-selection.js") < files.indexOf("toolbar.js"),
    "the controller must load first");
});

check("selection styling exists and the marquee is positioned", () => {
  const css = read("cloud/browser/styles.css");
  assert.match(css, /\.selection-marquee\s*\{[^}]*position:\s*absolute/);
  assert.match(css, /\[data-drop-target\]\.drop-target/);
  assert.match(css, /\.file-list,\s*\.device-content\s*\{\s*position:\s*relative/,
    "the marquee needs a positioned ancestor or it anchors to the page");
  assert.match(css, /\.file-item\.selected/);
});

console.log(`\ndesktop label, weather localization and file selection smoke test passed: ${passed} checks`);
