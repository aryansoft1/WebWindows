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

  const provider =
    new window
      .WebWindowsTransit
      .TransitlandTransitProvider();

  const resolver =
    new window
      .WebWindowsTransitPosition
      .TransitPositionResolver();

  const state = {
    map: null,
    mapReady: false,

    journey: null,
    resolved: null,

    controller: null,
    realtimeTimer: null,

    vehicleMarker: null,

    visible: false
  };

  function setStatus(
    text,
    error = false
  ) {
    const element =
      $("transit-status-message");

    element.textContent =
      text;

    element.classList.toggle(
      "error",
      error
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

    state.map.on(
      "load",
      () => {
        state.mapReady =
          true;

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

        updateMap();
      }
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
      "🚆";

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

  function updateMap() {
    if (
      !state.mapReady
    ) {
      return;
    }

    state.map
      .getSource(
        "transit-shape"
      )
      ?.setData(
        shapeGeoJson()
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

    if (
      shape.length >= 2
    ) {
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
    }
  }

  function renderDetails() {
    const grid =
      $("transit-detail-grid");

    grid.replaceChildren();

    const journey =
      state.journey;

    const items = [
      [
        "线路",
        journey
          ?.route
          ?.shortName ||
        journey
          ?.route
          ?.longName ||
        "—"
      ],

      [
        "运营方",
        journey
          ?.operator
          ?.name ||
        "—"
      ],

      [
        "Trip ID",
        journey
          ?.tripId ||
        "—"
      ],

      [
        "经过站数",
        Array.isArray(
          journey?.stopTimes
        )
          ? journey
              .stopTimes
              .length
          : "—"
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

  function render() {
    if (
      !state.journey
    ) {
      return;
    }

    state.resolved =
      resolver.resolve(
        state.journey
      );

    const journey =
      state.journey;

    $("transit-route-name")
      .textContent =
        journey
          .route
          .shortName ||
        journey
          .route
          .longName ||
        "公共交通";

    $("transit-operator-name")
      .textContent =
        journey
          .operator
          .name ||
        "运营方暂无信息";

    $("transit-origin-name")
      .textContent =
        journey
          .origin
          .name ||
        "—";

    $("transit-origin-time")
      .textContent =
        journey
          .origin
          .departureTime ||
        "—";

    $("transit-destination-name")
      .textContent =
        journey
          .destination
          .name ||
        "—";

    $("transit-destination-time")
      .textContent =
        journey
          .destination
          .arrivalTime ||
        "—";

    const status =
      state.resolved
        .positionStatus;

    const statusElement =
      $("transit-realtime-status");

    statusElement.dataset.status =
      status;

    if (
      status ===
      "live"
    ) {
      statusElement.textContent =
        "实时位置";

      $("transit-position-note")
        .textContent =
          "车辆位置来自 GTFS-Realtime。";

    } else if (
      status ===
      "estimated"
    ) {
      statusElement.textContent =
        "推定位置";

      $("transit-position-note")
        .textContent =
          "当前无实时车辆位置；车辆图标根据 GTFS 计划时间沿官方线路 shape 推定。";

    } else {
      statusElement.textContent =
        "无实时位置";

      $("transit-position-note")
        .textContent =
          "显示 GTFS 计划线路；当前没有可靠车辆位置。";
    }

    renderDetails();

    $("transit-result")
      .hidden =
        false;

    updateMap();
  }

  function stopRealtime() {
    if (
      state.realtimeTimer
    ) {
      clearInterval(
        state.realtimeTimer
      );

      state.realtimeTimer =
        null;
    }
  }

  function startRealtime() {
    stopRealtime();

    if (
      !state.visible ||
      !state.journey
        ?.feedKey
    ) {
      return;
    }

    state.realtimeTimer =
      setInterval(
        async () => {
          if (
            document.hidden ||
            !state.visible
          ) {
            return;
          }

          try {
            const payload =
              await provider
                .getRealtime(
                  state.journey
                    .feedKey
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
                    entity
                      ?.vehicle
                      ?.trip
                      ?.tripId ??
                    entity
                      ?.vehicle
                      ?.trip
                      ?.trip_id ??
                    ""
                  ) ===
                  String(
                    state.journey
                      .tripId
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
                        target
                          ?.vehicle
                          ?.timestamp
                      )
                    )
                      ? Number(
                          target
                            .vehicle
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
        },

        30000
      );
  }

  async function searchJourney(
    event
  ) {
    event?.preventDefault();

    const origin =
      $("transit-origin")
        .value
        .trim();

    const destination =
      $("transit-destination")
        .value
        .trim();

    const departureTime =
      $("transit-date-time")
        .value;

    if (
      !origin ||
      !destination ||
      !departureTime
    ) {
      setStatus(
        "请输入出发站、到达站和时间。",
        true
      );

      return;
    }

    state.controller
      ?.abort();

    state.controller =
      new AbortController();

    stopRealtime();

    state.journey =
      null;

    $("transit-result")
      .hidden =
        true;

    setStatus(
      "正在查询 GTFS 公共交通数据…"
    );

    try {
      state.journey =
        await provider
          .searchJourney(
            {
              origin,
              destination,
              departureTime
            },

            state.controller
              .signal
          );

      render();

      setStatus(
        "已找到直达行程。"
      );

      startRealtime();

    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        return;
      }

      setStatus(
        error?.message ||
        "公共交通查询失败。",
        true
      );
    }
  }

  function deactivateTransit() {
    state.visible =
      false;

    $("transit-tab")
      .classList
      .remove(
        "active"
      );

    $("transit-tab")
      .setAttribute(
        "aria-selected",
        "false"
      );

    $("transit-panel")
      .hidden =
        true;

    $("transit-map")
      .hidden =
        true;

    document
      .querySelector(
        ".map-panel"
      )
      ?.classList
      .remove(
        "transit-active"
      );

    stopRealtime();
  }

  function activateTransit() {
    /*
     * 如果此前正在问天，
     * 先触发问地切换，
     * 让 flight-app 停止实时轮询。
     */
    if (
      !$("sky-panel")
        .hidden
    ) {
      $("ground-tab")
        .click();
    }

    state.visible =
      true;

    $("ground-panel")
      .hidden =
        true;

    $("sky-panel")
      .hidden =
        true;

    $("transit-panel")
      .hidden =
        false;

    $("map")
      .hidden =
        true;

    $("flight-map")
      .hidden =
        true;

    $("transit-map")
      .hidden =
        false;

    $("ground-tab")
      .classList
      .remove(
        "active"
      );

    $("sky-tab")
      .classList
      .remove(
        "active"
      );

    $("transit-tab")
      .classList
      .add(
        "active"
      );

    $("ground-tab")
      .setAttribute(
        "aria-selected",
        "false"
      );

    $("sky-tab")
      .setAttribute(
        "aria-selected",
        "false"
      );

    $("transit-tab")
      .setAttribute(
        "aria-selected",
        "true"
      );

    document
      .querySelector(
        ".map-panel"
      )
      ?.classList
      .remove(
        "sky-active"
      );

    document
      .querySelector(
        ".map-panel"
      )
      ?.classList
      .add(
        "transit-active"
      );

    initMap();

    setTimeout(
      () =>
        state.map
          ?.resize(),

      0
    );

    if (
      state.journey
    ) {
      render();
      startRealtime();
    }
  }

  $("transit-date-time")
    .value =
      localDateTimeValue();

  $("transit-search-form")
    .addEventListener(
      "submit",
      searchJourney
    );

  $("transit-tab")
    .addEventListener(
      "click",
      activateTransit
    );

  $("ground-tab")
    .addEventListener(
      "click",
      deactivateTransit
    );

  $("sky-tab")
    .addEventListener(
      "click",
      deactivateTransit
    );

  window
    .addEventListener(
      "beforeunload",
      () => {
        stopRealtime();

        state.controller
          ?.abort();
      }
    );

  window.WebWindowsTransitApp =
    Object.freeze({
      getMap:
        () =>
          state.map,

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

          feedKey:
            state.journey
              ?.feedKey ||
            null,

          tripId:
            state.journey
              ?.tripId ||
            null,

          realtimeScheduled:
            Boolean(
              state.realtimeTimer
            )
        })
    });

})();