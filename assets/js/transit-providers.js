(function (global) {
  "use strict";

  const ENDPOINT = "/api/transit-proxy.asp";
  const RAIL_ENDPOINT = "/api/railway-proxy.asp";
  const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";

  /*
   * 所有外部请求的超时预算（毫秒）。
   * 任何 fetch 都必须有界：请求挂起时 UI 会永远停在
   * 「GTFS 数据照会中」——这是线上真实发生过的卡死根因。
   * 测试/调试可通过 global.__WENDAO_TRANSIT_TIMEOUTS__ 覆盖。
   */
  const TIMEOUTS = Object.assign(
    {
      transitRequest: 10000,
      geocoderRequest: 6000,
      railRequest: 15000,
      gtfsStage: 8000,
      railStage: 30000
    },
    global.__WENDAO_TRANSIT_TIMEOUTS__ || {}
  );

  /*
   * 经停表按候选车次顺序最多尝试的次数：
   * 12306 同城查询下首班车可能不停查询站，个别车次 czzz 也可能
   * 无经停数据——逐个有界回退，全部失败才报 schedule_* 错误。
   */
  const RAIL_SCHEDULE_MAX_ATTEMPTS = 5;

  function text(value) {
    return value === null || value === undefined
      ? ""
      : String(value);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function providerError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  function timeoutError(code, message) {
    const error = providerError(code, message);
    error.name = "TimeoutError";
    return error;
  }

  /*
   * fetch + 硬超时。
   * 外部 signal 正常转发；超时抛 name=TimeoutError / code=… 的错误，
   * 与用户取消（AbortError）严格可区分：
   * 超时 → 回落或报错，取消 → 静默中止，二者不可混淆。
   */
  function fetchWithTimeout(
    url,
    init,
    timeoutMs,
    timeoutCode,
    timeoutMessage
  ) {
    const controller = new AbortController();

    const external =
      init && init.signal
        ? init.signal
        : null;

    const relay = () => controller.abort();

    if (external) {
      if (external.aborted) {
        controller.abort();
      } else {
        external.addEventListener("abort", relay);
      }
    }

    let timer = null;

    const request = fetch(
      url,
      Object.assign({}, init, {
        signal: controller.signal
      })
    );

    const settled = request.then(
      value => {
        if (timer) clearTimeout(timer);
        return value;
      },
      error => {
        if (timer) clearTimeout(timer);
        throw error;
      }
    );

    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(
          timeoutError(timeoutCode, timeoutMessage)
        );
      }, timeoutMs);
    });

    const raced = Promise.race([settled, timeout]);

    if (external) {
      const cleanup = () =>
        external.removeEventListener("abort", relay);
      raced.then(cleanup, cleanup);
    }

    return raced;
  }

  function coordinatesFromStop(stop) {
    const coordinates =
      stop?.geometry?.coordinates;

    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2
    ) {
      return {
        latitude: null,
        longitude: null
      };
    }

    return {
      longitude: number(coordinates[0]),
      latitude: number(coordinates[1])
    };
  }

  function stopKey(stop) {
    return (
      text(stop?.onestop_id) ||
      text(stop?.id)
    );
  }

  function routeKey(route) {
    return (
      text(route?.onestop_id) ||
      text(route?.id)
    );
  }

  function departureArray(payload) {
    if (
      Array.isArray(payload?.stops) &&
      payload.stops[0] &&
      Array.isArray(
        payload.stops[0].departures
      )
    ) {
      return payload.stops[0].departures;
    }

    if (Array.isArray(payload?.departures)) {
      return payload.departures;
    }

    return [];
  }

  function tripFromPayload(payload) {
    if (
      Array.isArray(payload?.trips) &&
      payload.trips.length
    ) {
      return payload.trips[0];
    }

    if (payload?.trip) {
      return payload.trip;
    }

    return null;
  }

  function stopMatches(stop, destination) {
    if (!stop || !destination) {
      return false;
    }

    const stopOnestop =
      text(stop.onestop_id);

    const destinationOnestop =
      text(destination.onestop_id);

    if (
      stopOnestop &&
      destinationOnestop &&
      stopOnestop === destinationOnestop
    ) {
      return true;
    }

    const stopId =
      text(stop.stop_id);

    const destinationId =
      text(destination.stop_id);

    if (
      stopId &&
      destinationId &&
      stopId === destinationId
    ) {
      return true;
    }

    return (
      text(stop.stop_name)
        .trim()
        .toLocaleLowerCase() ===
      text(destination.stop_name)
        .trim()
        .toLocaleLowerCase()
    );
  }

  function shapeCoordinates(trip) {
    const coordinates =
      trip?.shape
        ?.geometry
        ?.coordinates;

    if (!Array.isArray(coordinates)) {
      return [];
    }

    return coordinates
      .filter(
        coordinate =>
          Array.isArray(coordinate) &&
          coordinate.length >= 2 &&
          Number.isFinite(
            Number(coordinate[0])
          ) &&
          Number.isFinite(
            Number(coordinate[1])
          )
      )
      .map(
        coordinate => [
          Number(coordinate[0]),
          Number(coordinate[1])
        ]
      );
  }

  function realtimeEntityArray(payload) {
    if (Array.isArray(payload?.entity)) {
      return payload.entity;
    }

    if (Array.isArray(payload?.entities)) {
      return payload.entities;
    }

    return [];
  }

  function findVehicle(payload, tripId) {
    const target =
      text(tripId);

    if (!target) {
      return null;
    }

    const entity =
      realtimeEntityArray(payload)
        .find(item => {
          const vehicle =
            item?.vehicle;

          const id =
            text(
              vehicle?.trip?.tripId ??
              vehicle?.trip?.trip_id
            );

          return id === target;
        });

    const vehicle =
      entity?.vehicle;

    const position =
      vehicle?.position;

    if (!position) {
      return null;
    }

    const latitude =
      number(position.latitude);

    const longitude =
      number(position.longitude);

    if (
      latitude === null ||
      longitude === null
    ) {
      return null;
    }

    return {
      latitude,
      longitude,

      bearing:
        number(position.bearing),

      speed:
        number(position.speed),

      timestamp:
        number(
          vehicle.timestamp
        ),

      vehicleId:
        text(
          vehicle?.vehicle?.id
        ),

      source:
        "live"
    };
  }

  /*
   * 图标只按官方 route_type / 车次字母推断，不臆造车型。
   */
  function routeIcon(type) {
    const value = number(type);

    if (value === null) {
      return "🚌";
    }

    if (value >= 100 && value < 200) {
      return "🚆";
    }

    if (value >= 200 && value < 300) {
      return "🚌";
    }

    if (value === 1) {
      return "🚇";
    }

    if (value === 700 || (value >= 700 && value < 800)) {
      return "🚲";
    }

    if (
      value === 0 ||
      value === 400 ||
      value === 900
    ) {
      return "🚋";
    }

    return "🚌";
  }

  /*
   * 12306 车次首字母：G 高铁 / C 城际 → 高铁动车组，D 动车 → 动车组，
   * 其余（Z/T/K 及纯数字）为普速列车。
   */
  function trainIcon(code) {
    const letter =
      text(code).trim().charAt(0).toUpperCase();

    return /^[GCD]$/.test(letter)
      ? "🚄"
      : "🚆";
  }

  class TransitProvider {
    async searchJourney() {
      throw new Error(
        "Transit provider is not implemented."
      );
    }

    async getRealtime() {
      return null;
    }
  }

  class TransitlandTransitProvider
    extends TransitProvider {

    constructor(
      endpoint = ENDPOINT
    ) {
      super();
      this.endpoint = endpoint;
    }

    async request(
      action,
      params,
      signal
    ) {
      const url =
        new URL(
          this.endpoint,
          global.location.origin
        );

      url.searchParams.set(
        "action",
        action
      );

      Object.entries(
        params || {}
      ).forEach(
        ([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== ""
          ) {
            url.searchParams.set(
              key,
              String(value)
            );
          }
        }
      );

      const response =
        await fetchWithTimeout(
          url.href,
          {
            credentials:
              "same-origin",

            headers: {
              Accept:
                "application/json"
            },

            signal
          },

          TIMEOUTS.transitRequest,
          "transit_timeout",
          "Transit request timed out."
        );

      const payload =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (!response.ok) {
        const error =
          providerError(
            payload
              ?.error
              ?.code ||
              "transit_request_failed",

            payload
              ?.error
              ?.message ||
              `Transit request failed (${response.status})`
          );

        error.httpStatus =
          response.status;

        throw error;
      }

      return payload;
    }

    async searchStops(
      search,
      signal
    ) {
      const payload =
        await this.request(
          "stops",
          {
            search,
            limit: 8
          },
          signal
        );

      return Array.isArray(
        payload?.stops
      )
        ? payload.stops
        : [];
    }

    async getDepartures(
      stop,
      serviceDate,
      startTime,
      signal
    ) {
      return this.request(
        "departures",
        {
          stop_key:
            stopKey(stop),

          service_date:
            serviceDate,

          start_time:
            startTime,

          limit:
            20
        },
        signal
      );
    }

    async getTrip(
      route,
      tripId,
      signal
    ) {
      return this.request(
        "trip",
        {
          route_key:
            routeKey(route),

          trip_id:
            tripId
        },
        signal
      );
    }

    async getRealtime(
      feedKey,
      signal
    ) {
      if (!feedKey) {
        return null;
      }

      try {
        return await this.request(
          "realtime",
          {
            feed_key:
              feedKey
          },
          signal
        );
      } catch (_) {
        return null;
      }
    }

    async searchJourney(
      {
        origin,
        destination,
        departureTime
      },
      signal
    ) {
      const departureValue =
            String(
              departureTime ||
              ""
            );

          const date =
            departureValue
              .slice(
                0,
                10
              );

          const timePart =
            departureValue
              .slice(
                11,
                16
              );

          const startTime =
            /^\d{2}:\d{2}$/
              .test(
                timePart
              )
                ? `${timePart}:00`
                : "00:00:00";

      const [
        originStops,
        destinationStops
      ] =
        await Promise.all([
          this.searchStops(
            origin,
            signal
          ),

          this.searchStops(
            destination,
            signal
          )
        ]);

      if (
        !originStops.length ||
        !destinationStops.length
      ) {
        throw providerError(
          "stop_not_found",
          "未找到出发站或到达站。"
        );
      }

      const originStop =
        originStops[0];

      const destinationStop =
        destinationStops[0];

      const departuresPayload =
        await this.getDepartures(
          originStop,
          date,
          startTime,
          signal
        );

      const departures =
        departureArray(
          departuresPayload
        ).slice(0, 12);

      for (
        const departure
        of departures
      ) {
        const departureTrip =
          departure?.trip;

        const tripId =
          text(
            departureTrip
              ?.trip_id
          );

        const route =
          departureTrip
            ?.route;

        if (
          !tripId ||
          !routeKey(route)
        ) {
          continue;
        }

        const tripPayload =
          await this.getTrip(
            route,
            tripId,
            signal
          );

        const trip =
          tripFromPayload(
            tripPayload
          );

        if (
          !trip ||
          !Array.isArray(
            trip.stop_times
          )
        ) {
          continue;
        }

        const originIndex =
          trip.stop_times
            .findIndex(
              item =>
                stopMatches(
                  item?.stop,
                  originStop
                )
            );

        const destinationIndex =
          trip.stop_times
            .findIndex(
              (item, index) =>
                index >
                  originIndex &&
                stopMatches(
                  item?.stop,
                  destinationStop
                )
            );

        if (
          originIndex < 0 ||
          destinationIndex < 0
        ) {
          continue;
        }

        const originTime =
          trip.stop_times[
            originIndex
          ];

        const destinationTime =
          trip.stop_times[
            destinationIndex
          ];

        const originPoint =
          coordinatesFromStop(
            originTime.stop
          );

        const destinationPoint =
          coordinatesFromStop(
            destinationTime.stop
          );

        const feedKey =
          text(
            trip
              ?.feed_version
              ?.feed
              ?.onestop_id
          );

        let realtime =
          null;

        if (feedKey) {
          const realtimePayload =
            await this.getRealtime(
              feedKey,
              signal
            );

          realtime =
            realtimePayload
              ? findVehicle(
                  realtimePayload,
                  tripId
                )
              : null;
        }

        return {
          provider:
            "transitland",

          feedKey,

          tripId,

          routeId:
            text(
              trip
                ?.route
                ?.route_id
            ),

          operator: {
            id:
              text(
                trip
                  ?.route
                  ?.agency
                  ?.onestop_id
              ),

            name:
              text(
                trip
                  ?.route
                  ?.agency
                  ?.agency_name
              )
          },

          route: {
            onestopId:
              text(
                trip
                  ?.route
                  ?.onestop_id
              ),

            shortName:
              text(
                trip
                  ?.route
                  ?.route_short_name
              ),

            longName:
              text(
                trip
                  ?.route
                  ?.route_long_name
              ),

            type:
              number(
                trip
                  ?.route
                  ?.route_type
              )
          },

          origin: {
            stopId:
              text(
                originTime
                  ?.stop
                  ?.stop_id
              ),

            onestopId:
              text(
                originTime
                  ?.stop
                  ?.onestop_id
              ),

            name:
              text(
                originTime
                  ?.stop
                  ?.stop_name
              ),

            latitude:
              originPoint.latitude,

            longitude:
              originPoint.longitude,

            departureTime:
              text(
                originTime
                  ?.departure_time
              )
          },

          destination: {
            stopId:
              text(
                destinationTime
                  ?.stop
                  ?.stop_id
              ),

            onestopId:
              text(
                destinationTime
                  ?.stop
                  ?.onestop_id
              ),

            name:
              text(
                destinationTime
                  ?.stop
                  ?.stop_name
              ),

            latitude:
              destinationPoint.latitude,

            longitude:
              destinationPoint.longitude,

            arrivalTime:
              text(
                destinationTime
                  ?.arrival_time
              )
          },

          serviceDate:
            date,

          shape:
            shapeCoordinates(
              trip
            ),

          stopTimes:
            trip.stop_times
              .slice(
                originIndex,
                destinationIndex + 1
              ),

          realtime: {
            available:
              Boolean(realtime),

            vehiclePosition:
              realtime,

            scheduleRelationship:
              text(
                trip
                  ?.schedule_relationship
              ),

            alerts:
              Array.isArray(
                trip?.alerts
              )
                ? trip.alerts
                : []
          }
        };
      }

      throw providerError(
        "direct_trip_not_found",
        "当前仅支持无需换乘的直达行程，未找到可用直达班次。"
      );
    }
  }

  /*
   * Photon GeoJSON → 统一的地点建议结构。
   * 只有真实存在的地名才返回，不生成任何占位地点。
   */
  function photonLabel(feature) {
    const properties =
      feature?.properties || {};

    const name =
      text(properties.name).trim();

    const locality =
      [
        text(properties.city).trim() ||
          text(properties.district).trim() ||
          text(properties.county).trim(),
        text(properties.state).trim(),
        text(properties.country).trim()
      ]
        .filter(Boolean)
        .filter(
          (value, index, list) =>
            list.indexOf(value) === index
        )
        .join(" · ");

    if (name && locality) {
      return `${name} · ${locality}`;
    }

    return name || locality;
  }

  function photonSuggestion(feature, limit = 8) {
    const coordinates =
      feature?.geometry?.coordinates;

    const latitude =
      number(coordinates?.[1]);

    const longitude =
      number(coordinates?.[0]);

    if (
      latitude === null ||
      longitude === null
    ) {
      return null;
    }

    const properties =
      feature?.properties || {};

    return {
      source: "photon",

      name:
        text(properties.name).trim() ||
        photonLabel(feature),

      label:
        photonLabel(feature),

      latitude,
      longitude,

      country:
        text(properties.country).trim()
    };
  }

  class PhotonGeocoder {
    constructor(
      endpoint = PHOTON_ENDPOINT
    ) {
      this.endpoint = endpoint;
    }

    async search(
      query,
      {
        signal,
        bias = null,
        limit = 8,
        language = "zh"
      } = {}
    ) {
      const value =
        text(query).trim();

      if (value.length < 2) {
        return [];
      }

      const url =
        new URL(
          this.endpoint
        );

      url.searchParams.set("q", value);
      /*
       * Photon 的 lang 只接受其内置 locale（en/de/fr/default…）。
       * 实测传 zh / ja / defaultlang=zh 一律 HTTP 400，
       * 导致所有地理编码失败 -> 经停站无坐标 -> journey.shape 为空
       * -> 地图永不跟随查询结果（线上事故）。
       * 中文/日文查询直接用 default，实测能正确返回「成都东」等中文地名。
       */
      url.searchParams.set(
        "lang",
        language === "en"
          ? "en"
          : "default"
      );

      if (
        bias &&
        Number.isFinite(Number(bias.latitude)) &&
        Number.isFinite(Number(bias.longitude))
      ) {
        url.searchParams.set(
          "lat",
          String(bias.latitude)
        );
        url.searchParams.set(
          "lon",
          String(bias.longitude)
        );
      }

      const response =
        await fetchWithTimeout(
          url.href,
          {
            headers: {
              Accept: "application/geo+json"
            },

            signal
          },

          TIMEOUTS.geocoderRequest,
          "geocoder_timeout",
          "Photon request timed out."
        );

      if (!response.ok) {
        throw providerError(
          "geocoder_unavailable",
          `Photon request failed (${response.status})`
        );
      }

      const payload =
        await response.json().catch(() => null);

      const features =
        Array.isArray(payload?.features)
          ? payload.features
          : [];

      return features
        .map(feature =>
          photonSuggestion(feature, limit)
        )
        .filter(Boolean)
        .slice(0, limit);
    }
  }

  function normalizeStationName(value) {
    return text(value)
      .trim()
      .replace(/\s+/g, "")
      .toLocaleLowerCase();
  }

  /*
   * 12306 station_name.js 解析：'@bjb|北京北|VAP|beijingbei|bjb|0@...'
   * 每段以 @ 开头，字段以 | 分隔。
   */
  function parseStationTable(source) {
    const raw =
      text(source).replace(
        /^[^@]*/,
        ""
      );

    const stations = [];

    raw.split("@").forEach(chunk => {
      if (!chunk) {
        return;
      }

      const fields =
        chunk.split("|");

      const code =
        text(fields[2]).trim();

      const name =
        text(fields[1]).trim();

      if (!code || !name) {
        return;
      }

      stations.push({
        code,
        name,

        pinyin:
          text(fields[3]).trim(),

        shortPinyin:
          text(fields[4]).trim()
      });
    });

    return stations;
  }

  /*
   * 车站匹配优先级：全名 > 电报码 > 拼音 > 拼音首字母 > 包含匹配
   * > 尾字「站」/方向字（东南西北）逐层剥除回落。
   */
  function matchStation(
    stations,
    query,
    exactOnly = false
  ) {
    const value =
      normalizeStationName(query);

    if (!value || !stations.length) {
      return null;
    }

    const exact =
      stations.find(
        station =>
          normalizeStationName(
            station.name
          ) === value
      );

    if (exact) {
      return exact;
    }

    const byCode =
      stations.find(
        station =>
          text(station.code)
            .trim()
            .toUpperCase() ===
          text(query).trim().toUpperCase()
      );

    if (byCode) {
      return byCode;
    }

    const byPinyin =
      stations.find(
        station =>
          normalizeStationName(
            station.pinyin
          ) === value
      );

    if (byPinyin) {
      return byPinyin;
    }

    const byShort =
      stations.find(
        station =>
          normalizeStationName(
            station.shortPinyin
          ) === value
      );

    if (byShort) {
      return byShort;
    }

    if (!exactOnly) {
      const contained =
        stations.find(
          station =>
            normalizeStationName(
              station.name
            ).includes(value) ||
            normalizeStationName(
              station.pinyin
            ).includes(value)
        );

      if (contained) {
        return contained;
      }
    }

    /*
     * 后缀回落：「成都站/成都北/成都北站」等口语写法在精确链与包含链
     * 都落空时，依次剥掉尾字「站」与方向字（东南西北）重试；
     * 剥除后的重试只走精确链（exactOnly），避免「海南→海→上海」这类乱配，
     * 彻底找不到才报 station_not_found。
     */
    if (/站$/.test(value)) {
      const byNoStationSuffix =
        matchStation(
          stations,
          value.slice(0, -1),
          true
        );

      if (byNoStationSuffix) {
        return byNoStationSuffix;
      }
    }

    if (/[东南西北]$/.test(value)) {
      const byNoDirectionSuffix =
        matchStation(
          stations,
          value.slice(0, -1),
          true
        );

      if (byNoDirectionSuffix) {
        return byNoDirectionSuffix;
      }
    }

    return null;
  }

  /*
   * 返回车站表中的候选项（用于自动补全，最多 limit 条）。
   */
  function stationSuggestions(
    stations,
    query,
    limit = 6
  ) {
    const value =
      normalizeStationName(query);

    if (value.length < 1) {
      return [];
    }

    const scored = [];

    stations.forEach(station => {
      const name =
        normalizeStationName(station.name);

      const pinyin =
        normalizeStationName(station.pinyin);

      const short =
        normalizeStationName(station.shortPinyin);

      const code =
        text(station.code)
          .trim()
          .toUpperCase();

      let score = -1;

      if (name === value) score = 0;
      else if (code === text(query).trim().toUpperCase()) score = 1;
      else if (pinyin === value) score = 2;
      else if (short === value) score = 3;
      else if (name.startsWith(value)) score = 4;
      else if (pinyin.startsWith(value)) score = 5;
      else if (short.startsWith(value)) score = 6;
      else if (name.includes(value)) score = 7;

      if (score >= 0) {
        scored.push({ station, score });
      }
    });

    return scored
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map(({ station }) => ({
        source: "station",

        code: station.code,
        name: station.name,

        label: station.name,

        latitude: null,
        longitude: null
      }));
  }

  /*
   * 余票列表字段索引（12306 leftTicket/query）：
   * 2 train_no · 3 车次 · 4/5 始发终到电报码 · 6/7 本段发到电报码
   * 8 发车时刻 · 9 到达时刻 · 10 历时 · 11 可否购票
   */
  function parseLeftTicket(payload) {
    /*
     * api/railway-proxy.asp 已在服务端解析 12306 原始报文，
     * 返回平铺的 {trains:[{trainNo,code,startTime,arriveTime,...}]}。
     */
    if (Array.isArray(payload?.trains)) {
      return payload.trains
        .map(train => {
          const code =
            text(train?.code).trim();

          if (!code) {
            return null;
          }

          return {
            trainNo:
              text(train?.trainNo).trim(),

            code,

            startCode: "",
            endCode: "",

            fromCode:
              text(train?.fromCode).trim(),

            toCode:
              text(train?.toCode).trim(),

            fromName:
              text(train?.fromName).trim(),

            toName:
              text(train?.toName).trim(),

            departTime:
              text(train?.startTime).trim(),

            arriveTime:
              text(train?.arriveTime).trim(),

            duration:
              text(train?.duration).trim(),

            canBuy:
              text(train?.canBuy).trim()
          };
        })
        .filter(Boolean);
    }

    const names =
      payload?.data?.map && typeof payload.data.map === "object"
        ? payload.data.map
        : {};

    const rows =
      Array.isArray(payload?.data?.result)
        ? payload.data.result
        : [];

    return rows
      .map(row => {
        if (!Array.isArray(row)) {
          return null;
        }

        const fromCode =
          text(row[6]).trim();

        const toCode =
          text(row[7]).trim();

        if (!fromCode || !toCode) {
          return null;
        }

        return {
          trainNo:
            text(row[2]).trim(),

          code:
            text(row[3]).trim(),

          startCode:
            text(row[4]).trim(),

          endCode:
            text(row[5]).trim(),

          fromCode,
          toCode,

          fromName:
            text(names[fromCode]) || fromCode,

          toName:
            text(names[toCode]) || toCode,

          departTime:
            text(row[8]).trim(),

          arriveTime:
            text(row[9]).trim(),

          duration:
            text(row[10]).trim(),

          canBuy:
            text(row[11]).trim()
        };
      })
      .filter(Boolean);
  }

  /*
   * 12306 经停表（czxx/queryByTrainNo）返回整条线路，
   * 必须按出发站 / 到达站站名切片。
   */
  /*
   * 兼容两种经停行形状：
   *   12306 原始 {station_name,arrive_time,start_time}
   *   代理归一 {name,arrive,depart}
   */
  function scheduleRowValue(row, original, proxy) {
    const value =
      row?.[original] ?? row?.[proxy];

    return text(value).trim();
  }

  function scheduleRowName(row) {
    return scheduleRowValue(
      row,
      "station_name",
      "name"
    );
  }

  function scheduleRowArrival(row) {
    const value =
      scheduleRowValue(
        row,
        "arrive_time",
        "arrive"
      );

    return value === "----" ? "" : value;
  }

  function scheduleRowDeparture(row) {
    const value =
      scheduleRowValue(
        row,
        "start_time",
        "depart"
      );

    return value === "----" ? "" : value;
  }

  function sliceSchedule(
    rows,
    fromName,
    toName
  ) {
    if (!Array.isArray(rows) || !rows.length) {
      return [];
    }

    const from =
      normalizeStationName(fromName);

    const to =
      normalizeStationName(toName);

    let startIndex =
      rows.findIndex(
        row =>
          normalizeStationName(
            scheduleRowName(row)
          ) === from
      );

    let endIndex =
      rows.findIndex(
        row =>
          normalizeStationName(
            scheduleRowName(row)
          ) === to
      );

    if (startIndex < 0 || endIndex < 0) {
      return [];
    }

    if (startIndex > endIndex) {
      return [];
    }

    return rows
      .slice(startIndex, endIndex + 1)
      .map((row, index, list) => ({
        name: scheduleRowName(row),

        arrival: scheduleRowArrival(row),

        departure: scheduleRowDeparture(row),

        isOrigin:
          index === 0,

        isDestination:
          index === list.length - 1
      }));
  }

  const CLOCK_PATTERN = /^(\d{1,2}):(\d{2})$/;

  function clockSeconds(value) {
    const match =
      CLOCK_PATTERN.exec(
        text(value).trim()
      );

    if (!match) {
      return null;
    }

    const hours =
      Number(match[1]);

    const minutes =
      Number(match[2]);

    if (
      hours > 48 ||
      minutes > 59
    ) {
      return null;
    }

    return hours * 3600 + minutes * 60;
  }

  function formatServiceTime(seconds) {
    /*
     * 跨日时刻保留 24:00 以上的写法（GTFS service time），
     * 只有负数才回卷，25:10:00 必须原样保留。
     */
    const value =
      seconds < 0
        ? ((seconds % 86400) + 86400) % 86400
        : seconds;

    const hours =
      Math.floor(value / 3600);

    const minutes =
      Math.floor((value % 3600) / 60);

    return (
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":00"
    );
  }

  /*
   * 经停时刻跨日进位：
   * 23:50 发车、次日 07:05 到达时，把进位后的秒数写成 31:05:00，
   * 这样 transit-position 可以直接比较，不需要猜测日期。
   */
  function normalizeStopTimes(stops) {
    let carry = 0;
    let previous = null;

    return stops.map(stop => {
      let departure =
        clockSeconds(stop.departure);

      let arrival =
        clockSeconds(stop.arrival);

      if (
        departure === null &&
        arrival === null
      ) {
        return {
          ...stop,

          departureSeconds: null,
          arrivalSeconds: null,

          departureTime: "",
          arrivalTime: ""
        };
      }

      if (departure === null) {
        departure = arrival;
      }

      if (arrival === null) {
        arrival = departure;
      }

      /*
       * 跨日进位只由「与前一站比较时时刻倒退」触发：
       * 23:50 发、次日 00:30 到时才会 carry += 86400。
       */
      if (
        previous !== null &&
        departure + carry < previous
      ) {
        carry += 86400;
      }

      let departureSeconds =
        departure + carry;

      let arrivalSeconds =
        arrival + carry;

      /*
       * 同一站内必然先到后发。若发车钟点早于到达钟点，
       * 说明该站跨零点（23:58 到、次日 00:02 发），进位给发车。
       * 注意：到 00:53 / 发 00:57 是正常停站，绝不能加一天——
       * 线上事故：旧实现写成 arrival<departure 就给到达加 24 小时，
       * 逐站累加后时刻显示成 24:53 / 49:35 / 100:03。
       */
      if (
        departureSeconds < arrivalSeconds
      ) {
        departureSeconds += 86400;
      }

      previous = Math.max(
        departureSeconds,
        arrivalSeconds
      );

      return {
        ...stop,

        departureSeconds,
        arrivalSeconds,

        departureTime:
          formatServiceTime(
            departureSeconds
          ),

        arrivalTime:
          formatServiceTime(
            arrivalSeconds
          )
      };
    });
  }

  async function fetchJson(
    url,
    signal
  ) {
    const response =
      await fetchWithTimeout(
        url,
        {
          credentials: "same-origin",

          headers: {
            Accept: "application/json"
          },

          signal
        },

        TIMEOUTS.railRequest,
        "rail_timeout",
        "Rail request timed out."
      );

    const payload =
      await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
      const error =
        providerError(
          payload?.error?.code ||
            "upstream_blocked",

          payload?.error?.message ||
            `Rail request failed (${response.status})`
        );

      error.httpStatus =
        response.status;

      throw error;
    }

    if (payload?.error) {
      throw providerError(
        payload.error.code ||
          "upstream_blocked",

        payload.error.message ||
          "Rail request failed."
      );
    }

    return payload;
  }

  /*
   * 中国铁路 12306 提供者。
   * 全部数据来自 12306 官方接口（经同源 api/railway-proxy.asp 代理），
   * 不生成任何虚构车次或线路。
   */
  class ChinaRailTransitProvider
    extends TransitProvider {

    constructor({
      endpoint = RAIL_ENDPOINT,
      geocoder = null
    } = {}) {
      super();

      this.endpoint = endpoint;

      this.geocoder =
        geocoder ||
        new PhotonGeocoder();

      this.stationCache = null;
    }

    async request(
      action,
      params,
      signal
    ) {
      const url =
        new URL(
          this.endpoint,
          global.location.origin
        );

      url.searchParams.set(
        "action",
        action
      );

      Object.entries(params || {}).forEach(
        ([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== ""
          ) {
            url.searchParams.set(
              key,
              String(value)
            );
          }
        }
      );

      return fetchJson(
        url.href,
        signal
      );
    }

    async getStations(signal) {
      if (this.stationCache) {
        return this.stationCache;
      }

      const payload =
        await this.request(
          "stations",
          {},
          signal
        );

      /*
       * 代理返回 {name,code,pinyin,abbr,city}，
       * 统一到 parseStationTable 的内部形状（简拼 shortPinyin）。
       */
      const stations = (
        Array.isArray(payload?.stations)
          ? payload.stations
          : []
      ).map(station => ({
        code:
          text(station?.code).trim(),

        name:
          text(station?.name).trim(),

        pinyin:
          text(station?.pinyin).trim(),

        shortPinyin:
          text(
            station?.shortPinyin ??
              station?.abbr
          ).trim()
      }));

      if (!stations.length) {
        throw providerError(
          "station_not_found",
          "中国铁路车站表为空。"
        );
      }

      this.stationCache =
        stations;

      return stations;
    }

    async searchStops(
      query,
      signal
    ) {
      const stations =
        await this.getStations(signal);

      return stationSuggestions(
        stations,
        query,
        6
      );
    }

    async resolveStation(
      query,
      signal
    ) {
      const stations =
        await this.getStations(signal);

      const station =
        matchStation(
          stations,
          query
        );

      if (!station) {
        throw providerError(
          "station_not_found",
          "未在中国铁路车站表中找到该站名。"
        );
      }

      return station;
    }

    async getLeftTicket(
      {
        from,
        to,
        date
      },
      signal
    ) {
      const payload =
        await this.request(
          "leftTicket",
          {
            from: from.code,
            to: to.code,
            date
          },
          signal
        );

      if (
        payload?.error?.code ===
          "presale" ||
        payload?.error?.code ===
          "upstream_blocked"
      ) {
        throw providerError(
          payload.error.code,
          payload.error.message
        );
      }

      const trains =
        parseLeftTicket(payload);

      if (
        !trains.length &&
        text(payload?.message)
      ) {
        throw providerError(
          "presale",
          text(payload.message)
        );
      }

      return trains;
    }

    /*
     * 车次候选按发车时间排序，供前端列出 ±5 趟可切换。
     */
    pickTrains(trains) {
      return [...trains]
        .sort(
          (a, b) =>
            text(a.departTime).localeCompare(
              text(b.departTime)
            )
        )
        .slice(0, 10);
    }

    async getSchedule(
      {
        trainNo,
        fromCode,
        toCode,
        fromName,
        toName,
        date
      },
      signal
    ) {
      const payload =
        await this.request(
          "schedule",
          {
            trainNo,
            from: fromCode,
            to: toCode,
            date
          },
          signal
        );

      /*
       * 代理返回 {stations:[{no,name,arrive,depart,stopover}]}；
       * 同时容忍 12306 原始 data 形状，便于直接测试。
       */
      const rows = Array.isArray(
        payload?.stations
      )
        ? payload.stations
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.data)
            ? payload.data.data
            : [];

      const sliced =
        sliceSchedule(
          rows,
          fromName,
          toName
        );

      if (sliced.length < 2) {
        throw providerError(
          "schedule_failed",
          "车次经停时刻获取失败。"
        );
      }

      return sliced;
    }

    /*
     * 按经停顺序用 Photon 串行地理编码，
     * 任何一个站查不到就保留 null，绝不编造坐标。
     * 返回值与 stops 一一对应，便于把坐标写回经停站。
     */
    async geocodeStops(
      stops,
      language,
      signal
    ) {
      const points = [];

      let bias = null;

      for (const stop of stops) {
        if (
          !stop.name ||
          signal?.aborted
        ) {
          points.push(null);
          continue;
        }

        let match = null;

        try {
          const results =
            await this.geocoder.search(
              stop.name,
              {
                signal,
                bias,
                language,
                limit: 1
              }
            );

          match =
            results[0] || null;
        } catch (_) {
          /*
           * 单个站地理编码失败不阻断时刻表，
           * 该站保留 null 坐标即可。
           */
          match = null;
        }

        if (match) {
          bias = {
            latitude:
              match.latitude,

            longitude:
              match.longitude
          };
        }

        points.push(match);
      }

      return points;
    }

    async searchJourney(
      {
        origin,
        destination,
        departureTime,
        trainNo = null,
        language = "zh"
      },
      signal
    ) {
      const departureValue =
        text(departureTime);

      const date =
        /^\d{4}-\d{2}-\d{2}$/
          .test(
            departureValue.slice(0, 10)
          )
          ? departureValue.slice(0, 10)
          : new Date()
              .toISOString()
              .slice(0, 10);

      const [
        originStation,
        destinationStation
      ] = await Promise.all([
        this.resolveStation(
          origin,
          signal
        ),

        this.resolveStation(
          destination,
          signal
        )
      ]);

      if (
        originStation.code ===
        destinationStation.code
      ) {
        throw providerError(
          "no_train",
          "出发站与到达站相同。"
        );
      }

      const trains =
        await this.getLeftTicket(
          {
            from: originStation,
            to: destinationStation,
            date
          },
          signal
        );

      if (!trains.length) {
        throw providerError(
          "no_train",
          "该日期与区间未找到直达车次。"
        );
      }

      const candidates =
        this.pickTrains(trains);

      /*
       * 12306 同城查询：查询「成都」可能返回「成都东」发车的车次，
       * 个别车次 czzz 又可能无经停数据。按候选顺序有界尝试，
       * 每次用车次行内真实站名切片；全部失败才抛错。
       */
      const preferred =
        trainNo &&
        candidates.find(
          item => item.trainNo === trainNo
        );

      const queue = preferred
        ? [preferred]
        : candidates.slice(
            0,
            RAIL_SCHEDULE_MAX_ATTEMPTS
          );

      if (!queue.length) {
        throw providerError(
          "schedule_failed",
          "车次经停时刻获取失败。"
        );
      }

      let selected = null;
      let sliced = null;
      let lastScheduleError = null;

      for (const candidate of queue) {
        if (signal?.aborted) {
          break;
        }

        try {
          const legFromName =
            text(candidate.fromName).trim() ||
            originStation.name;

          const legToName =
            text(candidate.toName).trim() ||
            destinationStation.name;

          const rows =
            await this.getSchedule(
              {
                trainNo: candidate.trainNo,

                fromCode:
                  text(candidate.fromCode).trim() ||
                  originStation.code,

                toCode:
                  text(candidate.toCode).trim() ||
                  destinationStation.code,

                fromName: legFromName,
                toName: legToName,

                date
              },
              signal
            );

          const stopTimes =
            normalizeStopTimes(rows);

          const originIndex =
            stopTimes.findIndex(
              stop =>
                normalizeStationName(stop.name) ===
                normalizeStationName(legFromName)
            );

          const destinationIndex =
            stopTimes.findIndex(
              stop =>
                normalizeStationName(stop.name) ===
                normalizeStationName(legToName)
            );

          if (
            originIndex < 0 ||
            destinationIndex <= originIndex
          ) {
            throw providerError(
              "schedule_failed",
              "经停表中未找到出发站或到达站。"
            );
          }

          selected = candidate;
          sliced = stopTimes.slice(
            originIndex,
            destinationIndex + 1
          );
          break;
        } catch (error) {
          if (
            error?.name === "AbortError" ||
            signal?.aborted
          ) {
            throw error;
          }
          lastScheduleError = error;
        }
      }

      if (!selected || !sliced) {
        throw (
          lastScheduleError ||
          providerError(
            "schedule_failed",
            "车次经停时刻获取失败。"
          )
        );
      }

      /*
       * 与 sliced 一一对应的地理编码结果（可能含 null）。
       */
      const geocoded =
        await this.geocodeStops(
          sliced,
          language,
          signal
        );

      const shape =
        geocoded
          .filter(Boolean)
          .map(match => [
            match.longitude,
            match.latitude
          ]);

      const first = sliced[0];
      const last =
        sliced[sliced.length - 1];

      const originPoint =
        geocoded[0];

      const destinationPoint =
        geocoded[
          geocoded.length - 1
        ];

      return {
        provider: "china-rail",

        feedKey: null,

        tripId:
          `${selected.trainNo}/${selected.trainNo}`,

        routeId:
          selected.code,

        operator: {
          id: "cn-national-rail",
          name: "中国铁路"
        },

        route: {
          onestopId:
            `cn-national-rail-${selected.code}`,

          shortName:
            selected.code,

          longName:
            `${originStation.name} → ${destinationStation.name}`,

          type: null
        },

        origin: {
          stopId:
            originStation.code,

          onestopId:
            `cn-${originStation.code}`,

          name:
            first?.name ||
            originStation.name,

          latitude:
            number(
              originPoint?.latitude
            ),

          longitude:
            number(
              originPoint?.longitude
            ),

          departureTime:
            first?.departureTime ||
            `${selected.departureTime}:00`
        },

        destination: {
          stopId:
            destinationStation.code,

          onestopId:
            `cn-${destinationStation.code}`,

          name:
            last?.name ||
            destinationStation.name,

          latitude:
            number(
              destinationPoint?.latitude
            ),

          longitude:
            number(
              destinationPoint?.longitude
            ),

          arrivalTime:
            last?.arrivalTime ||
            `${selected.arriveTime}:00`
        },

        serviceDate:
          date,

        /*
         * 12306 时刻为中国标准时间（UTC+8），
         * 由 transit-position 用该偏移换算本地比较基准。
         */
        serviceTimezoneOffsetMinutes: 480,

        shape,

        stopTimes: sliced.map(
          (stop, index) => {
            const point =
              geocoded[index];

            return {
              stop: {
                stop_id: stop.name,

                stop_name: stop.name,

                onestopId:
                  `cn-${stop.name}`,

                onestop_id:
                  `cn-${stop.name}`,

                latitude:
                  number(
                    point?.latitude
                  ),

                longitude:
                  number(
                    point?.longitude
                  ),

                geometry:
                  point
                    ? {
                        type: "Point",

                        coordinates: [
                          point.longitude,
                          point.latitude
                        ]
                      }
                    : null
              },

              arrival_time:
                stop.arrivalTime,

              departure_time:
                stop.departureTime,

              arrivalSeconds:
                stop.arrivalSeconds,

              departureSeconds:
                stop.departureSeconds,

              status: stop.isOrigin
                ? "origin"
                : stop.isDestination
                  ? "destination"
                  : "pass"
            };
          }
        ),

        candidates: candidates.map(
          item => ({
            trainNo: item.trainNo,

            code: item.code,

            departTime:
              item.departTime,

            arriveTime:
              item.arriveTime,

            duration:
              item.duration,

            canBuy:
              item.canBuy,

            selected:
              item.trainNo ===
              selected.trainNo
          })
        ),

        source: {
          code: "12306",
          label: "中国铁路 12306"
        },

        realtime: {
          available: false,

          vehiclePosition: null,

          scheduleRelationship:
            "SCHEDULED",

          alerts: []
        }
      };
    }
  }

  /*
   * 阶段总预算：到点取消子链并抛 TimeoutError，
   * 保证「照会中」状态永远有界。
   * race 对入参 promise 均挂有 handler，
   * 输家后续 rejection 不会泄漏为 unhandledrejection。
   */
  function withBudget(
    promise,
    timeoutMs,
    code,
    message,
    controller
  ) {
    let timer = null;

    const budget = new Promise((_, reject) => {
      timer = setTimeout(() => {
        if (controller) {
          controller.abort();
        }

        reject(timeoutError(code, message));
      }, timeoutMs);
    });

    return Promise.race([promise, budget])
      .finally(() => clearTimeout(timer));
  }

  /*
   * GTFS 优先；除用户取消外，GTFS 阶段任何失败
   * （找不到站点/班次、网络错误、限流、超时、上游异常）
   * 一律回落 12306，由 12306 给出确定结果或明确错误，
   * 绝不把用户卡在 GTFS 阶段（线上事故：请求挂起 → 永远「照会中」）。
   * 12306 阶段同样带总预算：超时上抛 rail_timeout 而非永久挂起。
   */
  async function searchJourneyWithFallback(
    {
      transitland,
      chinaRail,
      origin,
      destination,
      departureTime,
      trainNo = null,
      language = "zh",
      onFallback = null
    },
    signal
  ) {
    const gtfsController = new AbortController();
    const railController = new AbortController();

    const relayGtfs = () => gtfsController.abort();
    const relayRail = () => railController.abort();

    if (signal) {
      if (signal.aborted) {
        gtfsController.abort();
        railController.abort();
      } else {
        signal.addEventListener("abort", relayGtfs);
        signal.addEventListener("abort", relayRail);
      }
    }

    try {
      try {
        return {
          journey:
            await withBudget(
              transitland.searchJourney(
                {
                  origin,
                  destination,
                  departureTime
                },
                gtfsController.signal
              ),

              TIMEOUTS.gtfsStage,
              "transit_timeout",
              "GTFS query timed out.",
              gtfsController
            ),

          source: "transitland"
        };
      } catch (error) {
        /*
         * 只有「用户主动取消」（外部 signal 已中止）才整体放弃。
         * GTFS 阶段自身的 AbortError（fetchWithTimeout 内部控制器、
         * 阶段预算超时、或上游偶发中断）必须继续回落 12306，
         * 否则界面会永远停在「照会中」且一个铁路请求都不会发出
         * （线上事故：连点查询后 transit-proxy 显示 canceled，
         *   onFallback 未触发，leftTicket 从未发出）。
         */
        if (
          error?.name === "AbortError" &&
          signal?.aborted
        ) {
          throw error;
        }

        onFallback?.(
          text(error?.code) ||
            "transit_failed"
        );
      }

      return {
        journey:
          await withBudget(
            chinaRail.searchJourney(
              {
                origin,
                destination,
                departureTime,
                trainNo,
                language
              },
              railController.signal
            ),

            TIMEOUTS.railStage,
            "rail_timeout",
            "Rail query timed out.",
            railController
          ).catch(error => {
            /*
             * 12306 是最后兜底：此处 AbortError 若是用户取消则照常上抛；
             * 若是阶段内部中止（预算超时/请求中断），转成显式错误，
             * 避免界面停在「照会中」却什么也不显示。
             */
            if (
              error?.name === "AbortError" &&
              !signal?.aborted
            ) {
              throw providerError(
                "rail_failed",
                "Rail query was interrupted."
              );
            }

            throw error;
          }),

        source: "china-rail"
      };
    } finally {
      if (signal) {
        signal.removeEventListener("abort", relayGtfs);
        signal.removeEventListener("abort", relayRail);
      }
    }
  }

  global.WebWindowsTransit =
    Object.freeze({
      TransitProvider,
      TransitlandTransitProvider,
      ChinaRailTransitProvider,
      PhotonGeocoder,
      searchJourneyWithFallback,
      fetchWithTimeout,
      parseStationTable,
      matchStation,
      stationSuggestions,
      parseLeftTicket,
      sliceSchedule,
      normalizeStopTimes,
      routeIcon,
      trainIcon
    });

})(
  typeof window !== "undefined"
    ? window
    : globalThis
);
