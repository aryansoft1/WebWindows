import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const read = url => fs.readFile(new URL(url, import.meta.url), "utf8");

const providerSource = await read("../assets/js/transit-providers.js");
const positionSource = await read("../assets/js/transit-position.js");
const appSource = await read("../assets/js/navigation-app.js");
const transitAppSource = await read("../assets/js/transit-app.js");
const enhancementSource = await read("../assets/js/navigation-enhancements.js");
const cssSource = await read("../assets/css/navigation.css");
const railwayProxySource = await read("../api/railway-proxy.asp");
const transitProxySource = await read("../api/transit-proxy.asp");
const html = await read("../road.html");

function loadContext(source, filename, sandbox = {}) {
  const context = vm.createContext(sandbox);
  vm.runInContext(source, context, { filename });
  return context;
}

/*
 * 只有形如 { 的对象字面量才做括号配对，
 * 括号在字符串里（例如 {count} 占位符）会被跳过。
 */
function extractObjectLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  assert.ok(markerIndex >= 0, `missing marker: ${marker}`);

  const open = source.indexOf("{", markerIndex);
  assert.ok(open >= 0, `missing opening brace after: ${marker}`);

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = open; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }

  throw new Error(`unbalanced object literal after: ${marker}`);
}

const LANGUAGES = ["zh", "tw", "en", "jp"];

const TEXT = vm.runInNewContext(
  `(${extractObjectLiteral(appSource, "const TEXT=")})`
);

for (const language of LANGUAGES) {
  assert.ok(TEXT[language], `missing language dictionary: ${language}`);
}

const [zhKeys, twKeys, enKeys, jpKeys] = LANGUAGES.map(language => {
  const keys = Object.keys(TEXT[language]);
  assert.equal(
    new Set(keys).size,
    keys.length,
    `duplicate keys in ${language} dictionary`
  );
  return new Set(keys);
});

for (const key of zhKeys) {
  assert.ok(twKeys.has(key), `tw missing key: ${key}`);
  assert.ok(enKeys.has(key), `en missing key: ${key}`);
  assert.ok(jpKeys.has(key), `jp missing key: ${key}`);
}
assert.equal(twKeys.size, zhKeys.size);
assert.equal(enKeys.size, zhKeys.size);
assert.equal(jpKeys.size, zhKeys.size);

const htmlKeys = new Set(
  [...html.matchAll(/data-i18n(?:-placeholder|-aria)?="([^"]+)"/g)].map(
    match => match[1]
  )
);

assert.ok(htmlKeys.size >= 40, "road.html i18n coverage looks too small");

for (const key of htmlKeys) {
  assert.ok(zhKeys.has(key), `road.html key missing from zh: ${key}`);
}

/* transit-app / navigation-app 里动态取用的 key 也必须四语齐全 */
for (const source of [transitAppSource, enhancementSource]) {
  const used = [...source.matchAll(/\bT\(\s*"([\w-]+)"/g)].map(
    match => match[1]
  );

  for (const key of used) {
    for (const language of LANGUAGES) {
      assert.ok(
        TEXT[language][key],
        `${language} missing dynamic key: ${key}`
      );
    }
  }
}

assert.match(appSource, /translate:\s*\(key,vars\)=>t\(key,vars\)/);
assert.match(appSource, /getLanguage:\s*\(\)=>state.language/);
assert.match(transitAppSource, /wendao-language-change/);
assert.match(enhancementSource, /wendao-language-change/);
assert.doesNotMatch(transitAppSource, /\.innerHTML\s*=/);

/* STATUS_KEYS 的每个 i18n key 都必须四语齐全，否则会直接显示英文 key 名 */
const statusKeys = vm.runInNewContext(
  `(${extractObjectLiteral(transitAppSource, "const STATUS_KEYS =")})`
);

assert.ok(Object.keys(statusKeys).length >= 10, "STATUS_KEYS looks too small");

for (const [code, key] of Object.entries(statusKeys)) {
  for (const language of LANGUAGES) {
    assert.ok(
      TEXT[language][key],
      `${language} missing STATUS_KEYS[${code}] → ${key}`
    );
  }
}

/* api/railway-proxy.asp 独有错误码必须已映射 */
for (const code of [
  "station_source_unavailable",
  "station_source_invalid",
  "parse_failed",
  "schedule_unavailable",
  "invalid_date",
  "invalid_station",
  "invalid_train",
  "method_not_allowed",
  "unsupported_action"
]) {
  assert.ok(statusKeys[code], `STATUS_KEYS missing ASP code: ${code}`);
}

/* 超时与回落类错误码必须已映射（transit-providers.js TIMEOUTS / 兜底） */
for (const code of [
  "transit_timeout",
  "rail_timeout",
  "geocoder_timeout",
  "transit_upstream_unavailable",
  "transit_failed"
]) {
  assert.ok(statusKeys[code], `STATUS_KEYS missing timeout code: ${code}`);
}

assert.match(transitAppSource, /station_source_unavailable/);
assert.match(transitAppSource, /schedule_unavailable/);

/*
 * 行为级回归：首条候选站无班次/超时时必须继续尝试后续候选，
 * 且单趟 trip 详情失败只跳过该趟。
 */
const gtfsContext = loadContext(providerSource, "transit-providers.js", {
  URL,
  AbortController,
  setTimeout,
  clearTimeout,
  location: { origin: "https://www.y0.hk" },
  __WENDAO_TRANSIT_TIMEOUTS__: {
    transitRequest: 50,
    railRequest: 50,
    gtfsStage: 500,
    railStage: 500
  },
  fetch: async url => {
    const parsed = new URL(String(url));
    const action = parsed.searchParams.get("action");

    if (action === "stops") {
      const search = parsed.searchParams.get("search");
      // 「東京」首条是北海道旭川的同名站（无班次），
      // 第二条才是真正的东京站（发车 1 趟）
      const far = {
        onestop_id: "s-far-" + search,
        stop_name: search + "農業大学",
        geometry: { type: "Point", coordinates: [144.23424, 43.967122] }
      };
      const near = {
        onestop_id: "s-near-" + search,
        stop_name: search,
        geometry: { type: "Point", coordinates: [139.7648, 35.681935] }
      };
      return {
        ok: true,
        status: 200,
        json: async () => ({ stops: [far, near] })
      };
    }

    if (action === "departures") {
      const key = parsed.searchParams.get("stop_key") || "";
      const hasData = key.startsWith("s-near");
      return {
        ok: true,
        status: 200,
        json: async () => ({
          stops: [{
            departures: hasData
              ? [{
                  trip: {
                    trip_id: "T1",
                    route: { onestop_id: "r-1", route_id: "1" },
                    stop_times: [
                      { stop: { stop_name: "東京" } },
                      { stop: { stop_name: "名古屋" } }
                    ]
                  }
                }]
              : []
          }]
        })
      };
    }

    if (action === "trip") {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          trips: [{
            trip_id: "T1",
            route: { onestop_id: "r-1", route_id: "1" },
            stop_times: [
              { stop: { stop_name: "東京", geometry: { coordinates: [139.76, 35.68] } }, arrival: { scheduled: "09:00:00" }, departure: { scheduled: "09:05:00" } },
              { stop: { stop_name: "名古屋", geometry: { coordinates: [136.88, 35.17] } }, arrival: { scheduled: "11:00:00" }, departure: { scheduled: "11:05:00" } }
            ]
          }]
        })
      };
    }

    return {
      ok: false,
      status: 400,
      json: async () => ({ error: { code: "unsupported_action", httpStatus: 400 } })
    };
  }
});

const gtfsProvider = new gtfsContext.WebWindowsTransit.TransitlandTransitProvider();
const gtfsJourney = await gtfsProvider.searchJourney({
  origin: "東京",
  destination: "名古屋",
  departureTime: "2026-09-25T09:00"
});
assert.equal(gtfsJourney.provider, "transitland");
assert.equal(gtfsJourney.stopTimes.length, 2, "must use the stop that actually has departures");

/* transit-app 里写死的元素 id / 选择器必须真的存在于 road.html，
   否则页面运行时会拿到 null 并在查询过程中崩溃。 */
const htmlIds = new Set(
  [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1])
);

for (const match of transitAppSource.matchAll(/\$\("([\w-]+)"\)/g)) {
  assert.ok(
    htmlIds.has(match[1]),
    `road.html is missing element #${match[1]} referenced by transit-app.js`
  );
}

for (const match of transitAppSource.matchAll(
  /querySelector(?:All)?\("([^"]+)"\)/g
)) {
  const selector = match[1];

  if (selector.startsWith(".")) {
    assert.ok(
      html.includes(`class="${selector.slice(1)}`) ||
        html.includes(` ${selector.slice(1)}`),
      `road.html is missing element for selector ${selector}`
    );
  }
}

