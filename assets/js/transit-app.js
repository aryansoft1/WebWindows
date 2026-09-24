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

  function createVehicleMarker() {
    const element =
      document.createElement(
        "div"
      );

    element.className =
      "airport-marker";

    element.textContent =
      vehicleIcon();

    return element;
  }

  function updateVehicle() {
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
        state.vehicleMarker
          .remove();

        state.vehicleMarker =
          null;
      }

      return;
    }

    if (
      !state.vehicleMarker
    ) {
      state.vehicleMarker =
        new maplibregl
          .Marker({
            element:
              createVehicleMarker()
          })
          .addTo(
            state.map
          );
    } else {
      state.vehicleMarker
        .getElement()
        .textContent =
          vehicleIcon();
    }

    state.vehicleMarker
      .setLngLat([
        Number(
          position.longitude
        ),

        Number(
          position.latitude
        )
      ]);
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

      state.map.fitBounds(
        bounds,
        {
          padding:
            70,

          maxZoom:
            11,

          duration:
            600
        }
      );

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
        state.map.fitBounds(
          fallbackBounds,
          {
            padding: 70,

            maxZoom: 11,

            duration: 600
          }
        );
      }
    }
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
    fallbackCode
  ) {
    const gtfsMissed =
      [
        "stop_not_found",
        "direct_trip_not_found"
      ].includes(
        String(fallbackCode || "")
      );

    const railMissed =
      [
        "station_not_found",
        "no_train",
        "presale",
        "schedule_failed"
      ].includes(
        String(error?.code || "")
      );

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
              code => {
                state.fallbackCode =
                  code;

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
          state.fallbackCode
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
