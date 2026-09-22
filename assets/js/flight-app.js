(function () {
  "use strict";

  const $ = id => document.getElementById(id);

  if (
    !window.WebWindowsFlight ||
    !window.WebWindowsFlightPosition ||
    !$("sky-tab")
  ) {
    return;
  }

  const NORMAL_POLL_MS = 30000;
  const ESTIMATED_TICK_MS = 2000;
  const MAX_BACKOFF_MS = 300000;
  const MAX_TRACK_POINTS = 2000;

  const provider =
    new window.WebWindowsFlight.AirLabsFlightProvider();

  const resolver =
    new window.WebWindowsFlightPosition.FlightPositionResolver();

  /*
   * ADS-B 历史轨迹服务。
   * 即使 flight-track.js 没加载成功，
   * 也不能影响原来的航班查询。
   */
  const traceProvider =
    window.WebWindowsFlightTrack?.AdsbTraceProvider
      ? new window.WebWindowsFlightTrack.AdsbTraceProvider()
      : null;

  const refreshPolicy =
    new window.WebWindowsFlightPosition.FlightRefreshPolicy({
      normalMs: NORMAL_POLL_MS,
      maximumMs: MAX_BACKOFF_MS
    });

  /*
   * 这里只是少数常见航空公司的友好显示名称，
   * 不是完整航空公司列表。
   *
   * 完整航空公司目录仍通过 provider.getAirlines() 动态取得。
   */
  const FRIENDLY_AIRLINE_NAMES = {
    NH: "全日空 ANA",
    JL: "日本航空 JAL",
    CZ: "中国南方航空",
    MU: "中国东方航空",
    "3U": "四川航空"
  };

  const TEXT = {
    zh: {
      ground: "问地",
      sky: "问天",
      airline: "航空公司（可选）",
      auto: "自动从航班号识别（推荐）",
      help: "可以不选；输入航班号后系统会自动识别。",
      query: "查询航班",
      ready: "请输入航班号和日期。",
      searching: "正在查询真实航班数据…",
      need: "请输入航班号并选择日期。",
      live: "实时位置",
      estimated: "推定位置",
      unavailable: "位置不可用",
      updated: "最后更新 {time}",
      lastLive: "最后实时更新 {time}",
      waiting: "等待实时定位",

      estimateNote:
        "此位置根据机场和航班时间推算，并非实时定位；未作为真实飞行轨迹显示。",

      liveNote:
        "飞机位置为实时数据；实线仅显示已取得的真实 ADS-B 飞行轨迹。",

      unavailableNote:
        "缺少实时位置或可靠推定条件，未显示飞机。",

      delayed: "航班延误 {minutes} 分钟",
      cancelled: "航班已取消",
      diverted: "航班发生备降或航路变更",
      abnormal: "航班状态异常：{status}",
      rate: "实时服务限流，正在按退避策略重试。",
      stale: "实时位置暂未更新，保留最后位置并继续重试。",
      restored: "实时位置已恢复。",
      notConfigured: "航班数据服务尚未配置。",
      quota: "航班数据服务当前限流。",
      notFound: "未查询到该航班。",
      noDate: "该日期暂无航班数据。",
      timeout: "航班数据服务响应超时。",
      noInfo: "暂无信息"
    },

    tw: {
      ground: "問地",
      sky: "問天",
      airline: "航空公司（選填）",
      auto: "由航班號自動識別（建議）",
      help: "可不選；輸入航班號後系統會自動識別。",
      query: "查詢航班",
      ready: "請輸入航班號與日期。",
      searching: "正在查詢真實航班資料…",
      need: "請輸入航班號並選擇日期。",
      live: "即時位置",
      estimated: "推定位置",
      unavailable: "位置無法取得",
      updated: "最後更新 {time}",
      lastLive: "最後即時更新 {time}",
      waiting: "等待即時定位",

      estimateNote:
        "此位置依機場與航班時間推算，並非即時定位；不會當作真實飛行軌跡顯示。",

      liveNote:
        "航機位置為即時資料；實線僅顯示已取得的真實 ADS-B 飛行軌跡。",

      unavailableNote:
        "缺少即時位置或可靠推定條件，未顯示航機。",

      delayed: "航班延誤 {minutes} 分鐘",
      cancelled: "航班已取消",
      diverted: "航班備降或航路變更",
      abnormal: "航班狀態異常：{status}",
      rate: "即時服務限流，正按退避策略重試。",
      stale: "即時位置暫未更新，保留最後位置並繼續重試。",
      restored: "即時位置已恢復。",
      notConfigured: "航班資料服務尚未設定。",
      quota: "航班資料服務目前限流。",
      notFound: "找不到此航班。",
      noDate: "該日期沒有航班資料。",
      timeout: "航班資料服務逾時。",
      noInfo: "暫無資訊"
    },

    en: {
      ground: "Ground",
      sky: "Flights",
      airline: "Airline (optional)",
      auto: "Detect from flight number (recommended)",
      help:
        "You may leave this blank; the airline is detected from the flight number.",
      query: "Search flight",
      ready: "Enter a flight number and date.",
      searching: "Loading verified flight data…",
      need: "Enter a flight number and date.",
      live: "LIVE",
      estimated: "ESTIMATED",
      unavailable: "Position unavailable",
      updated: "Last update {time}",
      lastLive: "Last live update {time}",
      waiting: "Waiting for live position",

      estimateNote:
        "This approximate position is calculated from airports and flight times. It is not displayed as an actual flight track.",

      liveNote:
        "Aircraft position is live. The solid line contains only observed ADS-B flight-track points.",

      unavailableNote:
        "No live position or reliable estimate is available, so no aircraft is shown.",

      delayed: "Flight delayed {minutes} min",
      cancelled: "Flight cancelled",
      diverted: "Flight diverted or rerouted",
      abnormal: "Flight alert: {status}",
      rate: "Live service rate-limited; retry backoff is active.",
      stale:
        "Live position is temporarily stale; keeping the last point and retrying.",
      restored: "Live tracking restored.",
      notConfigured: "Flight data service is not configured.",
      quota: "Flight data service is rate-limited.",
      notFound: "Flight not found.",
      noDate: "No flight data for this date.",
      timeout: "Flight data service timed out.",
      noInfo: "No information"
    },

    jp: {
      ground: "問地",
      sky: "問天",
      airline: "航空会社（任意）",
      auto: "便名から自動判定（推奨）",
      help: "選択不要です。便名を入力すると航空会社を自動判定します。",
      query: "フライト検索",
      ready: "便名と日付を入力してください。",
      searching: "実際のフライト情報を検索中…",
      need: "便名と日付を入力してください。",
      live: "リアルタイム",
      estimated: "推定位置",
      unavailable: "位置情報なし",
      updated: "最終更新 {time}",
      lastLive: "最終リアルタイム更新 {time}",
      waiting: "リアルタイム測位待ち",

      estimateNote:
        "この位置は空港と運航時刻から算出した概算です。実際の飛行軌跡としては表示しません。",

      liveNote:
        "機体位置はリアルタイムです。実線は取得済みの実際の ADS-B 飛行軌跡のみを表示します。",

      unavailableNote:
        "リアルタイム位置または信頼できる推定条件がないため、機体は表示しません。",

      delayed: "この便は {minutes} 分遅れています",
      cancelled: "この便は欠航しました",
      diverted: "目的地変更・経路変更が発生しています",
      abnormal: "運航情報：{status}",
      rate:
        "リアルタイムサービスが制限中です。間隔を空けて再試行します。",
      stale:
        "リアルタイム位置を一時取得できません。最後の位置を保持して再試行します。",
      restored: "リアルタイム位置に復帰しました。",
      notConfigured: "フライト情報サービスが設定されていません。",
      quota: "フライト情報サービスが利用制限中です。",
      notFound: "該当便が見つかりません。",
      noDate: "この日付の便情報はありません。",
      timeout: "フライト情報サービスがタイムアウトしました。",
      noInfo: "情報なし"
    }
  };

  const state = {
    language: "zh",

    airlines: [],
    airlinesByIata: new Map(),
    airlinesByIcao: new Map(),

    map: null,
    mapReady: false,

    displayedAircraft: null,
    aircraftMarker: null,

    airportMarkers: [],

    current: null,
    resolved: null,

    /*
     * 这里只保存真实 ADS-B 点。
     */
    track: [],

    controller: null,

    networkTimer: null,
    estimateTimer: null,
    animation: null,

    failures: 0,
    forceEstimated: false,
    lastLiveAt: null,

    skyVisible: false,
    fitOnNextRender: false,
    threeDimensional: false
  };

  const details = [
    ["计划起飞", "departure.scheduled"],
    ["预计起飞", "departure.estimated"],
    ["实际起飞", "departure.actual"],

    ["计划到达", "arrival.scheduled"],
    ["预计到达", "arrival.estimated"],
    ["实际到达", "arrival.actual"],

    ["出发航站楼", "departure.terminal"],
    ["出发登机口", "departure.gate"],

    ["到达航站楼", "arrival.terminal"],
    ["到达登机口", "arrival.gate"],

    ["行李转盘", "arrival.baggage"],
    ["延误分钟", "delayedMinutes"],

    ["飞机型号", "aircraft.model"],
    ["注册号", "aircraft.registration"],
    ["ICAO24", "aircraft.icao24"],

    ["高度", "position.altitude", " m"],
    ["地速", "position.groundSpeed", " km/h"],
    ["航向", "position.heading", "°"],
    ["垂直速度", "position.verticalSpeed", " km/h"]
  ];

  function t(key, vars = {}) {
    return String(
      TEXT[state.language]?.[key] ||
      TEXT.zh[key] ||
      key
    ).replace(
      /\{(\w+)\}/g,
      (_, name) => vars[name] ?? ""
    );
  }

  function valueAt(object, path) {
    return path
      .split(".")
      .reduce(
        (value, key) => value?.[key],
        object
      );
  }

  function display(value, suffix = "") {

    if (
      value &&
      typeof value === "object" &&
      ("local" in value)
    ) {
      return value.local
        ? `${value.local}${
            value.timezone
              ? ` ${value.timezone}`
              : ""
          }`
        : t("noInfo");
    }

    return (
      value === null ||
      value === undefined ||
      value === ""
    )
      ? t("noInfo")
      : `${value}${suffix}`;
  }

  function setMessage(message, error = false) {
    const el = $("flight-status-message");

    el.textContent = message;

    el.classList.toggle(
      "error",
      error
    );
  }

  function nowClock(timestamp = Date.now()) {
    return new Intl.DateTimeFormat(
      {
        zh: "zh-CN",
        tw: "zh-TW",
        en: "en-US",
        jp: "ja-JP"
      }[state.language],
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    ).format(
      new Date(timestamp)
    );
  }

  function today() {
    const now = new Date();

    const offset =
      now.getTimezoneOffset();

    return new Date(
      now.getTime() -
      offset * 60000
    )
      .toISOString()
      .slice(0, 10);
  }

  function isPosition(position) {
    return window
      .WebWindowsFlightPosition
      .validPoint(position);
  }

  function active(flight) {
    return [
      "en-route",
      "active",
      "airborne"
    ].includes(
      String(
        flight?.status || ""
      ).toLowerCase()
    ) &&
    !flight?.cancelled;
  }

  function ended(flight) {
    return (
      flight?.cancelled ||

      [
        "arrived",
        "landed"
      ].includes(
        String(
          flight?.status || ""
        ).toLowerCase()
      ) ||

      Boolean(
        flight?.arrival
          ?.actual
          ?.timestamp
      )
    );
  }

  function parsedFlight(number) {
    return window.WebWindowsFlight
      .parseFlightNumber(number);
  }

  function airlineDisplay(code, name) {
    const iata =
      String(code || "")
        .toUpperCase();

    const friendly =
      FRIENDLY_AIRLINE_NAMES[
        iata
      ];

    return `${
      friendly ||
      name ||
      iata
    }${
      iata
        ? `（${iata}）`
        : ""
    }`;
  }

  function syncAirlineFromFlightNumber() {
    const parsed =
      parsedFlight(
        $("flight-number")
          .value
      );

    if (
      parsed &&
      state.airlinesByIata.has(
        parsed.airlineIata
      )
    ) {
      $("flight-airline")
        .value =
          parsed.airlineIata;
    }

    return parsed;
  }

  /*
   * 全球航空公司目录仍从 provider 动态加载。
   */
  async function loadAirlines() {
    try {

      const airlines =
        await provider.getAirlines();

      state.airlines =
        airlines
          .slice()
          .sort(
            (a, b) =>
              airlineDisplay(
                a.iataCode,
                a.name
              ).localeCompare(
                airlineDisplay(
                  b.iataCode,
                  b.name
                ),
                state.language
              )
          );

      state.airlinesByIata =
        new Map(
          state.airlines
            .filter(
              item =>
                item.iataCode
            )
            .map(
              item => [
                item.iataCode,
                item
              ]
            )
        );

      state.airlinesByIcao =
        new Map(
          state.airlines
            .filter(
              item =>
                item.icaoCode
            )
            .map(
              item => [
                item.icaoCode,
                item
              ]
            )
        );

      const select =
        $("flight-airline");

      const selected =
        select.value;

      select.replaceChildren(
        new Option(
          t("auto"),
          ""
        )
      );

      state.airlines
        .forEach(
          item => {

            select.add(
              new Option(
                airlineDisplay(
                  item.iataCode,
                  item.name
                ),

                item.iataCode ||
                item.icaoCode
              )
            );
          }
        );

      if (
        selected &&
        [
          ...select.options
        ].some(
          option =>
            option.value ===
            selected
        )
      ) {
        select.value =
          selected;
      }

      syncAirlineFromFlightNumber();

    } catch (error) {

      console.warn(
        "[Wendao Flight] Airline directory unavailable",
        error
      );

      /*
       * 航司目录失败不能影响按航班号查询。
       */
    }
  }

  function applyLanguage(language) {
    state.language =
      TEXT[language]
        ? language
        : "zh";

    $("ground-tab")
      .querySelector("b")
      .textContent =
        t("ground");

    $("sky-tab")
      .querySelector("b")
      .textContent =
        t("sky");

    $("flight-airline-label")
      .textContent =
        t("airline");

    $("flight-airline-help")
      .textContent =
        t("help");

    if (
      $("flight-airline")
        .options.length
    ) {
      $("flight-airline")
        .options[0]
        .textContent =
          t("auto");
    }

    $("flight-search-form")
      .querySelector("button")
      .textContent =
        t("query");

    if (!state.current) {
      setMessage(
        t("ready")
      );
    }

    if (state.current) {
      renderFull();
    }
  }

  function mergeNonNull(
    base,
    update
  ) {

    const output = {
      ...base
    };

    Object.entries(
      update || {}
    ).forEach(
      ([key, value]) => {

        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          key !== "track"
        ) {
          output[key] = value;
        }
      }
    );

    return output;
  }

  function mergeLive(
    base,
    live
  ) {
    return {
      ...base,

      ...mergeNonNull(
        base,
        live
      ),

      departure:
        mergeNonNull(
          base.departure,
          live.departure
        ),

      arrival:
        mergeNonNull(
          base.arrival,
          live.arrival
        ),

      aircraft:
        mergeNonNull(
          base.aircraft,
          live.aircraft
        ),

      position:
        live.position,

      track:
        base.track || []
    };
  }

  /*
   * 只允许真实 ADS-B 点生成轨迹。
   * 不使用 Great Circle 生成已飞航迹。
   */
  function actualTrackSegments() {

    const coordinates =
      state.track
        .filter(
          point =>
            point?.source ===
              "live" &&
            isPosition(point)
        )
        .map(
          point => [
            Number(
              point.longitude
            ),
            Number(
              point.latitude
            )
          ]
        );

    if (
      coordinates.length <
      2
    ) {
      return [];
    }

    const segments = [
      []
    ];

    coordinates.forEach(
      coordinate => {

        const current =
          segments[
            segments.length - 1
          ];

        const previous =
          current[
            current.length - 1
          ];

        /*
         * 防止跨 180° 经线产生横跨地图的错误线。
         */
        if (
          previous &&
          Math.abs(
            coordinate[0] -
            previous[0]
          ) > 180
        ) {
          segments.push([]);
        }

        segments[
          segments.length - 1
        ].push(
          coordinate
        );
      }
    );

    return segments.filter(
      segment =>
        segment.length > 1
    );
  }

  function emptyLineGeoJson() {
    return {
      type:
        "FeatureCollection",

      features: []
    };
  }

  function trackGeoJson() {

    const segments =
      actualTrackSegments();

    if (!segments.length) {
      return emptyLineGeoJson();
    }

    return {
      type:
        "FeatureCollection",

      features: [
        {
          type:
            "Feature",

          properties: {
            kind:
              "actualTrack"
          },

          geometry: {
            type:
              "MultiLineString",

            coordinates:
              segments
          }
        }
      ]
    };
  }

  function createAircraftElement() {

    const el =
      document.createElement(
        "div"
      );

    el.className =
      "flight-aircraft-marker";

    el.innerHTML = `
      <svg
        width="42"
        height="42"
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <path
          d="M32 2c-3 0-5 3-5 7v16L7 38v7l20-6v13l-7 5v5l12-3 12 3v-5l-7-5V39l20 6v-7L37 25V9c0-4-2-7-5-7Z"
          fill="#ffffff"
          stroke="#17251f"
          stroke-width="5"
          stroke-linejoin="round"
        />
      </svg>
      <span>LIVE</span>
    `;

    return el;
  }

  function initFlightMap() {

    if (
      state.map ||
      !window.maplibregl
    ) {
      return;
    }

    state.map =
      new maplibregl.Map({
        container:
          "flight-map",

        style:
          "https://tiles.openfreemap.org/styles/bright",

        center: [
          135,
          30
        ],

        zoom: 2.5,

        attributionControl:
          false,

        maxPitch: 70
      });

    state.map.addControl(
      new maplibregl
        .NavigationControl({
          visualizePitch:
            true
        }),

      "top-right"
    );

    state.map.on(
      "load",
      () => {

        state.mapReady =
          true;

        /*
         * 不创建 Great Circle 已飞路线层。
         * 这里只创建真实 ADS-B 轨迹。
         */
        state.map.addSource(
          "flight-actual-track",
          {
            type: "geojson",
            data:
              trackGeoJson()
          }
        );

        state.map.addLayer({
          id:
            "flight-actual-track",

          type:
            "line",

          source:
            "flight-actual-track",

          layout: {
            "line-join":
              "round",

            "line-cap":
              "round"
          },

          paint: {
            "line-color":
              "#087a55",

            "line-width":
              5,

            "line-opacity":
              1
          }
        });

        updateMap(false);
      }
    );
  }

  function clearAirportMarkers() {

    state.airportMarkers
      .forEach(
        marker =>
          marker.remove()
      );

    state.airportMarkers =
      [];
  }

  function airportMarker(
    code,
    point
  ) {

    if (
      !isPosition(point)
    ) {
      return;
    }

    const el =
      document.createElement(
        "div"
      );

    el.className =
      "airport-marker";

    el.textContent =
      code || "APT";

    state.airportMarkers
      .push(
        new maplibregl.Marker({
          element: el
        })
          .setLngLat([
            Number(
              point.longitude
            ),

            Number(
              point.latitude
            )
          ])
          .addTo(
            state.map
          )
      );
  }

  function addObservedPosition(
    position
  ) {

    if (
      position?.source !==
        "live" ||
      !isPosition(position)
    ) {
      return;
    }

    const last =
      state.track[
        state.track.length - 1
      ];

    if (
      !last ||
      Number(
        last.latitude
      ) !==
        Number(
          position.latitude
        ) ||
      Number(
        last.longitude
      ) !==
        Number(
          position.longitude
        )
    ) {

      state.track.push({
        ...position,
        source: "live"
      });
    }

    if (
      state.track.length >
      MAX_TRACK_POINTS
    ) {

      state.track.splice(
        0,

        state.track.length -
        MAX_TRACK_POINTS
      );
    }
  }

  function setAircraftSource(
    position
  ) {

    if (!state.map) {
      return;
    }

    if (
      !isPosition(position)
    ) {

      state.displayedAircraft =
        null;

      if (
        state.aircraftMarker
      ) {

        state.aircraftMarker
          .remove();

        state.aircraftMarker =
          null;
      }

      return;
    }

    state.displayedAircraft = {
      ...position
    };

    if (
      !state.aircraftMarker
    ) {

      const element =
        createAircraftElement();

      state.aircraftMarker =
        new maplibregl.Marker({
          element,

          anchor:
            "center",

          rotationAlignment:
            "map",

          pitchAlignment:
            "map"
        })
          .setLngLat([
            Number(
              position.longitude
            ),

            Number(
              position.latitude
            )
          ])
          .addTo(
            state.map
          );
    }

    state.aircraftMarker
      .setLngLat([
        Number(
          position.longitude
        ),

        Number(
          position.latitude
        )
      ]);

    const heading =
      Number(
        position.heading
      );

    if (
      Number.isFinite(
        heading
      )
    ) {

      state.aircraftMarker
        .setRotation(
          heading
        );
    }

    const label =
      state.aircraftMarker
        .getElement()
        .querySelector(
          "span"
        );

    if (label) {

      label.textContent =
        state.resolved
          ?.positionStatus ===
        "live"
          ? "LIVE"
          : "ESTIMATED";
    }
  }

  function animateAircraft(
    position
  ) {

    cancelAnimationFrame(
      state.animation
    );

    if (
      !isPosition(
        state.displayedAircraft
      )
    ) {

      setAircraftSource(
        position
      );

      return;
    }

    const start = {
      ...state.displayedAircraft
    };

    const target = {
      ...position
    };

    const started =
      performance.now();

    const duration =
      1500;

    const frame =
      now => {

        const progress =
          Math.min(
            1,

            (
              now -
              started
            ) /
            duration
          );

        const ease =
          1 -
          Math.pow(
            1 - progress,
            3
          );

        setAircraftSource({
          ...target,

          longitude:
            Number(
              start.longitude
            ) +
            (
              Number(
                target.longitude
              ) -
              Number(
                start.longitude
              )
            ) *
            ease,

          latitude:
            Number(
              start.latitude
            ) +
            (
              Number(
                target.latitude
              ) -
              Number(
                start.latitude
              )
            ) *
            ease
        });

        if (
          progress < 1
        ) {

          state.animation =
            requestAnimationFrame(
              frame
            );
        }
      };

    state.animation =
      requestAnimationFrame(
        frame
      );
  }

  function updateMap(
    animate = true
  ) {

    if (
      !state.mapReady ||
      !state.current
    ) {
      return;
    }

    state.map
      .getSource(
        "flight-actual-track"
      )
      ?.setData(
        trackGeoJson()
      );

    clearAirportMarkers();

    airportMarker(
      state.current
        .departure
        .airportCode,

      state.current
        .departure
    );

    airportMarker(
      state.current
        .arrival
        .airportCode,

      state.current
        .arrival
    );

    const position =
      state.resolved
        ?.position;

    if (
      isPosition(position)
    ) {

      if (animate) {
        animateAircraft(
          position
        );
      } else {
        setAircraftSource(
          position
        );
      }

    } else {

      setAircraftSource(
        null
      );
    }

    if (
      state.fitOnNextRender
    ) {

      state.fitOnNextRender =
        false;

      const points = [
        state.current
          .departure,

        state.current
          .arrival,

        position
      ].filter(
        isPosition
      );

      if (
        points.length
      ) {

        if (
          state.resolved
            ?.route
            ?.distanceKm() >
            5000 &&

          isPosition(position)
        ) {

          state.map.easeTo({
            center: [
              Number(
                position.longitude
              ),

              Number(
                position.latitude
              )
            ],

            zoom: 2.7,

            duration: 700
          });

        } else {

          const bounds =
            new maplibregl
              .LngLatBounds();

          points.forEach(
            point => {

              bounds.extend([
                Number(
                  point.longitude
                ),

                Number(
                  point.latitude
                )
              ]);
            }
          );

          state.map.fitBounds(
            bounds,
            {
              padding:
                90,

              maxZoom:
                7,

              duration:
                700
            }
          );
        }
      }
    }
  }

  function refreshResolved(
    animate = true
  ) {

    if (
      !state.current
    ) {
      return;
    }

    state.resolved =
      resolver.resolvePosition(
        state.current,

        {
          now:
            Date.now(),

          ignoreLive:
            state.forceEstimated
        }
      );

    if (
      state.resolved
        .positionStatus ===
      "live"
    ) {

      state.lastLiveAt =
        (
          state.resolved
            .position
            .timestamp ||

          Math.floor(
            Date.now() /
            1000
          )
        ) *
        1000;

      addObservedPosition(
        state.resolved
          .position
      );
    }

    updatePositionSummary();

    updateMap(
      animate
    );
  }

  function updatePositionSummary() {

    const status =
      state.resolved
        ?.positionStatus ||
      "unavailable";

    const statusEl =
      $(
        "flight-position-status"
      );

    const updated =
      $(
        "flight-position-updated"
      );

    statusEl.textContent =
      t(status);

    statusEl.dataset.status =
      status;

    if (
      status ===
      "live"
    ) {

      updated.textContent =
        t(
          "updated",

          {
            time:
              nowClock(
                state.lastLiveAt ||
                Date.now()
              )
          }
        );

    } else if (
      status ===
      "estimated"
    ) {

      updated.textContent =
        state.lastLiveAt

          ? t(
              "lastLive",

              {
                time:
                  nowClock(
                    state.lastLiveAt
                  )
              }
            )

          : t(
              "waiting"
            );

    } else {

      updated.textContent =
        "—";
    }

    $("flight-track-note")
      .textContent =
        status ===
        "live"

          ? t(
              "liveNote"
            )

          : status ===
            "estimated"

            ? t(
                "estimateNote"
              )

            : t(
                "unavailableNote"
              );
  }

  function renderAlert() {

    const result =
      state.current;

    const alert =
      $(
        "flight-alert"
      );

    const status =
      String(
        result.status ||
        ""
      ).toLowerCase();

    let message =
      "";

    let kind =
      "";

    if (
      result.cancelled ||
      status ===
      "cancelled"
    ) {

      message =
        t(
          "cancelled"
        );

      kind =
        "danger";

    } else if (
      [
        "diverted",
        "redirected"
      ].includes(
        status
      )
    ) {

      message =
        t(
          "diverted"
        );

      kind =
        "danger";

    } else if (
      Number(
        result.delayedMinutes
      ) > 0
    ) {

      message =
        t(
          "delayed",

          {
            minutes:
              Math.round(
                result
                  .delayedMinutes
              )
          }
        );

      kind =
        "warning";

    } else if (
      status &&
      ![
        "scheduled",
        "active",
        "en-route",
        "airborne",
        "landed",
        "arrived",
        "on-time"
      ].includes(
        status
      )
    ) {

      message =
        t(
          "abnormal",

          {
            status:
              result.status
          }
        );

      kind =
        "warning";
    }

    alert.hidden =
      !message;

    alert.textContent =
      message;

    alert.className =
      `flight-alert ${kind}`;
  }

  function renderFull() {

    const result =
      state.current;

    if (!result) {
      return;
    }

    refreshResolved(
      false
    );

    const code =
      result.airlineCode ||
      result.airlineIata;

    const airline =
      state.airlinesByIata.get(
        code
      ) ||
      state.airlinesByIcao.get(
        result.airlineIcao
      );

    $("flight-code")
      .textContent =
        display(
          result.flightNumber
        );

    $("flight-airline-name")
      .textContent =
        display(
          airlineDisplay(
            code,

            result.airlineName ||
            airline?.name
          )
        );

    $("flight-state")
      .textContent =
        result.cancelled
          ? t(
              "cancelled"
            )
          : display(
              result.status
            );

    $("flight-state")
      .dataset.status =
        result.cancelled
          ? "cancelled"
          : String(
              result.status ||
              ""
            ).toLowerCase();

    $("flight-departure-code")
      .textContent =
        display(
          result
            .departure
            .airportCode
        );

    $("flight-arrival-code")
      .textContent =
        display(
          result
            .arrival
            .airportCode
        );

    const grid =
      $(
        "flight-detail-grid"
      );

    grid.replaceChildren();

    details.forEach(
      (
        [
          label,
          path,
          suffix
        ]
      ) => {

        const box =
          document.createElement(
            "div"
          );

        const name =
          document.createElement(
            "span"
          );

        const value =
          document.createElement(
            "b"
          );

        box.className =
          "flight-detail";

        name.textContent =
          label;

        const source =
          path.startsWith(
            "position."
          )
            ? state.resolved
                ?.position
            : result;

        value.textContent =
          display(
            path.startsWith(
              "position."
            )
              ? valueAt(
                  {
                    position:
                      source
                  },

                  path
                )
              : valueAt(
                  source,
                  path
                ),

            suffix
          );

        box.append(
          name,
          value
        );

        grid.appendChild(
          box
        );
      }
    );

    renderAlert();

    $("flight-result")
      .hidden =
        false;

    updateMap(false);
  }

  function stopNetwork() {

    if (
      state.networkTimer
    ) {

      clearTimeout(
        state.networkTimer
      );
    }

    state.networkTimer =
      null;
  }

  function stopEstimatedTick() {

    if (
      state.estimateTimer
    ) {

      clearInterval(
        state.estimateTimer
      );
    }

    state.estimateTimer =
      null;
  }

  function ensureEstimatedTick() {

    stopEstimatedTick();

    if (
      !state.skyVisible ||
      document.hidden ||
      state.resolved
        ?.positionStatus !==
        "estimated" ||
      !active(
        state.current
      )
    ) {
      return;
    }

    state.estimateTimer =
      setInterval(
        () =>
          refreshResolved(
            true
          ),

        ESTIMATED_TICK_MS
      );
  }

  function scheduleNetwork(
    delay =
      NORMAL_POLL_MS
  ) {

    stopNetwork();

    if (
      !state.current ||
      ended(
        state.current
      ) ||
      !active(
        state.current
      ) ||
      document.hidden ||
      !state.skyVisible
    ) {
      return;
    }

    state.networkTimer =
      setTimeout(
        () =>
          query(
            true
          ),

        Math.min(
          MAX_BACKOFF_MS,

          Math.max(
            1000,
            delay
          )
        )
      );
  }

  function liveFailure(
    error
  ) {

    const limited =
      error?.httpStatus ===
        429 ||
      error?.code ===
        "quota_exhausted";

    const delay =
      refreshPolicy
        .recordFailure({
          retryAfterMs:
            error
              ?.retryAfterMs,

          rateLimited:
            limited
        });

    state.failures =
      refreshPolicy
        .failures;

    state.forceEstimated =
      refreshPolicy
        .forceEstimated;

    refreshResolved();

    ensureEstimatedTick();

    setMessage(
      limited
        ? t(
            "rate"
          )
        : state
            .forceEstimated
          ? t(
              "waiting"
            )
          : t(
              "stale"
            ),

      limited
    );

    scheduleNetwork(
      delay
    );
  }

  /*
   * 从 ADSB.lol trace 获取当前飞机
   * 本次飞行已经飞过的真实历史点。
   *
   * 不调用 AirLabs。
   */
  async function loadActualTrack() {

    if (
      !traceProvider
    ) {

      console.warn(
        "[Wendao Flight] ADS-B trace provider unavailable"
      );

      return;
    }

    const flight =
      state.current;

    if (!flight) {
      return;
    }

    const hex =
      flight.aircraft
        ?.icao24;

    if (!hex) {

      console.warn(
        "[Wendao Flight] ICAO24 unavailable; trace skipped"
      );

      return;
    }

    const departure =
      flight.departure
        ?.actual
        ?.timestamp ??

      flight.departure
        ?.estimated
        ?.timestamp ??

      flight.departure
        ?.scheduled
        ?.timestamp;

    try {

      /*
       * 这里暂时不强制 callsign 匹配。
       *
       * 原因：
       * ADS-B trace 里的 flight 有时是 IATA，
       * 有时是 ICAO callsign。
       *
       * 当前已经通过：
       * ICAO24 + 最新航段 + 起飞时间
       * 来确定本次飞行。
       */
      const points =
        await traceProvider
          .getCurrentTrack(
            {
              icao24:
                hex,

              flightIcao:
                null,

              departureTimestamp:
                departure
            },

            state.controller
              ?.signal
          );

      if (
        !Array.isArray(
          points
        ) ||
        points.length < 2
      ) {

        console.info(
          "[Wendao Flight] No usable ADS-B history",
          {
            hex,

            points:
              Array.isArray(
                points
              )
                ? points.length
                : 0
          }
        );

        return;
      }

      /*
       * 这里只接受真实 ADS-B 点。
       */
      state.track =
        points
          .filter(
            isPosition
          )
          .map(
            point => ({
              ...point,
              source:
                "live"
            })
          );

      if (
        state.track.length >
        MAX_TRACK_POINTS
      ) {

        state.track =
          state.track.slice(
            -MAX_TRACK_POINTS
          );
      }

      /*
       * trace 通常稍旧于当前实时位置。
       * 把当前实时点补到轨迹尾部。
       */
      const current =
        state.resolved
          ?.position;

      if (
        current?.source ===
          "live" &&
        isPosition(
          current
        )
      ) {

        addObservedPosition(
          current
        );
      }

      updateMap(false);

      console.info(
        "[Wendao Flight] ADS-B actual track loaded",
        {
          hex,
          points:
            state.track
              .length
        }
      );

    } catch (error) {

      if (
        error?.name ===
        "AbortError"
      ) {
        return;
      }

      /*
       * ADS-B trace 失败不能破坏
       * 已成功取得的航班资料。
       */
      console.warn(
        "[Wendao Flight] ADS-B trace unavailable",
        error
      );
    }
  }

  async function query(
    poll = false
  ) {

    const flightNumber =
      $("flight-number")
        .value;

    const date =
      $("flight-date")
        .value;

    const parsed =
      syncAirlineFromFlightNumber();

    const airlineCode =
      parsed?.airlineIata ||
      $("flight-airline")
        .value;

    if (
      !flightNumber ||
      !date
    ) {

      setMessage(
        t(
          "need"
        ),

        true
      );

      return;
    }

    if (!poll) {

      state.controller
        ?.abort();

      state.controller =
        new AbortController();

      state.track =
        [];

      state.failures =
        0;

      state.forceEstimated =
        false;

      state.lastLiveAt =
        null;

      refreshPolicy.failures =
        0;

      refreshPolicy.lastLiveAt =
        null;

      refreshPolicy.forceEstimated =
        false;

      state.fitOnNextRender =
        true;

      setMessage(
        t(
          "searching"
        )
      );
    }

    try {

      const result =
        poll

          ? await provider
              .getLivePosition(
                {
                  flightNumber,
                  date,
                  airlineCode
                },

                state.controller
                  ?.signal
              )

          : await provider
              .searchFlight(
                {
                  flightNumber,
                  date,
                  airlineCode
                },

                state.controller
                  .signal
              );

      /*
       * 30 秒实时轮询。
       *
       * 不重新下载 full trace，
       * 只追加新的真实位置点。
       */
      if (poll) {

        if (
          isPosition(
            result.position
          )
        ) {

          const wasEstimated =
            state.forceEstimated;

          state.current =
            mergeLive(
              state.current,
              result
            );

          state.lastLiveAt =
            (
              result
                .position
                .timestamp ||

              Math.floor(
                Date.now() /
                1000
              )
            ) *
            1000;

          refreshPolicy
            .recordLive(
              state.lastLiveAt
            );

          state.forceEstimated =
            false;

          state.failures =
            0;

          renderFull();

          setMessage(
            wasEstimated
              ? t(
                  "restored"
                )
              : t(
                  "live"
                )
          );

          ensureEstimatedTick();

          scheduleNetwork();

        } else {

          const retainedPosition =
            state.current
              .position;

          state.current =
            mergeLive(
              state.current,
              result
            );

          if (
            isPosition(
              retainedPosition
            )
          ) {

            state.current = {
              ...state.current,

              position:
                retainedPosition
            };
          }

          liveFailure({
            code:
              "empty_realtime"
          });
        }

        return;
      }

      /*
       * 首次查询。
       */
      state.current =
        result;

      state.forceEstimated =
        !isPosition(
          result.position
        );

      if (
        isPosition(
          result.position
        )
      ) {

        state.lastLiveAt =
          (
            result
              .position
              .timestamp ||

            Math.floor(
              Date.now() /
              1000
            )
          ) *
          1000;

        refreshPolicy
          .recordLive(
            state.lastLiveAt
          );

      } else {

        refreshPolicy
          .forceEstimated =
            true;
      }

      /*
       * 先显示航班和飞机。
       */
      renderFull();

      /*
       * 再补本次航班真实历史轨迹。
       */
      await loadActualTrack();

      setMessage(
        state.resolved
          .positionStatus ===
        "live"

          ? t(
              "live"
            )

          : state.resolved
              .positionStatus ===
            "estimated"

            ? t(
                "estimated"
              )

            : t(
                "unavailable"
              )
      );

      ensureEstimatedTick();

      scheduleNetwork();

    } catch (error) {

      if (
        error.name ===
        "AbortError"
      ) {
        return;
      }

      if (poll) {

        liveFailure(
          error
        );

        return;
      }

      const messages = {
        not_configured:
          t(
            "notConfigured"
          ),

        quota_exhausted:
          t(
            "quota"
          ),

        flight_not_found:
          t(
            "notFound"
          ),

        date_not_found:
          t(
            "noDate"
          ),

        provider_timeout:
          t(
            "timeout"
          )
      };

      setMessage(
        messages[
          error.code
        ] ||
        error.message ||
        t(
          "unavailable"
        ),

        true
      );

      $("flight-result")
        .hidden =
          true;
    }
  }

  function switchTab(
    sky
  ) {

    state.skyVisible =
      sky;

    $("ground-tab")
      .classList
      .toggle(
        "active",
        !sky
      );

    $("sky-tab")
      .classList
      .toggle(
        "active",
        sky
      );

    $("ground-tab")
      .setAttribute(
        "aria-selected",
        String(
          !sky
        )
      );

    $("sky-tab")
      .setAttribute(
        "aria-selected",
        String(
          sky
        )
      );

    $("ground-panel")
      .hidden =
        sky;

    $("sky-panel")
      .hidden =
        !sky;

    $("map")
      .hidden =
        sky;

    $("flight-map")
      .hidden =
        !sky;

    document
      .querySelector(
        ".map-panel"
      )
      .classList
      .toggle(
        "sky-active",
        sky
      );

    if (sky) {

      initFlightMap();

      setTimeout(
        () =>
          state.map
            ?.resize(),

        0
      );

      if (
        state.current &&
        !ended(
          state.current
        )
      ) {

        query(
          true
        );
      }

    } else {

      stopNetwork();

      stopEstimatedTick();

      setTimeout(
        () =>
          window
            .WebWindowsWendao
            ?.resizeMap
            ?.(),

        0
      );
    }
  }

  function toggle3d() {

    if (
      !state.map
    ) {
      return false;
    }

    state.threeDimensional =
      !state
        .threeDimensional;

    try {

      state.map
        .setProjection({
          type:
            state
              .threeDimensional
              ? "globe"
              : "mercator"
        });

    } catch (_) {
      /* MapLibre compatibility */
    }

    state.map
      .easeTo({
        pitch:
          state
            .threeDimensional
            ? 55
            : 0,

        bearing:
          state
            .threeDimensional
            ? -18
            : 0,

        duration:
          650
      });

    return state
      .threeDimensional;
  }

  function visibilityChanged() {

    if (
      document.hidden
    ) {

      stopNetwork();

      stopEstimatedTick();

      return;
    }

    if (
      state.skyVisible &&
      state.current &&
      !ended(
        state.current
      )
    ) {

      query(
        true
      );

      ensureEstimatedTick();
    }
  }

  $("flight-date")
    .value =
      today();

  $("flight-number")
    .addEventListener(
      "input",
      syncAirlineFromFlightNumber
    );

  $("flight-search-form")
    .addEventListener(
      "submit",

      event => {

        event
          .preventDefault();

        query(
          false
        );
      }
    );

  $("ground-tab")
    .addEventListener(
      "click",

      () =>
        switchTab(
          false
        )
    );

  $("sky-tab")
    .addEventListener(
      "click",

      () =>
        switchTab(
          true
        )
    );

  document
    .addEventListener(
      "visibilitychange",
      visibilityChanged
    );

  window
    .addEventListener(
      "wendao-language-change",

      event =>
        applyLanguage(
          event.detail
            ?.language
        )
    );

  window
    .addEventListener(
      "storage",

      event => {

        if (
          event.key ===
          "lang"
        ) {

          applyLanguage(
            event.newValue ||
            "zh"
          );
        }
      }
    );

  window
    .addEventListener(
      "beforeunload",

      () => {

        stopNetwork();

        stopEstimatedTick();

        state.controller
          ?.abort();
      }
    );

  window.WebWindowsFlightApp =
    Object.freeze({
      toggle3d,

      getMap:
        () =>
          state.map,

      getDebugState:
        () => ({
          failures:
            state.failures,

          positionStatus:
            state.resolved
              ?.positionStatus,

          trackPoints:
            state.track
              .length,

          traceProvider:
            Boolean(
              traceProvider
            ),

          networkScheduled:
            Boolean(
              state.networkTimer
            ),

          mapInstance:
            state.map
        })
    });

  applyLanguage(
    (() => {

      try {

        return (
          window.parent
            ?.WebWindowsI18n
            ?.getLanguage
            ?.() ||

          localStorage
            .getItem(
              "lang"
            ) ||

          "zh"
        );

      } catch (_) {

        return "zh";
      }
    })()
  );

  /*
   * 动态加载完整航空公司目录。
   */
  loadAirlines();

})();