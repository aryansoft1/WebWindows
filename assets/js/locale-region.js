(function () {
  "use strict";

  var REGIONS = Object.freeze({
    CN: Object.freeze({ code: "CN", locale: "zh-CN", timeZone: "Asia/Shanghai" }),
    JP: Object.freeze({ code: "JP", locale: "ja-JP", timeZone: "Asia/Tokyo" }),
    TW: Object.freeze({ code: "TW", locale: "zh-TW", timeZone: "Asia/Taipei" }),
    US: Object.freeze({ code: "US", locale: "en-US", timeZone: "America/New_York" })
  });
  var REGION_KEY = "webwindows.region";
  var TIME_ZONE_KEY = "webwindows.timeZone";
  var REGION_SOURCE_KEY = "webwindows.region.source";

  function systemLocale() {
    return (navigator.languages && navigator.languages[0]) || navigator.language || "en-US";
  }

  function languageFromLocale(locale) {
    var value = String(locale || "").toLowerCase();
    if (value.startsWith("ja")) return "jp";
    if (value.startsWith("zh-tw") || value.startsWith("zh-hk") || value.startsWith("zh-mo") || value.includes("hant")) return "tw";
    if (value.startsWith("zh")) return "zh";
    return "en";
  }

  function regionFromEnvironment(locale, timeZone) {
    var zone = String(timeZone || "");
    var value = String(locale || "").toLowerCase();
    if (zone === "Asia/Tokyo" || value.startsWith("ja")) return "JP";
    if (zone === "Asia/Taipei" || value.startsWith("zh-tw") || value.startsWith("zh-hk") || value.includes("hant")) return "TW";
    if (zone.startsWith("America/") || value.startsWith("en-us")) return "US";
    if (["Asia/Shanghai", "Asia/Chongqing", "Asia/Urumqi"].includes(zone) || value.startsWith("zh")) return "CN";
    return "US";
  }

  function regionFromCoordinates(latitude, longitude) {
    if (latitude >= 24 && latitude <= 46 && longitude >= 122 && longitude <= 146) return "JP";
    if (latitude >= 21 && latitude <= 26.5 && longitude >= 119 && longitude <= 123) return "TW";
    if (latitude >= 18 && latitude <= 54 && longitude >= 73 && longitude <= 135) return "CN";
    if (latitude >= 18 && latitude <= 72 && longitude >= -171 && longitude <= -66) return "US";
    return null;
  }

  function emitRegion(region) {
    window.dispatchEvent(new CustomEvent("webwindows:region-changed", { detail: region }));
  }

  function setRegion(code, options) {
    var region = REGIONS[code] || REGIONS.CN;
    var source = options && options.source || "manual";
    localStorage.setItem(REGION_KEY, region.code);
    localStorage.setItem(TIME_ZONE_KEY, region.timeZone);
    localStorage.setItem(REGION_SOURCE_KEY, source);
    if (!options || options.emit !== false) emitRegion(region);
    return region;
  }

  function getRegion() {
    var code = localStorage.getItem(REGION_KEY);
    var region = REGIONS[code] || REGIONS[regionFromEnvironment(systemLocale(), Intl.DateTimeFormat().resolvedOptions().timeZone)];
    return Object.assign({}, region, { timeZone: localStorage.getItem(TIME_ZONE_KEY) || region.timeZone });
  }

  async function refineRegionFromAuthorizedLocation() {
    if (!navigator.geolocation || !navigator.permissions || localStorage.getItem(REGION_SOURCE_KEY) === "manual") return;
    try {
      var permission = await navigator.permissions.query({ name: "geolocation" });
      if (permission.state !== "granted" || localStorage.getItem(REGION_SOURCE_KEY) === "manual") return;
      navigator.geolocation.getCurrentPosition(function (position) {
        if (localStorage.getItem(REGION_SOURCE_KEY) === "manual") return;
        var code = regionFromCoordinates(position.coords.latitude, position.coords.longitude);
        if (code) setRegion(code, { source: "location" });
      }, function () {}, { enableHighAccuracy: false, timeout: 5000, maximumAge: 86400000 });
    } catch (_) {}
  }

  function initialize() {
    if (!localStorage.getItem("lang")) localStorage.setItem("lang", languageFromLocale(systemLocale()));
    if (!localStorage.getItem(REGION_KEY)) {
      var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setRegion(regionFromEnvironment(systemLocale(), zone), { source: "system", emit: false });
      refineRegionFromAuthorizedLocation();
    } else if (!localStorage.getItem(REGION_SOURCE_KEY)) {
      // Existing installations chose this value in Settings before source tracking existed.
      localStorage.setItem(REGION_SOURCE_KEY, "manual");
    }
    return getRegion();
  }

  var api = Object.freeze({ REGIONS: REGIONS, initialize: initialize, getRegion: getRegion, setRegion: setRegion,
    systemLocale: systemLocale, languageFromLocale: languageFromLocale, regionFromEnvironment: regionFromEnvironment,
    regionFromCoordinates: regionFromCoordinates, refineRegionFromAuthorizedLocation: refineRegionFromAuthorizedLocation });
  window.WebWindowsLocale = api;
  initialize();
})();

