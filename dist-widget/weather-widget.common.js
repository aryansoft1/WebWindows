/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 262:
/***/ ((__unused_webpack_module, exports) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
// runtime helper for setting properties on components
// in a tree-shakable way
exports.A = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
        target[key] = val;
    }
    return target;
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ entry_lib)
});

;// ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
/* eslint-disable no-var */
// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var currentScript = window.document.currentScript
  if (false) // removed by dead control flow
{ var getCurrentScript; }

  var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)
  if (src) {
    __webpack_require__.p = src[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
/* harmony default export */ const setPublicPath = (null);

;// external {"commonjs":"vue","commonjs2":"vue","root":"Vue"}
const external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject = require("vue");
;// ./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./webwindows-vue/src/components/weather.vue?vue&type=template&id=c8ebc556&scoped=true


const _hoisted_1 = { class: "weather-header" }
const _hoisted_2 = {
  id: "weather-location",
  class: "weather-location"
}
const _hoisted_3 = { class: "weather-info" }
const _hoisted_4 = ["src"]
const _hoisted_5 = { class: "weather-text" }
const _hoisted_6 = {
  id: "weather-temp",
  class: "weather-temp"
}
const _hoisted_7 = {
  id: "weather-desc",
  class: "weather-desc"
}

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
    id: "weatherTimeWidget",
    class: "weather-widget",
    style: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeStyle)($options.rootStyle),
    onMousedown: _cache[1] || (_cache[1] = (...args) => ($options.onMouseDown && $options.onMouseDown(...args))),
    onTouchstart: _cache[2] || (_cache[2] = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.withModifiers)((...args) => ($options.onTouchStart && $options.onTouchStart(...args)), ["prevent"]))
  }, [
    (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", _hoisted_1, [
      (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", _hoisted_2, (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toDisplayString)($data.weatherLocation), 1),
      (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("button", {
        id: "closeWeatherBtn",
        onClick: _cache[0] || (_cache[0] = (...args) => ($options.closeWidget && $options.closeWidget(...args)))
      }, "×")
    ]),
    (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", _hoisted_3, [
      (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("img", {
        id: "weather-icon",
        class: "weather-icon",
        src: $data.weatherIcon,
        alt: "天气图标"
      }, null, 8, _hoisted_4),
      (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", _hoisted_5, [
        (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", _hoisted_6, (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toDisplayString)($data.weatherTemp), 1),
        (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", _hoisted_7, (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toDisplayString)($data.weatherDesc), 1)
      ])
    ])
  ], 36))
}
;// ./webwindows-vue/src/components/weather.vue?vue&type=template&id=c8ebc556&scoped=true

;// ./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./webwindows-vue/src/components/weather.vue?vue&type=script&lang=js

/* harmony default export */ const weathervue_type_script_lang_js = ({
  name: "WeatherTimeWidget",
  data() {
    return {
      position: { x: 100, y: 100 }, // 初始位置，可根据需要调整
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      weatherTemp: "--°C",
      weatherDesc: "加载中...",
      weatherIcon: "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg",
      weatherLocation: "定位中...",
      touchOffset: { x: 0, y: 0 },
      lang: (navigator.language || "zh").slice(0, 2),
      refreshTimer: null,
      isVisible: true,
      hasDragged: false,
    };
  },
  computed:{
    rootStyle(){
      const base = { position:'absolute', cursor: this.isDragging ? 'move' : 'default' }
      if (this.hasDragged) {
        base.left  = this.position.x + 'px'
        base.top   = this.position.y + 'px'
        base.right = 'auto'
      }
      return base
    }
  },
  mounted() {
    // 鼠标移动和松开事件绑定到document，支持拖拽
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);

    // 初始化加载天气
    this.loadWeather();

    // 每小时刷新一次天气
    this.refreshTimer = setInterval(() => {
      this.loadWeather();
    }, 3600000);
  },
  beforeUnmount() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    clearInterval(this.refreshTimer);
  },
  methods: {
    onMouseDown(e) {
      this.isDragging = true;
      this.dragOffset.x = e.offsetX;
      this.dragOffset.y = e.offsetY;
    },
    onMouseMove(e) {
      if (!this.isDragging) return
      if (!this.hasDragged) this.hasDragged = true   // ★关键：第一次移动时切到 left/top 模式
      this.position.x = e.pageX - this.dragOffset.x
      this.position.y = e.pageY - this.dragOffset.y
    },
    onMouseUp() {
      this.isDragging = false;
    },
    onTouchStart(e) {
      const touch = e.touches[0];
      this.touchOffset.x = touch.clientX - this.position.x;
      this.touchOffset.y = touch.clientY - this.position.y;

      const onTouchMove = (e) => {
        const touch = e.touches[0];
        this.position.x = touch.clientX - this.touchOffset.x;
        this.position.y = touch.clientY - this.touchOffset.y;
        if (!this.hasDragged) this.hasDragged = true
        e.preventDefault(); // 禁止默认滚动
      };

      const onTouchEnd = () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };

      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    },
    
    // ========= 仅替换为 Open-Meteo 的实现，其他逻辑尽量不动 =========
    // 仅替换 methods 里的 fetchWeather()
