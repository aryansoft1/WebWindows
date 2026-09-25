(function () {
  "use strict";

  const $ =
    id =>
      document.getElementById(id);

  if (
    !window.WebWindowsTransit ||
    !window.WebWindowsTransitPosition ||
    !$("transit-tab")
  ) {
    return;
  }

  const LIB = window.WebWindowsTransit;

  const transitland =
    new LIB.TransitlandTransitProvider();

  const chinaRail =
    new LIB.ChinaRailTransitProvider();

  const resolver =
    new window
      .WebWindowsTransitPosition
      .TransitPositionResolver();

  const describeService =
    window
      .WebWindowsTransitPosition
      .describeService;

  /*
   * 页面级四语字典由 navigation-app.js 持有，
   * 这里只做取值，避免出现第二份字典。
   */
  function T(key, vars) {
    const translate =
      window.WebWindowsWendao?.translate;

    if (
      typeof translate === "function"
    ) {
      return translate(key, vars || {});
    }

    return key;
  }

  const STATUS_KEYS = {
    stop_not_found: "errStopNotFound",
    direct_trip_not_found:
      "errDirectTripNotFound",
    gtfs_trip_unavailable:
      "errGtfsUnavailable",
    station_not_found:
      "errStationNotFound",
    no_train: "errNoTrain",
    presale: "errPresale",
    upstream_blocked:
      "errUpstreamBlocked",
    schedule_failed:
      "errScheduleFailed",
    transit_request_failed:
      "errUpstreamBlocked",
    geocoder_unavailable:
      "errUpstreamBlocked",
    transit_upstream_unavailable:
      "errUpstreamBlocked",

    /* 超时预算类错误码（transit-providers.js TIMEOUTS） */
    transit_timeout: "errUpstreamBlocked",
    rail_timeout: "errUpstreamBlocked",
    geocoder_timeout: "errUpstreamBlocked",
    transit_failed: "errUpstreamBlocked",

    /* api/railway-proxy.asp 独有错误码 */
    station_source_unavailable:
      "errUpstreamBlocked",
    station_source_invalid:
      "errUpstreamBlocked",
    parse_failed:
      "errScheduleFailed",
    schedule_unavailable:
      "errScheduleFailed",
    invalid_date: "errGeneric",
    invalid_station: "errGeneric",
    invalid_train: "errGeneric",
    method_not_allowed: "errGeneric",
    unsupported_action: "errGeneric"
  };

  const STOP_STATUS_KEYS = {
    passed: "stopStatusPassed",
    next: "stopStatusNext",
    upcoming: "stopStatusUpcoming",
    waiting: "stopStatusWaiting"
  };

  const STATE_KEYS = {
    before: "serviceBefore",
    running: "serviceRunning",
    arrived: "serviceArrived"
  };

  const state = {
    map: null,
    mapReady: false,

    pendingFit: false,

    journey: null,
    resolved: null,
    described: null,

    query: null,
    source: null,

    /*
     * 状态文案存 key + 变量，
     * 语言切换后可以原样重绘。
     */
    status: {
      key: "transitPrompt",
      vars: {},
      error: false
    },

    controller: null,
    realtimeTimer: null,
    serviceTimer: null,

    vehicleMarker: null,

    suggestController: null,
    suggestions: {
      origin: [],
      destination: []
    },
    suggestionIndex: -1,
    stationTableFailedAt: 0,

    visible: false
  };

  function setStatus(
    key,
    vars = {},
    error = false
  ) {
    state.status = {
      key,
      vars,
      error
    };

    paintStatus();
  }

  function paintStatus() {
    const element =
      $("transit-status-message");

    if (!element) {
      return;
    }

    element.textContent =
      T(
        state.status.key,
        state.status.vars
      );

    element.classList.toggle(
      "error",
      Boolean(state.status.error)
    );
  }

  function localDateTimeValue() {
    const date =
      new Date();

    date.setMinutes(
      date.getMinutes() -
      date.getTimezoneOffset()
    );

    return date
      .toISOString()
      .slice(0, 16);
  }

  function shapeGeoJson() {
    const shape =
      state.journey
        ? resolver
            .getDisplayShape(
              state.journey
            )
        : [];

    return {
      type:
        "FeatureCollection",

      features:
        shape.length >= 2
          ? [
              {
                type:
                  "Feature",

                properties: {},

                geometry: {
                  type:
                    "LineString",

                  coordinates:
                    shape
                }
              }
            ]
          : []
    };
  }

  /*
   * 经停站只画真实坐标：
   * 12306 的坐标来自 Photon，查不到就留空，不补点。
   */
  function stopsGeoJson() {
    const described =
      state.described;

    const features =
      (described?.stops || [])
        .filter(
          stop =>
            Number.isFinite(
              Number(stop.latitude)
            ) &&
            Number.isFinite(
              Number(stop.longitude)
            )
        )
        .map(stop => ({
          type:
            "Feature",

          properties: {
            status:
              stop.status,

            name:
              stop.name
          },

          geometry: {
            type:
              "Point",

            coordinates: [
              Number(
                stop.longitude
              ),

              Number(
                stop.latitude
              )
            ]
          }
        }));

    return {
      type:
        "FeatureCollection",
      features
    };
  }

  function initMap() {
    if (
      state.map ||
      !window.maplibregl
    ) {
      return;
    }

    state.map =
      new maplibregl.Map({
        container:
          "transit-map",

        style:
          "https://tiles.openfreemap.org/styles/bright",

        center: [
          139.7,
          35.68
        ],

        zoom:
          5,

        attributionControl:
          false,

        maxPitch:
          70
      });

    state.map.addControl(
      new maplibregl
        .NavigationControl({
          visualizePitch:
            true
        }),

      "top-right"
    );

    /*
     * 地图就绪判定：MapLibre 的 "load" 要等全部样式资源完成，
     * OpenFreeMap 的部分图层（字体/3D）常年不结束，导致 load
     * 永不触发 -> mapReady 永为 false -> 查询结果不渲染到地图、
     * 也不 fitBounds（线上事故：查询成功但地图毫无反应）。
     * 因此除 "load" 外，另用 idle + 轮询兜底。
     */
    const markMapReady = () => {
      if (state.mapReady) {
        return;
      }

      state.mapReady = true;

        state.map.addSource(
          "transit-shape",
          {
            type:
              "geojson",

            data:
              shapeGeoJson()
          }
        );

        state.map.addLayer({
          id:
            "transit-shape",

          type:
            "line",

          source:
            "transit-shape",

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
              0.92
          }
        });

        state.map.addSource(
          "transit-stops",
          {
            type:
              "geojson",

            data:
              stopsGeoJson()
          }
        );

        state.map.addLayer({
          id:
            "transit-stops",

          type:
            "circle",

          source:
            "transit-stops",

          paint: {
            "circle-radius":
              6,

            "circle-color": [
              "match",
              [
                "get",
                "status"
              ],
              "passed",
              "#9aa5a0",
              "next",
              "#f0a02a",
              "waiting",
              "#c3ccc7",
              "#087a55"
            ],

            "circle-stroke-color":
              "#ffffff",

            "circle-stroke-width":
              2
          }
        });

        /*
         * 地图就绪后补执行查询期间挂起的 fit 请求：
         * 否则「先出结果、后完成地图初始化」时地图永不跟随。
         */
        updateMap({
          fit: state.pendingFit
        });
    };

    state.map.on("load", markMapReady);
    state.map.on("idle", markMapReady);

    /*
     * 兜底轮询：不再依赖 load / idle / isStyleLoaded
     * （实测 OpenFreeMap 下三者都可能长时间为 false），
     * 只要地图实例与样式对象可用、容器已有尺寸，就视为就绪。
     */
    const readyPoll = setInterval(() => {
      const container =
        state.map?.getContainer?.();

      const usable =
        state.map &&
        state.mapReady === false &&
        state.map.getStyle &&
        container &&
        container.clientWidth > 0 &&
        container.clientHeight > 0;

      if (usable) {
        markMapReady();
      }

      if (state.mapReady) {
        clearInterval(readyPoll);
      }
    }, 400);
  }

  function vehicleIcon() {
    const journey =
      state.journey;

    if (!journey) {
      return "🚆";
    }

    if (
      journey.provider ===
      "china-rail"
    ) {
      return LIB.trainIcon(
        journey.route?.shortName
      );
    }

    return LIB.routeIcon(
      journey.route?.type
    );
  }

  /*
   * 车辆图标的两种形态（2026-09-25 按用户要求重做设计）：
   *   bullet —— 高铁/动车（G/D/C 头），火箭头造型，车头是流线型尖鼻；
   *   train  —— 普通列车（K/Z/T 头，以及所有海外普通火车），常规车头造型。
   * 判定只看车次字头，海外一律按普通火车处理。
   */
  const BULLET_PREFIXES = ["G", "D", "C"];

  function vehicleKind() {
    const journey =
      state.journey;

    if (
      journey?.provider !==
      "china-rail"
    ) {
      return "train";
    }

    const code = [
      journey.route?.shortName,
      journey.route?.longName,
      journey.trainNo
    ]
      .map(
        value =>
          String(
            value ?? ""
          )
            .trim()
      )
      .find(Boolean) ||
      "";

    const head =
      code
        .toUpperCase()
        .charAt(0);

    return BULLET_PREFIXES.includes(
      head
    )
      ? "bullet"
      : "train";
  }

  /*
   * 车头朝向：从当前位置指向「下一站」的方位角。
   *
   * 为什么要「指向下一站」而不是起点：车辆在运行中位于上一站与下一站之间，
   * 位置估算就是在这两点间插值得到的，所以 position → 下一站的方向正是
   * 真实行进方向，也天然等于「目的地方向」（下一站不可用时退到终点站）。
   * 地图为北向上，rotate(bearing) 让图标车头正好指向行进方向。
   */
  function vehicleBearing() {
    const position =
      state.resolved
        ?.position;

    if (
      !position ||
      !window
        .WebWindowsTransitPosition
        .validPoint(
          position
        )
    ) {
      return null;
    }

    const described =
      state.described;

    const stops =
      Array.isArray(described?.stops)
        ? described.stops
        : [];

    const nextIndex =
      Number.isInteger(
        described?.nextIndex
      ) && described.nextIndex >= 0
        ? described.nextIndex
        : stops.findIndex(
            stop =>
              stop?.status ===
                "next" ||
              stop?.status ===
                "upcoming"
          );

    const next =
      described?.currentSegment
        ?.to ||
      stops[nextIndex] ||
      stops[stops.length - 1] ||
      null;

    if (
      !next ||
      !Number.isFinite(
        Number(next.longitude)
      ) ||
      !Number.isFinite(
        Number(next.latitude)
      )
    ) {
      return null;
    }

    const fromLng = Number(position.longitude);
    const fromLat = Number(position.latitude);
    const toLng = Number(next.longitude);
    const toLat = Number(next.latitude);

    if (fromLng === toLng && fromLat === toLat) {
      return null;
    }

    const phi1 = (fromLat * Math.PI) / 180;
    const phi2 = (toLat * Math.PI) / 180;
    const deltaLng = ((toLng - fromLng) * Math.PI) / 180;

    const y = Math.sin(deltaLng) * Math.cos(phi2);
    const x =
      Math.cos(phi1) * Math.sin(phi2) -
      Math.sin(phi1) *
        Math.cos(phi2) *
        Math.cos(deltaLng);

    const bearing =
      (Math.atan2(y, x) * 180) / Math.PI;

    return Number.isFinite(bearing)
      ? (bearing + 360) % 360
      : null;
  }

  const VEHICLE_SVG = {
    /*
     * 火箭头（高铁/动车）：侧视为流线尖鼻 + 深色风挡带 + 底部裙板，
     * 车头朝右（0°），由外层 rotate 指向行进方向。
     */
    bullet: [
      '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">',
      '<defs>',
      '<linearGradient id="tvk-bullet" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0" stop-color="#3f8bff"/>',
      '<stop offset="1" stop-color="#1246c8"/>',
      "</linearGradient>",
      "</defs>",
      '<circle cx="16" cy="16" r="15" fill="url(#tvk-bullet)"/>',
      '<circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="1.6"/>',
      // 车身：左侧方、右侧尖鼻
      '<path d="M8 10.5h9.5c3.6 0 6.2 2 7.8 5.2 1.5 3 1.5 3 1.5 3H8z" fill="#fff"/>',
      // 风挡带
      '<path d="M12.4 12.2h5.6c2.2 0 3.7 1 4.8 2.6H12.4z" fill="#123a86"/>',
      // 裙板与轮位
      '<rect x="8" y="19.2" width="17.2" height="1.9" rx="0.95" fill="#0d2f6b"/>',
      '<circle cx="11.4" cy="22.6" r="1.5" fill="#e8f0ff"/>',
      '<circle cx="19.4" cy="22.6" r="1.5" fill="#e8f0ff"/>',
      "</svg>"
    ].join(""),

    /*
     * 普通火车：方正车头 + 双风挡 + 前照灯 + 受电弓暗示，
     * 车头同样朝右（0°）。
     */
    train: [
      '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">',
      '<defs>',
      '<linearGradient id="tvk-train" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0" stop-color="#5b6b7c"/>',
      '<stop offset="1" stop-color="#2b3743"/>',
      "</linearGradient>",
      "</defs>",
      '<circle cx="16" cy="16" r="15" fill="url(#tvk-train)"/>',
      '<circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="1.6"/>',
      // 车头（略带圆角方正轮廓）
      '<rect x="7.5" y="9" width="15" height="14" rx="3.4" fill="#f2f5f8"/>',
      // 双风挡
      '<rect x="9.4" y="11" width="5" height="4.2" rx="1.2" fill="#2b3743"/>',
      '<rect x="15.4" y="11" width="5" height="4.2" rx="1.2" fill="#2b3743"/>',
      // 前照灯
      '<circle cx="10.6" cy="18.6" r="1.5" fill="#ffd75e"/>',
      '<circle cx="19.4" cy="18.6" r="1.5" fill="#ffd75e"/>',
      // 底部裙板
      '<rect x="8.6" y="21" width="12.8" height="1.6" rx="0.8" fill="#c3ccd6"/>',
      // 受电弓（普通列车特征）
      '<path d="M13 7.4h6M15.2 7.4l2.4-2.6" stroke="#f2f5f8" stroke-width="1.5" stroke-linecap="round" fill="none"/>',
      "</svg>"
    ].join("")
  };

  function createVehicleMarker() {
    const element =
      document.createElement(
        "div"
      );

    /*
     * transit-vehicle-marker 是本模块专用钩子：
     * 一来给 CSS 做绝对定位（MapLibre 只写 transform，
     * 元素自身必须是 absolute 才会精确落在投影点上），
     * 二来用来清理历史事故留下的半残标记（见 purgeStrayVehicleMarkers）。
     *
     * 注意：MapLibre 会**独占** marker 元素的 style.transform（用于投影
     * 定位），所以车头朝向的 rotate 必须落在内层 .transit-vehicle-glyph 上，
     * 否则会与 MapLibre 的定位 transform 互相覆盖（历史上 fitBounds 抢
     * transform 的教训）。
     */
    element.className =
      "transit-vehicle-marker";

    const glyph =
      document.createElement(
        "span"
      );

    glyph.className =
      "transit-vehicle-glyph";

    element.appendChild(glyph);

    return element;
  }

  function applyVehicleLook(
    element
  ) {
    if (!element) {
      return;
    }

    const glyph =
      element.querySelector(
        ".transit-vehicle-glyph"
      );

    if (!glyph) {
      return;
    }

    const kind = vehicleKind();

    if (
      glyph.dataset.kind !== kind
    ) {
      glyph.dataset.kind = kind;

      /*
       * 用 DOMParser 而不是 innerHTML：项目规则禁止 innerHTML 赋值
       * （tests/wendao-transit-smoke.mjs 有断言），而这里的内容是
       * 模块内静态常量模板、不含任何用户数据，但仍走无 innerHTML 的路径。
       */
      const markup =
        VEHICLE_SVG[kind] ||
        VEHICLE_SVG.train;

      const parsed =
        new DOMParser()
          .parseFromString(
            markup,
            "image/svg+xml"
          );

      glyph.replaceChildren(
        parsed.documentElement
      );
    }

    const bearing =
      vehicleBearing();

    glyph.style.transform =
      Number.isFinite(bearing)
        ? `rotate(${bearing.toFixed(1)}deg)`
        : "";
  }

  /*
   * 清理不属于当前标记的「半残 Marker」元素。
   *
   * 事故链（真实浏览器 + 控制台证据）：旧代码先 addTo() 再 setLngLat()，
   * MapLibre 5.6 的 addTo() 会立刻用尚未定义的 _lngLat 调 _update()，直接抛
   * "Cannot read properties of undefined (reading 'lng')"；元素已被挂进地图
   * 容器、地图事件监听也已注册，于是留下一个「没有坐标却监听 move/resize」
   * 的残骸。地图一动，它就在渲染循环内部抛错，把 MapLibre 渲染队列楔死
   * （控制台刷 "Attempting to run(), but is already running"），此后
   * jumpTo/setCenter/setZoom/fitBounds 全部抛错——地图再也不跟随、车辆标记
   * 永远停在容器原点，且每次查询再泄漏一个。修好创建顺序后本函数是兜底：
   * 老会话已经楔死时也能把残骸清掉。
   */
  function purgeStrayVehicleMarkers() {
    const current =
      state.vehicleMarker
        ?.getElement?.() ||
      null;

    document
      .querySelectorAll(
        ".transit-vehicle-marker"
      )
      .forEach(node => {
        if (node !== current) {
          node.remove();
        }
      });
  }

  function updateVehicle() {
    /*
     * 车辆标记是锦上添花：地图 transform 未就绪时 addTo 可能抛错，
     * 不能因此中断结果渲染（位置与状态文字已在 DOM 中）。
     */
    try {
      renderVehicleMarker();
    } catch {
      if (state.vehicleMarker) {
        try {
          state.vehicleMarker.remove();
        } catch {
          // 标记已失效时忽略
        }

        state.vehicleMarker = null;
      }
    }
  }

  function renderVehicleMarker() {
    const position =
      state.resolved
        ?.position;

    if (
      !window
        .WebWindowsTransitPosition
        .validPoint(
          position
        )
    ) {
      if (
        state.vehicleMarker
      ) {
        try {
          state.vehicleMarker
            .remove();
        } catch {
          // 标记已失效时忽略
        }

        state.vehicleMarker =
          null;
      }

      purgeStrayVehicleMarkers();

      return;
    }

    const lngLat = [
      Number(
        position.longitude
      ),

      Number(
        position.latitude
      )
    ];

    if (
      !state.vehicleMarker
    ) {
      const element =
        createVehicleMarker();

      const marker =
        new maplibregl.Marker({
          element
        });

      /*
       * 顺序是硬约束：必须先 setLngLat 再 addTo。
       * MapLibre 5.6 的 addTo() 结尾会立刻调 _update()，而此时
       * _lngLat 还没赋值 → project(undefined) 抛
       * "Cannot read properties of undefined (reading 'lng')"。
       * 更糟的是元素已经进了地图容器、move/resize 监听也已注册，
       * 于是留下没有坐标的半残 Marker，它在后续渲染循环里持续抛错并
       * 楔死 MapLibre 的渲染队列（详见 purgeStrayVehicleMarkers）。
       * 真实浏览器实测：改成正确顺序后 marker 拿到精确 transform、
       * 相机 API 全部可用、控制台零报错。
       */
      try {
        marker.setLngLat(lngLat);
        marker.addTo(state.map);
        state.vehicleMarker = marker;
      } catch (error) {
        // addTo 失败时元素可能已挂进容器，必须兜底摘掉，避免再留残骸
        try {
          marker.remove();
        } catch {
          // remove 也失败时下面直接摘 DOM
        }

        element.remove();
        state.vehicleMarker = null;

        throw error;
      }
    } else {
      state.vehicleMarker
        .setLngLat(lngLat);
    }

    /*
     * 图标形态与车头朝向每次渲染都刷新：定时轮询会更新位置，
     * 行进方向（指向下一站）随之变化，车头必须跟着转。
     */
    applyVehicleLook(
      state.vehicleMarker
        ?.getElement?.() ||
      null
    );

    purgeStrayVehicleMarkers();
  }

  /*
   * 相机调用前的准备与降级。
   *
   * 线上事故（真实浏览器复现）：问乡面板默认隐藏，容器尺寸为 0，
   * MapLibre 的 transform 未初始化，此时带 padding/duration 的
   * fitBounds 会抛 "Cannot read properties of undefined (reading 'lng')"，
   * 异常向上冒泡后整次渲染中断——结果卡片能显示，但地图不跟随，
   * 状态栏还变成错误信息。
   * 实测：先 map.resize() 再调用同样的 fitBounds 即恢复正常；
   * 若仍失败，降级为无参数 fitBounds，再失败则放弃相机动画（结果照常展示）。
   */
  function fitBoundsSafely(
    fit
  ) {
    try {
      state.map?.resize?.();
    } catch {
      // resize 失败不阻断后续尝试
    }

    try {
      fit();

      return true;
    } catch {
      return false;
    }
  }

  function updateMap({
    fit = false
  } = {}) {
    /*
     * 地图尚未 load 完时，fit 请求必须挂起而不是丢弃：
     * 旧实现直接 return，导致先出结果、后完成地图初始化时
     * fitBounds 永不执行，地图一直停在默认位置（线上事故：
     * 查询成功但地图不跟随，且没有任何报错）。
     */
    if (!state.mapReady) {
      if (fit) {
        state.pendingFit = true;
      }

      return;
    }

    state.pendingFit = false;

    state.map
      .getSource(
        "transit-shape"
      )
      ?.setData(
        shapeGeoJson()
      );

    state.map
      .getSource(
        "transit-stops"
      )
      ?.setData(
        stopsGeoJson()
      );

    updateVehicle();
    keepVehicleInView();

    if (
      !state.journey
    ) {
      return;
    }

    const shape =
      resolver.getDisplayShape(
        state.journey
      );

    if (fit && shape.length >= 2) {
      const bounds =
        new maplibregl
          .LngLatBounds();

      shape.forEach(
        coordinate =>
          bounds.extend(
            coordinate
          )
      );

      focusBounds(bounds);

      return;
    }

    /*
     * 兜底：经停站地理编码失败时 shape 为空，若不做任何处理，
     * 地图会一直停在默认位置、看起来「不跟随查询结果」。
     * 此处用起终点坐标（Photon 建议/选点已有）单独 fit。
     */
    if (fit) {
      const fallbackBounds =
        new maplibregl
          .LngLatBounds();

      [
        state.journey?.origin,
        state.journey?.destination
      ].forEach(point => {
        if (
          point &&
          Number.isFinite(
            Number(point.longitude)
          ) &&
          Number.isFinite(
            Number(point.latitude)
          )
        ) {
          fallbackBounds.extend([
            Number(point.longitude),
            Number(point.latitude)
          ]);
        }
      });

      if (!fallbackBounds.isEmpty()) {
        focusBounds(fallbackBounds);
      }
    }
  }

  /*
   * 统一的「把相机移到这些边界」入口。
   *
   * 真实浏览器抓到的关键事实（决定了这里的写法）：
   * 1) 相机**动画**在这类窗口里可能永远不推进——`fitBounds({duration})`、
   *    `easeTo({duration})` 既不抛错也不动，`isMoving()/isEasing()` 永久为
   *    true（rAF 循环不跑：窗口不可见/被遮挡时就会这样）。所以**不能**把
   *    「没抛异常」当作成功，必须校验相机是否真的移动了。
   * 2) 同步 `map.stop()` + `map.jumpTo()` 立即生效，不依赖动画循环；
   *    `cameraForBounds()` 在坏状态下也能算出正确的 center/zoom。
   * 因此主路径是「stop → cameraForBounds → jumpTo → 校验是否真的移动」，
   * 之后才依次降级到 easeTo、带 options 的 fitBounds、无参 fitBounds。
   */
  function focusBounds(
    bounds
  ) {
    stopCamera();

    const camera =
      boundsCamera(bounds);

    if (
      camera &&
      jumpCameraVerified(
        camera
      )
    ) {
      return true;
    }

    if (
      camera &&
      easeToBounds(
        camera
      )
    ) {
      return true;
    }

    if (
      fitBoundsVerified(
        bounds,
        {
          padding: 70,

          maxZoom: 11
        }
      )
    ) {
      return true;
    }

    return fitBoundsVerified(
      bounds
    );
  }

  function stopCamera() {
    try {
      state.map?.stop?.();
    } catch {
      // 停止动画失败不阻断后续跳转
    }
  }

  function cameraSnapshot() {
    try {
      const map = state.map;
      const center =
        map?.getCenter?.();

      if (!center) {
        return null;
      }

      return {
        lng: Number(center.lng),

        lat: Number(center.lat),

        zoom: Number(map.getZoom())
      };
    } catch {
      return null;
    }
  }

  function cameraCenterOf(
    value
  ) {
    const raw =
      value?.lng !==
        undefined
        ? value
        : Array.isArray(value)
          ? {
              lng: value[0],

              lat: value[1]
            }
          : null;

    if (!raw) {
      return null;
    }

    const lng = Number(raw.lng);
    const lat = Number(raw.lat);

    if (
      !Number.isFinite(lng) ||
      !Number.isFinite(lat)
    ) {
      return null;
    }

    return [lng, lat];
  }

  function boundsCamera(
    bounds
  ) {
    let camera = null;

    try {
      camera =
        state.map
          ?.cameraForBounds?.(
            bounds,
            {
              padding: 70,

              maxZoom: 11
            }
          ) ||
        null;
    } catch {
      camera = null;
    }

    const center =
      cameraCenterOf(camera?.center) ||
      cameraCenterOf(
        (() => {
          try {
            return bounds.getCenter();
          } catch {
            return null;
          }
        })()
      );

    if (!center) {
      return null;
    }

    return {
      center,

      zoom:
        Number.isFinite(
          camera?.zoom
        )
          ? camera.zoom
          : 6
    };
  }

  /*
   * 执行一次相机调用，并**校验相机是否真的移动**。
   * 「没抛错但没动」在动画不推进时非常常见，必须当成失败继续降级。
   */
  function moveCameraVerified(
    move
  ) {
    const before =
      cameraSnapshot();

    if (!before) {
      return false;
    }

    if (
      !fitBoundsSafely(move)
    ) {
      return false;
    }

    const after =
      cameraSnapshot();

    if (!after) {
      return false;
    }

    return (
      Math.abs(
        after.lng - before.lng
      ) > 1e-6 ||
      Math.abs(
        after.lat - before.lat
      ) > 1e-6 ||
      Math.abs(
        after.zoom - before.zoom
      ) > 1e-6
    );
  }

  function jumpCameraVerified(
    camera
  ) {
    const center =
      cameraCenterOf(camera?.center);

    if (!center) {
      return false;
    }

    const zoom =
      Number.isFinite(camera?.zoom)
        ? camera.zoom
        : 6;

    return moveCameraVerified(
      () =>
        state.map.jumpTo(
          {
            center,
            zoom
          }
        )
    );
  }

  function easeToBounds(
    camera
  ) {
    const center =
      cameraCenterOf(camera?.center);

    if (!center) {
      return false;
    }

    const zoom =
      Number.isFinite(camera?.zoom)
        ? camera.zoom
        : 6;

    return moveCameraVerified(
      () =>
        state.map.easeTo(
          {
            center,
            zoom,

            duration: 600
          }
        )
    );
  }

  function fitBoundsVerified(
    bounds,
    options
  ) {
    return moveCameraVerified(
      () =>
        options
          ? state.map.fitBounds(
              bounds,
              options
            )
          : state.map.fitBounds(
              bounds
            )
    );
  }

  /*
   * 车辆在视野外时把相机带过去。
   *
   * 切换候选车次时 render({fit:false}) 是有意不重新 fit 全程的；但如果
   * 新车次的推定位置落在当前视野外（实测切到运行中车次后标记 x=-297，
   * 完全在画布外），用户依然会「看不到车辆位置」。这里只在标记确实不在
   * 可视区内时平移一次，且靠上面的「校验真的移动了」避免反复触发。
   */
  function keepVehicleInView() {
    const position =
      state.resolved
        ?.position;

    if (
      !position ||
      !window
        .WebWindowsTransitPosition
        .validPoint(
          position
        )
    ) {
      return;
    }

    const canvas =
      state.map?.getCanvas?.();

    if (
      !canvas?.clientWidth ||
      !canvas?.clientHeight
    ) {
      return;
    }

    const center =
      cameraCenterOf(
        state.resolved?.position
      );

    if (!center) {
      return;
    }

    let projected = null;

    try {
      projected =
        state.map.project(center);
    } catch {
      projected = null;
    }

    const margin = 56;

    if (
      projected &&
      projected.x >= margin &&
      projected.y >= margin &&
      projected.x <=
        canvas.clientWidth - margin &&
      projected.y <=
        canvas.clientHeight - margin
    ) {
      return;
    }

    const zoom =
      Math.max(
        Number(
          state.map.getZoom()
        ) || 0,
        6
      );

    jumpCameraVerified(
      {
        center,
        zoom
      }
    );
  }

  function sourceLabel() {
    return state.journey
      ?.provider === "china-rail"
      ? T("sourceChinaRail")
      : T("sourceTransitland");
  }

  function operatorLabel() {
    const journey =
      state.journey;

    if (
      journey?.operator?.id ===
        "cn-national-rail" ||
      journey?.provider ===
        "china-rail"
    ) {
      return T("sourceChinaRail");
    }

    return (
      journey?.operator?.name ||
      T("transitOperatorMissing")
    );
  }

  function renderDetails() {
    const grid =
      $("transit-detail-grid");

    grid.replaceChildren();

    const journey =
      state.journey;

    if (!journey) {
      return;
    }

    const serviceDate =
      journey.serviceDate || "—";

    const items = [
      [
        T("detailRoute"),
        [
          journey.route?.shortName,
          journey.route?.longName
        ]
          .filter(Boolean)
          .join(" · ") || "—"
      ],

      [
        T("detailOperator"),
        operatorLabel()
      ],

      [
        T("detailTripId"),
        journey.tripId || "—"
      ],

      [
        T("detailStopCount"),
        String(
          Array.isArray(
            journey.stopTimes
          )
            ? journey.stopTimes
                .length
            : "—"
        )
      ],

      [
        T("detailServiceDate"),
        serviceDate
      ],

      [
        T("detailSource"),
        sourceLabel()
      ]
    ];

    items.forEach(
      ([label, value]) => {
        const box =
          document.createElement(
            "div"
          );

        box.className =
          "transit-detail";

        const span =
          document.createElement(
            "span"
          );

        const strong =
          document.createElement(
            "b"
          );

        span.textContent =
          label;

        strong.textContent =
          String(value);

        box.append(
          span,
          strong
        );

        grid.appendChild(
          box
        );
      }
    );
  }

  function renderStops() {
    const section =
      $("transit-stops");

    const list =
      $("transit-stop-list");

    const progress =
      $("transit-progress");

    const described =
      state.described;

    const stops =
      described?.stops || [];

    if (!stops.length) {
      section.hidden = true;
      progress.textContent = "";
      list.replaceChildren();
      return;
    }

    section.hidden = false;

    progress.textContent =
      T("stopProgress", {
        passed:
          String(
            described.passedCount
          ),

        total:
          String(stops.length)
      });

    list.replaceChildren();

    stops.forEach(stop => {
      const item =
        document.createElement(
          "li"
        );

      item.className =
        `transit-stop ${stop.status}`;

      const time =
        document.createElement(
          "span"
        );

      time.className =
        "transit-stop-time";

      const clock =
        stop.status === "passed"
          ? stop.departureTime ||
            stop.arrivalTime
          : stop.arrivalTime ||
            stop.departureTime;

      time.textContent =
        clock
          ? String(clock).slice(0, 5)
          : "—";

      const name =
        document.createElement(
          "b"
        );

      name.textContent =
        stop.name || "—";

      const badge =
        document.createElement(
          "em"
        );

      badge.textContent =
        T(
          STOP_STATUS_KEYS[
            stop.status
          ] || "stopStatusUpcoming"
        );

      item.append(
        time,
        name,
        badge
      );

      list.appendChild(item);
    });
  }

  function renderCandidates() {
    const host =
      $("transit-candidates");

    const list =
      $("transit-candidate-list");

    const candidates =
      state.journey?.candidates ||
      [];

    if (candidates.length < 2) {
      host.hidden = true;
      list.replaceChildren();
      return;
    }

    host.hidden = false;

    list.replaceChildren();

    candidates.forEach(item => {
      const button =
        document.createElement(
          "button"
        );

      button.type = "button";

      button.dataset.train =
        item.trainNo;

      if (item.selected) {
        button.classList.add(
          "active"
        );
      }

      const code =
        document.createElement(
          "b"
        );

      code.textContent =
        `${LIB.trainIcon(item.code)} ${item.code}`;

      const time =
        document.createElement(
          "span"
        );

      time.textContent =
        [
          item.departTime,
          item.arriveTime
        ]
          .filter(Boolean)
          .join(" → ");

      button.append(
        code,
        time
      );

      /*
       * 运行中 / 已通过车次加状态标签：
       * provider 的状态词是 running/past/upcoming，而本文件的状态键表用
       * before/running/arrived——past 需映射到 arrived，否则已过站车次
       * 没有标签（真实浏览器验证时发现）。
       */
      const stateKey =
        item.state === "past"
          ? STATE_KEYS.arrived
          : STATE_KEYS[item.state];

      if (stateKey) {
        const badge =
          document.createElement(
            "em"
          );

        badge.className =
          "transit-candidate-state";

        badge.textContent =
          T(stateKey);

        button.appendChild(badge);
      }

      list.appendChild(button);
    });
  }

  function render({
    fit = false
  } = {}) {
    if (
      !state.journey
    ) {
      return;
    }

    state.resolved =
      resolver.resolve(
        state.journey
      );

    state.described =
      describeService(
        state.journey
      );

    const journey =
      state.journey;

    /*
     * 记住这条线路（含行内电报码）：12306 对当天只返回未发车车次，
     * 「运行中/已通过」车次只能靠代理当日快照，而快照必须在发车前抓到。
     * 记住电报码后，下次打开页面即可用同一区间预热当天（每天一次）。
     */
    if (journey?.source === "china-rail") {
      rememberRoute(
        journey.origin?.name || "",
        journey.destination?.name || "",
        journey.origin?.stopId || "",
        journey.destination?.stopId || ""
      );

      warmTodaySnapshot(
        journey.origin?.stopId || "",
        journey.destination?.stopId || ""
      );
    }

    const icon =
      vehicleIcon();

    $("transit-route-name")
      .textContent =
        `${icon} ${
          journey.route
            ?.shortName ||
          journey.route
            ?.longName ||
          T("transitRouteFallback")
        }`;

    $("transit-operator-name")
      .textContent =
        operatorLabel();

    $("transit-origin-name")
      .textContent =
        journey.origin?.name ||
        "—";

    $("transit-origin-time")
      .textContent =
        (
          journey.origin
            ?.departureTime || ""
        ).slice(0, 5) || "—";

    $("transit-destination-name")
      .textContent =
        journey.destination
          ?.name || "—";

    $("transit-destination-time")
      .textContent =
        (
          journey.destination
            ?.arrivalTime || ""
        ).slice(0, 5) || "—";

    const status =
      state.resolved
        .positionStatus;

    const statusElement =
      $("transit-realtime-status");

    statusElement.dataset.status =
      status;

    const isRail =
      journey.provider ===
      "china-rail";

    if (status === "live") {
      statusElement.textContent =
        T("statusLive");

      $("transit-position-note")
        .textContent =
          T("noteLive");

    } else if (
      status === "estimated"
    ) {
      statusElement.textContent =
        T("statusEstimated");

      $("transit-position-note")
        .textContent =
          T(
            isRail
              ? "noteRailEstimate"
              : "noteEstimated"
          );

    } else {
      statusElement.textContent =
        T("statusNoLive");

      $("transit-position-note")
        .textContent =
          T(
            isRail
              ? "noteRailEstimate"
              : "noteScheduled"
          );
    }

    const stateElement =
      $("transit-service-state");

    stateElement.textContent =
      T(
        STATE_KEYS[
          state.described.state
        ] || "serviceRunning"
      );

    stateElement.dataset.state =
      state.described.state;

    $("transit-source-pill")
      .textContent =
        sourceLabel();

    renderDetails();
    renderStops();
    renderCandidates();

    $("transit-result")
      .hidden =
        false;

    updateMap({ fit });
  }

  function stopPolling() {
    if (
      state.realtimeTimer
    ) {
      clearInterval(
        state.realtimeTimer
      );

      state.realtimeTimer =
        null;
    }

    if (
      state.serviceTimer
    ) {
      clearInterval(
        state.serviceTimer
      );

      state.serviceTimer =
        null;
    }
  }

  async function refreshRealtime() {
    if (
      !state.journey?.feedKey
    ) {
      return;
    }

    try {
      const payload =
        await transitland.getRealtime(
          state.journey.feedKey
        );

      const entities =
        Array.isArray(
          payload?.entity
        )
          ? payload.entity
          : [];

      /*
       * 每轮刷新先清除上一轮的实时位置。
       * 如果当前 GTFS-Realtime 已经没有该 trip，
       * resolver 会自动退回 estimated / unavailable，
       * 不允许继续显示过期 live 位置。
       */
      state.journey
        .realtime
        .vehiclePosition =
          null;

      state.journey
        .realtime
        .available =
          false;

      const target =
        entities.find(
          entity =>
            String(
              entity?.vehicle
                ?.trip?.tripId ??
              entity?.vehicle
                ?.trip?.trip_id ??
              ""
            ) ===
            String(
              state.journey.tripId
            )
        );

      const position =
        target
          ?.vehicle
          ?.position;

      if (
        position &&
        Number.isFinite(
          Number(
            position.latitude
          )
        ) &&
        Number.isFinite(
          Number(
            position.longitude
          )
        )
      ) {
        state.journey
          .realtime
          .vehiclePosition = {
          latitude:
            Number(
              position.latitude
            ),

          longitude:
            Number(
              position.longitude
            ),

          bearing:
            Number.isFinite(
              Number(
                position.bearing
              )
            )
              ? Number(
                  position.bearing
                )
              : null,

          speed:
            Number.isFinite(
              Number(
                position.speed
              )
            )
              ? Number(
                  position.speed
                )
              : null,

          timestamp:
            Number.isFinite(
              Number(
                target?.vehicle
                  ?.timestamp
              )
            )
              ? Number(
                  target.vehicle
                    .timestamp
                )
              : null,

          source:
            "live"
        };

        state.journey
          .realtime
          .available =
            true;
      }

      render();

    } catch (error) {
      console.warn(
        "[Wendao Transit] realtime unavailable",
        error
      );
    }
  }

  function startPolling() {
    stopPolling();

    if (
      !state.visible ||
      !state.journey
    ) {
      return;
    }

    /*
     * 没有 GTFS-Realtime 时（例如 12306 车次），
     * 也要按时刻刷新“已过站 / 下一站 / 推定位置”。
     */
    state.serviceTimer =
      setInterval(
        () => {
          if (
            document.hidden ||
            !state.visible
          ) {
            return;
          }

          render();
        },

        60000
      );

    if (
      state.journey.feedKey
    ) {
      state.realtimeTimer =
        setInterval(
          () => {
            if (
              document.hidden ||
              !state.visible
            ) {
              return;
            }

            refreshRealtime();
          },

          30000
        );
    }
  }

  function errorMessage(error) {
    const code =
      String(
        error?.code || ""
      );

    const key =
      STATUS_KEYS[code];

    if (key) {
      return T(key);
    }

    return (
      error?.message ||
      T("errGeneric")
    );
  }

  /*
   * GTFS 找不到站点 / 直达班次时回落到 12306；
   * 两个数据源都失败时给出覆盖范围提示，而不是编造班次。
   */
  function coveredErrorMessage(
    error,
    fallbackCode,
    fallbackMessage,
    fallbackDetails
  ) {
    const gtfsMissed =
      [
        "stop_not_found",
        "direct_trip_not_found",
        "transit_timeout",
        "transit_upstream_unavailable"
      ].includes(
        String(fallbackCode || "")
      );

    /*
     * GTFS 上游故障（班次详情取不到、或阶段预算超时）不是
     * 「没有这条线路」，而是「公共交通数据源暂时不可用」——
     * 此时即使 12306 也查不到（海外站点本就不在中国铁路表里），
     * 也必须提示上游故障，否则查海外会显示
     * 「未在中国铁路车站表中找到该站名」，误导用户。
     */
    const railMissed =
      [
        "station_not_found",
        "no_train",
        "presale",
        "schedule_failed"
      ].includes(
        String(error?.code || "")
      );

    /*
     * GTFS 上游故障（班次详情取不到 / 阶段预算超时）时的文案区分：
     *  - station_not_found：12306 站表里根本没有该站名 —— 海外线路的典型情况，
     *    说「未在中国铁路车站表中找到该站名」对用户是误导，改为提示上游不可用。
     *  - no_train / presale / schedule_failed：站是在 12306 覆盖内的，
     *    只是这一段没车次，应走下面的「两源均未覆盖」提示。
     */
    const gtfsUnavailable =
      [
        "gtfs_trip_unavailable",
        "transit_timeout",
        "transit_upstream_unavailable"
      ].includes(
        String(fallbackCode || "")
      );

    if (
      gtfsUnavailable &&
      String(error?.code || "") ===
        "station_not_found"
    ) {
      return T("errGtfsUnavailable");
    }

    /*
     * 海外「两源都没有」时要说清是**覆盖问题**而不是服务故障：
     * GTFS 侧结论是 direct_trip_not_found（确实取到过经停表、只是没有
     * 一班到终点），12306 侧是 station_not_found（海外站名不在中国铁路
     * 站表里）。
     *
     * 文案必须按当前语言组装：provider 是共享库、只抛中文 message，
     * 直接透传会让日文/英文界面显示中文（线上事故）。所以这里用回落时
     * 传回的 details.routes + 四语文案 errGtfsNoDirect 自行拼装。
     */
    if (
      String(fallbackCode || "") ===
        "direct_trip_not_found" &&
      railMissed
    ) {
      const routes =
        (fallbackDetails
          ?.routes || [])
          .slice(0, 4)
          .join(" / ") || "—";

      const vars = {
        origin:
          state.query?.origin || "—",

        destination:
          state.query?.destination ||
          "—",

        routes
      };

      const localized = T(
        "errGtfsNoDirect",
        vars
      );

      if (
        localized &&
        !/^\{/.test(
          String(localized).trim()
        )
      ) {
        return localized;
      }

      return T(
        "errNotCovered",
        vars
      );
    }

    if (gtfsMissed && railMissed) {
      return T("errNotCovered", {
        origin:
          state.query?.origin || "—",

        destination:
          state.query?.destination ||
          "—"
      });
    }

    return errorMessage(error);
  }

  function selectTrain(trainNo) {
    if (!state.query) {
      return;
    }

    searchJourney({
      origin:
        state.query.origin,

      destination:
        state.query.destination,

      departureTime:
        state.query.departureTime,

      trainNo
    });
  }
  /*
   * 当日快照的本地记忆与预热。
   *
   * 背景：12306 对「当天」只返回尚未发车的车次（北京 10:31 只剩 10:42
   * 之后的 80 趟），所以「运行中/已通过」车次只能来自代理的当日快照；
   * 而快照必须**在那些车次发车之前**被抓到，否则永远补不回来。
   * 代理侧已把快照落盘（不再随应用池回收丢失），这里再补两点：
   *   1) 记住上次查询的区间，下次打开页面即可用它预热当天；
   *   2) 每天只预热一次（本地标记），避免无谓请求。
   * 预热失败静默忽略——它只是让覆盖更全，不该影响正常查询。
   */
  const ROUTE_MEMORY_KEY =
    "webwindows.transit.route.v1";

  const WARM_MARK_KEY =
    "webwindows.transit.warm.v1";

  function readStorage(key) {
    try {
      return window.localStorage.getItem(
        key
      );
    } catch {
      return null;
    }
  }

  function writeStorage(
    key,
    value
  ) {
    try {
      window.localStorage.setItem(
        key,
        value
      );
    } catch {
      // 隐私模式/存储被禁用时忽略
    }
  }

  function beijingDateKey() {
    const shifted =
      new Date(
        Date.now() + 8 * 3600 * 1000
      );

    const pad = value =>
      String(value).padStart(2, "0");

    return (
      shifted.getUTCFullYear() +
      "-" +
      pad(shifted.getUTCMonth() + 1) +
      "-" +
      pad(shifted.getUTCDate())
    );
  }

  function rememberRoute(
    origin,
    destination,
    fromCode,
    toCode
  ) {
    if (!fromCode || !toCode) {
      return;
    }

    writeStorage(
      ROUTE_MEMORY_KEY,
      JSON.stringify({
        origin,
        destination,
        fromCode,
        toCode
      })
    );
  }

  function warmTodaySnapshot(
    fromCode,
    toCode
  ) {
    if (!fromCode || !toCode) {
      return;
    }

    const dateKey = beijingDateKey();
    const mark = `${dateKey}|${fromCode}|${toCode}`;

    if (readStorage(WARM_MARK_KEY) === mark) {
      return;
    }

    writeStorage(WARM_MARK_KEY, mark);

    /*
     * 直接打 leftTicket（而不是完整 searchJourney）：
     * 目的只是让代理把「当天剩余车次」并入快照，
     * 不需要经停表、地理编码与地图渲染。
     */
    chinaRail
      .getLeftTicket(
        {
          from: { code: fromCode },
          to: { code: toCode },
          date: dateKey,
          includeElapsed: true
        }
      )
      .catch(() => null);
  }

  function warmFromLastRoute() {
    const raw = readStorage(
      ROUTE_MEMORY_KEY
    );

    if (!raw) {
      return;
    }

    let pair = null;

    try {
      pair = JSON.parse(raw);
    } catch {
      return;
    }

    warmTodaySnapshot(
      String(pair?.fromCode || "").trim(),
      String(pair?.toCode || "").trim()
    );
  }

  async function searchJourney(overrides) {
    const origin =
      String(
        overrides?.origin ??
          $("transit-origin").value
      ).trim();

    const destination =
      String(
        overrides?.destination ??
          $("transit-destination")
            .value
      ).trim();

    const departureTime =
      String(
        overrides?.departureTime ??
          $("transit-date-time")
            .value
      );

    /*
     * 候选车次点击：selectTrain 传入的 trainNo 必须透传给 provider，
     * 否则该参数被静默丢弃、查询原样重跑，界面毫无变化
     * （线上事故：点其它车次无反应）。
     */
    const trainNo =
      String(
        overrides?.trainNo ??
          ""
      ).trim();

    if (
      !origin ||
      !destination ||
      !departureTime
    ) {
      setStatus(
        "transitPrompt",
        {},
        true
      );

      return;
    }

    state.query = {
      origin,
      destination,
      departureTime,
      trainNo
    };

    state.controller?.abort();

    const controller =
      new AbortController();

    state.controller = controller;

    stopPolling();

    state.journey = null;
    state.source = null;
    state.fallbackCode = null;
    state.fallbackMessage = "";
    state.fallbackDetails = null;

    $("transit-result").hidden =
      true;

    setStatus("transitStepGtfs");

    const language =
      window.WebWindowsWendao
        ?.getLanguage?.() || "zh";

    try {
      const outcome =
        await LIB.searchJourneyWithFallback(
          {
            transitland,

            chinaRail,

            origin,

            destination,

            departureTime,

            trainNo,

            language,

            onFallback:
              (
                code,
                message,
                details
              ) => {
                state.fallbackCode =
                  code;

                state.fallbackMessage =
                  String(
                    message || ""
                  );

                state.fallbackDetails =
                  details || null;

                setStatus(
                  "transitStepRail"
                );
              }
          },

          controller.signal
        );

      /*
       * 期间用户已发起新查询/取消：
       * 丢弃过期结果，避免旧响应覆盖新状态。
       */
      if (controller.signal.aborted) {
        return;
      }

      state.journey =
        outcome.journey;

      state.source =
        outcome.source;

      render({ fit: true });

      setStatus("transitFound");

      startPolling();

    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        /*
         * 被取消：若已有更新的查询接手（state.controller 已换人），
         * 交由那轮刷新状态；否则说明这轮被外部中断且无人接手，
         * 必须把状态改回可重试，绝不能永久停在「照会中」。
         */
        if (state.controller !== controller) {
          return;
        }

        setStatus(
          "transitPrompt",
          {},
          true
        );

        return;
      }

      /*
       * 错误文案按当前语言生成一次，
       * 语言切换时通过 state.status.text 原样重绘。
       */
      state.status = {
        key: "errGeneric",
        vars: {},
        error: true,

        text: coveredErrorMessage(
          error,
          state.fallbackCode,
          state.fallbackMessage,
          state.fallbackDetails
        )
      };

      paintStatusWithText();
    }
  }

  /*
   * 错误文案按当前语言生成后直接写入，
   * 不再二次查表，避免 code 与字典不同步。
   */
  function paintStatusWithText() {
    const element =
      $("transit-status-message");

    element.textContent =
      state.status.text ||
      T(state.status.key);

    element.classList.toggle(
      "error",
      Boolean(state.status.error)
    );
  }

  function suggestionElements(which) {
    return {
      input: $(
        which === "origin"
          ? "transit-origin"
          : "transit-destination"
      ),

      list: $(
        which === "origin"
          ? "transit-origin-suggestions"
          : "transit-destination-suggestions"
      )
    };
  }

  function hideSuggestions(which) {
    const { list } =
      suggestionElements(which);

    if (!list) {
      return;
    }

    list.replaceChildren();
    list.hidden = true;

    state.suggestions[which] = [];

    if (
      state.suggestionWhich ===
      which
    ) {
      state.suggestionIndex = -1;
    }

    const { input } =
      suggestionElements(which);

    input?.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  function renderSuggestions(which) {
    const { input, list } =
      suggestionElements(which);

    const items =
      state.suggestions[which] || [];

    list.replaceChildren();

    if (!items.length) {
      list.hidden = true;
      input.setAttribute(
        "aria-expanded",
        "false"
      );
      return;
    }

    items.forEach(
      (item, index) => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";

        button.id =
          `${which}-suggestion-${index}`;

        button.className =
          "place-suggestion";

        button.setAttribute(
          "role",
          "option"
        );

        button.dataset.index =
          String(index);

        if (
          index ===
          state.suggestionIndex
        ) {
          button.classList.add(
            "active"
          );
        }

        if (item.badge) {
          const badge =
            document.createElement(
              "em"
            );

          badge.textContent =
            item.badge;

          button.appendChild(
            badge
        );
        }

        const label =
          document.createElement(
            "span"
          );

        label.textContent =
          item.label;

        button.appendChild(label);

        list.appendChild(button);
      }
    );

    list.hidden = false;

    input.setAttribute(
      "aria-expanded",
      "true"
    );
  }

  async function loadSuggestions(which, query) {
    const { list } =
      suggestionElements(which);

    if (!query) {
      hideSuggestions(which);
      return;
    }

    state.suggestController?.abort();

    const controller =
      new AbortController();

    state.suggestController =
      controller;

    state.suggestionWhich = which;
    state.suggestionIndex = -1;

    list.replaceChildren();

    const items = [];

    /*
     * 12306 车站表：成功后缓存，
     * 失败 30 秒内不再重试，避免每次按键都打代理。
     */
    if (
      Date.now() -
        state.stationTableFailedAt <
      30000
    ) {
      // 车站表暂时不可用，只用地址建议。
    } else {
      try {
        const stations =
          await chinaRail.searchStops(
            query,
            controller.signal
          );

        stations.forEach(station => {
          items.push({
            kind: "station",

            label:
              station.label ||
              station.name,

            value:
              station.name,

            badge:
              T("suggestionStation")
          });
        });
      } catch (_) {
        state.stationTableFailedAt =
          Date.now();
      }
    }

    if (controller.signal.aborted) {
      return;
    }

    /*
     * 世界范围地址建议：Photon GeoJSON（同源导航搜索）。
     */
    try {
      const navigation =
        window.WebWindowsNavigation;

      if (navigation?.search) {
        const focus =
          window.WebWindowsWendao?.getCurrentLocation?.();

        const result =
          await navigation.search(
            query,
            "community",
            {
              signal:
                controller.signal,

              focus
            }
          );

        (result?.results || [])
          .slice(0, 6)
          .forEach(place => {
            items.push({
              kind: "place",

              label: [
                place.name,
                place.alternate,
                place.country
              ]
                .filter(Boolean)
                .join(" · "),

              value:
                place.name
            });
          });
      }
    } catch (_) {
      /* 地址建议失败不阻断车站建议 */
    }

    if (controller.signal.aborted) {
      return;
    }

    if (!items.length) {
      items.push({
        kind: "empty",

        label:
          T("suggestionEmpty"),

        value: ""
      });
    }

    state.suggestions[which] =
      items;

    renderSuggestions(which);
  }

  function pickSuggestion(which, index) {
    const item =
      (
        state.suggestions[which] ||
        []
      )[index];

    if (!item || !item.value) {
      return;
    }

    const { input } =
      suggestionElements(which);

    input.value = item.value;

    hideSuggestions(which);

    input.focus();
  }

  function wireSuggestions(which) {
    const { input, list } =
      suggestionElements(which);

    if (!input || !list) {
      return;
    }

    let timer = null;

    input.addEventListener(
      "input",
      () => {
        clearTimeout(timer);

        const query =
          input.value.trim();

        timer = setTimeout(() => {
          loadSuggestions(
            which,
            query
          );
        }, 300);
      }
    );

    input.addEventListener(
      "keydown",
      event => {
        const items =
          state.suggestions[which] ||
          [];

        if (
          event.key === "Escape"
        ) {
          hideSuggestions(which);
          return;
        }

        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowUp"
        ) {
          if (!items.length) {
            return;
          }

          event.preventDefault();

          state.suggestionWhich =
            which;

          state.suggestionIndex =
            event.key === "ArrowDown"
              ? (state
                  .suggestionIndex +
                  1) %
                items.length
              : (state
                  .suggestionIndex -
                  1 +
                  items.length) %
                items.length;

          renderSuggestions(which);
          return;
        }

        if (
          event.key === "Enter" &&
          state.suggestionIndex >= 0 &&
          state
            .suggestionWhich ===
            which
        ) {
          event.preventDefault();

          pickSuggestion(
            which,
            state.suggestionIndex
          );
        }
      }
    );

    list.addEventListener(
      "click",
      event => {
        const button =
          event.target.closest(
            "[data-index]"
          );

        if (!button) {
          return;
        }

        pickSuggestion(
          which,
          Number(
            button.dataset.index
          )
        );
      }
    );

    /*
     * mousedown 阻止默认行为，
     * 避免 input 先失焦导致列表被隐藏。
     */
    list.addEventListener(
      "mousedown",
      event =>
        event.preventDefault()
    );
  }

  function deactivateTransit() {
    state.visible = false;

    $("transit-tab")
      .classList.remove("active");

    $("transit-tab").setAttribute(
      "aria-selected",
      "false"
    );

    $("transit-panel").hidden =
      true;

    $("transit-map").hidden = true;

    document
      .querySelector(".map-panel")
      ?.classList.remove(
        "transit-active"
      );

    stopPolling();
  }

  function activateTransit() {
    /*
     * 如果此前正在问天，
     * 先触发问地切换，
     * 让 flight-app 停止实时轮询。
     */
    if (
      !$("sky-panel").hidden
    ) {
      $("ground-tab").click();
    }

    state.visible = true;

    $("ground-panel").hidden =
      true;

    $("sky-panel").hidden = true;

    $("transit-panel").hidden =
      false;

    $("map").hidden = true;

    $("flight-map").hidden = true;

    $("transit-map").hidden =
      false;

    $("ground-tab").classList.remove(
      "active"
    );

    $("sky-tab").classList.remove(
      "active"
    );

    $("transit-tab").classList.add(
      "active"
    );

    $("ground-tab").setAttribute(
      "aria-selected",
      "false"
    );

    $("sky-tab").setAttribute(
      "aria-selected",
      "false"
    );

    $("transit-tab").setAttribute(
      "aria-selected",
      "true"
    );

    document
      .querySelector(".map-panel")
      ?.classList.remove(
        "sky-active"
      );

    document
      .querySelector(".map-panel")
      ?.classList.add(
        "transit-active"
      );

    initMap();

    setTimeout(
      () =>
        state.map?.resize(),

      0
    );

    if (state.journey) {
      render();
      startPolling();
    }
  }

  $("transit-date-time").value =
    localDateTimeValue();

  /*
   * 打开页面即用「上次查询的区间」预热当天快照（每天一次）：
   * 让「运行中/已通过」车次的覆盖随使用自我修复，
   * 而不是完全依赖用户在车次发车前恰好查过一次。
   */
  warmFromLastRoute();

  /*
   * 必须 preventDefault：<form> 是 method="get"，若放任原生提交，
   * 浏览器会在 JS 查询刚发起时导航/刷新本页，beforeunload 随即
   * abort 掉 state.controller，查询被自己杀掉，界面永远停在
   * 「GTFS照会中」（线上事故：transit-proxy 显示 canceled、
   * 无 leftTicket、且与点击次数无关）。
   */
  $("transit-search-form")
    .addEventListener(
      "submit",
      event => {
        event.preventDefault();
        searchJourney();
      }
    );

  $("transit-tab").addEventListener(
    "click",
    activateTransit
  );

  $("ground-tab").addEventListener(
    "click",
    deactivateTransit
  );

  $("sky-tab").addEventListener(
    "click",
    deactivateTransit
  );

  wireSuggestions("origin");
  wireSuggestions("destination");

  $("transit-candidate-list")
    ?.addEventListener(
      "click",
      event => {
        const button =
          event.target.closest(
            "[data-train]"
          );

        if (!button) {
          return;
        }

        selectTrain(
          button.dataset.train
        );
      }
    );

  document.addEventListener(
    "click",
    event => {
      if (
        event.target.closest(
          ".transit-field"
        )
      ) {
        return;
      }

      hideSuggestions("origin");
      hideSuggestions(
        "destination"
      );
    }
  );

  /*
   * 语言切换后按 key 重绘状态与结果。
   */
  window.addEventListener(
    "wendao-language-change",
    () => {
      paintStatus();

      if (state.status.text) {
        paintStatusWithText();
      }

      if (state.journey) {
        render();
      }
    }
  );

  window.addEventListener(
    "beforeunload",
    () => {
      stopPolling();

      state.controller?.abort();

      state.suggestController?.abort();
    }
  );

  window.WebWindowsTransitApp =
    Object.freeze({
      getMap:
        () =>
          state.map,

      searchJourney:
        options =>
          searchJourney(options),

      getStatus:
        () => ({ ...state.status }),

      getDebugState:
        () => ({
          visible:
            state.visible,

          hasJourney:
            Boolean(
              state.journey
            ),

          positionStatus:
            state.resolved
              ?.positionStatus,

          /*
           * 车辆标记与相机的可观测状态：2026-09-25 的「看不到运行中车辆
           * 位置」事故就是「标记没定位 + 相机楔死」，这两个字段能在
           * 真实浏览器里一眼看出是否复发，不必再翻控制台。
           */
          vehicleMarker:
            (() => {
              const element =
                state.vehicleMarker
                  ?.getElement?.() ||
                null;

              const strays =
                document.querySelectorAll(
                  ".transit-vehicle-marker"
                ).length -
                (element ? 1 : 0);

              return {
                present:
                  Boolean(element),

                positioned:
                  Boolean(
                    element?.style
                      ?.transform
                  ),

                transform:
                  element?.style
                    ?.transform ||
                  null,

                strays:
                  strays > 0
                    ? strays
                    : 0
              };
            })(),

          camera:
            (() => {
              try {
                const center =
                  state.map
                    ?.getCenter?.();

                return center
                  ? {
                      lng: +Number(
                        center.lng
                      ).toFixed(3),

                      lat: +Number(
                        center.lat
                      ).toFixed(3),

                      zoom: +Number(
                        state.map.getZoom()
                      ).toFixed(2)
                    }
                  : null;
              } catch {
                return null;
              }
            })(),

          serviceState:
            state.described?.state ||
            null,

          passedCount:
            state.described
              ?.passedCount ?? null,

          stopCount:
            Array.isArray(
              state.journey
                ?.stopTimes
            )
              ? state.journey
                  .stopTimes.length
              : 0,

          candidateCount:
            state.journey
              ?.candidates
              ?.length ?? 0,

          source:
            state.source || null,

          feedKey:
            state.journey
              ?.feedKey ||

            null,

          tripId:
            state.journey
              ?.tripId || null,

          realtimeScheduled:
            Boolean(
              state.realtimeTimer
            ),

          serviceTicker:
            Boolean(
              state.serviceTimer
            )
        })
    });

  paintStatus();
})();
