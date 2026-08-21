import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../assets/js/locale-region.js", import.meta.url), "utf8");

function run({ locale, zone, stored = {}, permission = "prompt" }) {
  const values = new Map(Object.entries(stored));
  const events = [];
  const context = {
    navigator: {
      language: locale,
      languages: [locale],
      permissions: { query: async () => ({ state: permission }) },
      geolocation: { getCurrentPosition: () => { throw new Error("must not prompt without a granted permission"); } }
    },
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) },
    Intl: { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: zone }) }) },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
    window: { dispatchEvent: event => events.push(event) }
  };
  context.window.window = context.window;
  vm.runInNewContext(source, context, { filename: "locale-region.js" });
  return { values, api: context.window.WebWindowsLocale, events };
}

for (const sample of [
  ["zh-CN", "Asia/Shanghai", "zh", "CN"],
  ["zh-TW", "Asia/Taipei", "tw", "TW"],
  ["ja-JP", "Asia/Tokyo", "jp", "JP"],
  ["en-US", "America/Los_Angeles", "en", "US"],
  ["fr-FR", "Europe/Paris", "en", "US"]
]) {
  const result = run({ locale: sample[0], zone: sample[1] });
  assert.equal(result.values.get("lang"), sample[2]);
  assert.equal(result.values.get("webwindows.region"), sample[3]);
  assert.equal(result.values.get("webwindows.region.source"), "system");
}

const manual = run({ locale: "ja-JP", zone: "Asia/Tokyo", stored: {
  lang: "en", "webwindows.region": "CN", "webwindows.timeZone": "Asia/Shanghai", "webwindows.region.source": "manual"
}});
assert.equal(manual.values.get("lang"), "en", "manual language must win after first initialization");
assert.equal(manual.api.getRegion().code, "CN", "manual region must win after first initialization");
assert.equal(manual.api.regionFromCoordinates(35.68, 139.76), "JP");
assert.equal(manual.api.regionFromCoordinates(25.03, 121.56), "TW");
assert.equal(manual.api.regionFromCoordinates(39.90, 116.40), "CN");
console.log("locale and region initialization smoke tests passed");
