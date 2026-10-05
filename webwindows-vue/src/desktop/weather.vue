<template>
  <div id="weatherTimeWidget" v-show="isVisible" class="weather-widget" :style="rootStyle" :data-ww-cursor="isDragging ? 'grabbing' : 'move'" @mousedown="onMouseDown"
    @touchstart.prevent="onTouchStart">
    <!-- 顶部：城市在左，关闭在右 -->
    <div class="weather-header">
      <div id="weather-location" class="weather-location">{{ weatherLocation }}</div>
      <button id="closeWeatherBtn" type="button" aria-label="关闭天气组件" @mousedown.stop @touchstart.stop @click.stop="closeWidget">×</button>
    </div>

    <!-- 下部：天气（图标 + 温度 + 描述） -->
    <div class="weather-info">
      <svg id="weather-icon" class="weather-icon" :class="[`weather-icon--${weatherIconKind}`, { 'is-heavy-weather': isHeavyWeather }]" viewBox="0 0 48 48" role="img" :aria-label="`${weatherDesc} ${weatherTemp}`" xmlns="http://www.w3.org/2000/svg">
        <g v-if="weatherIconKind === 'sun' || weatherIconKind === 'partly'" class="weather-sun">
          <circle cx="17" cy="17" r="6" fill="#FFC857" />
          <path d="M17 3v4M17 27v4M3 17h4M27 17h4M7.1 7.1 10 10m14 14 2.9 2.9M26.9 7.1 24 10" stroke="#FFC857" stroke-width="2" stroke-linecap="round" />
        </g>
        <path v-if="['partly','cloud','drizzle','rain','snow','thunder','fog'].includes(weatherIconKind)" class="weather-cloud" d="M14.1 30.5h20.1a7 7 0 0 0 .4-14 10.5 10.5 0 0 0-20.2 2.1 6 6 0 0 0-.3 11.9Z" fill="#EAF5FF" stroke="#BBDDF7" stroke-width="1.4" stroke-linejoin="round" />
        <g v-if="weatherIconKind === 'drizzle' || weatherIconKind === 'rain'" class="weather-rain" fill="none" stroke="#57C7F3" stroke-width="2.2" stroke-linecap="round">
          <path class="rain-drop rain-drop--one" d="m17 35-2 4" /><path class="rain-drop rain-drop--two" d="m25 35-2 4" /><path class="rain-drop rain-drop--three" d="m33 35-2 4" />
          <path v-if="weatherIconKind === 'rain'" class="rain-drop rain-drop--four" d="m21 41-2 4" /><path v-if="weatherIconKind === 'rain'" class="rain-drop rain-drop--five" d="m30 41-2 4" />
        </g>
        <g v-if="weatherIconKind === 'snow'" class="weather-snow" fill="#DDF6FF">
          <circle class="snow-flake snow-flake--one" cx="16" cy="38" r="1.8" /><circle class="snow-flake snow-flake--two" cx="25" cy="41" r="1.8" /><circle class="snow-flake snow-flake--three" cx="34" cy="37" r="1.8" />
        </g>
        <path v-if="weatherIconKind === 'thunder'" class="weather-lightning" d="m25 31-7 10h6l-2 7 10-12h-7l3-5Z" fill="#FFD166" stroke="#F3B53F" stroke-width=".8" stroke-linejoin="round" />
        <g v-if="weatherIconKind === 'fog'" class="weather-fog" fill="none" stroke="#C9D9E7" stroke-width="2" stroke-linecap="round">
          <path d="M10 35h27M7 40h25" /><path d="M13 30h22" opacity=".6" />
        </g>
      </svg>
      <div class="weather-text">
        <div id="weather-temp" class="weather-temp">{{ weatherTemp }}</div>
        <div id="weather-desc" class="weather-desc">{{ weatherDesc }}</div>
      </div>
    </div>
  </div>
</template>


<script>
import WeatherLanguage from './weather-language.js'

