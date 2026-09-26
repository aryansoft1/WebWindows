(function () {
  "use strict";

  /*
   * 访客统计图表：世界地图（国家色阶 + 中国下钻到地级市）、设备分布、
   * 停留时间分布、每日趋势。
   *
   * 约定：
   *   * 地图与图表库走 CDN（页面本身不引 Tailwind，样式自包含在 visitor-analytics.css）；
   *   * 不用 innerHTML，所有 DOM 文本走 textContent / createElement；
   *   * 地区数据来自服务端，country_code 是 ISO 3166-1 alpha-2，与 Natural Earth
   *     的 ISO_A2_EH 直接对齐，因此世界地图不需要任何国家名映射表；
   *   * 中国下钻用 DataV 阿里云 GeoJSON（无需 key），省 → 市两级；
   *     数据源最细到地级市，所以不再往「区」下钻，避免把市级数据摊到区级造成误导。
   */

  const WORLD_GEOJSON =
    "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.0/geojson/ne_110m_admin_0_countries.geojson";
  // 边界数据走**同源代理** /api/region-geo.asp?adcode=…。
  // 原先直连 geo.datav.aliyun.com，而该边缘节点带防盗链：只要请求带 Referer 就
  // 403（响应头 X-Tengine-Error: denied by Referer ACL），浏览器跨域 fetch 默认带，
  // 于是点中国下钻必然失败。服务器发起（MSXML 不带 Referer）就没有这个问题，
  // 第三方再改策略也影响不到页面。
  const DATAV_BASE = "/api/region-geo.asp?adcode=";
  const CHINA_ADCODE = 100000;

  const PLACE_SUFFIXES = [
    "特别行政区", "维吾尔自治区", "壮族自治区", "回族自治区", "自治区",
    "自治州", "地区", "盟", "省", "市", "区", "县", "旗"
  ];

  // 仅显示层的名称覆盖：**不改统计口径、不改 ISO 代码、不改任何查询**。
  // 键是 ISO A2 代码（与 Natural Earth 的 ISO_A2_EH 对齐，地图着色与下钻判定都靠它），
  // 值只出现在地图悬停提示里。
  const COUNTRY_DISPLAY_NAMES = { CN: "ROC", TW: "ROC-TW", MN: "ROC-MN" };
  const DEVICE_LABELS = { desktop: "电脑", mobile: "手机", tablet: "平板" };
  const geoJsonCache = new Map();
  const chartCache = new Map();
  const state = { level: "world", frames: [], payload: null };

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function normalizePlace(value) {
    let text = String(value || "").replace(/\s+/g, "").replace(/[·・]/g, "");
    let changed = true;
    while (changed && text.length > 2) {
      changed = false;
      for (const suffix of PLACE_SUFFIXES) {
        if (text.length > suffix.length + 1 && text.endsWith(suffix)) {
          text = text.slice(0, text.length - suffix.length);
          changed = true;
          break;
        }
      }
    }
    return text;
  }

  function fetchJson(url) {
    if (geoJsonCache.has(url)) return Promise.resolve(geoJsonCache.get(url));
    return fetch(url, { credentials: "same-origin", cache: "default" })
      .then((response) => {
        if (!response.ok) throw new Error(`边界数据加载失败（HTTP ${response.status}）`);
        return response.json();
      })
      .then((data) => {
        geoJsonCache.set(url, data);
        return data;
      });
  }

  function chart(id) {
    if (chartCache.has(id)) return chartCache.get(id);
    const node = document.getElementById(id);
    if (!node || typeof window.echarts === "undefined") return null;
    const instance = window.echarts.init(node, null, { renderer: "canvas" });
    chartCache.set(id, instance);
    return instance;
  }

  function secondsLabel(total) {
    const value = Math.max(0, Number(total) || 0);
    if (value < 60) return `${Math.round(value)} 秒`;
    if (value < 3600) return `${Math.floor(value / 60)} 分`;
    return `${(value / 3600).toFixed(1)} 小时`;
  }

  // ---------------------------------------------------------------- 设备 / 停留 / 趋势

  function renderDevices(devices) {
    const instance = chart("deviceChart");
    if (!instance) return;
    const items = (devices || []).map((item) => ({
      name: DEVICE_LABELS[item.type] || item.type || "未知",
      value: Number(item.sessions) || 0,
      visitors: Number(item.visitors) || 0,
      average: secondsLabel(item.averageActiveSeconds)
    }));
    instance.setOption({
      tooltip: {
        trigger: "item",
        formatter: (params) => `${params.name}<br/>会话：${params.value}（${params.percent}%）<br/>独立访客：${params.data.visitors}<br/>平均活跃：${params.data.average}`
      },
      legend: { bottom: 0, textStyle: { fontSize: 12 } },
      series: [{
        type: "pie",
        radius: ["45%", "72%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: "#fff", borderWidth: 2 },
        label: { formatter: "{b}\n{d}%" },
        data: items
      }]
    }, true);
  }

  function renderDwell(dwell) {
    const instance = chart("dwellChart");
    if (!instance) return;
    const items = dwell || [];
    instance.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
      xAxis: { type: "value", minInterval: 1, splitLine: { lineStyle: { color: "#f1f5f9" } } },
      yAxis: { type: "category", data: items.map((item) => item.label), axisTick: { show: false } },
      series: [{
        type: "bar",
        barMaxWidth: 26,
        itemStyle: { color: "#6366f1", borderRadius: [0, 6, 6, 0] },
        label: { show: true, position: "right", fontSize: 11, color: "#4b5563" },
        data: items.map((item) => Number(item.sessions) || 0)
      }]
    }, true);
  }

  /*
   * 每个窗口（功能）停留时间：横向条形图，按累计活跃停留倒序取前 12 个。
   * 用累计秒数而不是格式化字符串做数值轴，tooltip 里再换算成人类可读时间。
   */
  function renderFeatureDwell(features) {
    const instance = chart("featureChart");
    if (!instance) return 0;
    const items = (features || [])
      .map((item) => ({
        key: item.key,
        name: item.name || item.key || "未命名窗口",
        seconds: Math.max(0, Number(item.activeSeconds) || 0),
        opens: Math.max(0, Number(item.opens) || 0),
        sessions: Math.max(0, Number(item.sessions) || 0)
      }))
      .sort((left, right) => right.seconds - left.seconds)
      .slice(0, 12)
      .reverse();
    instance.setOption({
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          const row = items[params.dataIndex] || {};
          const perOpen = row.opens ? Math.round(row.seconds / row.opens) : 0;
          return `${row.name}<br/>累计停留：${secondsLabel(row.seconds)}`
            + `<br/>打开次数：${row.opens}<br/>会话数：${row.sessions}`
            + `<br/>平均每次：${secondsLabel(perOpen)}`;
        }
      },
      grid: { left: 8, right: 72, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: "value", show: false, max: (value) => value.max * 1.18 },
      yAxis: {
        type: "category",
        data: items.map((item) => item.name),
        axisLabel: { fontSize: 12, color: "#374151", width: 120, overflow: "truncate" },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: [{
        type: "bar",
        barMaxWidth: 20,
        itemStyle: { color: "#0ea5e9", borderRadius: [0, 6, 6, 0] },
        label: {
          show: true,
          position: "right",
          fontSize: 11,
          color: "#4b5563",
          formatter: (params) => secondsLabel(params.value)
        },
        data: items.map((item) => item.seconds)
      }]
    }, true);
    return items.length;
  }

  function renderTrend(daily) {    const instance = chart("trendChart");
    if (!instance) return;
    const items = daily || [];
    instance.setOption({
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: { fontSize: 12 } },
      grid: { left: 8, right: 16, top: 24, bottom: 32, containLabel: true },
      xAxis: { type: "category", data: items.map((item) => item.day), axisLabel: { fontSize: 11 } },
      yAxis: [
        { type: "value", name: "会话", minInterval: 1, splitLine: { lineStyle: { color: "#f1f5f9" } } },
        { type: "value", name: "活跃时长", splitLine: { show: false } }
      ],
      series: [
        {
          name: "会话", type: "line", smooth: true, symbolSize: 6,
          itemStyle: { color: "#3b82f6" }, areaStyle: { color: "rgba(59,130,246,.12)" },
          data: items.map((item) => Number(item.sessions) || 0)
        },
        {
          name: "独立访客", type: "line", smooth: true, symbolSize: 6,
          itemStyle: { color: "#8b5cf6" },
          data: items.map((item) => Number(item.visitors) || 0)
        },
        {
          name: "活跃时长", type: "bar", yAxisIndex: 1, barMaxWidth: 18,
          itemStyle: { color: "rgba(16,185,129,.55)", borderRadius: [4, 4, 0, 0] },
          data: items.map((item) => Number(item.activeSeconds) || 0)
        }
      ]
    }, true);
  }

  // ---------------------------------------------------------------- 世界地图 + 中国下钻

  function aggregateWorld() {
    const values = new Map();
    for (const item of state.payload.countries || []) {
      const code = String(item.code || "").trim().toUpperCase();
      if (!/^[A-Z]{2}$/.test(code)) continue;
      // 有覆盖名时供应商返回的名字不参与展示，避免两条记录显示成两个名字
      const override = Object.prototype.hasOwnProperty.call(COUNTRY_DISPLAY_NAMES, code)
        ? COUNTRY_DISPLAY_NAMES[code]
        : "";
      const current = values.get(code) || { value: 0, visitors: 0, display: override || item.name || code };
      current.value += Number(item.sessions) || 0;
      current.visitors += Number(item.visitors) || 0;
      if (!override && item.name) current.display = item.name;
      values.set(code, current);
    }
    return values;
  }

  function aggregateChina(level, parentName) {
    const values = new Map();
    for (const item of state.payload.chinaRegions || []) {
      const region = normalizePlace(item.region);
      const city = normalizePlace(item.city);
      if (level === "province") {
        if (!region) continue;
        const current = values.get(region) || { value: 0, visitors: 0, display: item.region };
        current.value += Number(item.sessions) || 0;
        current.visitors += Number(item.visitors) || 0;
        if (item.region) current.display = item.region;
        values.set(region, current);
      } else {
        if (parentName && region !== normalizePlace(parentName)) continue;
        if (!city) continue;
        const current = values.get(city) || { value: 0, visitors: 0, display: item.city };
        current.value += Number(item.sessions) || 0;
        current.visitors += Number(item.visitors) || 0;
        if (item.city) current.display = item.city;
        values.set(city, current);
      }
    }
    return values;
  }

  /*
   * series.data 的 name 必须是「地图区域名」（ECharts 靠它匹配区域），
   * 而不是展示名 —— 之前把 name 写成中文导致整张图不着色。
   * 展示名与独立访客数放进 mapMeta，由 tooltip 查表，避免污染 series 数据维度
   * （visualMap 会把对象的额外字段当成维度，取错就会按错误维度上色）。
   */
  const mapMeta = new Map();

  function toSeriesData(collection, features, normalizeKey) {
    const series = [];
    mapMeta.clear();
    let covered = 0;
    for (const feature of features) {
      const key = feature.properties.name;
      const hitKey = normalizeKey ? normalizeKey(key) : key;
      const hit = collection.get(hitKey);
      const visitors = hit ? hit.visitors : 0;
      if (hit && hit.value > 0) covered += 1;
      mapMeta.set(key, {
        visitors,
        display: (hit && hit.display) || feature.properties.NAME || key
      });
      series.push({ name: key, value: hit ? hit.value : 0 });
    }
    return { series, covered };
  }

  function colorScale(maximum) {
    return ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"];
  }

  function paintGeoMap(options) {
    const instance = chart("geoMap");
    if (!instance) return;
    const maximum = Math.max(1, ...options.series.map((item) => Number(item.value) || 0));
    instance.setOption({
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          const meta = mapMeta.get(params.name) || { visitors: 0, display: params.name };
          const value = Number(params.value) || 0;
          if (!value) return `${meta.display}<br/>暂无访客记录`;
          return `${meta.display}<br/>访问会话：${value}<br/>独立访客：${meta.visitors}`;
        }
      },
      visualMap: {
        show: false,
        min: 0,
        max: maximum,
        inRange: { color: colorScale(maximum) }
      },
      series: [{
        type: "map",
        map: options.mapName,
        roam: true,
        zoom: options.zoom || 1.15,
        layoutCenter: ["50%", "52%"],
        layoutSize: options.layoutSize || "112%",
        scaleLimit: { min: 0.8, max: 12 },
        label: { show: false },
        emphasis: {
          // 悬停标签用**显示名**（CN → ROC、TW → ROC-TW）：ECharts 默认把区域名
          // （= ISO 代码）印在地图上。区域名本身不变，下钻判定 params.name !== "CN"
          // 因此不受影响。label 必须只出现一次 —— 重复键会被后者覆盖，formatter 静默失效。
          label: {
            show: true,
            fontSize: 11,
            formatter: (item) => (mapMeta.get(item.name) || {}).display || item.name
          },
          itemStyle: { areaColor: "#f59e0b" }
        },
        itemStyle: { borderColor: "#ffffff", borderWidth: 0.6 },
        select: { disabled: true },
        data: options.series
      }]
    }, true);
    instance.__wwCovered = options.covered || 0;
  }

  function renderBreadcrumb() {
    const root = document.getElementById("geoBreadcrumb");
    root.replaceChildren();
    state.frames.forEach((frame, index) => {
      if (index > 0) root.appendChild(element("span", "text-gray-400", "›"));
      const button = element("button", "text-blue-600", frame.title);
      button.type = "button";
      button.style.cursor = "pointer";
      button.addEventListener("click", () => {
        state.frames = state.frames.slice(0, index + 1);
        state.level = frame.level;
        paint();
      });
      root.appendChild(button);
    });
  }

  function setSummary(text, kind) {
    const node = document.getElementById("geoSummary");
    node.className = kind === "warn"
      ? "mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
      : "mt-2 text-xs text-gray-500";
    node.textContent = text;
  }

  function showWorld() {
    state.level = "world";
    state.frames = [{ level: "world", title: "世界" }];
    renderBreadcrumb();
    return fetchJson(WORLD_GEOJSON).then((geojson) => {
      const features = (geojson.features || []).map((feature) => {
        const iso = String(feature.properties.ISO_A2_EH || "").toUpperCase();
        const next = Object.assign({}, feature);
        next.properties = Object.assign({}, feature.properties, {
          name: /^[A-Z]{2}$/.test(iso) ? iso : `X-${feature.properties.NAME || "UNKNOWN"}`,
          NAME: feature.properties.NAME || iso
        });
        return next;
      });
      geojson.features = features;
      if (!window.echarts.getMap("ww-world")) window.echarts.registerMap("ww-world", geojson);
      const known = new Set(features.map((feature) => feature.properties.name));
      const { series, covered } = toSeriesData(aggregateWorld(), features, null);
      paintGeoMap({ mapName: "ww-world", series, zoom: 1.1, layoutSize: "118%", covered });
      // 110m 比例尺下香港/澳门/新加坡等微型地区没有独立边界要素，
      // 不能让这些访客数据悄悄消失，因此单独列出来。
      const overflow = (state.payload.countries || []).filter((item) => {
        const code = String(item.code || "").trim().toUpperCase();
        return item.sessions > 0 && /^[A-Z]{2}$/.test(code) && !known.has(code);
      });
      const overflowText = overflow.length
        ? `；地图边界不含以下地区，已单独列出：${overflow.map((item) => `${item.name || item.code} ${item.sessions}`).join("、")}`
        : "";
      setSummary(`世界地图按访问会话着色，共 ${covered} 个国家/地区有记录。点击「中国」可下钻到省与地级市${overflowText}。`);
    });
  }

  function showChinaProvinces() {
    state.level = "province";
    state.frames = [{ level: "world", title: "世界" }, { level: "province", title: "中国" }];
    renderBreadcrumb();
    return fetchJson(`${DATAV_BASE}${CHINA_ADCODE}_full.json`).then((geojson) => {
      if (!window.echarts.getMap("ww-cn-100000")) window.echarts.registerMap("ww-cn-100000", geojson);
      const { series, covered } = toSeriesData(aggregateChina("province"), geojson.features || [], normalizePlace);
      paintGeoMap({ mapName: "ww-cn-100000", series, zoom: 1.05, layoutSize: "104%", covered });
      setSummary(`中国省级分布，共 ${covered} 个省份有记录。点击省份可下钻到地级市。`);
    });
  }

  function showChinaCities(province) {
    state.level = "city";
    state.frames = [
      { level: "world", title: "世界" },
      { level: "province", title: "中国" },
      { level: "city", title: province.properties.name, adcode: province.properties.adcode }
    ];
    renderBreadcrumb();
    return fetchJson(`${DATAV_BASE}${province.properties.adcode}_full.json`).then((geojson) => {
      const mapName = `ww-cn-${province.properties.adcode}`;
      if (!window.echarts.getMap(mapName)) window.echarts.registerMap(mapName, geojson);
      const { series, covered } = toSeriesData(
        aggregateChina("city", province.properties.name), geojson.features || [], normalizePlace
      );
      paintGeoMap({ mapName, series, zoom: 1.1, layoutSize: "104%", covered });
      setSummary(`${province.properties.name} 的地级市分布，共 ${covered} 个城市有记录。IP 解析数据最细到地级市，因此不再下钻到区县。`);
    });
  }

  function paint() {
    if (state.level === "world") {
      showWorld().catch((error) => setSummary(`世界地图加载失败：${error.message || error}`, "warn"));
      return;
    }
    if (state.level === "province") {
      showChinaProvinces().catch((error) => setSummary(`中国地图加载失败：${error.message || error}`, "warn"));
      return;
    }
    const frame = state.frames[state.frames.length - 1];
    showChinaCities({ properties: { adcode: frame.adcode, name: frame.title } })
      .catch((error) => setSummary(`地图加载失败：${error.message || error}`, "warn"));
  }

  function bindMapClick() {
    const instance = chart("geoMap");
    if (!instance || instance.__wwBound) return;
    instance.__wwBound = true;
    instance.on("click", (params) => {
      if (state.level === "world") {
        if (params.name !== "CN") return;
        showChinaProvinces().catch((error) => setSummary(`中国地图加载失败：${error.message || error}`, "warn"));
        return;
      }
      if (state.level !== "province") return;
      // params.name 是 DataV 的中文区划名（如「江苏省」），adcode 要回原始 GeoJSON 里查；
      // 不能用 echarts.getMap()：它返回的是内部解析结果，没有 features。
      const source = geoJsonCache.get(`${DATAV_BASE}${CHINA_ADCODE}_full.json`);
      const feature = ((source && source.features) || []).find(
        (item) => item.properties.name === params.name
      );
      if (!feature) return;
      showChinaCities(feature)
        .catch((error) => setSummary(`地图加载失败：${error.message || error}`, "warn"));
    });
  }

  // ---------------------------------------------------------------- 入口

  function render(payload) {
    state.payload = payload || {};
    if (typeof window.echarts === "undefined") {
      setSummary("图表库未能加载（CDN 不可达），地图与图表暂不可用；下方表格数据仍然可用。", "warn");
      return;
    }
    const geo = state.payload.geo || {};
    if (!geo.resolvedSessions) {
      setSummary(
        geo.source === "external-api"
          ? "当前范围内还没有解析出地区的新会话；新访客进来后会自动出现。"
          : "尚未启用地区解析：服务器上没有 api/visitor-analytics.config.asp，也没有开启本机 IIS GeoIP。",
        "warn"
      );
    }
    renderDevices(state.payload.devices);
    renderDwell(state.payload.dwell);
    renderTrend(state.payload.daily);
    const featureCount = renderFeatureDwell(state.payload.features);
    const featureSummary = document.getElementById("featureSummary");
    if (featureSummary) {
      const total = (state.payload.features || []).reduce(
        (sum, item) => sum + (Number(item.activeSeconds) || 0), 0
      );
      featureSummary.textContent = (state.payload.features || []).length
        ? `共 ${(state.payload.features || []).length} 个功能窗口有记录，图表按累计停留展示前 ${featureCount} 个，合计 ${secondsLabel(total)}。`
        : "当前范围内还没有功能窗口的停留记录。";
    }
    state.level = "world";
    state.frames = [{ level: "world", title: "世界" }];
    paint();
    bindMapClick();
  }

  addEventListener("resize", () => {
    for (const instance of chartCache.values()) instance.resize();
  });

  window.WebWindowsVisitorCharts = { render, geoJsonCache };
})();