/* road.html 结构：补全容器、经停站、车次候选、版本号 */
assert.match(html, /id="transit-origin-suggestions"/);
assert.match(html, /id="transit-destination-suggestions"/);
assert.match(html, /id="transit-stop-list"/);
assert.match(html, /id="transit-stops"/);
assert.match(html, /id="transit-progress"/);
assert.match(html, /id="transit-candidates"/);
assert.match(html, /id="transit-candidate-list"/);
assert.match(html, /id="transit-source-pill"/);
assert.match(html, /id="transit-service-state"/);
assert.match(html, /data-i18n="tabTransit"/);
assert.match(html, /transit-providers\.js\?v=20260925-6/);
assert.match(html, /transit-app\.js\?v=20260925-9/);
assert.match(html, /navigation\.css\?v=20260925-3/);
assert.doesNotMatch(html, /transit-providers\.js\?v=20260925-5/);
assert.doesNotMatch(html, /transit-providers\.js\?v=20260924-6/);
assert.doesNotMatch(html, /transit-app\.js\?v=20260925-8/);
assert.doesNotMatch(html, /navigation\.css\?v=20260923-1/);
assert.doesNotMatch(html, /transit-providers\.js\?v=20260923-2/);

/*
 * 海外 500 真因（生产代理双向实测）：
 * Transitland 单班次端点只认**内部数字 id**：
 *   /routes/{route_key}/trips/20B0809000  → 502（上游 500 parameter error，无经停）
 *   /routes/{route_key}/trips/12368625337 → 200，stop_times=18
 * departures 响应里两种 id 都有（trip.trip_id 与 trip.id），
 * 客户端优先用 trip.id，代理原样透传并接受两种形态。
 */