export default {
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
      lang: WeatherLanguage.normalize(
        localStorage.getItem("lang") || (navigator.language || "zh")
      ),
      refreshTimer: null,
      isVisible: true,
      hasDragged: false,
      offsetLat: -0.0000095, // 纠偏：纬度增量（+向北，-向南），单位：度
      offsetLon: 0.0000215, // 纠偏：经度增量（+向东，-向西），单位：度
    };
  },
  computed: {
    weatherIconKind() {
      const icon = String(this.weatherIcon || '')
      if (icon.includes('26C8')) return 'thunder'
      if (icon.includes('1F328')) return 'snow'
      if (icon.includes('1F326')) return 'drizzle'
      if (icon.includes('1F327')) return 'rain'
      if (icon.includes('1f32b')) return 'fog'
      if (icon.includes('26C5')) return 'partly'
      if (icon.includes('2600')) return 'sun'
      return 'cloud'
    },
    isHeavyWeather() {
      return /大雨|暴雨|强阵雨|大雪|暴风雪|heavy|torrential|violent|blizzard/i.test(String(this.weatherDesc || ''))
    },
    rootStyle() {
      const base = { position: 'absolute' }
      if (this.hasDragged) {
        base.left = this.position.x + 'px'
        base.top = this.position.y + 'px'
        base.right = 'auto'
      }
      return base
    }
  },
  mounted() {
    // 鼠标移动和松开事件绑定到document，支持拖拽
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    this.onLanguageChanged = (event) => {
      const selected = event.detail?.language || localStorage.getItem("lang") || "zh";
      this.lang = WeatherLanguage.normalize(selected);
      this.loadWeather();
    };
    window.addEventListener("webwindows:language-changed", this.onLanguageChanged);
    this.onWidgetVisibilityChanged = (event) => {
      if (event.detail?.id !== 'weatherTimeWidget') return
      this.isVisible = Boolean(event.detail.visible)
      this.restoreWidgetGeometry(event.detail.geometry)
    }
    this.$el.addEventListener('webwindows:desktop-widget-visibility', this.onWidgetVisibilityChanged)
    const activeWorkspace = window.WebWindows?.workspaces?.getActiveWorkspace?.()
    const savedWidget = activeWorkspace?.widgets?.find((widget) => widget.id === 'weatherTimeWidget')
    if (savedWidget) {
      this.isVisible = savedWidget.visible !== false
      this.restoreWidgetGeometry(savedWidget.geometry)
    }
    else {
      try {
        const state = JSON.parse(localStorage.getItem('webwindows.workspaces.v1') || 'null')
        const workspace = state?.workspaces?.find((item) => item.id === state.activeWorkspaceId)
        const widget = workspace?.widgets?.find((item) => item.id === 'weatherTimeWidget')
        if (widget) {
          this.isVisible = widget.visible !== false
          this.restoreWidgetGeometry(widget.geometry)
        }
      } catch (_) {}
    }

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
    window.removeEventListener("webwindows:language-changed", this.onLanguageChanged);
    this.$el.removeEventListener('webwindows:desktop-widget-visibility', this.onWidgetVisibilityChanged)
    clearInterval(this.refreshTimer);
  },
  methods: {
    restoreWidgetGeometry(geometry) {
      if (!geometry || !Number.isFinite(Number(geometry.x)) || !Number.isFinite(Number(geometry.y))) return
      this.position.x = Math.max(0, Math.min(1, Number(geometry.x))) * (window.innerWidth || document.documentElement.clientWidth)
      this.position.y = Math.max(0, Math.min(1, Number(geometry.y))) * (window.innerHeight || document.documentElement.clientHeight)
      this.hasDragged = true
    },
    onMouseDown(e) {
      if (e.button !== 0) return
      this.isDragging = true;
      const rect = this.$el.getBoundingClientRect()
      this.dragOffset.x = e.clientX - rect.left
      this.dragOffset.y = e.clientY - rect.top
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
      const rect = this.$el.getBoundingClientRect()
      this.touchOffset.x = touch.clientX - rect.left
      this.touchOffset.y = touch.clientY - rect.top

      const onTouchMove = (e) => {
        const touch = e.touches[0];
        this.position.x = touch.pageX - this.touchOffset.x;
        this.position.y = touch.pageY - this.touchOffset.y;
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
      const safeLat = Number.isFinite(lat) ? lat : 30.73019;
      const safeLon = Number.isFinite(lon) ? lon : 104.09282;

      // ---------- 1) wttr 优先（~lat,lon + 两位小数；非 JSON/Unknown 则抛错） ----------
      try {
        const lat2 = Math.round(safeLat * 100) / 100;   // 两位小数足够
        const lon2 = Math.round(safeLon * 100) / 100;
        // 强烈建议：wttr 通过服务端代理，否则容易被 CORS/WAF 影响
        // 如已上代理：/api/wttr_proxy.asp?lat=...&lon=...&lang=...
        // 这里先保留直连写法（如果你已经搭了代理，请把下面一行替换成代理 URL）
        const wttrUrl = `https://wttr.in/~${lat2},${lon2}?format=j1&lang=${this.lang}`;

        const wttrRes = await fetch(wttrUrl, { cache: 'no-store' });
        const wttrText = await wttrRes.text();
        if (!wttrText.trim().startsWith('{') || /Unknown location/i.test(wttrText)) {
          throw new Error('wttr non-JSON or unknown');
        }
        const data = JSON.parse(wttrText);

        const cond = data?.current_condition?.[0];
        const tempC = cond?.temp_C;
        if (tempC == null) throw new Error('wttr missing temp');

        // 描述：zh/ja 用本地码表（wttr 的 lang_zh/ja 实际仍是英文）
        const mapped = this.mapWttrCode(cond?.weatherCode);
        const descRaw = this.resolveDesc(
          mapped,
          (cond[`lang_${this.lang}`]?.[0]?.value?.trim())
            || (cond.weatherDesc?.[0]?.value?.trim()),
          this.lang
        );

        // 图标：先用关键词匹配，不命中则用映射图标
        const en = (cond.weatherDesc?.[0]?.value || '').toLowerCase();
        let iconUrl = mapped.iconUrl;
        if (en.includes('thunder')) iconUrl = 'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/26C8.svg';
        else if (en.includes('drizzle')) iconUrl = 'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F326.svg';
        else if (en.includes('rain')) iconUrl = 'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F327.svg';
        else if (en.includes('partly') || en.includes('mostly')) iconUrl = 'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/26C5.svg';
        else if (en.includes('cloud')) iconUrl = 'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg';

        this.weatherTemp = `${tempC}°C`;
        this.weatherDesc = descRaw;
        this.weatherIcon = iconUrl;

        // 地名二次标准化（保留你原有 geonames.asp；没有就忽略）
        try {
          const areaName =
            data?.nearest_area?.[0]?.[`lang_${this.lang}`]?.[0]?.value
            || data?.nearest_area?.[0]?.areaName?.[0]?.value
            || '';
          if (areaName) {
            const resp = await fetch(`/api/geonames.asp?city=${encodeURIComponent(areaName)}&lang=${this.lang}`);
            const txt2 = await resp.text();
            try {
              const j2 = JSON.parse(txt2);
              this.weatherLocation = j2?.geonames?.[0]?.name || this.weatherLocation || areaName;
            } catch { }
          }
        } catch { }
        return; // ✅ wttr 成功直接返回
      } catch (e) {
        console.warn('[wttr] failed, fallback OM:', e?.message || e);
      }

      // ---------- 2) wttr 失败 → Open-Meteo 兜底（只在失败时调用） ----------
      try {
        const omWUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(safeLat)}&longitude=${encodeURIComponent(safeLon)}&current_weather=true&timezone=auto`;
        const omW = await fetch(omWUrl, { cache: 'no-store' }).then(r => r.json());
        const cur = omW?.current_weather;
        if (!cur) throw new Error('om weather missing');

        const mapped = this.mapWeatherCode ? this.mapWeatherCode(cur.weathercode) : null;
        const descText = mapped ? this.resolveDesc(mapped, '', this.lang) : '—';
        const iconFinal = mapped?.iconUrl || 'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg';

        this.weatherTemp = `${cur.temperature}°C`;
        this.weatherDesc = descText;
        this.weatherIcon = iconFinal;

        // 地名：loadWeather 里并发拿的 district 已经显示；这里就不强依赖 OM 反向地理了
      } catch (e) {
        // 双源都失败
        this.weatherTemp = '--°C';
        this.weatherDesc = '无服务';
        this.weatherIcon = 'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg';
        if (!this.weatherLocation) this.weatherLocation = '未知地点';
      }
    }

    ,

    async loadWeather() {
      const onPos = async ({ coords }) => {
        const lat = coords.latitude + (this.offsetLat || 0);
        const lon = coords.longitude + (this.offsetLon || 0);

        // 先并发拿“区/郡”并显示（不阻塞天气）
        (async () => {
          try {
            const district = await this.fetchDistrict(lat, lon);
            if (district) this.weatherLocation = district;   // “区/郡”优先显示
          } catch { }
        })();

        // 再拉天气
        await this.fetchWeather(lat, lon);
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          onPos,
          () => onPos({ coords: { latitude: 0, longitude: 0 } })
        );
      } else {
        onPos({ coords: { latitude: 0, longitude: 0 } });
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
      const o = (en, zh, ja, icon) => ({ descEn: en, descZh: zh, descJa: ja, iconUrl: icon, descUnknown: "未知" });

      const MAP = {
        0: o("Clear sky", "晴朗", "快晴", ICON.SUN),
        1: o("Mainly clear", "大致晴朗", "晴れ時々曇り", ICON.PARTLY),
        2: o("Partly cloudy", "局部多云", "くもり時々晴れ", ICON.PARTLY),
        3: o("Overcast", "阴天", "くもり", ICON.CLOUD),

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
      // === WWO / wttr 别名（把 wttr 的 code 归并进来） ===
      MAP[113] = o("Clear", "晴朗", "快晴", ICON.SUN);
      MAP[116] = o("Partly cloudy", "多云", "くもり時々晴れ", ICON.PARTLY);
      MAP[122] = o("Overcast", "阴天", "くもり", ICON.CLOUD);
      MAP[143] = o("Mist", "薄雾", "もや/霧", ICON.FOG);

      MAP[176] = o("Patchy rain nearby", "中阵雨", "にわか雨", ICON.RAIN);     // ≈ WMO 81
      MAP[263] = o("Patchy light drizzle", "小毛毛雨", "弱い霧雨", ICON.DRIZZLE);  // ≈ 51
      MAP[266] = o("Light drizzle", "小毛毛雨", "弱い霧雨", ICON.DRIZZLE);  // ≈ 51
      MAP[296] = o("Light rain", "小雨", "弱い雨", ICON.RAIN);     // ≈ 61
      MAP[299] = o("Moderate rain at times", "中雨", "並の雨", ICON.RAIN);     // ≈ 63
      MAP[302] = o("Moderate rain", "中雨", "並の雨", ICON.RAIN);     // ≈ 63
      MAP[305] = o("Heavy rain at times", "大雨", "強い雨", ICON.RAIN);     // ≈ 65
      MAP[308] = o("Heavy rain", "大雨", "強い雨", ICON.RAIN);     // ≈ 65

      MAP[353] = o("Light rain shower", "小阵雨", "弱いにわか雨", ICON.RAIN);     // ≈ 80
      MAP[356] = o("Moderate or heavy rain shower", "强阵雨", "激しいにわか雨", ICON.RAIN);     // ≈ 82
      MAP[359] = o("Torrential rain shower", "暴雨", "非常に激しい雨", ICON.RAIN);     // 归强阵雨

      MAP[386] = o("Patchy light rain with thunder", "雷阵雨", "雷雨(弱い)", ICON.THUNDER);  // ≈ 95
      MAP[389] = o("Heavy rain with thunderstorm", "强雷阵雨", "激しい雷雨", ICON.THUNDER);  // ≈ 95/96
      // （可按需要继续加其他 WWO 码）

      return MAP[code] || o("Unknown", "未知", "不明", ICON.CLOUD);
    },

    // 根据用户语言返回最佳描述
    pickLocalizedDesc(mapped, lang) {
      if (lang === "zh") return mapped.descZh || mapped.descEn;
      if (lang === "ja") return mapped.descJa || mapped.descEn;
      return mapped.descEn;
    },

    /*
     * wttr.in answers `lang=zh` / `lang=ja` with the *untranslated* English
     * string (verified: for weatherCode 353 it returns
     * lang_zh = "Light rain shower", byte-identical to weatherDesc). So the
     * upstream localized field cannot be trusted for zh/ja, and preferring it
     * is exactly what made Chinese and Japanese systems show English.
     *
     * For zh/ja we therefore resolve from our own WWO code table, which covers
     * every code wttr can return. Only when the table genuinely has no entry
     * do we fall back to the provider text. English keeps using the provider
     * text, because there it is already the target language.
     */
    resolveDesc(mapped, providerText, lang) {
      const provider = String(providerText || "").trim();
      if (lang === "en" || lang === "xx") return provider || this.pickLocalizedDesc(mapped, lang);
      const localized = this.pickLocalizedDesc(mapped, lang);
      // The table's "Unknown" placeholder is not a real translation, so an
      // unmapped code still deserves the provider text over "未知"/"不明".
      if (localized && localized !== mapped.descUnknown) return localized;
      return provider || localized;
    },
    // ✅ 完整覆盖常见 wttr/weatherCode → 多语言描述 + 图标
    mapWttrCode(code) {
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
      const o = (en, zh, ja, icon) => ({ descEn: en, descZh: zh, descJa: ja, iconUrl: icon, descUnknown: "未知" });

      const M = {
        // 晴/多云
        113: o("Clear", "晴", "快晴", ICON.SUN),
        116: o("Partly cloudy", "多云间晴", "所により曇り", ICON.PARTLY),
        119: o("Cloudy", "多云", "くもり", ICON.CLOUD),
        122: o("Overcast", "阴", "くもり（厚い雲）", ICON.CLOUD),

        // 能见度差
        143: o("Mist", "薄雾", "靄（もや）", ICON.FOG),
        248: o("Fog", "雾", "霧", ICON.FOG),
        260: o("Freezing fog", "冻雾", "着氷性の霧", ICON.FOG),

        // 附近/零星
        176: o("Patchy rain nearby", "附近零星小雨", "ところにより雨", ICON.RAIN),
        179: o("Patchy snow nearby", "附近零星小雪", "ところにより雪", ICON.SNOW),
        182: o("Patchy sleet nearby", "附近零星雨夹雪", "ところによりみぞれ", ICON.RAIN),
        185: o("Patchy freezing drizzle nearby", "附近零星冻毛毛雨", "ところにより着氷性霧雨", ICON.DRIZZLE),

        // 雷/暴风雪
        200: o("Thundery outbreaks possible", "可能有雷", "雷の可能性", ICON.THUNDER),
        227: o("Blowing snow", "吹雪", "地吹雪", ICON.SNOW),
        230: o("Blizzard", "暴风雪", "猛吹雪", ICON.SNOW),

        // 毛毛雨/冻毛毛雨
        263: o("Patchy light drizzle", "局地小毛毛雨", "ところにより弱い霧雨", ICON.DRIZZLE),
        266: o("Light drizzle", "小毛毛雨", "弱い霧雨", ICON.DRIZZLE),
        281: o("Freezing drizzle", "冻毛毛雨", "着氷性霧雨", ICON.DRIZZLE),
        284: o("Heavy freezing drizzle", "强冻毛毛雨", "強い着氷性霧雨", ICON.DRIZZLE),

        // 小雨/中雨/大雨
        293: o("Patchy light rain", "局地小雨", "ところにより弱い雨", ICON.RAIN),
        296: o("Light rain", "小雨", "弱い雨", ICON.RAIN),
        299: o("Moderate rain at times", "间歇中雨", "時々並の雨", ICON.RAIN),
        302: o("Moderate rain", "中雨", "並の雨", ICON.RAIN),
        305: o("Heavy rain at times", "间歇大雨", "時々強い雨", ICON.RAIN),
        308: o("Heavy rain", "大雨", "強い雨", ICON.RAIN),

        // 冻雨/雨夹雪
        311: o("Light freezing rain", "小冻雨", "弱い着氷性の雨", ICON.RAIN),
        314: o("Moderate or heavy freezing rain", "中到大冻雨", "強い着氷性の雨", ICON.RAIN),
        317: o("Light sleet", "小雨夹雪", "弱いみぞれ", ICON.RAIN),
        320: o("Moderate or heavy sleet", "中到大雨夹雪", "みぞれ", ICON.RAIN),

        // 小雪/中雪/大雪
        323: o("Patchy light snow", "局地小雪", "ところにより弱い雪", ICON.SNOW),
        326: o("Light snow", "小雪", "弱い雪", ICON.SNOW),
        329: o("Patchy moderate snow", "局地中雪", "ところに並の雪", ICON.SNOW),
        332: o("Moderate snow", "中雪", "並の雪", ICON.SNOW),
        335: o("Patchy heavy snow", "局地大雪", "ところに大雪", ICON.SNOW),
        338: o("Heavy snow", "大雪", "強い雪", ICON.SNOW),

        // 冰粒/冰雹类（wttr 归在 Ice pellets）
        350: o("Ice pellets", "冰粒", "氷の粒", ICON.SNOW),

        // 阵性降水（rain/sleet/snow/ice pellets showers）
        353: o("Light rain shower", "小阵雨", "弱いにわか雨", ICON.RAIN),
        356: o("Moderate or heavy rain shower", "中到大阵雨", "驟雨または強い驟雨", ICON.RAIN),
        359: o("Torrential rain shower", "暴雨（阵）", "激しいにわか雨", ICON.RAIN),

        362: o("Light sleet showers", "小阵性雨夹雪", "弱いにわかみぞれ", ICON.RAIN),
        365: o("Moderate or heavy sleet showers", "中到大阵性雨夹雪", "にわかみぞれ（中〜強）", ICON.RAIN),

        368: o("Light snow showers", "小阵雪", "弱いにわか雪", ICON.SNOW),
        371: o("Moderate or heavy snow showers", "中到大阵雪", "にわか雪（中〜強）", ICON.SNOW),

        374: o("Light showers of ice pellets", "小阵性冰粒", "弱いにわか氷の粒", ICON.SNOW),
        377: o("Moderate or heavy showers of ice pellets", "中到大阵性冰粒", "にわか氷の粒（中〜強）", ICON.SNOW),

        // 雷雨复合（最常见 4 条）
        386: o("Patchy light rain with thunder", "局地雷阵小雨", "ところにより雷を伴う弱い雨", ICON.THUNDER),
        389: o("Moderate or heavy rain with thunder", "雷阵雨（中到大）", "雷を伴う雨（中〜強）", ICON.THUNDER),
        392: o("Patchy light snow with thunder", "局地雷阵小雪", "ところにより雷を伴う弱い雪", ICON.THUNDER),
        395: o("Moderate or heavy snow with thunder", "雷阵雪（中到大）", "雷を伴う雪（中〜強）", ICON.THUNDER),
      };

      const c = Number(code);
      return M[c] || o("Unknown", "未知", "不明", ICON.CLOUD);
    },

    closeWidget() {
      this.isVisible = false
      const manager = window.WebWindows?.workspaces
      if (manager?.setDesktopWidgetVisibility?.('weatherTimeWidget', false)) return
      // The close button remains usable if the workspace bundle failed to expose its API.
      try {
        const state = JSON.parse(localStorage.getItem('webwindows.workspaces.v1') || 'null')
        const workspace = state?.workspaces?.find((item) => item.id === state.activeWorkspaceId)
        if (workspace) {
          workspace.widgets ||= []
          const widget = workspace.widgets.find((item) => item.id === 'weatherTimeWidget')
          if (widget) widget.visible = false
          else workspace.widgets.push({ id: 'weatherTimeWidget', visible: false })
          workspace.updatedAt = new Date().toISOString()
          localStorage.setItem('webwindows.workspaces.v1', JSON.stringify(state))
        }
      } catch (_) {}
    },
  },
};
</script>

<style scoped>
.weather-widget {
  position: absolute;
  top: 20px;
  /* ★ 初始默认：右上角 */
  right: 20px;
  /* ★ 初始默认：右上角 */
  width: 160px;
  background: rgba(0, 0, 0, .65);
  color: #fff;
  font-family: system-ui, -apple-system, "Segoe UI", "Noto Sans JP", Roboto, Arial, sans-serif;
  padding: 10px;
  border-radius: 14px;
  z-index: 9999;
  box-shadow: 0 0 8px rgba(0, 0, 0, .3);
  touch-action: none;
  user-select: none;
}

/* 顶部一行：城市 + 关闭 */
.weather-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

#closeWeatherBtn {
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  --ww-cursor-state: var(--ww-cursor-link, pointer);cursor: var(--ww-cursor-link, pointer);
}

/* 下部：天气 */
.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.weather-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  overflow: visible;
}

.weather-sun { transform-origin: 17px 17px; animation: weather-sun-turn 18s linear infinite; }
.weather-cloud { transform-origin: center; animation: weather-cloud-drift 3.2s ease-in-out infinite alternate; }
.weather-rain .rain-drop, .weather-snow .snow-flake { animation: weather-fall .9s ease-in-out infinite; }
.weather-rain .rain-drop--two, .weather-snow .snow-flake--two { animation-delay: -.35s; }
.weather-rain .rain-drop--three, .weather-rain .rain-drop--five, .weather-snow .snow-flake--three { animation-delay: -.65s; }
.weather-lightning { transform-origin: center; animation: weather-flash 2.8s ease-in-out infinite; }
.weather-fog path { animation: weather-fog-drift 3s ease-in-out infinite alternate; }
.weather-fog path:nth-child(2) { animation-delay: -.8s; }
.is-heavy-weather .weather-rain .rain-drop { animation-duration: .52s; }
@keyframes weather-sun-turn { to { transform: rotate(360deg); } }
@keyframes weather-cloud-drift { to { transform: translateX(1.5px); } }
@keyframes weather-fall { 0%, 100% { opacity: .45; transform: translateY(-1px); } 55% { opacity: 1; transform: translateY(2px); } }
@keyframes weather-flash { 0%, 42%, 48%, 100% { opacity: 1; } 45% { opacity: .35; } }
@keyframes weather-fog-drift { to { transform: translateX(2px); opacity: .55; } }
@media (prefers-reduced-motion: reduce) {
  .weather-icon *, .weather-icon::before, .weather-icon::after { animation: none !important; }
}

/* 文本细节（按你喜好微调） */
.weather-temp {
  font-size: 20px;
  line-height: 1;
  font-weight: 600;
}

.weather-desc {
  font-size: 14px;
  opacity: .9;
}

.weather-location {
  font-size: 14px;
  font-weight: 500;
}
</style>
