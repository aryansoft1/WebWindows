import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const read = url => fs.readFile(new URL(url, import.meta.url), "utf8");

const providerSource = await read("../assets/js/transit-providers.js");
const positionSource = await read("../assets/js/transit-position.js");
const appSource = await read("../assets/js/navigation-app.js");
const transitAppSource = await read("../assets/js/transit-app.js");
const enhancementSource = await read("../assets/js/navigation-enhancements.js");
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
assert.match(html, /transit-providers\.js\?v=20260923-2/);
assert.match(html, /transit-app\.js\?v=20260923-2/);
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
  "var station_names='@bjb|北京北|VAP|beijingbei|bjb|0@icw|成都东|ICW|chengdudong|cdd|1@eay|西安北|EAY|xianbei|xab|2';";

const stations = rail.parseStationTable(stationSource);
assert.equal(stations.length, 3);
assert.equal(rail.matchStation(stations, "成都东").code, "ICW");
assert.equal(rail.matchStation(stations, "chengdudong").code, "ICW");
assert.equal(rail.matchStation(stations, "cdd").code, "ICW");
assert.equal(rail.matchStation(stations, "ICW").code, "ICW");
assert.equal(rail.matchStation(stations, "西安北").code, "EAY");
assert.equal(rail.matchStation(stations, "没有这个站"), null);

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

/* 代理错误码必须带 httpStatus 抛出，由 STATUS_KEYS 本地化 */
const errorContext = loadContext(providerSource, "transit-providers.js", {
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

/* 用户取消 → AbortError 原样上抛，绝不回落到 12306 */
let cancelledError = null;
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
        throw new Error("rail provider must not run after cancel");
      }
    },
    origin: "a",
    destination: "b",
    departureTime: "2026-09-24T08:10"
  });
} catch (error) {
  cancelledError = error;
}
assert.equal(cancelledError?.name, "AbortError");

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