assert.match(
  providerSource,
  /departureTrip\?\.id/,
  "GTFS must prefer the internal trip id (trip.id) over trip_id"
);
assert.match(
  transitProxySource,
  /Function IsTripRef\(/,
  "transit proxy must accept both trip_id and internal trip id"
);
assert.doesNotMatch(
  transitProxySource,
  /IsTrainNo\(tripId\)/,
  "trip id must not be validated as a China Rail train number"
);

/*
 * 当日快照必须落盘：线上事故——Application 内存快照随应用池回收丢失后，
 * 北京 10:31 的查询只剩「10:42 之后的 80 趟」，运行中/已通过车次全部消失，
 * 且响应不再带 snapshot 标记。快照需写站点内文件（服务器已有写盘先例）。
 */
/*
 * 服务端落盘已被线上事实否决：应用池对 data/、cloud/file/、logs/ 均无写权限
 * （FSO + ADODB.Stream 逐个探测，建子目录与既有目录直写两种形态都失败），
 * 因此「跨应用池回收持久化」必须由客户端 localStorage 承担。
 */
assert.match(
  providerSource,
  /function mergeRailSnapshots\(/,
  "client must merge locally cached trains so running trains survive server recycles"
);
assert.match(
  providerSource,
  /webwindows\.transit\.rail\.v1\./,
  "local snapshot key must be namespaced and auditable"
);
assert.doesNotMatch(
  railwayProxySource,
  /SnapshotWriteFile|SnapshotReadFile/,
  "dead file-persistence code must be removed once the host denies writes"
);

/* 客户端预热：记住上次线路（含电报码）并在打开页面时预热当天一次 */
assert.match(
  transitAppSource,
  /function warmTodaySnapshot\(/,
  "app must pre-warm today's snapshot so coverage self-heals"
);
assert.match(
  transitAppSource,
  /function warmFromLastRoute\(/,
  "app must pre-warm using the last used route on page load"
);
assert.match(
  transitAppSource,
  /includeElapsed:\s*true/,
  "pre-warm must ask the proxy for elapsed trains"
);

/*
 * 「运行中/已通过车次」事故回归（T-017）：
 * 实测 12306 对当天只返回未发车车次（北京 23:12 直连 queryG 仅剩 2 趟），
 * 已发车/运行中车次在上游就被过滤，客户端再怎么排序也搜不到。
 * 修法＝代理侧「当日快照」+ 客户端按北京时区判定状态，必须都有：
 *   代理：includeElapsed 入参、快照合并/过期、快照标记
 *   客户端：北京时间判定、running/past/upcoming 分组、默认选中逻辑
 */
assert.match(
  railwayProxySource,
  /includeElapsed/,
  "proxy must accept includeElapsed to return the same-day snapshot"
);
assert.match(
  railwayProxySource,
  /RAIL_SNAPSHOT_TTL_SECONDS/,
  "snapshot must expire so Application state cannot grow forever"
);
assert.match(
  railwayProxySource,
  /Function SnapshotMergeRows\(/,
  "fresh trains must be merged into the same-day snapshot"
);
assert.match(
  railwayProxySource,
  /Function WithSnapshotFlag\(/,
  "snapshot responses must be marked so the client can tell"
);
assert.match(
  railwayProxySource,
  /jsonStringField\(row, "trainNo"\)/i,
  "snapshot merge must key on trainNo"
);

/*
 * 引号陷阱守卫：VBScript 里 """ 是「一个双引号」，而四个连续引号会被
 * 解析成两段（实测 `"""" & x & """:"` 静默少一个引号、marker 永远匹配不到）。
 * 快照解析依赖精确 marker，必须用 Chr(34) 显式构造。
 */
assert.doesNotMatch(
  railwayProxySource,
  /marker = """"/,
  "VBScript literals must use Chr(34), four quotes silently split the literal"
);
assert.match(
  railwayProxySource,
  /marker = Chr\(34\) & "trains" & Chr\(34\) & ":\["/,
  "trains-array marker must be built with Chr(34)"
);
assert.match(
  railwayProxySource,
  /marker = Chr\(34\) & fieldName & Chr\(34\) & ":"/,
  "field marker must be built with Chr(34)"
);

assert.match(
  providerSource,
  /function beijingClock\(/,
  "state classification must use Beijing time, not the browser timezone"
);
assert.match(
  providerSource,
  /function classifyRailTrain\(/,
  "trains must be classified running/past/upcoming"
);
assert.match(
  providerSource,
  /RAIL_RUNNING_CANDIDATE_LIMIT/,
  "running trains must have their own candidate quota"
);
assert.match(
  providerSource,
  /pickInitialCandidate\(/,
  "default train must match the queried moment (now → running train)"
);
assert.match(
  providerSource,
  /includeElapsed\s*:\s*includeElapsed \? "1" : ""/,
  "client must ask the proxy for elapsed trains only when needed"
);
assert.match(
  transitAppSource,
  /transit-candidate-state/,
  "candidate list must label running/past trains"
);
assert.match(
  cssSource,
  /\.transit-candidate-state/,
  "candidate state badge must be styled"
);

/*
 * 相机事故回归（真实浏览器复现）：
 * 问乡面板默认隐藏 → 容器尺寸 0 → MapLibre transform 未初始化 →
 * 带 padding/duration 的 fitBounds 抛
 * "Cannot read properties of undefined (reading 'lng')"，
 * 异常冒泡中断整次渲染：结果能显示但地图不跟随、状态栏变成错误信息。
 * 实测 resize() 后同一调用恢复；因此相机调用必须先 resize 且有降级。
 */
assert.match(
  transitAppSource,
  /function fitBoundsSafely\(/,
  "camera calls must go through a guarded helper"
);
assert.match(
  transitAppSource,
  /state\.map\?\.resize\?\.\(\)/,
  "camera helper must resize the map first (hidden panel => zero-size container)"
);
assert.match(
  transitAppSource,
  /function focusBounds\([\s\S]{0,2500}?fitBoundsVerified\(\s*bounds\s*\)/,
  "camera chain must end with the option-less fitBounds as last resort"
);
assert.match(
  transitAppSource,
  /function fitBoundsVerified\([\s\S]{0,800}?state\.map\.fitBounds\(\s*bounds\s*\)/,
  "the option-less fitBounds call must exist inside the verified helper"
);

/*
 * 相机动画在窗口不可见/rAF 受限时会「不抛错但永不推进」：
 * 实测 fitBounds({duration}) 与 easeTo({duration}) 都返回正常，
 * 但 isMoving()/isEasing() 永久为 true、中心永不变；而同步
 * stop() + jumpTo() 立即生效。所以相机必须走「同步跳转 + 校验真的移动」。
 */
assert.match(
  transitAppSource,
  /function moveCameraVerified\(/,
  "camera calls must be verified, not trusted"
);
assert.match(
  transitAppSource,
  /function moveCameraVerified\([\s\S]{0,900}?const after\s*=\s*\n?\s*cameraSnapshot\(\)/,
  "verified camera move must re-read the camera afterwards"
);
assert.match(
  transitAppSource,
  /state\.map\.jumpTo\(/,
  "primary camera path must be the synchronous jumpTo"
);
assert.match(
  transitAppSource,
  /function stopCamera\(/,
  "in-flight animations must be stopped before moving the camera"
);
assert.match(
  transitAppSource,
  /function keepVehicleInView\(/,
  "a vehicle outside the viewport must pull the camera to it"
);

/*
 * 车辆图标设计（用户要求：高铁/动车=火箭头，普通车=普通火车，
 * 且车头必须朝向目的地方向）。
 */
assert.match(
  transitAppSource,
  /const BULLET_PREFIXES\s*=\s*\["G",\s*"D",\s*"C"\]/,
  "G/D/C prefixes must select the bullet-train icon"
);
assert.match(
  transitAppSource,
  /function vehicleKind\(\)[\s\S]{0,900}?provider\s*!==\s*\n?\s*"china-rail"[\s\S]{0,200}?return "train"/,
  "overseas transit must fall back to the ordinary train icon"
);
assert.match(
  transitAppSource,
  /const VEHICLE_SVG\s*=\s*\{[\s\S]{0,400}?bullet:\s*\[/,
  "a bullet-train (rocket nose) SVG must exist"
);
assert.match(
  transitAppSource,
  /train:\s*\[/,
  "an ordinary train SVG must exist"
);
assert.match(
  transitAppSource,
  /function vehicleBearing\(\)/,
  "the vehicle glyph must be rotated toward its direction of travel"
);
assert.match(
  transitAppSource,
  /function vehicleBearing\(\)[\s\S]{0,1200}?currentSegment[\s\S]{0,1200}?Math\.atan2/,
  "bearing must point from the current position toward the next stop (destination direction)"
);
assert.match(
  transitAppSource,
  /function applyVehicleLook\([\s\S]{0,1600}?transit-vehicle-glyph[\s\S]{0,1600}?rotate\(/,
  "rotation must be applied to the inner glyph, not MapLibre's marker element"
);
assert.match(
  transitAppSource,
  /new DOMParser\(\)/,
  "SVG must be built without innerHTML (project rule)"
);
assert.match(
  cssSource,
  /\.transit-vehicle-glyph\s*\{[^}]*transform-origin/,
  "glyph rotation must pivot on its center"
);

/*
 * 海外「有数据却报错」事故回归（真实浏览器 + 网络面板取证）：
 * 東京→名古屋 报错「公共交通上游暂时无法提供班次详情」，但
 *   1) 11 次 trip 详情请求**全部 200**、各有 23~25 个经停（并非上游故障）；
 *   2) 11 次请求全部来自**同一条线路同一 stop_pattern**（丸ノ内線），
 *      即重复取同一份经停表 11 次，耗时 8.6 秒；
 *   3) 阶段预算 gtfsStage 只有 8 秒 → 被判 transit_timeout → 回落 12306
 *      → 界面显示「上游故障」，而真实结论是「这些数据源没有这条直达线路」。
 * 修复：按 (route, stop_pattern) 去重 + 跨线路轮转取样、预算放宽、
 *      「至少成功解析过一趟」即报无直达（而非上游故障）、文案列出已查线路。
 */
assert.match(
  providerSource,
  /function diversifyTripCandidates\(/,
  "trip candidates must be de-duplicated per route+stop_pattern"
);
assert.match(
  providerSource,
  /const GTFS_TRIP_PER_ROUTE = 2;/,
  "per-route pattern sampling must be bounded"
);
assert.match(
  providerSource,
  /const GTFS_TRIP_CANDIDATE_LIMIT = 8;/,
  "total trip detail calls must be bounded"
);
assert.match(
  providerSource,
  /gtfsStage:\s*14000/,
  "GTFS stage budget must exceed the deduplicated worst case"
);
assert.match(
  providerSource,
  /let tripDetailOk = false;/,
  "must track whether any trip was parsed successfully"
);
assert.match(
  providerSource,
  /!tripDetailOk && tripDetailFailed\s*\?\s*"gtfs_trip_unavailable"/,
  "upstream failure must only be reported when nothing could be parsed"
);
assert.match(
  providerSource,
  /当前数据源未覆盖这条直达线路/,
  "the no-direct message must state it is a coverage gap, not an outage"
);
assert.match(
  transitAppSource,
  /"direct_trip_not_found"[\s\S]{0,200}?railMissed/,
  "app must not label a coverage gap as an upstream outage"
);
assert.match(
  transitAppSource,
  /function keepVehicleInView\([\s\S]{0,1200}?state\.map\.project\(/,
  "keepVehicleInView must project the position to detect off-screen"
);
assert.match(
  transitAppSource,
  /updateVehicle\(\);\s*\n\s*keepVehicleInView\(\);/,
  "keepVehicleInView must run right after the marker is placed"
);
assert.match(
  transitAppSource,
  /function updateVehicle\(\)[\s\S]{0,200}?try \{[\s\S]{0,80}?renderVehicleMarker\(\)/,
  "vehicle marker failures must not abort rendering"
);

/*
 * 车辆标记看不到的事故回归（真实浏览器 + 控制台证据）：
 * 旧代码 `new Marker(...).addTo(map)` 之后才 setLngLat()，而 MapLibre 5.6
 * 的 addTo() 结尾会立刻用尚未定义的 _lngLat 调 _update()，抛
 * "Cannot read properties of undefined (reading 'lng')"；元素已进容器、
 * move/resize 监听已注册，留下「没有坐标却监听地图事件」的半残 Marker。
 * 地图一动它就在渲染循环里抛错，把渲染队列楔死（控制台刷
 * "Attempting to run(), but is already running"），此后 jumpTo/setCenter/
 * setZoom/无参 fitBounds 全部抛错——地图不再跟随、标记永远停在容器原点，
 * 且每次查询再泄漏一个。症状：用户「看不到运行中车辆位置」。
 */
const vehicleMarkerBlock =
  transitAppSource.slice(
    transitAppSource.indexOf(
      "function renderVehicleMarker("
    ),
    transitAppSource.indexOf(
      "function purgeStrayVehicleMarkers("
    ) >
      transitAppSource.indexOf(
        "function renderVehicleMarker("
      )
        ? transitAppSource.indexOf(
            "function purgeStrayVehicleMarkers("
          )
        : transitAppSource.length
  );

assert.match(
  vehicleMarkerBlock,
  /setLngLat\(lngLat\);[\s\S]{0,80}?addTo\(/,
  "Marker.setLngLat() MUST run before addTo() — reversed order wedges the MapLibre render queue"
);
assert.doesNotMatch(
  vehicleMarkerBlock,
  /\.addTo\([\s\S]{0,200}?\.setLngLat\(/,
  "addTo() before setLngLat() is the exact defect that hid the vehicle marker"
);
assert.match(
  transitAppSource,
  /function purgeStrayVehicleMarkers\(/,
  "stray half-registered markers must be purged"
);
assert.match(
  transitAppSource,
  /transit-vehicle-marker/,
  "vehicle marker must carry a dedicated hook class"
);
assert.match(
  cssSource,
  /\.transit-vehicle-marker\s*\{[^}]*position:\s*absolute/,
  "MapLibre only writes transform — the marker element must be absolutely positioned"
);

/* 相机降级链：easeTo 是楔死状态下唯一实测可用的相机路径 */
assert.match(
  transitAppSource,
  /function focusBounds\(/,
  "camera moves must go through a single chained helper"
);
assert.match(
  transitAppSource,
  /function easeToBounds\(/,
  "camera chain must fall back to easeTo"
);
assert.match(
  transitAppSource,
  /cameraForBounds\?\.|\.cameraForBounds\(/,
  "easeTo fallback needs a camera computed from the bounds"
);
assert.match(
  transitAppSource,
  /state\.map\.easeTo\(/,
  "camera chain must actually call easeTo"
);

/*
 * 海外事故回归：stops 搜索「名称包含即命中」且无相关性排序，
 * 搜「東京」首条可能是北海道旭川的「東京農業大学」（144.23/43.97），
 * 盲取 [0] 必然拿错站 → getDepartures 为 0 → 误报「无直达」。
 * 必须有：候选站按名称匹配 + 地理邻近排序、超距剔除、逐站容错。
 */
assert.match(
  providerSource,
  /function rankStopCandidates\(/,
  "GTFS stop candidates must be ranked, not taken as stops[0]"
);
assert.match(
  providerSource,
  /function referencePoint\(/,
  "reference point must come from best name-match group only"
);
assert.match(
  providerSource,
  /GTFS_STOP_MAX_DISTANCE_KM/,
  "same-name remote stops must be filtered by distance"
);
assert.match(
  providerSource,
  /GTFS_STOP_CANDIDATE_LIMIT/,
  "origin stop candidates must be tried one by one"
);
assert.match(
  providerSource,
  /catch \(error\) \{[\s\S]{0,200}?tripDetailFailed = true;[\s\S]{0,80}?continue;/,
  "a failing trip detail lookup must skip that trip, not abort the search"
);
assert.match(
  providerSource,
  /gtfs_trip_unavailable/,
  "upstream trip failure must be reported distinctly from no-direct-service"
);
assert.match(
  transitAppSource,
  /gtfs_trip_unavailable:\s*\n?\s*"errGtfsUnavailable"/,
  "app must map gtfs_trip_unavailable to a user-facing message"
);

/*
 * GTFS 上游故障时不能显示「未在中国铁路车站表中找到该站名」——
 * 查海外时 12306 本就查不到，必须提示公共交通上游不可用。
 */
assert.match(
  transitAppSource,
  /gtfsUnavailable[\s\S]{0,900}?T\("errGtfsUnavailable"\)/,
  "upstream GTFS failure must surface its own message, not the rail station error"
);

/*
 * 线上事故回归：Photon 只接受其内置 locale（en/de/fr/default）。
 * 实测 lang=zh / lang=ja / defaultlang=zh 一律 HTTP 400，
 * 导致所有地理编码失败 -> 经停站无坐标 -> journey.shape 为空 ->
 * 地图永不跟随查询结果。中文/日文必须走 default。
 */
assert.match(
  providerSource,
  /searchParams\.set\(\s*"lang",\s*\n?\s*language === "en"\s*\n?\s*\?\s*"en"\s*\n?\s*:\s*"default"/,
  "Photon geocoder must send lang=en or lang=default (zh/ja return HTTP 400)"
);

/*
 * 候选车次点击：selectTrain 传入的 trainNo 必须被 searchJourney 读取并透传，
 * 否则参数被静默丢弃、查询原样重跑（点其它车次毫无反应）。
 */
assert.match(
  transitAppSource,
  /overrides\?\.trainNo/,
  "searchJourney must read overrides.trainNo"
);
assert.match(
  transitAppSource,
  /trainNo,\s*\n\s*language,/,
  "trainNo must be forwarded to the provider options"
);

/*
 * trainNo 必须一路传到 chinaRail.searchJourney：
 * searchJourneyWithFallback 早期漏了解构/透传 trainNo，
 * 导致点击候选车次后仍查回原来那趟（线上事故：点其它车次无反应）。
 */
assert.match(
  providerSource,
  /async function searchJourneyWithFallback\([\s\S]{0,400}?trainNo = null/,
  "searchJourneyWithFallback must accept trainNo"
);
assert.match(
  providerSource,
  /chinaRail\.searchJourney\(\s*\{[\s\S]{0,220}?trainNo,/,
  "searchJourneyWithFallback must forward trainNo to chinaRail"
);

/*
 * 线上事故回归：<form method="get"> 的 submit 监听器必须 preventDefault。
 * 否则点「交通を検索」时 JS 查询刚发起，浏览器就原生 GET 提交并导航，
 * beforeunload 随即 abort 掉 state.controller 把查询自己杀掉——
 * 界面永远停在「GTFS照会中」，transit-proxy 显示 (canceled)，
 * 从不发出 leftTicket，且与点击次数无关（用户只点一次也复现）。
 */
assert.match(
  transitAppSource,
  /addEventListener\(\s*"submit",[\s\S]{0,200}?preventDefault\(\)/,
  "transit search form must preventDefault on submit"
);

/*
 * 地图兜底：经停站无坐标（shape 为空）时也必须用起终点 fit，
 * 否则地图永远停在默认位置、看起来「不跟随查询结果」。
 */
assert.match(
  transitAppSource,
  /shape\.length >= 2[\s\S]{0,2500}?journey\?\.origin[\s\S]{0,600}?journey\?\.destination/,
  "map must fall back to origin/destination bounds when shape is empty"
);

/*
 * 地图不跟随（另一路径）：查询结果先到、地图 load 事件后到时，
 * updateMap 因 mapReady=false 直接 return，挂起的 fit 必须被记住
 * 并在地图就绪后补执行，否则地图永远停在默认位置。
 */
assert.match(
  transitAppSource,
  /if \(!state\.mapReady\) \{[\s\S]{0,120}?state\.pendingFit = true;[\s\S]{0,80}?return;/,
  "updateMap must remember a fit request while the map is not ready"
);
assert.match(
  transitAppSource,
  /updateMap\(\{\s*fit: state\.pendingFit\s*\}\)/,
  "map load handler must replay the pending fit request"
);

/*
 * MapLibre 的 "load" 要等全部样式资源，OpenFreeMap 的部分图层常年不结束，
 * 实测 loaded() 恒为 false、mapReady 永为 false、fit 永挂起。
 * 必须另有 idle / 轮询兜底把 mapReady 置起来。
 */
assert.match(
  transitAppSource,
  /state\.map\.on\(\s*"idle",\s*markMapReady\s*\)/,
  "map must also mark ready on idle (load may never fire)"
);
assert.match(
  transitAppSource,
  /setInterval\([\s\S]{0,700}?clientWidth > 0[\s\S]{0,200}?clientHeight > 0[\s\S]{0,300}?markMapReady\(\)/,
  "map readiness must have a container-size polling fallback"
);
assert.doesNotMatch(html, /transit-app\.js\?v=20260923-1/);
assert.doesNotMatch(html, /road\.html\?v=20260921-12/);

/*
 * vm 上下文只有 ECMAScript 标准全局：
 * fetchWithTimeout / withBudget 依赖宿主的 AbortController 与定时器，必须注入。
 */
const providerHostGlobals = {
  AbortController,
  setTimeout,
  clearTimeout
};

const rail = loadContext(providerSource, "transit-providers.js", {
  ...providerHostGlobals,
  fetch: async () => {
    throw new Error("network disabled in tests");
  }
}).WebWindowsTransit;

const position = loadContext(positionSource, "transit-position.js", {})
  .WebWindowsTransitPosition;

/* ---------- 12306 解析 ---------- */

const stationSource =
  "var station_names='@bjb|北京北|VAP|beijingbei|bjb|0@icw|成都东|ICW|chengdudong|cdd|1@eay|西安北|EAY|xianbei|xab|2@cdw|成都|CDW|chengdu|cd|3@shh|上海|SHH|shanghai|sh|4';";

const stations = rail.parseStationTable(stationSource);
assert.equal(stations.length, 5);
assert.equal(rail.matchStation(stations, "成都东").code, "ICW");
assert.equal(rail.matchStation(stations, "chengdudong").code, "ICW");
assert.equal(rail.matchStation(stations, "cdd").code, "ICW");
assert.equal(rail.matchStation(stations, "ICW").code, "ICW");
assert.equal(rail.matchStation(stations, "西安北").code, "EAY");
assert.equal(rail.matchStation(stations, "没有这个站"), null);

/*
 * 后缀回落：客运表没有的方向站名/带「站」口语写法逐层剥除，
 * 剥除后只走精确链——「成都北」落到「成都」，但「海南」绝不能乱配「上海」。
 */
assert.equal(rail.matchStation(stations, "成都北").code, "CDW");
assert.equal(rail.matchStation(stations, "成都站").code, "CDW");
assert.equal(rail.matchStation(stations, "成都北站").code, "CDW");
assert.equal(rail.matchStation(stations, "上海站").code, "SHH");
assert.equal(rail.matchStation(stations, "海南"), null);
assert.equal(rail.matchStation(stations, "站"), null);

const ticketPayload = {
  data: {
    map: { ICW: "成都东", EAY: "西安北" },
    result: [
      ["", "", "24000000G100K", "G100", "ICW", "EAY", "ICW", "EAY", "08:10", "15:30", "07:20", "Y"],
      ["", "", "24000000D301K", "D301", "ICW", "EAY", "ICW", "EAY", "09:00", "16:12", "07:12", "N"]
    ]
  }
};

const trains = rail.parseLeftTicket(ticketPayload);
assert.equal(trains.length, 2);
assert.equal(trains[0].code, "G100");
assert.equal(trains[0].trainNo, "24000000G100K");
assert.equal(trains[0].fromName, "成都东");
assert.equal(trains[0].toName, "西安北");
assert.equal(trains[0].departTime, "08:10");
assert.equal(trains[0].arriveTime, "15:30");
assert.equal(trains[0].canBuy, "Y");
assert.equal(rail.parseLeftTicket({}).length, 0);

const scheduleRows = [
  { station_name: "成都东", arrive_time: "----", start_time: "08:10" },
  { station_name: "绵阳", arrive_time: "08:58", start_time: "09:00" },
  { station_name: "西安北", arrive_time: "15:30", start_time: "----" },
  { station_name: "郑州东", arrive_time: "17:20", start_time: "17:25" }
];

const sliced = rail.sliceSchedule(scheduleRows, "成都东", "西安北");
assert.equal(sliced.length, 3);
assert.equal(sliced[0].name, "成都东");
assert.equal(sliced[2].name, "西安北");
assert.equal(rail.sliceSchedule(scheduleRows, "西安北", "成都东").length, 0);
assert.equal(rail.sliceSchedule(scheduleRows, "成都东", "没有的站").length, 0);

/* ---------- api/railway-proxy.asp 真实响应契约 ---------- */

/*
 * 代理把 12306 原始报文在服务端解析成平铺 JSON。
 * 这三种形状 + 参数名就是前后端契约，任何一侧改动都必须同步。
 */
const aspStationsPayload = {
  stations: [
    { name: "成都东", code: "ICW", pinyin: "chengdudong", abbr: "cdd", city: "成都" },
    { name: "西安北", code: "EAY", pinyin: "xianbei", abbr: "xab", city: "西安" }
  ]
};

const aspTicketPayload = {
  date: "2026-09-24",
  from: { code: "ICW", name: "成都东" },
  to: { code: "EAY", name: "西安北" },
  message: "",
  trains: [
    {
      trainNo: "24000000G100K",
      code: "G100",
      fromCode: "ICW",
      toCode: "EAY",
      fromName: "成都东",
      toName: "西安北",
      startTime: "08:10",
      arriveTime: "15:30",
      duration: "07:20",
      canBuy: "Y"
    },
    {
      trainNo: "24000000D301K",
      code: "D301",
      fromCode: "ICW",
      toCode: "EAY",
      fromName: "成都东",
      toName: "西安北",
      startTime: "09:00",
      arriveTime: "16:12",
      duration: "07:12",
      canBuy: "N"
    }
  ]
};

const aspSchedulePayload = {
  stations: [
    { no: "01", name: "成都东", arrive: "----", depart: "08:10", stopover: "----" },
    { no: "02", name: "绵阳", arrive: "08:58", depart: "09:00", stopover: "2分" },
    { no: "14", name: "西安北", arrive: "15:30", depart: "----", stopover: "----" },
    { no: "15", name: "郑州东", arrive: "17:20", depart: "17:25", stopover: "5分" }
  ]
};

/* parseLeftTicket / sliceSchedule 直接吃代理形状 */
const aspTrains = rail.parseLeftTicket(aspTicketPayload);
assert.equal(aspTrains.length, 2);
assert.equal(aspTrains[0].code, "G100");
assert.equal(aspTrains[0].trainNo, "24000000G100K");
assert.equal(aspTrains[0].fromCode, "ICW");
assert.equal(aspTrains[0].toCode, "EAY");
assert.equal(aspTrains[0].fromName, "成都东");
assert.equal(aspTrains[0].toName, "西安北");
assert.equal(aspTrains[0].departTime, "08:10");
assert.equal(aspTrains[0].arriveTime, "15:30");
assert.equal(aspTrains[0].duration, "07:20");
assert.equal(aspTrains[0].canBuy, "Y");

const aspSliced = rail.sliceSchedule(
  aspSchedulePayload.stations,
  "成都东",
  "西安北"
);
assert.equal(aspSliced.length, 3);
assert.equal(aspSliced[0].name, "成都东");
assert.equal(aspSliced[0].departure, "08:10");
assert.equal(aspSliced[1].arrival, "08:58");
assert.equal(aspSliced[2].name, "西安北");
assert.equal(aspSliced[2].arrival, "15:30");
assert.equal(
  rail.sliceSchedule(aspSchedulePayload.stations, "西安北", "成都东").length,
  0
);

/* 端到端：provider 真的按代理契约发请求、解析响应 */
const railRequests = [];

const aspContext = loadContext(providerSource, "transit-providers.js", {
  ...providerHostGlobals,
  URL,
  location: { origin: "https://www.y0.hk" },
  fetch: async url => {
    const href = String(url);
    railRequests.push(href);

    const action = new URL(href).searchParams.get("action");

    const payload =
      action === "stations"
        ? aspStationsPayload
        : action === "leftTicket"
          ? aspTicketPayload
          : action === "schedule"
            ? aspSchedulePayload
            : null;

    if (!payload) {
      return {
        ok: false,
        status: 400,
        json: async () => ({
          error: { code: "unsupported_action", message: "unsupported action" }
        })
      };
    }

    return { ok: true, status: 200, json: async () => payload };
  }
});

const aspRail = aspContext.WebWindowsTransit;

const railProvider = new aspRail.ChinaRailTransitProvider({
  geocoder: { search: async () => null }
});

/* 简拼 abbr 必须被归一化成 shortPinyin，否则 cdd 匹配不到成都东 */
const cddSuggestions = await railProvider.searchStops("cdd");
assert.equal(cddSuggestions.length, 1);
assert.equal(cddSuggestions[0].code, "ICW");

const xabSuggestions = await railProvider.searchStops("xab");
assert.equal(xabSuggestions[0].code, "EAY");

const resolvedOrigin = await railProvider.resolveStation("成都东");
assert.equal(resolvedOrigin.code, "ICW");

const resolvedDestination = await railProvider.resolveStation("西安北");
assert.equal(resolvedDestination.code, "EAY");

const leftTicketTrains = await railProvider.getLeftTicket(
  { from: resolvedOrigin, to: resolvedDestination, date: "2026-09-24" },
  undefined
);
assert.equal(leftTicketTrains.length, 2);
assert.equal(leftTicketTrains[0].departTime, "08:10");

const scheduleRowsFromProvider = await railProvider.getSchedule({
  trainNo: "24000000G100K",
  fromCode: "ICW",
  toCode: "EAY",
  fromName: "成都东",
  toName: "西安北",
  date: "2026-09-24"
});
assert.equal(scheduleRowsFromProvider.length, 3);
assert.equal(scheduleRowsFromProvider[0].name, "成都东");
assert.equal(scheduleRowsFromProvider[2].arrival, "15:30");

/* 参数名必须与 ASP 读取的 QueryString 完全一致 */
assert.ok(railRequests.length >= 3, "provider did not call the rail proxy");

const stationRequest = new URL(
  railRequests.find(href => href.includes("action=stations"))
);
assert.equal(stationRequest.searchParams.get("action"), "stations");

const ticketRequest = new URL(
  railRequests.find(href => href.includes("action=leftTicket"))
);
assert.equal(ticketRequest.searchParams.get("from"), "ICW");
assert.equal(ticketRequest.searchParams.get("to"), "EAY");
assert.equal(ticketRequest.searchParams.get("date"), "2026-09-24");

const scheduleRequest = new URL(
  railRequests.find(href => href.includes("action=schedule"))
);
assert.equal(scheduleRequest.searchParams.get("trainNo"), "24000000G100K");
assert.equal(scheduleRequest.searchParams.get("from"), "ICW");
assert.equal(scheduleRequest.searchParams.get("to"), "EAY");
assert.equal(scheduleRequest.searchParams.get("date"), "2026-09-24");
assert.equal(scheduleRequest.searchParams.get("train_no"), null);
assert.equal(scheduleRequest.searchParams.get("code"), null);

/*
 * 12306 是同城级查询：查询「成都」返回「成都东」发车的车次，
 * 且个别车次 czzz 无经停数据（G4190 404）。
 * 断言：① 按行内真实站名切片（成都东→西安北）而非查询站名
 *       ② 首选车次无经停数据时按候选有界回落到下一班
 *       ③ 全部候选失败才抛错，且保留真实错误码
 */
const sameCityStations = {
  stations: [
    { name: "成都", code: "CDW", pinyin: "chengdu", abbr: "cd", city: "成都" },
    { name: "成都东", code: "ICW", pinyin: "chengdudong", abbr: "cdd", city: "成都" },
    { name: "西安北", code: "EAY", pinyin: "xianbei", abbr: "xab", city: "西安" }
  ]
};

const sameCityTicket = {
  date: "2026-09-24",
  from: { code: "CDW", name: "成都" },
  to: { code: "EAY", name: "西安北" },
  message: "",
  trains: [
    {
      trainNo: "77000G419003",
      code: "G4190",
      fromCode: "ICW",
      toCode: "EAY",
      fromName: "成都东",
      toName: "西安北",
      startTime: "00:57",
      arriveTime: "04:30",
      duration: "03:33",
      canBuy: "Y"
    },
    {
      trainNo: "76000D473003",
      code: "D4730",
      fromCode: "ICW",
      toCode: "EAY",
      fromName: "成都东",
      toName: "西安北",
      startTime: "05:05",
      arriveTime: "08:11",
      duration: "03:06",
      canBuy: "Y"
    }
  ]
};

/* 经停表是全路由（czzz 忽略 from/to），首班车 G4190 无数据 → 回落 D4730 */
const sameCitySchedule = {
  "77000G419003": null,
  "76000D473003": {
    stations: [
      { no: "01", name: "重庆北", arrive: "----", depart: "23:40", stopover: "----" },
      { no: "02", name: "成都东", arrive: "05:00", depart: "05:05", stopover: "5分" },
      { no: "03", name: "广元", arrive: "06:32", depart: "06:38", stopover: "6分" },
      { no: "04", name: "西安北", arrive: "08:11", depart: "----", stopover: "----" }
    ]
  }
};

const sameCityRequests = [];
const sameCityContext = loadContext(providerSource, "transit-providers.js", {
  ...providerHostGlobals,
  URL,
  location: { origin: "https://www.y0.hk" },
  fetch: async url => {
    const href = String(url);
    sameCityRequests.push(href);
    const parsed = new URL(href);
    const action = parsed.searchParams.get("action");
    if (action === "stations") {
      return { ok: true, status: 200, json: async () => sameCityStations };
    }
    if (action === "leftTicket") {
      assert.equal(parsed.searchParams.get("from"), "CDW");
      assert.equal(parsed.searchParams.get("to"), "EAY");
      return { ok: true, status: 200, json: async () => sameCityTicket };
    }
    if (action === "schedule") {
      const payload = sameCitySchedule[parsed.searchParams.get("trainNo")];
      if (!payload) {
        return {
          ok: false,
          status: 404,
          json: async () => ({
            error: { code: "schedule_unavailable", httpStatus: 404, message: "该车次没有可用的经停站数据。" }
          })
        };
      }
      return { ok: true, status: 200, json: async () => payload };
    }
    return {
      ok: false,
      status: 400,
      json: async () => ({ error: { code: "unsupported_action", httpStatus: 400, message: "unsupported action" } })
    };
  }
});

const sameCityRail = sameCityContext.WebWindowsTransit;
const sameCityProvider = new sameCityRail.ChinaRailTransitProvider({
  geocoder: { search: async () => null }
});

const sameCityJourney = await sameCityProvider.searchJourney({
  origin: "成都北",
  destination: "西安北",
  /*
   * 查 00:30 → 最贴合的是 G4190（00:57），它恰好无经停数据，
   * 必须按候选顺序回落到 D4730（05:05）——有界回退不能被
   * 「按时刻就近选车」的新逻辑破坏。
   */
  departureTime: "2026-09-24T00:30",
  language: "zh"
});
assert.equal(sameCityJourney.provider, "china-rail");
assert.equal(sameCityJourney.routeId, "D4730", "G4190 无经停数据 → 回落 D4730");
assert.equal(sameCityJourney.origin.name, "成都东", "实际上车站 = 行内发站，不是查询站成都");
assert.equal(sameCityJourney.stopTimes[0].stop.stop_name, "成都东");
assert.equal(
  sameCityJourney.stopTimes[sameCityJourney.stopTimes.length - 1].stop.stop_name,
  "西安北"
);
assert.ok(sameCityJourney.stopTimes.length >= 2);
assert.equal(sameCityJourney.stopTimes[0].status, "origin");
const sameCitySchedules = sameCityRequests.filter(href => href.includes("action=schedule"));
assert.equal(sameCitySchedules.length, 2, "G4190 失败后必须再试下一候选");
const d4730Schedule = new URL(sameCityRequests.find(href => href.includes("76000D473003")));
assert.equal(d4730Schedule.searchParams.get("from"), "ICW", "经停请求必须用车次行内发站码");

/* 全部候选都无经停数据 → 有界尝试后抛出真实错误码 */
const allFailContext = loadContext(providerSource, "transit-providers.js", {
  ...providerHostGlobals,
  URL,
  location: { origin: "https://www.y0.hk" },
  fetch: async url => {
    const parsed = new URL(String(url));
    const action = parsed.searchParams.get("action");
    if (action === "stations") {
      return { ok: true, status: 200, json: async () => sameCityStations };
    }
    if (action === "leftTicket") {
      return { ok: true, status: 200, json: async () => sameCityTicket };
    }
    if (action === "schedule") {
      return {
        ok: false,
        status: 404,
        json: async () => ({
          error: { code: "schedule_unavailable", httpStatus: 404, message: "该车次没有可用的经停站数据。" }
        })
      };
    }
    return {
      ok: false,
      status: 400,
      json: async () => ({ error: { code: "unsupported_action", httpStatus: 400, message: "unsupported action" } })
    };
  }
});
const allFailRail = allFailContext.WebWindowsTransit;
const allFailProvider = new allFailRail.ChinaRailTransitProvider({
  geocoder: { search: async () => null }
});
await assert.rejects(
  () =>
    allFailProvider.searchJourney({
      origin: "成都北",
      destination: "西安北",
      departureTime: "2026-09-24T12:00",
      language: "zh"
    }),
  error => error?.code === "schedule_unavailable"
);

/*
 * 「运行中车次」纯函数级回归（不发网络请求）：
 * 12306 对当天不返回已发车车次，代理用当日快照补齐后，
 * 客户端必须按【北京时区】把车次分成 running/past/upcoming 并分组排序，
 * 否则会出现「浏览器在 JST、列车时刻是 CST」导致的错判。
 */
const stateContext = loadContext(providerSource, "transit-providers.js", {
  ...providerHostGlobals,
  URL,
  location: { origin: "https://www.y0.hk" },
  fetch: async () => {
    throw new Error("state tests must not perform network calls");
  }
});
const stateProvider = new stateContext.WebWindowsTransit.ChinaRailTransitProvider({
  geocoder: { search: async () => null }
});

// 北京时间 2026-09-24 10:30 == UTC 2026-09-24T02:30:00Z
const beijing1030 = Date.parse("2026-09-24T02:30:00Z");

const sameDayTrains = [
  { trainNo: "T-EARLY", code: "G1", departTime: "00:57", arriveTime: "04:30", serviceDate: "2026-09-24" },
  { trainNo: "T-RUN", code: "G2", departTime: "09:00", arriveTime: "12:00", serviceDate: "2026-09-24" },
  { trainNo: "T-NEXT", code: "G3", departTime: "14:00", arriveTime: "17:00", serviceDate: "2026-09-24" },
  { trainNo: "T-NIGHT", code: "G4", departTime: "23:30", arriveTime: "26:10", serviceDate: "2026-09-24" }
];

const grouped = stateProvider.pickTrains(sameDayTrains, beijing1030);
/* 注意：provider 在 vm context 里执行，其数组原型属于另一 realm，
   故用 join/string 比较而不是 assert.deepEqual（会因原型不同误报）。 */
assert.equal(
  grouped.map(item => item.trainNo).join(","),
  "T-RUN,T-NEXT,T-NIGHT,T-EARLY",
  "当天候选顺序必须是 运行中 → 未发车 → 已通过"
);
assert.equal(
  grouped.map(item => item.serviceState).join(","),
  "running,upcoming,upcoming,past"
);
assert.equal(
  grouped[0].code,
  "G2",
  "运行中的车次必须排在候选首位"
);

/* 查「此刻」→ 默认选中运行中的车次（可在地图上看到推定位置） */
assert.equal(
  stateProvider.pickInitialCandidate(grouped, "2026-09-24T10:30", beijing1030)?.trainNo,
  "T-RUN",
  "查此刻必须默认选中运行中的车次"
);

/* 查具体时刻 → 取最接近该时刻的车次（这正是「搜过去的车次」） */
assert.equal(
  stateProvider.pickInitialCandidate(grouped, "2026-09-24T09:20", beijing1030)?.trainNo,
  "T-RUN",
  "指定时刻应选中发车时间最接近的车次"
);
assert.equal(
  stateProvider.pickInitialCandidate(grouped, "2026-09-24T01:10", beijing1030)?.trainNo,
  "T-EARLY",
  "查凌晨时段应能选中已通过的车次"
);

/* 没有运行中车次时退回最近的未发车车次 */
const noRunning = grouped.filter(item => item.trainNo !== "T-RUN");
assert.equal(
  stateProvider.pickInitialCandidate(noRunning, "2026-09-24T10:30", beijing1030)?.trainNo,
  "T-NEXT",
  "无运行中车次时应选最近的未发车车次"
);

/* 未来日期保持原行为：按发车时间升序，不做状态分组 */
const futureTrains = [
  { trainNo: "F-LATE", code: "G9", departTime: "18:00", arriveTime: "22:00", serviceDate: "2026-09-26" },
  { trainNo: "F-EARLY", code: "G8", departTime: "06:09", arriveTime: "09:31", serviceDate: "2026-09-26" }
];
assert.equal(
  stateProvider.pickTrains(futureTrains, beijing1030).map(item => item.trainNo).join(","),
  "F-EARLY,F-LATE",
  "未来日期必须保持按发车时间升序"
);
assert.ok(
  stateProvider.pickTrains(futureTrains, beijing1030).every(item => item.serviceState === "upcoming"),
  "未来日期一律 upcoming"
);

/* 跨零点车次：到达 26:10 视为次日，运行中判定不能因 26>23 而判为已结束 */
const crossMidnight = stateProvider.pickTrains(
  [{ trainNo: "T-X", code: "G5", departTime: "23:30", arriveTime: "26:10", serviceDate: "2026-09-24" }],
  Date.parse("2026-09-24T16:00:00Z") // 北京 2026-09-25 00:00
);
assert.equal(crossMidnight[0].serviceState, "running", "跨零点车次在次日 00:00 应判为运行中");

/*
 * 过去日期（如查昨天）不能被「今天的 3 趟配额」砍掉，
 * 且应按距所查时刻的远近排序，帮用户找回自己那趟车。
 */
const yesterdayTrains = [
  { trainNo: "Y-06", code: "G6", departTime: "06:00", arriveTime: "10:00", serviceDate: "2026-09-23" },
  { trainNo: "Y-08", code: "G7", departTime: "08:00", arriveTime: "12:00", serviceDate: "2026-09-23" },
  { trainNo: "Y-18", code: "G8", departTime: "18:00", arriveTime: "22:00", serviceDate: "2026-09-23" }
];
const yesterdayOrdered = stateProvider.pickTrains(
  yesterdayTrains,
  beijing1030,
  8 * 3600 + 30 * 60 // 查 08:30
);
assert.equal(
  yesterdayOrdered.map(item => item.trainNo).join(","),
  "Y-08,Y-06,Y-18",
  "过去日期应按距所查时刻排序（08:30 → 08:00 那趟排最前）"
);
assert.equal(
  stateProvider.pickInitialCandidate(
    yesterdayOrdered,
    "2026-09-23T08:30",
    beijing1030
  )?.trainNo,
  "Y-08",
  "查过去日期必须能选中用户要的那趟车"
);

/* 代理错误码必须带 httpStatus 抛出，由 STATUS_KEYS 本地化 */const errorContext = loadContext(providerSource, "transit-providers.js", {
  ...providerHostGlobals,
  URL,
  location: { origin: "https://www.y0.hk" },
  fetch: async () => ({
    ok: false,
    status: 502,
    json: async () => ({
      error: { code: "station_source_unavailable", message: "车站表不可用" }
    })
  })
});

let railError = null;
try {
  await new errorContext.WebWindowsTransit.ChinaRailTransitProvider(
    {}
  ).getStations();
} catch (error) {
  railError = error;
}
assert.equal(railError?.code, "station_source_unavailable");
assert.equal(railError?.httpStatus, 502);

/* 跨日经停：23:50 发车、次日 01:10 到达必须进位到 25:10:00 */
const overnight = rail.normalizeStopTimes([
  { name: "成都东", departure: "23:50", arrival: "----" },
  { name: "西安北", departure: "----", arrival: "01:10" }
]);

assert.equal(overnight[0].departureTime, "23:50:00");
assert.equal(overnight[1].departureTime, "25:10:00");
assert.equal(overnight[1].arrivalTime, "25:10:00");

const daytime = rail.normalizeStopTimes([
  { name: "A", departure: "08:10", arrival: "08:10" },
  { name: "B", departure: "08:58", arrival: "08:58" },
  { name: "C", departure: "15:30", arrival: "15:30" }
]);
assert.equal(daytime[2].arrivalTime, "15:30:00");

/*
 * 线上事故回归（G4190 真实经停，2026-09-25）：
 * 旧实现把「同一站内到达早于发车」当成跨日，逐站给到达 +86400，
 * 时刻显示成 24:53 / 49:35 / 100:03。同站正常停站绝不能加一天。
 */
const g4190 = rail.normalizeStopTimes([
  { name: "成都东", arrival: "00:53", departure: "00:57" },
  { name: "绵阳", arrival: "01:35", departure: "01:37" },
  { name: "广元", arrival: "02:27", departure: "02:34" },
  { name: "汉中", arrival: "03:15", departure: "03:20" },
  { name: "西安北", arrival: "04:30", departure: "04:30" }
]);

assert.equal(g4190[0].arrivalTime, "00:53:00");
assert.equal(g4190[0].departureTime, "00:57:00");
assert.equal(g4190[1].arrivalTime, "01:35:00");
assert.equal(g4190[4].arrivalTime, "04:30:00");
assert.deepEqual(
  g4190.map(stop => stop.arrivalTime),
  ["00:53:00", "01:35:00", "02:27:00", "03:15:00", "04:30:00"],
  "跨零点车次经停时刻必须逐站保持真实钟点"
);
assert.ok(
  g4190.every(
    stop =>
      Number(stop.arrivalTime.slice(0, 2)) < 24 &&
      Number(stop.departureTime.slice(0, 2)) < 24
  ),
  "日内经停不得出现 24 小时以上的时刻"
);

/* 同站跨零点停站：23:58 到、次日 00:02 发，只给发车进位 */
const midnightStop = rail.normalizeStopTimes([
  { name: "X", arrival: "23:58", departure: "00:02" },
  { name: "Y", arrival: "00:20", departure: "00:25" }
]);

assert.equal(midnightStop[0].arrivalTime, "23:58:00");
assert.equal(midnightStop[0].departureTime, "24:02:00");
assert.equal(midnightStop[0].arrivalSeconds, 23 * 3600 + 58 * 60);
assert.equal(midnightStop[0].departureSeconds, 86400 + 2 * 60);

/* 车型图标只按官方类型 / 车次字母推断 */
assert.equal(rail.routeIcon(100), "🚆");
assert.equal(rail.routeIcon(120), "🚆");
assert.equal(rail.routeIcon(3), "🚌");
assert.equal(rail.routeIcon(1), "🚇");
assert.equal(rail.routeIcon(0), "🚋");
assert.equal(rail.routeIcon(900), "🚋");
assert.equal(rail.trainIcon("G102"), "🚄");
assert.equal(rail.trainIcon("C2001"), "🚄");
assert.equal(rail.trainIcon("D301"), "🚄");
assert.equal(rail.trainIcon("K540"), "🚆");
assert.equal(rail.trainIcon("Z123"), "🚆");
assert.equal(rail.trainIcon("1234"), "🚆");

/* ---------- GTFS → 12306 回落链 ---------- */

const journeyStub = { provider: "china-rail", route: { shortName: "G100" } };
let fallbackCode = null;
let railCalls = 0;

const fellBack = await rail.searchJourneyWithFallback({
  transitland: {
    searchJourney: async () => {
      const error = new Error("no direct trip");
      error.code = "direct_trip_not_found";
      throw error;
    }
  },
  chinaRail: {
    searchJourney: async () => {
      railCalls += 1;
      return journeyStub;
    }
  },
  origin: "成都东",
  destination: "西安北",
  departureTime: "2026-09-24T08:10",
  onFallback: code => {
    fallbackCode = code;
  }
});

assert.equal(fellBack.source, "china-rail");
assert.equal(fellBack.journey, journeyStub);
assert.equal(fallbackCode, "direct_trip_not_found");
assert.equal(railCalls, 1);

const noFallback = await rail.searchJourneyWithFallback({
  transitland: { searchJourney: async () => ({ provider: "transitland" }) },
  chinaRail: {
    searchJourney: async () => {
      throw new Error("rail provider must not run");
    }
  },
  origin: "东京",
  destination: "名古屋",
  departureTime: "2026-09-24T08:10"
});
assert.equal(noFallback.source, "transitland");

/*
 * 回落语义（线上事故回归）：
 * GTFS 阶段除用户取消外任何失败都必须回落 12306——
 * 限流、网络错误、超时、挂起，一律不许把用户卡在 GTFS 阶段。
 */
let hardFallback = null;
railCalls = 0;

const hardFailure = await rail.searchJourneyWithFallback({
  transitland: {
    searchJourney: async () => {
      const error = new Error("quota");
      error.code = "rate_limited";
      throw error;
    }
  },
  chinaRail: {
    searchJourney: async () => {
      railCalls += 1;
      return journeyStub;
    }
  },
  origin: "a",
  destination: "b",
  departureTime: "2026-09-24T08:10",
  onFallback: code => {
    hardFallback = code;
  }
});
assert.equal(hardFailure.source, "china-rail");
assert.equal(hardFailure.journey, journeyStub);
assert.equal(hardFallback, "rate_limited");
assert.equal(railCalls, 1);

/* 网络错误（fetch TypeError，无 code）→ 回落，fallbackCode 兜底 transit_failed */
hardFallback = null;
railCalls = 0;

const networkFailure = await rail.searchJourneyWithFallback({
  transitland: {
    searchJourney: async () => {
      throw new TypeError("Failed to fetch");
    }
  },
  chinaRail: {
    searchJourney: async () => {
      railCalls += 1;
      return journeyStub;
    }
  },
  origin: "a",
  destination: "b",
  departureTime: "2026-09-24T08:10",
  onFallback: code => {
    hardFallback = code;
  }
});
assert.equal(networkFailure.source, "china-rail");
assert.equal(hardFallback, "transit_failed");

/*
 * GTFS 阶段的 AbortError 必须回落到 12306，而不是整体放弃。
 * 旧实现对任意 AbortError 直接 rethrow，固化了线上事故：
 * 连点查询时 transit-proxy 被取消 -> onFallback 不触发、
 * leftTicket 从不发出、界面永远停在「照会中」。
 * 「用户取消」只由外部已中止的 signal 表示（见下方 userCancel 断言）。
 */
let gtfsAbortFellBack = null;
const gtfsAbortOutcome = await rail.searchJourneyWithFallback({
  transitland: {
    searchJourney: async () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    }
  },
  chinaRail: {
    searchJourney: async () => journeyStub
  },
  origin: "a",
  destination: "b",
  departureTime: "2026-09-24T08:10",
  onFallback: () => {
    gtfsAbortFellBack = true;
  }
});
assert.equal(gtfsAbortOutcome.source, "china-rail");
assert.equal(gtfsAbortFellBack, true);

/* 用户主动取消（外部 signal 已中止）→ AbortError 原样上抛，不查询 12306 */
let userCancelError = null;
let userCancelRailCalls = 0;
const userCancelController = new AbortController();
userCancelController.abort();
try {
  await rail.searchJourneyWithFallback({
    transitland: {
      searchJourney: async () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        throw error;
      }
    },
    chinaRail: {
      searchJourney: async () => {
        userCancelRailCalls += 1;
        throw new Error("rail provider must not run after user cancel");
      }
    },
    origin: "a",
    destination: "b",
    departureTime: "2026-09-24T08:10"
  }, userCancelController.signal);
} catch (error) {
  userCancelError = error;
}
assert.equal(userCancelError?.name, "AbortError", "用户主动取消必须保持 AbortError 语义");
assert.equal(userCancelRailCalls, 0, "用户已取消时不得再查询 12306");

/* ---------- 短预算：挂起必须有界，绝不永久「照会中」 ---------- */

const impatient = loadContext(providerSource, "transit-providers.js", {
  fetch: () => new Promise(() => {}), // 永不 settle 的网络黑洞
  AbortController,
  setTimeout,
  clearTimeout,
  URL,
  __WENDAO_TRANSIT_TIMEOUTS__: {
    transitRequest: 15,
    geocoderRequest: 15,
    railRequest: 15,
    gtfsStage: 25,
    railStage: 40
  }
}).WebWindowsTransit;

/* GTFS 挂起 → 阶段预算超时 → 及时回落 12306 */
railCalls = 0;
hardFallback = null;

const hungStart = Date.now();
const hungGtfs = await impatient.searchJourneyWithFallback({
  transitland: { searchJourney: () => new Promise(() => {}) },
  chinaRail: {
    searchJourney: async () => {
      railCalls += 1;
      return journeyStub;
    }
  },
  origin: "a",
  destination: "b",
  departureTime: "2026-09-24T08:10",
  onFallback: code => {
    hardFallback = code;
  }
});
assert.equal(hungGtfs.source, "china-rail");
assert.equal(hardFallback, "transit_timeout");
assert.equal(railCalls, 1);
assert.ok(Date.now() - hungStart < 2000, "hung GTFS must fall back via stage budget");

/* 12306 阶段也挂起 → rail_timeout 上抛（有界报错，而非卡死） */
let railTimeout = null;
try {
  await impatient.searchJourneyWithFallback({
    transitland: { searchJourney: () => new Promise(() => {}) },
    chinaRail: { searchJourney: () => new Promise(() => {}) },
    origin: "a",
    destination: "b",
    departureTime: "2026-09-24T08:10"
  });
} catch (error) {
  railTimeout = error;
}
assert.equal(railTimeout?.name, "TimeoutError");
assert.equal(railTimeout?.code, "rail_timeout");

/* 中止一轮查询后，下一轮用新 signal 必须照常工作（不可被污染） */
let afterCancelCalls = 0;
const afterCancel = await impatient.searchJourneyWithFallback({
  transitland: { searchJourney: () => new Promise(() => {}) },
  chinaRail: {
    searchJourney: async () => {
      afterCancelCalls += 1;
      return journeyStub;
    }
  },
  origin: "a",
  destination: "b",
  departureTime: "2026-09-24T08:10"
});
assert.equal(afterCancel.source, "china-rail", "重新查询必须照常回落");
assert.equal(afterCancelCalls, 1);

/* 单请求 fetch 超时：TimeoutError + code 可与 AbortError 严格区分 */
let singleTimeout = null;
try {
  await impatient.fetchWithTimeout(
    "https://example.invalid/",
    {},
    15,
    "transit_timeout",
    "timed out"
  );
} catch (error) {
  singleTimeout = error;
}
assert.equal(singleTimeout?.name, "TimeoutError");
assert.equal(singleTimeout?.code, "transit_timeout");

/* ---------- 服务时区与运行状态 ---------- */

const railJourney = {
  provider: "china-rail",
  serviceDate: "2026-09-23",
  serviceTimezoneOffsetMinutes: 480,
  origin: { name: "成都东", departureTime: "08:10:00" },
  destination: { name: "西安北", arrivalTime: "15:30:00" },
  stopTimes: [
    { stop: { stop_name: "成都东" }, departure_time: "08:10:00", arrival_time: "08:10:00" },
    { stop: { stop_name: "绵阳" }, departure_time: "09:00:00", arrival_time: "08:58:00" },
    { stop: { stop_name: "西安北" }, departure_time: "15:30:00", arrival_time: "15:30:00" }
  ]
};

/* 北京时间 10:00 = UTC 02:00：与浏览器所在时区无关 */
const runningAt = Date.UTC(2026, 8, 23, 2, 0, 0);
assert.equal(position.serviceSeconds(railJourney, runningAt), 36000);

const running = position.describeService(railJourney, runningAt);
assert.equal(running.state, "running");
assert.equal(running.passedCount, 2);
assert.equal(running.nextIndex, 2);
assert.deepEqual(
  running.stops.map(stop => stop.status),
  ["passed", "passed", "next"]
);
assert.equal(running.currentSegment.from.name, "绵阳");
assert.equal(running.currentSegment.to.name, "西安北");

const before = position.describeService(
  railJourney,
  Date.UTC(2026, 8, 23, 0, 0, 0)
);
assert.equal(before.state, "before");
assert.equal(before.passedCount, 0);
assert.ok(before.stops.every(stop => stop.status === "waiting"));

const arrived = position.describeService(
  railJourney,
  Date.UTC(2026, 8, 23, 8, 0, 0)
);
assert.equal(arrived.state, "arrived");
assert.equal(arrived.passedCount, 3);
assert.equal(arrived.nextIndex, -1);

/* 服务日跨零点：次日北京时间 00:30 属于前一天的 service day */
const overnightJourney = {
  ...railJourney,
  serviceDate: "2026-09-23",
  origin: { name: "成都东", departureTime: "23:50:00" },
  destination: { name: "西安北", arrivalTime: "25:10:00" }
};

assert.equal(
  position.serviceSeconds(
    overnightJourney,
    Date.UTC(2026, 8, 23, 16, 30, 0)
  ),
  88200
);

assert.equal(
  position.describeService(
    overnightJourney,
    Date.UTC(2026, 8, 23, 16, 30, 0)
  ).state,
  "running"
);

/* 发车前 22:00（北京时间）仍应是未发车 */
assert.equal(
  position.describeService(
    overnightJourney,
    Date.UTC(2026, 8, 23, 14, 0, 0)
  ).state,
  "before"
);

/* 推定位置必须落在真实 shape 上 */
const shaped = {
  ...railJourney,
  shape: [
    [104.1, 30.6],
    [105.0, 31.4],
    [108.9, 34.3]
  ],
  origin: { name: "成都东", departureTime: "08:10:00", latitude: 30.6, longitude: 104.1 },
  destination: { name: "西安北", arrivalTime: "15:30:00", latitude: 34.3, longitude: 108.9 }
};

const resolver = new position.TransitPositionResolver();
const midTrip = resolver.resolve(shaped, runningAt);
assert.equal(midTrip.positionStatus, "estimated");
assert.ok(
  midTrip.position.latitude > 30.6 && midTrip.position.latitude < 34.3
);
assert.equal(
  resolver.resolve(shaped, Date.UTC(2026, 8, 23, 0, 0, 0)).positionStatus,
  "unavailable"
);

console.log("wendao transit, china rail, and i18n smoke tests passed");
