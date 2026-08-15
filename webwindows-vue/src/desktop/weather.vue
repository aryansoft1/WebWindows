<template>
  <div id="weatherTimeWidget" class="weather-widget" :style="rootStyle" @mousedown="onMouseDown"
    @touchstart.prevent="onTouchStart">
    <!-- 顶部：城市在左，关闭在右 -->
    <div class="weather-header">
      <div id="weather-location" class="weather-location">{{ weatherLocation }}</div>
      <button id="closeWeatherBtn" @click="closeWidget">×</button>
    </div>

    <!-- 下部：天气（图标 + 温度 + 描述） -->
    <div class="weather-info">
      <img id="weather-icon" class="weather-icon" :src="weatherIcon" alt="天气图标" />
      <div class="weather-text">
        <div id="weather-temp" class="weather-temp">{{ weatherTemp }}</div>
        <div id="weather-desc" class="weather-desc">{{ weatherDesc }}</div>
      </div>
    </div>
  </div>
</template>


<script>
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
      lang: (navigator.language || "zh").slice(0, 2),
      refreshTimer: null,
      geoWatchId: null,
      geoWatchStopTimer: null,
      locationRequest: 0,
      bestAccuracy: Infinity,
      isVisible: true,
      hasDragged: false,
    };
  },
  computed: {
    rootStyle() {
      const base = { position: 'absolute', cursor: this.isDragging ? 'move' : 'default' }
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
    if (this.geoWatchId != null) navigator.geolocation?.clearWatch(this.geoWatchId);
    clearTimeout(this.geoWatchStopTimer);
  },
  methods: {
    onMouseDown(e) {
      if (e.button !== 0 || e.target.closest("button")) return;
      const rect = e.currentTarget.getBoundingClientRect();
      this.isDragging = true;
      this.hasDragged = true;
      this.position.x = rect.left;
      this.position.y = rect.top;
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;
      e.preventDefault();
    },
    onMouseMove(e) {
      if (!this.isDragging) return
      this.moveTo(e.clientX, e.clientY, this.dragOffset)
    },
    onMouseUp() {
      this.isDragging = false;
    },
    onTouchStart(e) {
      const touch = e.touches[0];
      if (!touch || e.target.closest("button")) return;
      const rect = e.currentTarget.getBoundingClientRect();
      this.hasDragged = true;
      this.position.x = rect.left;
      this.position.y = rect.top;
      this.touchOffset.x = touch.clientX - rect.left;
      this.touchOffset.y = touch.clientY - rect.top;

      const onTouchMove = (e) => {
        const touch = e.touches[0];
        this.moveTo(touch.clientX, touch.clientY, this.touchOffset);
        e.preventDefault(); // 禁止默认滚动
      };

      const onTouchEnd = () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };

      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    },
    moveTo(clientX, clientY, offset) {
      const element = this.$el;
      const width = element?.offsetWidth || 160;
      const height = element?.offsetHeight || 100;
      this.position.x = Math.max(0, Math.min(window.innerWidth - width, clientX - offset.x));
      this.position.y = Math.max(0, Math.min(window.innerHeight - height, clientY - offset.y));
    },

    // ========= 仅替换为 Open-Meteo 的实现，其他逻辑尽量不动 =========
    // 仅替换 methods 里的 fetchWeather()
    async fetchWeather(lat, lon) {
      const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lon);
      const safeLat = hasCoordinates ? lat : 30.73019;
      const safeLon = hasCoordinates ? lon : 104.09282;

      // ---------- 1) wttr 优先（~lat,lon + 两位小数；非 JSON/Unknown 则抛错） ----------
      try {
        const lat2 = Number(safeLat.toFixed(4));
        const lon2 = Number(safeLon.toFixed(4));
        // 强烈建议：wttr 通过服务端代理，否则容易被 CORS/WAF 影响
        // 如已上代理：/api/wttr_proxy.asp?lat=...&lon=...&lang=...
        // 这里先保留直连写法（如果你已经搭了代理，请把下面一行替换成代理 URL）
        const wttrUrl = hasCoordinates
          ? `https://wttr.in/~${lat2},${lon2}?format=j1&lang=${this.lang}`
          : `https://wttr.in/?format=j1&lang=${this.lang}`;

        const wttrRes = await fetch(wttrUrl, { cache: 'no-store' });
        const wttrText = await wttrRes.text();
        if (!wttrText.trim().startsWith('{') || /Unknown location/i.test(wttrText)) {
          throw new Error('wttr non-JSON or unknown');
        }
        const data = JSON.parse(wttrText);

        const cond = data?.current_condition?.[0];
        const tempC = cond?.temp_C;
        if (tempC == null) throw new Error('wttr missing temp');

        // 描述：有本地语言优先；否则用映射/英文
        const mapped = this.mapWttrCode(cond?.weatherCode);
        const descRaw = (cond[`lang_${this.lang}`]?.[0]?.value?.trim())
          || (cond.weatherDesc?.[0]?.value?.trim())
          || this.pickLocalizedDesc(mapped, this.lang);

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
            this.weatherLocation = areaName;
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
        const descText = mapped ? (this.pickLocalizedDesc ? this.pickLocalizedDesc(mapped, this.lang)
          : (this.lang === 'zh' ? mapped.descZh : this.lang === 'ja' ? mapped.descJa : mapped.descEn))
          : '—';
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
        if (!this.weatherLocation || this.weatherLocation === '定位中...') this.weatherLocation = '未知地点';
      }
    }

    ,

    async loadWeather() {
      const request = ++this.locationRequest;
      this.bestAccuracy = Infinity;
      let lastWeatherAt = 0;
      const onPos = async ({ coords }) => {
        if (request !== this.locationRequest) return;
        const accuracy = Number(coords.accuracy);
        const now = Date.now();
        if (Number.isFinite(accuracy) && accuracy >= this.bestAccuracy * 0.8 && now - lastWeatherAt < 5000) return;
        if (Number.isFinite(accuracy)) this.bestAccuracy = Math.min(this.bestAccuracy, accuracy);
        lastWeatherAt = now;
        const lat = Number(coords.latitude);
        const lon = Number(coords.longitude);
        if (!this.weatherLocation || this.weatherLocation === '定位中...') this.weatherLocation = '当前位置';
        if (this.$el && Number.isFinite(accuracy)) this.$el.title = `定位精度约 ±${Math.max(1, Math.round(accuracy))} 米`;
        await this.fetchWeather(lat, lon);
      };

      const onError = () => {
        if (request !== this.locationRequest || lastWeatherAt) return;
        this.weatherLocation = '按网络位置定位';
        this.fetchWeather(Number.NaN, Number.NaN);
      };

      const options = { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onPos, onError, options);
        if (this.geoWatchId != null) navigator.geolocation.clearWatch(this.geoWatchId);
        this.geoWatchId = navigator.geolocation.watchPosition(onPos, () => {}, options);
        clearTimeout(this.geoWatchStopTimer);
        this.geoWatchStopTimer = setTimeout(() => {
          if (this.geoWatchId != null) navigator.geolocation.clearWatch(this.geoWatchId);
          this.geoWatchId = null;
        }, 12000);
      } else {
        onError();
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
      const o = (en, zh, ja, icon) => ({ descEn: en, descZh: zh, descJa: ja, iconUrl: icon });

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

    closeWidget() {      // ★ 新增：与旧逻辑等价
      this.isVisible = false
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
  cursor: pointer;
}

/* 下部：天气 */
.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.weather-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 12px;
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
