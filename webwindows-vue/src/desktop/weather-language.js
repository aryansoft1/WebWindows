/*
 * Weather widget language normalization.
 *
 * Two separate defects made the widget fall back to English on Chinese and
 * Japanese systems:
 *
 * 1. The stored/system value is a mix of shapes. `localStorage.lang` uses the
 *    app's own codes ("zh" / "tw" / "jp" / "en"), while `navigator.language`
 *    yields full tags ("zh-CN" / "ja-JP" / "en-US"). The widget used a lookup
 *    table that only knew { jp: "ja", tw: "zh" } and otherwise passed the raw
 *    value through, so "zh-CN" or "ja-JP" reached the description resolver as
 *    itself and matched no localized branch at all.
 * 2. wttr.in answers `lang=zh` / `lang=ja` with the *untranslated* English
 *    string, so even a correctly normalized language could still render
 *    English if the provider field was trusted. Resolution therefore prefers
 *    the local WWO code table; see `resolveDesc` in weather.vue.
 *
 * Kept dependency-free and side-effect free so the smoke test can exercise the
 * exact same function the widget runs.
 */
const WeatherLanguage = {
  /**
   * Reduce any stored or system locale to "zh" | "ja" | "en".
   * Traditional Chinese ("tw") intentionally resolves to "zh": the widget's
   * code table carries Simplified strings only, and Simplified text is far
   * better than English.
   */
  normalize(value) {
    const raw = String(value == null ? "" : value).trim().toLowerCase();
    if (!raw) return "zh";
    // App-internal codes first: these are the values localStorage actually holds.
    if (raw === "jp") return "ja";
    if (raw === "tw" || raw === "hk" || raw === "mo") return "zh";
    // Then full/partial BCP-47 tags from the browser.
    if (raw.startsWith("ja")) return "ja";
    if (raw.startsWith("zh") || raw.startsWith("yue") || raw.startsWith("cmn")) return "zh";
    if (raw.startsWith("en")) return "en";
    // A bare two-letter code we do not recognize stays as-is only if it is one
    // of the three supported languages; anything else is safer as Chinese,
    // which is the product default.
    return "zh";
  },

  /**
   * The `lang` query value to send upstream. wttr.in only understands these
   * three, and sending a full tag makes it ignore the request entirely.
   */
  upstream(value) {
    return WeatherLanguage.normalize(value);
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = WeatherLanguage;
}

export default WeatherLanguage;