async fetchWeather(lat, lon) {
  // —— 兜底坐标：成都凤凰山军用机场 —— //
  const safeLat = Number.isFinite(lat) && Math.abs(lat) > 0 ? lat : 30.73019;
  const safeLon = Number.isFinite(lon) && Math.abs(lon) > 0 ? lon : 104.09282;

  // ==== A. 并发启动 Open-Meteo（用于调试 + 备用） ==== //
  const omWeatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(safeLat)}` +
    `&longitude=${encodeURIComponent(safeLon)}&current_weather=true&timezone=auto`;

  const omWeatherPromise = fetch(omWeatherUrl, { cache: "no-store" })
    .then(r => r.ok ? r.json() : Promise.reject(new Error(`OM weather HTTP ${r.status}`)))
    .then(j => { console.log("[Open-Meteo][debug weather]", j); return j; })
    .catch(e => { console.warn("[Open-Meteo][debug weather] failed:", e); return null; });


  // ==== B. 首选 wttr ==== //
  let usedWttr = false;
  try {
    const wttrUrl =
      (safeLat === 0 || safeLon === 0)
        ? `https://wttr.in/?format=j1&lang=${this.lang}`
        : `https://wttr.in/${safeLat},${safeLon}?format=j1&lang=${this.lang}`;

    const res = await fetch(wttrUrl, { cache: "no-store" });
    const text = await res.text();

    // wttr 超额时可能返回纯文本示例页；优先尝试 JSON 解析，否则直接抛错走回退
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("WTTR returned non-JSON (likely quota/sample page).");
    }

    const cond = data?.current_condition?.[0];
    const tempC = cond?.temp_C;
    if (!cond || tempC == null) {
      throw new Error("WTTR JSON missing current_condition/temp_C.");
    }

    // 描述（按语言优先级）
    let desc = "Clear";
    if (this.lang === "zh") {
      desc = cond.lang_zh?.[0]?.value || cond.weatherDesc?.[0]?.value || desc;
    } else if (this.lang === "ja") {
      desc = cond.lang_ja?.[0]?.value || cond.weatherDesc?.[0]?.value || desc;
    } else {
      desc = cond.weatherDesc?.[0]?.value || desc;
    }

    // 地名（本地语言优先）
    let areaName = data?.nearest_area?.[0]?.[`lang_${this.lang}`]?.[0]?.value
      || data?.nearest_area?.[0]?.areaName?.[0]?.value
      || "Unknown";

    // 图标（保持你原来的关键词匹配）
    const descLower = (cond.weatherDesc?.[0]?.value || "").toLowerCase();
    let iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg"; // 默认云朵
    if (descLower.includes("sun") || descLower.includes("clear"))
      iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2600.svg";
    else if (descLower.includes("drizzle") || descLower.includes("rain"))
      iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F327.svg";
    else if (descLower.includes("snow"))
      iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F328.svg";
    else if (descLower.includes("thunder") || descLower.includes("storm"))
      iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/26C8.svg";
    else if (descLower.includes("tornado"))
      iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/1f32a.svg";
    else if (descLower.includes("hurricane") || descLower.includes("cyclone"))
      iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/1f300.svg";
    else if (descLower.includes("partly cloudy") || descLower.includes("mostly sunny"))
      iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/26C5.svg";
    else if (descLower.includes("cloud") || descLower.includes("overcast"))
      iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg";
    else if (descLower.includes("mist") || descLower.includes("fog") || descLower.includes("haze") || descLower.includes("smoke"))
      iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/1f32b.svg";
    else
      iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/2600.svg";

    // 更新 UI（wttr 成功）
    this.weatherTemp = `${tempC}°C`;
    this.weatherDesc = desc;
    this.weatherIcon = iconUrl;

    // 二次地名标准化（保留你的逻辑）
    try {
      const response = await fetch(`/api/geonames.asp?city=${encodeURIComponent(areaName)}&lang=${this.lang}`);
      if (!response.ok) throw new Error(`HTTP状态码: ${response.status}`);
      const text2 = await response.text();
      let jsonData;
      try { jsonData = JSON.parse(text2); }
      catch (e) { console.error("JSON解析错误:", e); throw e; }
      if (jsonData?.geonames?.length > 0) {
        this.weatherLocation = jsonData.geonames[0].name || areaName;
      } else {
        this.weatherLocation = areaName;
      }
    } catch (err) {
      console.warn("调用地名接口失败(已忽略):", err.message);
      this.weatherLocation = areaName;
    }

    usedWttr = true; // 标记已用 wttr
  } catch (wttrErr) {
    console.warn("[WTTR] fallback to Open-Meteo because:", wttrErr?.message || wttrErr);

    // ==== C. 回退用 Open-Meteo（并利用刚才已并发的结果） ==== //
    // ★ 只在进入兜底时才请求 geocoding，避免首页无故触发 CORS 报错
    const omGeoUrl =
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${encodeURIComponent(safeLat)}` +
      `&longitude=${encodeURIComponent(safeLon)}&language=${encodeURIComponent(this.lang)}&count=1`;
    const omGeoPromise = fetch(omGeoUrl, { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`OM geo HTTP ${r.status}`)))
      .then(j => { console.log("[Open-Meteo][geo]", j); return j; })
      .catch(e => { console.info("[Open-Meteo][geo] failed:", e); return null; });
    const [omW, omG] = await Promise.allSettled([omWeatherPromise, omGeoPromise]);
    const omWeather = omW.status === "fulfilled" ? omW.value : null;
    const omGeo = omG.status === "fulfilled" ? omG.value : null;

    const cur = omWeather?.current_weather;
    if (!cur) {
      // 双源都失败
      this.weatherDesc = "无服务";
      this.weatherIcon = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg";
      this.weatherTemp = "--°C";
      this.weatherLocation = "未知";
      return;
    }

    // 使用你的 mapWeatherCode + pickLocalizedDesc（如果你组件里已有）
    const mapped = this.mapWeatherCode ? this.mapWeatherCode(cur.weathercode) : { descEn: "Unknown", iconUrl: "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg" };
    const descText = this.pickLocalizedDesc ? this.pickLocalizedDesc(mapped, this.lang) : (mapped.descZh || mapped.descEn);

    let areaName = "未知地点";
    if (omGeo?.results?.length) {
      const g = omGeo.results[0];
      areaName = [g.name, g.admin2, g.admin1, g.country].filter(Boolean).join(" · ");
    }

    this.weatherTemp = `${cur.temperature}°C`;
    this.weatherDesc = descText || "—";
    this.weatherIcon = mapped.iconUrl || "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg";

    try {
      const response = await fetch(`/api/geonames.asp?city=${encodeURIComponent(areaName)}&lang=${this.lang}`);
      if (!response.ok) throw new Error(`HTTP状态码: ${response.status}`);
      const text2 = await response.text();
      let jsonData;
      try { jsonData = JSON.parse(text2); }
      catch (e) { console.error("JSON解析错误:", e); throw e; }
      if (jsonData?.geonames?.length > 0) {
        this.weatherLocation = jsonData.geonames[0].name || areaName;
      } else {
        this.weatherLocation = areaName;
      }
    } catch (err) {
      console.warn("调用地名接口失败(已忽略):", err.message);
      this.weatherLocation = areaName;
    }
  }

  // D. 即使 wttr 成功，也等待并输出一次 Open-Meteo 的并发调试结果（不影响界面）
  if (usedWttr) {
    try {
      const [omW2, omG2] = await Promise.allSettled([omWeatherPromise, omGeoPromise]);
      // 已在 promise 里 console.log 过，这里只是确保 promise 结束，避免未处理的拒绝
    } catch {}
  }
}
,

    loadWeather() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => this.fetchWeather(pos.coords.latitude, pos.coords.longitude),
          () => this.fetchWeather(0, 0)
        );
      } else {
        this.fetchWeather(0, 0);
      }
    },

    // —— Open-Meteo / WMO 天气码 → 多语言描述 + 图标 —— //
    mapWeatherCode(code) {
      const ICON = {
        SUN: "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2600.svg",
        PARTLY: "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/26C5.svg",
        CLOUD: "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg",
        DRIZZLE: "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F326.svg",
        RAIN: "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F327.svg",
        SNOW: "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F328.svg",
        THUNDER: "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/26C8.svg",
        FOG: "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/1f32b.svg",
      };
      const o = (en, zh, ja, icon) => ({ descEn: en, descZh: zh, descJa: ja, iconUrl: icon });

      const MAP = {
        0:  o("Clear sky", "晴朗", "快晴", ICON.SUN),
        1:  o("Mainly clear", "大致晴朗", "晴れ時々曇り", ICON.PARTLY),
        2:  o("Partly cloudy", "局部多云", "くもり時々晴れ", ICON.PARTLY),
        3:  o("Overcast", "阴天", "くもり", ICON.CLOUD),

        45: o("Fog", "雾", "霧", ICON.FOG),
        48: o("Depositing rime fog", "雾凇/雾霭", "着氷性霧", ICON.FOG),

        51: o("Light drizzle", "小毛毛雨", "弱い霧雨", ICON.DRIZZLE),
        53: o("Moderate drizzle", "毛毛雨", "霧雨", ICON.DRIZZLE),
        55: o("Dense drizzle", "较强毛毛雨", "強い霧雨", ICON.DRIZZLE),

        56: o("Light freezing drizzle", "轻微冻毛雨", "弱い着氷性霧雨", ICON.DRIZZLE),
        57: o("Dense freezing drizzle", "冻毛雨", "強い着氷性霧雨", ICON.DRIZZLE),

        61: o("Slight rain", "小雨", "弱い雨", ICON.RAIN),
        63: o("Moderate rain", "中雨", "並の雨", ICON.RAIN),
        65: o("Heavy rain", "大雨", "強い雨", ICON.RAIN),

        66: o("Light freezing rain", "轻微冻雨", "弱い着氷性雨", ICON.RAIN),
        67: o("Heavy freezing rain", "冻雨", "強い着氷性雨", ICON.RAIN),

        71: o("Slight snow", "小雪", "弱い雪", ICON.SNOW),
        73: o("Moderate snow", "中雪", "並の雪", ICON.SNOW),
        75: o("Heavy snow", "大雪", "強い雪", ICON.SNOW),

        77: o("Snow grains", "米雪", "細雪/霰", ICON.SNOW),

        80: o("Slight rain showers", "小阵雨", "弱いにわか雨", ICON.RAIN),
        81: o("Moderate rain showers", "阵雨", "にわか雨", ICON.RAIN),
        82: o("Violent rain showers", "强阵雨", "激しいにわか雨", ICON.RAIN),

        85: o("Slight snow showers", "小阵雪", "弱いにわか雪", ICON.SNOW),
        86: o("Heavy snow showers", "强阵雪", "激しいにわか雪", ICON.SNOW),

        95: o("Thunderstorm", "雷雨", "雷雨", ICON.THUNDER),
        96: o("Thunderstorm with slight hail", "雷雨伴小冰雹", "雷雨(小粒の雹)", ICON.THUNDER),
        99: o("Thunderstorm with heavy hail", "雷雨伴强冰雹", "雷雨(強い雹)", ICON.THUNDER),
      };

      return MAP[code] || o("Unknown", "未知", "不明", ICON.CLOUD);
    },

    // 根据用户语言返回最佳描述
    pickLocalizedDesc(mapped, lang) {
      if (lang === "zh") return mapped.descZh || mapped.descEn;
      if (lang === "ja") return mapped.descJa || mapped.descEn;
      return mapped.descEn;
    },
    closeWidget() {      // ★ 新增：与旧逻辑等价
      this.isVisible = false
    },
  },
});

;// ./webwindows-vue/src/components/weather.vue?vue&type=script&lang=js
 
;// ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-12.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-12.use[1]!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-12.use[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./webwindows-vue/src/components/weather.vue?vue&type=style&index=0&id=c8ebc556&scoped=true&lang=css
// extracted by mini-css-extract-plugin

;// ./webwindows-vue/src/components/weather.vue?vue&type=style&index=0&id=c8ebc556&scoped=true&lang=css

// EXTERNAL MODULE: ./node_modules/vue-loader/dist/exportHelper.js
var exportHelper = __webpack_require__(262);
;// ./webwindows-vue/src/components/weather.vue




;


const __exports__ = /*#__PURE__*/(0,exportHelper/* default */.A)(weathervue_type_script_lang_js, [['render',render],['__scopeId',"data-v-c8ebc556"]])

/* harmony default export */ const weather = (__exports__);
;// ./node_modules/@vue/cli-service/lib/commands/build/entry-lib.js


/* harmony default export */ const entry_lib = (weather);


module.exports = __webpack_exports__["default"];
/******/ })()
;
//# sourceMappingURL=weather-widget.common.js.map