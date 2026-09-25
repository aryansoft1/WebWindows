(function (global) {
  "use strict";

  const ENDPOINT = "/api/transit-proxy.asp";
  const RAIL_ENDPOINT = "/api/railway-proxy.asp";

  /*
   * 全球长途 provider 的同源代理。
   * Key 在服务器端配置文件里，浏览器永远拿不到 Key；
   * 未配置时 action=capabilities 返回 enabled:false，
   * 客户端整段跳过 —— 零请求、零行为变化。
   */
  const LONGDISTANCE_ENDPOINT =
    "/api/longdistance-proxy.asp";

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
      /*
       * 海外阶段预算：原来 8 秒，而「按线路去重」之前的实现要对
       * 同一线路同一 stop pattern 连发 11 次 trip 详情（实测 8.6 秒），
       * 必然撞穿预算 → 被判 transit_timeout → 回落 12306 → 对海外线路
       * 显示成「上游故障」。去重后典型 1~2 秒，这里放宽到 14 秒作为余量。
       */
      gtfsStage: 20000,
      railStage: 30000,

      /*
       * 长途阶段只在「两个免费源都覆盖不到」时才跑，且仅在
       * 12306 明确回 station_not_found（= 不是中国境内车站）时触发。
       * 预算比 GTFS 短：付费调用不能拖住界面，且 Rome2Rio 自身
       * 响应通常在 1~3 秒内。
       */
      longDistanceStage: 15000
    },
    global.__WENDAO_TRANSIT_TIMEOUTS__ || {}
  );

  /*
   * 经停表按候选车次顺序最多尝试的次数：
   * 12306 同城查询下首班车可能不停查询站，个别车次 czzz 也可能
   * 无经停数据——逐个有界回退，全部失败才报 schedule_* 错误。
   */
  const RAIL_SCHEDULE_MAX_ATTEMPTS = 5;

  /*
   * 海外（GTFS）候选班次取样上限：
   *  - GTFS_TRIP_PER_ROUTE：同一条线路最多取几个不同 stop_pattern；
   *  - GTFS_TRIP_CANDIDATE_LIMIT：总共最多取几趟去重后的班次去查经停表。
   * 取值依据实测：单次 trip 详情约 0.4~0.7 秒，去重后典型 1~3 趟，
   * 阶段耗时 1~2 秒；即使最坏 8 趟也在 14 秒预算内。
   */
  const GTFS_TRIP_PER_ROUTE = 2;
  const GTFS_TRIP_CANDIDATE_LIMIT = 6;

  /* 起点发车扫描上限：单次请求，供跨线路取样使用。 */
  const GTFS_DEPARTURE_SCAN_LIMIT = 30;

  /*
   * 出发站发车列表 → 候选班次（按 route + stop_pattern 去重，跨线路轮转）。
   *
   * 同一 route + stop_pattern 的班次共用同一份 stop_times，逐班取详情
   * 纯属浪费：实测「東京」站 40 班全属丸ノ内線同一 pattern，
   * 原实现连发 11 次相同请求、耗时 8.6 秒，撞穿 8 秒阶段预算后
   * 被判「上游超时」，把「数据源没这条直达线路」误报成「上游故障」。
   * 去重后请求数降到 1~3，且因为跨线路轮取，线路覆盖面反而更广。
   */
  function diversifyTripCandidates(
    departures
  ) {
    const seenPatterns = new Set();
    const byRoute = new Map();

    for (
      const departure
      of departures
    ) {
      const trip = departure?.trip;
      const route = routeKey(trip?.route);

      if (!trip || !route) {
        continue;
      }

      const patternKey =
        [
          route,
          text(trip.stop_pattern_id) ||
            text(trip.direction_id) ||
            text(trip.trip_headsign)
        ].join("|");

      if (seenPatterns.has(patternKey)) {
        continue;
      }

      seenPatterns.add(patternKey);

      if (!byRoute.has(route)) {
        byRoute.set(
          route,
          []
        );
      }

      byRoute
        .get(route)
        .push(departure);
    }

    /*
     * 轮转取样：先取每条线路的第 1 个 pattern，再取每条第 2 个……
     * 保证在总数上限内覆盖尽可能多的线路（原先按时间顺序取，
     * 前 N 班很可能全落在同一条线路上）。
     */
    const result = [];
    const usedPerRoute = new Map();
    let round = 0;

    while (result.length < GTFS_TRIP_CANDIDATE_LIMIT) {
      let added = false;

      for (
        const [route, list]
        of byRoute.entries()
      ) {
        if (result.length >= GTFS_TRIP_CANDIDATE_LIMIT) {
          break;
        }

        const used = usedPerRoute.get(route) || 0;

        if (
          used >= GTFS_TRIP_PER_ROUTE ||
          !list[used]
        ) {
          continue;
        }

        result.push(list[used]);
        usedPerRoute.set(
          route,
          used + 1
        );
        added = true;
      }

      if (!added) {
        break;
      }

      round++;
    }

    return result;
  }

  /*
   * 「运行中/已通过」车次的展示配额（仅当查询日 = 北京当天时生效）：
   * 12306 对当天只返回未发车车次（实测北京 23:12 只剩 2 趟），
   * 代理的「当日快照」把当天早些时候查到的车次补回来，
   * 客户端据此把运行中车次排在候选前列并标状态。
   */
  const RAIL_RUNNING_CANDIDATE_LIMIT = 5;
  const RAIL_PAST_CANDIDATE_LIMIT = 3;
  const RAIL_FUTURE_CANDIDATE_LIMIT = 10;

  /* 12306 时刻为 UTC+8；判定运行中状态时必须用中国标准时间比较。 */
  const RAIL_TIMEZONE_OFFSET_MINUTES = 480;

  /*
   * 当日车次本地累积（客户端快照）。
   *
   * 为什么必须有：12306 对「当天」只返回尚未发车的车次（北京 10:31 只剩
   * 10:42 之后的 77 趟），所以「运行中/已通过」车次只能靠「早些时候抓到过
   * 的列表」。而服务端快照在本托管上无法落盘（实测应用池对 data/、
   * cloud/file/、logs/ 均无写权限），只能活在 Application 内存里，
   * 应用池一回收就丢。这里在浏览器侧按「日期+区间」持久化已见车次。
   */
  const RAIL_LOCAL_SNAPSHOT_PREFIX =
    "webwindows.transit.rail.v1.";

  const RAIL_LOCAL_SNAPSHOT_MAX_TRAINS = 400;

  /*
   * 跨起点站轮转取样：把有限的 trip 详情预算公平分给不同 feed 的候选站。
   *
   * 这是「你查的都是公交车，所以查不到」的第二个成因：预算若按站顺序分配，
   * 会被第一个候选站吃掉（市内公交/地铁在候选里通常排最前且必有发车），
   * 铁路站 / 高速巴士站一次都轮不到。改成轮转后，3 个候选站各先得到 1 次
   * 机会，再依次追加，直到用满 limit。
   */
  function roundRobinTripCandidates(
    groups,
    limit
  ) {
    const result = [];
    let round = 0;

    while (result.length < limit) {
      let added = false;

      for (
        const group
        of groups
      ) {
        if (result.length >= limit) {
          break;
        }

        const departure =
          group.departures[round];

        if (!departure) {
          continue;
        }

        result.push({
          stop: group.stop,
          departure
        });
        added = true;
      }

      if (!added) {
        break;
      }

      round++;
    }

    return result;
  }

  function railSnapshotKey(
    date,
    fromCode,
    toCode
  ) {
    return (
      RAIL_LOCAL_SNAPSHOT_PREFIX +
      date +
      "." +
      fromCode +
      "." +
      toCode
    );
  }

  function readLocalSnapshot(
    key
  ) {
    try {
      const raw =
        window.localStorage.getItem(
          key
        );

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  function writeLocalSnapshot(
    key,
    trains
  ) {
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify(
          trains.slice(
            0,
            RAIL_LOCAL_SNAPSHOT_MAX_TRAINS
          )
        )
      );
    } catch {
      // 存储不可用或已满时忽略，不影响当次查询
    }
  }

  function mergeRailSnapshots(
    fresh,
    cached
  ) {
    const byTrainNo = new Map();

    for (const train of cached) {
      const no = text(train?.trainNo).trim();

      if (no) {
        byTrainNo.set(no, train);
      }
    }

    for (const train of fresh) {
      const no = text(train?.trainNo).trim();

      if (no) {
        byTrainNo.set(no, train);
      }
    }

    return [...byTrainNo.values()].slice(
      0,
      RAIL_LOCAL_SNAPSHOT_MAX_TRAINS
    );
  }

  function text(value) {
    return value === null || value === undefined
      ? ""
      : String(value);
  }

  /* 中国标准时间下的日期与 HH:MM（不受浏览器时区影响）。 */
  function beijingClock(now = Date.now()) {
    const shifted =
      new Date(
        now +
          RAIL_TIMEZONE_OFFSET_MINUTES * 60000
      );

    const pad = value =>
      String(value).padStart(2, "0");

    return {
      dateKey:
        `${shifted.getUTCFullYear()}-${pad(
          shifted.getUTCMonth() + 1
        )}-${pad(shifted.getUTCDate())}`,

      seconds:
        shifted.getUTCHours() * 3600 +
        shifted.getUTCMinutes() * 60 +
        shifted.getUTCSeconds()
    };
  }

  /* "02:13" / "24:28" → 秒；跨日 24 点以上允许（12306 跨零点车次）。 */
  function railSeconds(value) {
    const match =
      /^(\d{1,2}):(\d{2})$/.exec(
        text(value).trim()
      );

    if (!match) {
      return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (
      !Number.isFinite(hours) ||
      !Number.isFinite(minutes) ||
      hours > 47 ||
      minutes > 59
    ) {
      return null;
    }

    return hours * 3600 + minutes * 60;
  }

  /* 两个 ISO 日期相差几天（todayKey - serviceDate）：0=今天，1=昨天。 */
  function railDayDifference(
    todayKey,
    serviceDate
  ) {
    const today = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      text(todayKey).trim()
    );
    const service =
      /^(\d{4})-(\d{2})-(\d{2})$/.exec(
        text(serviceDate).trim()
      );

    if (!today || !service) {
      return null;
    }

    const todayMs = Date.UTC(
      Number(today[1]),
      Number(today[2]) - 1,
      Number(today[3])
    );

    const serviceMs = Date.UTC(
      Number(service[1]),
      Number(service[2]) - 1,
      Number(service[3])
    );

    if (
      !Number.isFinite(todayMs) ||
      !Number.isFinite(serviceMs)
    ) {
      return null;
    }

    return Math.round(
      (todayMs - serviceMs) / 86400000
    );
  }

  /*
   * 车次状态：running（运行中）/ past（已通过）/ upcoming（未发车）。
   * 全部按中国标准时间比较（浏览器可能在 JST 等其它时区）。
   * 跨零点车次要按「服务日零点起的绝对秒」判断：23:30 发车、次日 02:10 到，
   * 在次日 00:00 仍属运行中，不能因为 serviceDate 已变成昨天就判成未发车。
   */
  function classifyRailTrain(
    train,
    clock
  ) {
    const dayOffset = railDayDifference(
      clock.dateKey,
      train?.serviceDate
    );

    if (
      dayOffset === null ||
      dayOffset < 0 ||
      dayOffset > 2
    ) {
      return "upcoming";
    }

    const depart = railSeconds(
      train?.departTime
    );

    if (depart === null) {
      return "upcoming";
    }

    let arrive = railSeconds(
      train?.arriveTime
    );

    if (
      arrive !== null &&
      arrive <= depart
    ) {
      arrive += 86400;
    }

    const now =
      clock.seconds + dayOffset * 86400;

    if (now < depart) {
      return "upcoming";
    }

    if (
      arrive !== null &&
      now < arrive
    ) {
      return "running";
    }

    return "past";
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

  /* 两点球面距离（公里），用于剔除「同名但异地」的错误站点。 */
  function haversineKm(a, b) {
    if (
      !Array.isArray(a) ||
      !Array.isArray(b) ||
      a.length < 2 ||
      b.length < 2
    ) {
      return null;
    }

    const toRad =
      value =>
        (Number(value) * Math.PI) / 180;

    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const dLat = lat2 - lat1;
    const dLon = toRad(b[0] - a[0]);

    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  /*
   * 站间行程时长（分钟）。
   * GTFS 允许 24:00:00 以上的 service time（跨日车次），
   * 这里按绝对秒差算，不做时钟回绕处理。
   */
  function legDurationMinutes(
    from,
    to
  ) {
    const toSeconds = value => {
      const match =
        String(value || "")
          .match(
            /^(\d{1,3}):(\d{2})(?::(\d{2}))?$/
          );

      if (!match) {
        return null;
      }

      return (
        Number(match[1]) * 3600 +
        Number(match[2]) * 60 +
        Number(match[3] || 0)
      );
    };

    const start = toSeconds(
      from?.departure_time ||
        from?.arrival_time
    );

    const end = toSeconds(
      to?.arrival_time ||
        to?.departure_time
    );

    if (
      start === null ||
      end === null ||
      end <= start
    ) {
      return null;
    }

    return (end - start) / 60;
  }

  function stopCoordinates(stop) {
    const point = stop?.geometry?.coordinates;

    if (
      Array.isArray(point) &&
      point.length >= 2 &&
      Number.isFinite(Number(point[0])) &&
      Number.isFinite(Number(point[1]))
    ) {
      return point;
    }

    return null;
  }

  function stopName(stop) {
    return text(
      stop?.stop_name ??
        stop?.name
    ).trim();
  }

  function stopNameMatchScore(
    stop,
    query
  ) {
    const needle =
      text(query)
        .trim()
        .toLocaleLowerCase();

    const name =
      stopName(stop)
        .toLocaleLowerCase();

    if (!needle) {
      return 3;
    }

    if (name === needle) {
      return 0;
    }

    if (name.startsWith(needle)) {
      return 1;
    }

    if (name.includes(needle)) {
      return 2;
    }

    return 3;
  }

  /*
   * 参考点：只取「名称匹配最佳」的那一组站点的质心。
   * 若把所有候选都算进质心，异地同名站（如北海道的「東京農業大学」）
   * 会把质心拉到北边，导致真正可达的城市全部被判超距。
   */
  function referencePoint(
    stops,
    query
  ) {
    const list = Array.isArray(stops)
      ? stops
      : [];

    if (!list.length) {
      return null;
    }

    let best = Infinity;

    for (const stop of list) {
      const score =
        stopNameMatchScore(
          stop,
          query
        );

      if (score < best) {
        best = score;
      }
    }

    const top = list.filter(
      stop =>
        stopNameMatchScore(
          stop,
          query
        ) === best
    );

    return centroidOf(top);
  }

  /*
   * 候选站排序（线上事故回归）：
   * stops 搜索是「名称包含即命中」，且不做任何相关性排序——
   * 搜「東京」返回的第一条可能是北海道旭川的「東京農業大学」
   * （坐标 144.23/43.97），盲取 [0] 必然拿错站、
   * getDepartures 返回 0，最终误报「无直达班次」。
   *
   * 排序规则：
   *   1) 名称完全一致 > 前缀匹配 > 包含匹配 > 其余
   *   2) 有坐标且落在 reference 附近者优先（剔除同名异地站）
   *   3) 按 onestop_id 去重
   */
  function rankStopCandidates(
    stops,
    query,
    reference,
    maxDistanceKm
  ) {
    const scored = [];
    const seen = new Set();

    for (const stop of Array.isArray(stops) ? stops : []) {
      const key =
        text(stop?.onestop_id) ||
        text(stop?.id);

      if (key && seen.has(key)) {
        continue;
      }

      if (key) {
        seen.add(key);
      }

      const nameScore =
        stopNameMatchScore(
          stop,
          query
        );

      const coordinates =
        stopCoordinates(stop);

      let distanceKm = null;

      if (
        coordinates &&
        reference
      ) {
        distanceKm = haversineKm(
          coordinates,
          reference
        );
      }

      /*
       * 明确超距（同名但异地）直接淘汰：
       * 例如「東京農業大学」在北海道，而终点在名古屋。
       */
      if (
        distanceKm !== null &&
        Number.isFinite(maxDistanceKm) &&
        distanceKm > maxDistanceKm
      ) {
        continue;
      }

      scored.push({
        stop,
        nameScore,
        distanceKm
      });
    }

    scored.sort((a, b) => {
      if (a.nameScore !== b.nameScore) {
        return a.nameScore - b.nameScore;
      }

      const da =
        a.distanceKm === null
          ? Number.POSITIVE_INFINITY
          : a.distanceKm;

      const db =
        b.distanceKm === null
          ? Number.POSITIVE_INFINITY
          : b.distanceKm;

      return da - db;
    });

    return scored.map(item => item.stop);
  }

  function centroidOf(stops) {
    const points = (
      Array.isArray(stops) ? stops : []
    )
      .map(stopCoordinates)
      .filter(Boolean);

    if (!points.length) {
      return null;
    }

    const sum = points.reduce(
      (acc, point) => [
        acc[0] + Number(point[0]),
        acc[1] + Number(point[1])
      ],
      [0, 0]
    );

    return [
      sum[0] / points.length,
      sum[1] / points.length
    ];
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

    /*
     * 700~799 是 GTFS **Bus Service (extended)**，不是自行车；
     * 旧实现返回 🚲 是明显误映射（用户 overseas 看到「公交/自行车」观感）。
     * 这里改为大巴 🚌，与 UI 里新增的 coach（大巴）图标语义一致。
     */
    if (value >= 700 && value < 800) {
      return "🚌";
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

      /*
       * 候选站排序：stops 搜索不做相关性排序，「東京」首条可能是
       * 北海道旭川的「東京農業大学」。以对方候选站质心为参考，
       * 剔除同名异地站，再按名称匹配度排序。
       */
      const originCandidates =
        rankStopCandidates(
          originStops,
          origin,
          referencePoint(
            destinationStops,
            destination
          ),
          GTFS_STOP_MAX_DISTANCE_KM
        );

      const destinationCandidates =
        rankStopCandidates(
          destinationStops,
          destination,
          referencePoint(
            originStops,
            origin
          ),
          GTFS_STOP_MAX_DISTANCE_KM
        );

      if (
        !originCandidates.length ||
        !destinationCandidates.length
      ) {
        throw providerError(
          "stop_not_found",
          "未找到出发站或到达站。"
        );
      }

      const destinationStop =
        destinationCandidates[0];

      /*
       * 逐个尝试起点候选：个别站点可能无当日班次或超时，
       * 不能因第一个候选失败就判定「无直达」（线上事故：
       * 盲取 [0] 拿到错误站点后直接报 direct_trip_not_found）。
       */

      /*
       * 记录「班次详情取不到」与「确实没有匹配路线」的区别：
       * 上游 trip 接口整体故障时，不能误报成「无直达班次」。
       * tripDetailOk 表示**至少有一趟**成功取到并解析了经停表——
       * 只要有过一次成功，就应该报「没有直达线路」而不是「上游故障」
       * （线上事故：東京→名古屋 其实 11 次 trip 请求全部 200 且各有 23~25 个
       *  经停，只因其中一次失败就把「无直达」说成「上游暂时无法提供」）。
       */
      let tripDetailFailed = false;

      /*
       * 被范围过滤排除掉的线路（地铁/捷运/通勤/市内公交…）。
       * 全部候选都被排除时，错误详情要带上它们 ——
       * 否则界面只会说「没有直达班次」，用户会以为线路不存在，
       * 而真实情况是「有地铁，但问乡海外不显示这类线路」。
       */
      const excludedServices = [];

      function rememberExcluded(
        name,
        classification
      ) {
        if (
          excludedServices.length < 6
        ) {
          excludedServices.push({
            name:
              String(name || "")
                .trim() || "—",
            kind:
              classification?.kind ||
              "other"
          });
        }
      }
      let tripDetailOk = false;

      /*
       * 起点候选**逐个**尝试，不再「第一个有发车的站就停」。
       *
       * 旧行为的实际后果（用户反馈「你查的都是公交车，所以查不到」）：
       * 「東京」「大分」这类站名被多个运营商/交通方式的 feed 同时收录，
       * 候选排序往往把市内公交/地铁的站排在前面，一旦它有发车就 break，
       * 于是高速巴士站、铁路站这些**真正可能到终点的候选永远不会被试**。
       * 现在每个有发车的候选站都进入后续匹配，trip 详情预算由
       * roundRobinTripCandidates 跨站轮转分配。
       */
      /*
       * 起点候选的 departures **并行**请求。
       *
       * Transitland 的 /stops/{key}/departures 极慢（实测 1.7s~5.7s，
       * 偶发 >10s 超时），而「多运营商同名站」需要试多个候选站；
       * 串行叠加后整次查询实测 29 秒，直接撞穿阶段预算 → 界面误报
       * 「上游故障」（真实页面回归）。并行后总耗时约等于最慢的那一个。
       * 单个候选失败只影响它自己（catch 后返回 null）。
       */
      const perStopCandidates = (
        await Promise.all(
          originCandidates
            .slice(
              0,
              GTFS_STOP_CANDIDATE_LIMIT
            )
            .map(async candidate => {
              if (signal?.aborted) {
                return null;
              }

              let list = [];

              try {
                const payload =
                  await this.getDepartures(
                    candidate,
                    date,
                    startTime,
                    signal
                  );

                list = departureArray(payload);
              } catch (error) {
                if (error?.name === "AbortError") {
                  throw error;
                }

                list = [];
              }

              if (!list.length) {
                return null;
              }

              /*
               * 取较多发车用于跨线路取样（同一请求，不额外耗时）：
               * 只看前 12 班时可能整段都落在同一条线路上。
               */
              const picks =
                diversifyTripCandidates(
                  list.slice(
                    0,
                    GTFS_DEPARTURE_SCAN_LIMIT
                  )
                );

              return picks.length
                ? {
                    stop: candidate,
                    departures: picks
                  }
                : null;
            })
        )
      ).filter(Boolean);

      if (!perStopCandidates.length) {
        throw providerError(
          "direct_trip_not_found",
          "当前数据源未覆盖这条线路（起点站没有可用的班次数据；仅支持无需换乘的直达行程）。"
        );
      }

      /*
       * 出发站发车列表 → 候选班次。
       *
       * 关键：同一 route + stop_pattern 的班次**共用同一份经停表**，
       * 逐班取 trip 详情是纯浪费。实测「東京」站 40 班全是丸ノ内線同一
       * pattern，于是发了 11 次完全相同的请求、耗时 8.6 秒，直接撞穿
       * 原 8s 的阶段预算 → 被判 transit_timeout → 回落到 12306 →
       * 界面显示「上游故障」，而真实结论是「这些数据源没有这条直达线路」。
       *
       * 所以这里按 (route, stop_pattern) 去重，并且**跨线路轮转**取样：
       * 每条线路最多 GTFS_TRIP_PER_ROUTE 个 pattern、总数不超过
       * GTFS_TRIP_CANDIDATE_LIMIT，既把耗时压到 1~2 秒，又让线路覆盖面
       * 反而更广（原先只看前 12 班，很可能全落在一条线路上）。
       */
      /*
       * 出发站发车列表 → 候选班次。两层去重/轮转，都是为了在有限请求预算内
       * 覆盖尽可能多的线路与运营商：
       *  1) 站间轮转（roundRobinTripCandidates）：不同 feed 的候选站轮流
       *     获得 trip 详情预算，避免预算全被第一个站吃掉；
       *  2) 站内按 (route, stop_pattern) 去重 + 跨线路轮转
       *     （diversifyTripCandidates）：同一份经停表绝不重复取。
       * 实测「東京」站 40 班全属丸ノ内線同一 pattern，旧实现连发 11 次
       * 相同请求、耗时 8.6 秒并撞穿阶段预算。
       */
      const tripCandidates =
        roundRobinTripCandidates(
          perStopCandidates,
          GTFS_TRIP_CANDIDATE_LIMIT
        );

      for (
        const entry
        of tripCandidates
      ) {
        const departure =
          entry.departure;

        const candidateStop =
          entry.stop;
        const departureTrip =
          departure?.trip;

        /*
         * Transitland 单班次端点只认**内部数字 id**（trip.id）：
         * /routes/{route_key}/trips/{内部id} → 200 且返回 stop_times；
         * 换成对外 trip_id（如 20B0809000）一律 500 "parameter error"。
         * 实测（同一线路同一班次）：
         *   20B0809000     → 500 parameter error（无经停，海外查询必然失败）
         *   12368625337    → 200，stop_times=18
         * 故优先用 id，缺失时才退回 trip_id（并让代理接受两种形态）。
         */
        const tripId =
          text(
            departureTrip?.id
          ) ||
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

        /*
         * 【海外范围过滤 · 第一道】
         * 用户只认城际/干线铁路、高铁（新干线、磁悬浮）与长途大巴；
         * 地下铁、捷运、subway、市区通勤铁路与市内公交一律不显示。
         * 在**取 trip 详情之前**就排除：既是正确性要求，也顺带省掉大量
         * 无用的经停表请求（实测「東京」站 40 班全是丸ノ内線）。
         */
        const earlyClass =
          classifyOverseasService({
            routeType:
              route?.route_type,

            names: [
              route?.route_short_name,
              route?.route_long_name,
              departureTrip?.trip_headsign
            ],

            agency:
              route?.agency
                ?.agency_name
          });

        if (!earlyClass.include) {
          rememberExcluded(
            route?.route_long_name ||
              route?.route_short_name,
            earlyClass
          );

          continue;
        }

        /*
         * 单趟 trip 详情失败（上游 500/超时/未授权）只跳过这一趟，
         * 不能让整次查询失败——否则一个坏 trip 就会让
         * 整个海外查询报「无直达班次」（线上事故：
         * Transitland trip 接口返回 500，首趟即中止全部搜索）。
         */
        let tripPayload = null;

        try {
          tripPayload =
            await this.getTrip(
              route,
              tripId,
              signal
            );
        } catch (error) {
          if (error?.name === "AbortError") {
            throw error;
          }

          tripDetailFailed = true;
          continue;
        }

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

        tripDetailOk = true;

        const originIndex =
          trip.stop_times
            .findIndex(
              item =>
                stopMatches(
                  item?.stop,
                  candidateStop
                )
            );

        const destinationIndex =
          trip.stop_times
            .findIndex(
              (item, index) =>
                index >
                  originIndex &&
                destinationCandidates.some(
                  candidate =>
                    stopMatches(
                      item?.stop,
                      candidate
                    )
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

        /*
         * 【海外范围过滤 · 第二道】
         * 实测长途大巴与市内公交**都是 route_type=3**，光看制式分不出
         * 长途/市内，所以用行程尺度兜底：≤45 分钟且 ≤40 公里判为市内。
         * 高铁在第一道已按线路名放行，不受里程限制
         * （东京→品川的新干线只有 12 分钟，也是该显示的）。
         */
        const gateRoute = {
          ...(departureTrip?.route || {}),
          ...(trip?.route || {})
        };

        const finalClass =
          classifyOverseasService({
            routeType:
              gateRoute?.route_type,

            names: [
              gateRoute?.route_short_name,
              gateRoute?.route_long_name,
              trip?.trip_headsign
            ],

            agency:
              gateRoute?.agency
                ?.agency_name,

            durationMinutes:
              legDurationMinutes(
                originTime,
                destinationTime
              ),

            distanceKm:
              haversineKm(
                [
                  originPoint?.longitude,
                  originPoint?.latitude
                ],
                [
                  destinationPoint?.longitude,
                  destinationPoint?.latitude
                ]
              )
          });

        if (!finalClass.include) {
          rememberExcluded(
            gateRoute?.route_long_name ||
              gateRoute?.route_short_name,
            finalClass
          );

          continue;
        }

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

        /*
         * 车型判定（高铁/普通火车/大巴）依赖 route_type，但 Transitland 的
         * **trip 详情响应里 route 是空对象**（实测 keys=[]），
         * route_type / route_short_name 只在 departures 列表里。
         * 这里合并两处：trip 优先、缺失字段用列表补齐——
         * 否则海外巴士会被当成轨道，标题与地图标记都显示成普通火车。
         */
        const listRoute =
          departure?.trip?.route || {};

        const detailRoute =
          trip?.route || {};

        const routeMeta = {
          ...listRoute,
          ...detailRoute
        };

        return {
          provider:
            "transitland",

          feedKey,

          tripId,

          /*
           * 范围分类结果：highspeed（高铁/新干线/磁悬浮）→ 火箭头图标，
           * rail（城际/干线铁路）→ 普通火车，coach（长途大巴）→ 大巴。
           * 图标层直接读这个字段，不必再猜 route_type。
           */
          serviceClass:
            finalClass.kind,

          serviceScope:
            finalClass.reason,

          routeId:
            text(
              routeMeta
                ?.route_id
            ),

          operator: {
            id:
              text(
                routeMeta
                  ?.agency
                  ?.onestop_id
              ),

            name:
              text(
                routeMeta
                  ?.agency
                  ?.agency_name
              )
          },

          route: {
            onestopId:
              text(
                routeMeta
                  ?.onestop_id
              ),

            shortName:
              text(
                routeMeta
                  ?.route_short_name
              ) ||
              /*
               * Transitland 的单班次响应里 route 常常只有 id/onestop_id，
               * 线路名缺失时回落 trip_short_name / trip_headsign，
               * 否则界面只能显示「公共交通」占位（实测修复后仍见占位）。
               */
              text(
                trip?.trip_short_name
              ) ||
              text(
                trip?.trip_headsign
              ),

            longName:
              text(
                routeMeta
                  ?.route_long_name
              ),

            type:
              number(
                routeMeta
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

      /*
       * 错误归因：
       *  - 一趟都没解析成功，且确实有请求失败 → 上游故障（gtfs_trip_unavailable）
       *  - 否则（拿到过经停表，只是没有一班到终点）→ 如实说「没有直达线路」，
       *    并把「已检查的线路」挂成结构化详情（details.routes）。
       *
       * 文案不在 provider 里定死：provider 是共享库，界面有中/繁/英/日四语，
       * 因此只抛中文 message 供日志/直调使用，**用户可见文案由 app 按当前
       * 语言组装**（线上事故：日文界面直接显示中文「当前数据源未覆盖…」）。
       */
            const routeNames =
        tripCandidates
          .map(
            entry =>
              entry.departure
          )
          .map(
            candidate =>
              text(
                candidate
                  ?.trip
                  ?.route
                  ?.route_short_name
              ) ||
              text(
                candidate
                  ?.trip
                  ?.route
                  ?.route_long_name
              )
          )
          .filter(Boolean);

      const uniqueRouteNames = [
        ...new Set(routeNames)
      ];

      const upstreamBroken =
        !tripDetailOk && tripDetailFailed;

      /*
       * 全部候选都被「海外显示范围」过滤掉（而不是没有班次）：
       * 独立错误码，界面明确告诉用户「找到的是地铁/通勤/市内公交，
       * 问乡海外只显示城际/干线铁路、高铁与长途大巴」，
       * 而不是含糊地说「没有直达班次」—— 否则用户会以为线路不存在。
       *
       * 上游故障优先：连经停表都没取到时，先说上游问题。
       */
      const allExcluded =
        !tripDetailOk &&
        !upstreamBroken &&
        excludedServices.length > 0;

      const error = providerError(
        upstreamBroken
          ? "gtfs_trip_unavailable"
          : allExcluded
            ? "out_of_scope_service"
            : "direct_trip_not_found",
        upstreamBroken
          ? "公共交通上游暂时无法提供班次详情，请稍后重试。"
          : allExcluded
            ? "找到的班次都不在问乡海外的显示范围内（仅显示城际/干线铁路、高铁与长途大巴）。"
            : `当前数据源未覆盖这条直达线路（已检查 ${
                uniqueRouteNames
                  .slice(0, 4)
                  .join("、") || "相关线路"
              }，共 ${uniqueRouteNames.length} 条；仅支持无需换乘的直达行程）。`
      );

      error.details = {
        routes: uniqueRouteNames,

        /* 界面上「已排除：××（地铁/通勤/市内公交）」用 */
        excluded: allExcluded
          ? excludedServices
          : []
      };

      throw error;
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

  /*
   * GTFS 候选站策略：
   *  - MAX_DISTANCE_KM：同名异地站剔除阈值（东京↔名古屋约 290km，
   *    旭川的「東京農業大学」距名古屋约 1000+km，应被剔除）
   *  - CANDIDATE_LIMIT：起点最多尝试的候选站数
   */
  const GTFS_STOP_MAX_DISTANCE_KM = 400;
  const GTFS_STOP_CANDIDATE_LIMIT = 4;

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
        date,
        includeElapsed = false
      },
      signal
    ) {
      const payload =
        await this.request(
          "leftTicket",
          {
            from: from.code,
            to: to.code,
            date,

            /*
             * 当天/过去日期：要求代理返回「当日快照」，
             * 否则 12306 只给未发车车次，运行中车次根本拿不到。
             */
            includeElapsed:
              includeElapsed ? "1" : ""
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

      const serviceDate =
        text(payload?.date).trim() ||
        date;

      const withDate = trains.map(
        train => ({
          ...train,

          /*
           * 状态判定需要知道这趟车属于哪一天：
           * 代理的快照可能把不同查询日的数据混在一起（仅过去日期），
           * 故按返回体里的 date 为准，缺失时回落到请求日期。
           */
          serviceDate
        })
      );

      /*
       * 与本地累积列表合并：服务端快照只存在于 Application 内存，
       * 本托管的应用池对 data/、cloud/file/、logs/ 均无写权限
       * （action=__diag_snapshot_dir 实测全部 writable=False），
       * 应用池一回收快照即丢——用户侧表现为「运行中车次仍然不会出」。
       * 浏览器这份按「日期+区间」持久化，刷新/回收/换会话都不丢。
       */
      const snapshotKey = railSnapshotKey(
        serviceDate,
        from.code,
        to.code
      );

      const merged = mergeRailSnapshots(
        withDate,
        readLocalSnapshot(snapshotKey)
      );

      if (merged.length) {
        writeLocalSnapshot(
          snapshotKey,
          merged
        );
      }

      return merged;
    }

    /*
     * 车次候选排序：
     *  - 查询日 = 北京当天：运行中 → 未发车 → 已通过
     *    （用户要能搜到正在跑的車，并在地图上看到推定位置）
     *  - 未来日期：保持原行为（按发车时间取最早 N 趟）
     * 每趟附 serviceState，供列表显示状态标签。
     */
    pickTrains(
      trains,
      now = Date.now(),
      requestedSeconds = null
    ) {
      const clock = beijingClock(now);

      const byDepartAsc = (a, b) =>
        text(a.train.departTime).localeCompare(
          text(b.train.departTime)
        );

      const byDepartDesc = (a, b) =>
        text(b.train.departTime).localeCompare(
          text(a.train.departTime)
        );

      /* 过去日期：按「距用户所查时刻有多近」排序，帮用户找回自己那趟车。 */
      const byRequestedDistance = (a, b) => {
        const da = railSeconds(a.train.departTime);
        const db = railSeconds(b.train.departTime);
        if (da === null || db === null) {
          return byDepartAsc(a, b);
        }
        if (requestedSeconds === null) {
          return byDepartDesc(a, b);
        }
        return (
          Math.abs(da - requestedSeconds) -
          Math.abs(db - requestedSeconds)
        );
      };

      const tagged = trains.map(train => ({
        train,
        state: classifyRailTrain(train, clock)
      }));

      const isServiceDay =
        tagged.some(
          item => item.state !== "upcoming"
        );

      if (!isServiceDay) {
        return tagged
          .sort(byDepartAsc)
          .slice(
            0,
            RAIL_FUTURE_CANDIDATE_LIMIT
          )
          .map(item => ({
            ...item.train,
            serviceState: item.state
          }));
      }

      /*
       * 过去日期（查「昨天/前天」）不该被今天的配额砍到只剩 3 趟，
       * 否则用户明明查过却找不到自己那趟车。
       */
      const firstOffset = railDayDifference(
        clock.dateKey,
        tagged[0]?.train?.serviceDate
      );

      const isPastDay =
        firstOffset !== null && firstOffset >= 1;

      const pastLimit = isPastDay
        ? RAIL_FUTURE_CANDIDATE_LIMIT
        : RAIL_PAST_CANDIDATE_LIMIT;

      const ordered = [
        ...tagged
          .filter(item => item.state === "running")
          .sort(byDepartAsc)
          .slice(
            0,
            RAIL_RUNNING_CANDIDATE_LIMIT
          ),

        ...tagged
          .filter(item => item.state === "upcoming")
          .sort(byDepartAsc)
          .slice(
            0,
            RAIL_FUTURE_CANDIDATE_LIMIT
          ),

        ...tagged
          .filter(item => item.state === "past")
          .sort(
            isPastDay
              ? byRequestedDistance
              : byDepartDesc
          )
          .slice(0, pastLimit)
      ];

      return ordered.map(item => ({
        ...item.train,
        serviceState: item.state
      }));
    }

    /*
     * 默认选中哪一趟：
     *  - 用户查的就是「此刻」→ 优先运行中的车（否则最近将发）
     *  - 用户指定了其它时刻 → 取发车时间最接近该时刻的一趟
     *    （这正是「搜过去的车次」的能力：指定早上 8 点就能搜到 8 点那趟）
     */
    pickInitialCandidate(
      candidates,
      departureTime,
      now = Date.now()
    ) {
      if (!candidates.length) {
        return null;
      }

      const requested = railSeconds(
        text(departureTime).slice(11, 16)
      );

      if (requested === null) {
        return candidates[0];
      }

      const clock = beijingClock(now);

      if (
        Math.abs(requested - clock.seconds) <=
        3600
      ) {
        return (
          candidates.find(
            item => item.serviceState === "running"
          ) ||
          candidates.find(
            item => item.serviceState === "upcoming"
          ) ||
          candidates[0]
        );
      }

      let best = null;
      let bestDistance = Infinity;

      for (const candidate of candidates) {
        const depart = railSeconds(
          candidate.departTime
        );

        if (depart === null) {
          continue;
        }

        const distance = Math.abs(
          depart - requested
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          best = candidate;
        }
      }

      return best || candidates[0];
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

      /*
       * 当天与过去日期必须带 includeElapsed：12306 上游对当天只返回
       * 未发车车次（北京 23:12 仅剩 2 趟），不带该参数则运行中车次
       * 永远搜不到；代理会用「当日快照」补齐。
       */
      const todayBeijing = beijingClock().dateKey;
      const includeElapsed = date <= todayBeijing;

      const trains =
        await this.getLeftTicket(
          {
            from: originStation,
            to: destinationStation,
            date,
            includeElapsed
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
        this.pickTrains(
          trains,
          Date.now(),
          railSeconds(
            text(departureValue).slice(11, 16)
          )
        );

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

      /*
       * 未指定车次时，默认选中「最贴合用户所查时刻」的一趟
       * （查此刻 → 优先运行中；查某个具体时刻 → 最接近该时刻），
       * 随后按候选顺序有界回退。
       */
      const initial = preferred
        ? null
        : this.pickInitialCandidate(
            candidates,
            departureValue
          );

      const queue = preferred
        ? [preferred]
        : (
            initial
              ? [
                  initial,
                  ...candidates.filter(
                    item => item !== initial
                  )
                ]
              : candidates
          ).slice(
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

            /*
             * running / past / upcoming：列表据此显示
             * 「运行中」「已通过」标签，不必逐个点开才知道。
             */
            state:
              item.serviceState ||
              "upcoming",

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
   * ==================== 全球长途 provider（第三层降级） ====================
   *
   * 定位：Transitland GTFS 覆盖各地**本地**公交/轨道，12306 覆盖**中国境内**
   * 铁路，两者都不覆盖新干线、欧洲 ICE/高速巴士这类**长途**线路
   * （T-025 已实测：Transitland 搜「新大阪」0 个站点）。
   *
   * 数据源：Rome2Rio（全球 240+ 国家、2 万+ 运营商），**按调用计费**。
   * 因此商业逻辑是：
   *   1) GTFS（免费）→ 2) 12306（免费）→ 3) 长途（付费）
   *   付费源永远排最后，且只在 12306 明确说「站表里没这个站名」时才调用；
   *   站名能在中国站表里查到（no_train / presale 等）就绝不花钱调 Rome2Rio。
   *
   * Key 不在浏览器：同源代理在服务端持有，未配置时 capabilities 返回
   * enabled:false，本层整段跳过（不产生任何请求）。
   */

  const LONGDISTANCE_MODES = [
    "train",
    "bus",
    "coach",
    "rail",
    "ferry"
  ];

  /* Rome2Rio travelMode 数字编码 → 内部车型。未知编码不猜，直接排除。 */
  const LONGDISTANCE_MODE_CODES = {
    0: "car",
    1: "bus",
    2: "train",
    3: "ferry",
    4: "taxi",
    5: "car",
    6: "flight"
  };

  function longDistanceMode(
    segment
  ) {
    const raw =
      text(
        segment?.travelMode ??
        segment?.mode
      )
        .toLowerCase();

    if (
      raw &&
      LONGDISTANCE_MODES.includes(raw)
    ) {
      return raw;
    }

    const code =
      number(
        segment?.travelMode
      );

    if (
      code !== null &&
      LONGDISTANCE_MODE_CODES[code]
    ) {
      return LONGDISTANCE_MODE_CODES[code];
    }

    return null;
  }

  /*
   * Rome2Rio 返回的是 ISO 绝对时刻（"2026-09-26T09:00:00+09:00"）。
   *
   * 直接交给界面会出错：serviceSeconds() 期望「服务地墙上时间」的
   * HH:MM:SS 加一个 YYYY-MM-DD 服务日，并用 serviceTimezoneOffsetMinutes
   * 换算「此刻」。所以这里做三件事：
   *   1) 取 ISO 字符串里字面的墙上时间（它本身就是服务当地时间）；
   *   2) 取日期部分作为 serviceDate；
   *   3) 从尾部 +09:00 / Z 解析分钟偏移，供位置估算用。
   * 不做任何 Date 换算：换算反而会把服务当地时间换成本机时间。
   */
  function isoMoment(
    value
  ) {
    const raw =
      text(value).trim();

    if (!raw) {
      return null;
    }

    const match =
      raw.match(
        /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2}))?/
      );

    if (!match) {
      return null;
    }

    return {
      date: match[1],
      time: match[2] + ":" + (match[3] || "00"),
      offsetMinutes: isoOffsetMinutes(raw)
    };
  }

  function isoOffsetMinutes(
    raw
  ) {
    if (/\dT[\d:.]+Z$/i.test(raw)) {
      return 0;
    }

    const match =
      raw.match(
        /([+-])(\d{2}):?(\d{2})$/
      );

    if (!match) {
      return null;
    }

    const minutes =
      Number(match[2]) * 60 +
      Number(match[3]);

    return match[1] === "-"
      ? -minutes
      : minutes;
  }

  /*
   * 只保留**铁路/巴士**单段直达方案：
   *  - 轮渡/飞机/自驾/出租没有对应的车辆图标与运营语义，硬画会误导；
   *  - 多段换乘需要跨段时刻与形状合并，超出当前渲染模型（shape 是单条线），
   *    与其渲染错位不如先不显示。
   * 被排除的方案名会带回错误详情，便于界面说明「有但需换乘」。
   */
  function normalizeLongDistanceRoutes(
    payload
  ) {
    const routes =
      Array.isArray(payload?.routes)
        ? payload.routes
        : [];

    const usable = [];
    const rejected = [];

    routes.forEach(route => {
      const segments =
        Array.isArray(route?.segments)
          ? route.segments
          : [];

      const label =
        text(route?.name) ||
        text(route?.shortName) ||
        "—";

      if (
        segments.length !== 1
      ) {
        rejected.push(label);
        return;
      }

      const segment = segments[0];

      const mode =
        longDistanceMode(segment);

      if (
        mode !== "train" &&
        mode !== "bus" &&
        mode !== "coach"
      ) {
        rejected.push(label);
        return;
      }

      /*
       * 与 GTFS 同一套显示范围：地铁/捷运/通勤/市内公交不显示。
       * Rome2Rio 返回的多为城际长途，少数短途查询仍可能命中市内线路，
       * 同样按线路名 + 行程尺度判定。
       */
      const serviceNames = [
        route?.name,
        route?.shortName,
        segment?.name,
        ...(Array.isArray(segment?.operators)
          ? segment.operators.map(
            operator => operator?.name
          )
          : [])
      ];

      const serviceClass =
        classifyOverseasService({
          routeType:
            mode === "train"
              ? 2
              : 3,

          names: serviceNames
        });

      if (!serviceClass.include) {
        rejected.push(label);
        return;
      }

      const places =
        Array.isArray(segment?.places)
          ? segment.places
          : [];

      if (
        places.length < 2
      ) {
        rejected.push(label);
        return;
      }

      const operators =
        Array.isArray(segment?.operators)
          ? segment.operators
          : [];

      const stops = places.map(place => {
        const arrival = isoMoment(
          place?.arriveBefore ??
          place?.arrivalTime ??
          place?.arrival_time
        );

        const departure = isoMoment(
          place?.departAfter ??
          place?.departureTime ??
          place?.departure_time
        );

        return {
          arrival_time: arrival?.time || "",
          departure_time: departure?.time || "",

          /* 保留解析结果：serviceDate / 时区偏移要从 ISO 原文取，不能从 HH:MM:SS 反推。 */
          arrivalMoment: arrival,
          departureMoment: departure,

          /*
           * shape 只能由有坐标的站组成；中间站缺坐标时保留在
           * stopTimes 里（时刻仍然正确），只是不画线。
           */
          latitude: number(place?.lat),
          longitude: number(place?.lng ?? place?.lon),

          stop_id:
            text(place?.id) ||
            text(place?.placeId),

          stop_name:
            text(place?.name) ||
            text(place?.shortName)
        };
      });

      const first = stops[0];
      const last = stops[stops.length - 1];

      /*
       * 起终点必须有坐标：缺了就画不出线、也 fit 不动地图，
       * 与其显示一条无法定位的行程，不如如实报「无可用方案」。
       */
      if (
        !Number.isFinite(first.latitude) ||
        !Number.isFinite(first.longitude) ||
        !Number.isFinite(last.latitude) ||
        !Number.isFinite(last.longitude)
      ) {
        rejected.push(label);
        return;
      }

      const departureMoment =
        first.departureMoment ||
        first.arrivalMoment;

      const arrivalMoment =
        last.arrivalMoment ||
        last.departureMoment;

      /*
       * shape 复用上游给的经停点坐标（Rome2Rio 不提供轨道几何），
       * 顺序为 [lng, lat]，与 GeoJSON / 现有 provider 一致。
       * 连续重复点会让插值分母为 0，必须去掉。
       */
      const shape = [];
      stops.forEach(stop => {
        if (
          !Number.isFinite(stop.latitude) ||
          !Number.isFinite(stop.longitude)
        ) {
          return;
        }

        const coordinate = [
          stop.longitude,
          stop.latitude
        ];

        const previous = shape[shape.length - 1];

        if (
          previous &&
          previous[0] === coordinate[0] &&
          previous[1] === coordinate[1]
        ) {
          return;
        }

        shape.push(coordinate);
      });

      usable.push({
        provider: "longdistance",

        /* 图标层读它决定火箭头/普通火车/大巴 */
        serviceClass:
          serviceClass.kind,

        serviceScope:
          serviceClass.reason,

        tripId:
          text(route?.id) ||
          label,

        routeId:
          text(route?.id),

        operator: {
          id:
            text(operators[0]?.id),

          name:
            text(operators[0]?.name)
        },

        route: {
          shortName:
            text(route?.shortName) ||
            label,

          longName:
            text(route?.name),

          /*
           * GTFS route_type 对齐：2=铁路、3=巴士。
           * gtfsVehicleKind() 据此选图标（高铁/动车另走 bullet 判定），
           * 所以长途铁路会显示普通火车、长途巴士显示大巴。
           */
          type:
            mode === "train"
              ? 2
              : 3
        },

        origin: {
          stopId: first.stop_id,
          name: first.stop_name,
          latitude: first.latitude,
          longitude: first.longitude,
          departureTime: first.departure_time
        },

        destination: {
          stopId: last.stop_id,
          name: last.stop_name,
          latitude: last.latitude,
          longitude: last.longitude,
          arrivalTime: last.arrival_time
        },

        serviceDate:
          departureMoment?.date ||
          arrivalMoment?.date ||
          text(route?.serviceDate) ||
          text(route?.date),

        /*
         * 位置估算按「服务地当地时间」比较：没有偏移量时
         * serviceTimezoneOffset() 会回落到浏览器本地时区。
         */
        serviceTimezoneOffsetMinutes:
          departureMoment?.offsetMinutes ??
          arrivalMoment?.offsetMinutes ??
          null,

        /* GTFS 形状：站序 + 时刻，供地图连线与经停表渲染。 */
        shape,

        stopTimes: stops.map(stop => ({
          arrival_time: stop.arrival_time,
          departure_time: stop.departure_time,

          stop: {
            stop_id: stop.stop_id,
            stop_name: stop.stop_name,
            stop_lat: stop.latitude,
            stop_lon: stop.longitude
          }
        })),

        durationMinutes:
          number(route?.duration),

        price:
          text(route?.price) ||
          text(route?.indicativePrice),

        mode,

        rejected
      });
    });

    /*
     * 排序：先按出发时刻（>0 的排前面），再按总时长。
     * Rome2Rio 的 duration 单位未在可得资料中明示（官方文档 404），
     * 这里只用于**同一响应内的相对排序**，不展示给用户，
     * 因此单位判断错误也不会产生错误文案。
     */
    usable.sort((a, b) => {
      const aHas = Boolean(a.origin.departureTime);
      const bHas = Boolean(b.origin.departureTime);

      if (aHas !== bHas) {
        return aHas ? -1 : 1;
      }

      if (aHas && bHas) {
        const byTime =
          text(a.origin.departureTime)
            .localeCompare(
              text(b.origin.departureTime)
            );

        if (byTime !== 0) {
          return byTime;
        }
      }

      return (
        (a.durationMinutes ?? 1e9) -
        (b.durationMinutes ?? 1e9)
      );
    });

    return { usable, rejected };
  }

  class LongDistanceTransitProvider
    extends TransitProvider {

    constructor({
      endpoint = LONGDISTANCE_ENDPOINT
    } = {}) {
      super();

      this.endpoint = endpoint;

      /*
       * capabilities 每个会话只探测一次，且**不绑查询的 signal**：
       * 否则用户点「取消」会把探测一起中止、把 enabled:false
       * 永久缓存进本次会话，之后即使配了 Key 也永远不启用。
       */
      this.capabilitiesPromise = null;
    }

    async capabilities() {
      if (!this.capabilitiesPromise) {
        this.capabilitiesPromise =
          this
            .request(
              "capabilities",
              {}
            )
            .then(payload => ({
              provider:
                text(payload?.provider) ||
                "rome2rio",

              enabled:
                payload?.enabled === true,

              base:
                text(payload?.base)
            }))
            .catch(() => ({
              provider: "rome2rio",
              enabled: false,
              base: ""
            }));
      }

      return this.capabilitiesPromise;
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

      const response =
        await fetchWithTimeout(
          url.href,
          {
            credentials: "same-origin",

            headers: {
              Accept: "application/json"
            },

            signal
          },

          TIMEOUTS.longDistanceStage,
          "longdistance_timeout",
          "Long-distance request timed out."
        );

      const payload =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        const error = providerError(
          payload?.error?.code ||
            "longdistance_failed",

          payload?.error?.message ||
            `Long-distance request failed (${response.status})`
        );

        error.httpStatus = response.status;

        throw error;
      }

      if (payload?.error) {
        throw providerError(
          payload.error.code ||
            "longdistance_failed",

          payload.error.message ||
            "Long-distance request failed."
        );
      }

      return payload;
    }

    async searchJourney(
      {
        origin,
        destination,
        departureTime
      },
      signal
    ) {
      const capabilities =
        await this.capabilities();

      if (!capabilities.enabled) {
        throw providerError(
          "longdistance_not_configured",
          "Long-distance source is not configured."
        );
      }

      const params = {
        oName: origin,
        dName: destination,

        /*
         * 只请求铁路与巴士。轮渡/航空/自驾虽然上游也返回，
         * 但界面没有对应图标与运营语义（且跨运营商换乘
         * 需要合并多段时刻/形状），先不显示。
         */
        mode: "train|bus",

        language: "en"
      };

      const date =
        text(departureTime)
          .slice(0, 10);

      if (date) {
        params.date = date;
      }

      const payload =
        await this.request(
          "search",
          params,
          signal
        );

      const {
        usable,
        rejected
      } =
        normalizeLongDistanceRoutes(
          payload
        );

      if (!usable.length) {
        const error = providerError(
          "longdistance_no_direct",
          "No direct long-distance route found."
        );

        error.details = {
          provider: "rome2rio",
          rejected: rejected.slice(0, 4)
        };

        throw error;
      }

      return usable[0];
    }
  }

  /*
   * ==================== 海外线路分类：城际/干线 vs 城市轨道 ====================
   *
   * 用户要求（明确定调）：海外只显示
   *   ① 普通铁路的**城际/干线**车次
   *   ② 高铁（新干线、磁悬浮等）
   *   ③ 长途大巴（高速/城际巴士）
   * 明确**排除**地下铁、捷运、subway，以及市区通勤铁路（山手线、京王线、
   * 台北电铁市区段……）与市内公交。
   *
   * 为什么必须三重判据（都基于实测，不是照抄规格书）：
   *  - GTFS route_type 只能判「制式」：实测丸ノ内線=1（Subway，排除），
   *    但**长途大巴与市内公交都是 3**，光看 type 分不出长途/市内；
   *  - 线路名/运营方关键字补上「名字里就写了通勤」的情况
   *    （JR 系 feed 常把山手线也标成 2）；
   *  - 行程尺度（时长 + 起终点直线距离）兜住前两者都判不出来的情况。
   *    实测要町：東京メトロ「有楽町線」type=1、越後交通「長岡線」type=3；
   *    而用户要的大分↔熊本高速巴士同样是 type=3 —— 只能靠尺度区分。
   *
   * 判定顺序（先命中先决定）：
   *   高铁名 → include（即使里程很短，东京→品川的新干线也该显示）
   *   巴士 type → include，但「≤45 分钟且 ≤40 公里」判为市内 → exclude
   *   城市制式 type/name → exclude
   *   通勤 type/name → exclude
   *   轨道 type → include，同样受尺度判据约束
   *   其余（轮渡/航空/出租/无法识别）→ exclude
   */

  const OVERSEAS_EXCLUDE_METRO_TYPE = new Set([
    0, /* Tram */
    1, /* Subway / Metro */
    5, /* Monorail */
    6, /* Funicular */
    7, /* Rack Railway */
    11, /* Trolleybus */
    12, /* Monorail */
    401, /* City Railway */
    405, /* Metro Service */
    406, /* Underground */
    900, /* Tram Service */
    901,
    902,
    903, /* Car Tram */
    904, /* Rack and Pinion */
    905, /* Funicular */
    906, /* Suspended Monorail */
    110, /* Metro Service */
    111, /* Underground */
    112, /* Light Rail / Tram */
    113 /* Monorail */
  ]);

  const OVERSEAS_EXCLUDE_COMMUTER_TYPE = new Set([
    402, /* Commuter Rail */
    103, /* Suburban Railway */
    107, /* Local Train */
    108, /* Short line */
    404 /* Urban Railway */
  ]);

  const OVERSEAS_RAIL_TYPE = new Set([
    2, /* Railway */
    100, /* Railway Service */
    101, /* Long-distance Train */
    104, /* Intercity */
    105, /* Long-distance */
    106, /* Regional Rail */
    109, /* Night Train */
    114,
    115,
    116,
    117,
    403, /* Interurban */
    1600,
    1601,
    1602,
    1603,
    1604,
    1605,
    1606,
    1607
  ]);

  const OVERSEAS_COACH_TYPE = new Set([
    3, /* Bus */
    200,
    201,
    202,
    203,
    204,
    205,
    206,
    207,
    208,
    209,
    700,
    701,
    702,
    703,
    704,
    705,
    706,
    707,
    708,
    709,
    710,
    711,
    712,
    713,
    714,
    715,
    716,
    717,
    800 /* Trolleybus：与巴士同类处理 */
  ]);

  /*
   * 市内判据：两个条件同时成立才算「市内」。
   * 用 AND 而不是 OR —— 大阪→京都 的 JR 干线约 30 分钟/42 公里，
   * 只按时间会被误杀；实测东京→池袋的丸ノ内線是 16 分钟/13 公里，两条都成立。
   */
  const OVERSEAS_URBAN_MAX_MINUTES = 45;
  const OVERSEAS_URBAN_MAX_KM = 40;

  const OVERSEAS_METRO_NAME =
    /地下鉄|地鐵|捷運|捷运|地下铁|单轨|單軌|市电|市電|路面電車|新交通|\bmetro\b|\bmetropolitan\b|\bsubway\b|\bunderground\b|u-?bahn|\btube\b|\bmrt\b|\blrt\b|\btram\b|light\s*rail|people\s*mover|cable\s*car|缆车|纜車|funicular|索道|monorail/i;

  const OVERSEAS_COMMUTER_NAME =
    /山手|環状|环状|総武|京王|東急|東武|伊勢崎|相鉄|相铁|湘南|京浜東北|各駅停車|各站停车|区間|区间|通勤|\bsuburban\b|\bcommuter\b|\blocal\s+(train|service)\b|\bshort\s+line\b|\burban\b|市區|市区/i;

  const OVERSEAS_HIGH_SPEED_NAME =
    /新幹線|shinkansen|磁気浮上|磁悬浮|磁浮|maglev|超電鉄|高鐵|高铁|high[\s-]?speed|\bhsr\b|\btgv\b|\bice\b|\bave\b|eurostar/i;

  const OVERSEAS_METRO_AGENCY =
    /メトロ|\bmetro\b|subway|捷運|捷运|地鐵|地下铁/i;

  function classifyOverseasService(
    {
      routeType = null,
      names = [],
      agency = "",
      durationMinutes = null,
      distanceKm = null
    } = {}
  ) {
    /*
     * 注意：Number(null) === 0、Number("") === 0，而 0 在城市制式排除表里
     *（Tram）。直接 Number(routeType) 会把「没有 route_type」的线路
     * 误判成有轨电车而排除 —— 实测 Gautrain（无 type）就是这样被误杀的。
     * 所以先把 null / undefined / 空串显式判为「无类型」。
     */
    const typeMissing =
      routeType === null ||
      routeType === undefined ||
      routeType === "";

    const type =
      typeMissing ? NaN : Number(routeType);

    const hasType = Number.isFinite(type);

    const label = [
      ...(Array.isArray(names) ? names : [names]),
      agency
    ]
      .map(
        value =>
          String(value ?? "")
            .trim()
      )
      .filter(Boolean)
      .join(" ");

    const urbanScale =
      Number.isFinite(durationMinutes) &&
      Number.isFinite(distanceKm) &&
      durationMinutes <= OVERSEAS_URBAN_MAX_MINUTES &&
      distanceKm <= OVERSEAS_URBAN_MAX_KM;

    /*
     * ① 高铁优先：名字里写了新幹線/TGV/maglev 的，无论里程多短都该显示
     *    （东京→品川的新干线只有 12 分钟，尺度判据会误杀）。
     */
    if (
      label &&
      OVERSEAS_HIGH_SPEED_NAME.test(label)
    ) {
      return {
        kind: "highspeed",
        include: true,
        reason: "high-speed"
      };
    }

    if (
      hasType &&
      OVERSEAS_COACH_TYPE.has(type)
    ) {
      if (urbanScale) {
        return {
          kind: "urbancoach",
          include: false,
          reason: "short city coach"
        };
      }

      return {
        kind: "coach",
        include: true,
        reason: "long-distance coach"
      };
    }

    if (
      hasType &&
      OVERSEAS_EXCLUDE_METRO_TYPE.has(type)
    ) {
      return {
        kind: "metro",
        include: false,
        reason: "urban rail / metro"
      };
    }

    if (
      label &&
      OVERSEAS_METRO_NAME.test(label)
    ) {
      return {
        kind: "metro",
        include: false,
        reason: "urban rail / metro"
      };
    }

    if (
      hasType &&
      OVERSEAS_EXCLUDE_COMMUTER_TYPE.has(type)
    ) {
      return {
        kind: "commuter",
        include: false,
        reason: "commuter rail"
      };
    }

    if (
      label &&
      OVERSEAS_COMMUTER_NAME.test(label)
    ) {
      return {
        kind: "commuter",
        include: false,
        reason: "commuter rail"
      };
    }

    if (
      hasType &&
      OVERSEAS_RAIL_TYPE.has(type)
    ) {
      if (urbanScale) {
        return {
          kind: "commuter",
          include: false,
          reason: "short urban rail"
        };
      }

      return {
        kind: "rail",
        include: true,
        reason: "intercity rail"
      };
    }

    /*
     * ② 运营方带地铁/捷运字样时兜底排除
     *    （放在最后：运营方名里出现 Metro 时，route_type 与线路名都不该被推翻）。
     */
    if (
      String(agency || "") &&
      OVERSEAS_METRO_AGENCY.test(
        String(agency)
      )
    ) {
      return {
        kind: "metro",
        include: false,
        reason: "urban rail / metro"
      };
    }

    /*
     * ③ 无法识别的制式一律不显示：轮渡/航空/出租没有对应的车辆图标与
     *    运营语义，硬画会误导；宁可如实报「没有符合范围的线路」。
     */
    return {
      kind: "other",
      include: false,
      reason: "unsupported mode"
    };
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
      longDistance = null,
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
    const longDistanceController =
      new AbortController();

    const relayGtfs = () => gtfsController.abort();
    const relayRail = () => railController.abort();
    const relayLongDistance = () =>
      longDistanceController.abort();

    if (signal) {
      if (signal.aborted) {
        gtfsController.abort();
        railController.abort();
        longDistanceController.abort();
      } else {
        signal.addEventListener("abort", relayGtfs);
        signal.addEventListener("abort", relayRail);
        signal.addEventListener(
          "abort",
          relayLongDistance
        );
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
            "transit_failed",

          /*
           * 连同结构化详情一起回落：GTFS 侧的结论（例：没有直达线路 +
           * 已检查了哪些线路）比 12306 的「未在站表中找到该站名」更贴近
           * 真实原因。**不要**把 provider 的中文 message 直接交给界面——
           * 界面有中/繁/英/日四语，用户可见文案必须由 app 按当前语言组装。
           */
          String(
            error?.message || ""
          ),

          error?.details || null
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
    } catch (railError) {
      /*
       * ------------------------------------------------------------------
       * 第三层：全球长途（付费）。
       *
       * 商业门禁（这就是「B 方案」的核心）：
       *   - 未配置 Key → capabilities.enabled=false → **整段跳过**，
       *     不发任何请求（部署后行为与现在完全一致）；
       *   - 12306 若回 no_train / presale / schedule_failed，说明站名
       *     在中国站表里、只是这一段没车 → **绝不调用付费源**；
       *   - 只有 12306 回 station_not_found（站名不在中国站表 = 极可能是
       *     海外/跨境线路，正是付费源的覆盖范围）才调用；
       *   - 用户主动取消立即上抛，不发起任何新请求。
       */
      const longDistanceEligible =
        longDistance &&
        String(railError?.code || "") ===
          "station_not_found";

      if (!longDistanceEligible) {
        throw railError;
      }

      if (
        signal?.aborted ||
        railError?.name === "AbortError"
      ) {
        throw railError;
      }

      onFallback?.(
        "longdistance_stage",
        "Falling back to the global long-distance source.",
        {
          railCode:
            railError?.code ||
            "unknown"
        }
      );

      try {
        const journey =
          await withBudget(
            longDistance.searchJourney(
              {
                origin,
                destination,
                departureTime,
                language
              },
              longDistanceController.signal
            ),

            TIMEOUTS.longDistanceStage,
            "longdistance_timeout",
            "Long-distance query timed out.",
            longDistanceController
          );

        return {
          journey,
          source: "longdistance"
        };
      } catch (longDistanceError) {
        /*
         * 长途源也没结果：把两边的真实错误都带回界面层，
         * 由界面按当前语言组装文案（provider 只抛 code + 中文 message，
         * 直接透传会让日/英文界面显示中文——T-023 已踩过）。
         *
         * 优先抛长途源的错误（它的结论更贴近「为什么没查到」），
         * 但把 12306 的 code 挂在 details 上，便于界面区分
         * 「站表没有这个站」与「付费源也没这条长途线路」。
         */
        const error =
          longDistanceError?.code ===
            "longdistance_not_configured"
            ? railError
            : longDistanceError;

        error.details = {
          ...(error.details || {}),

          railCode:
            railError?.code ||
            "unknown",

          longDistanceCode:
            longDistanceError?.code ||
            "unknown"
        };

        throw error;
      }
    } finally {
      if (signal) {
        signal.removeEventListener("abort", relayGtfs);
        signal.removeEventListener("abort", relayRail);
        signal.removeEventListener(
          "abort",
          relayLongDistance
        );
      }
    }
  }

  global.WebWindowsTransit =
    Object.freeze({
      TransitProvider,
      TransitlandTransitProvider,
      ChinaRailTransitProvider,
      LongDistanceTransitProvider,
      PhotonGeocoder,
      searchJourneyWithFallback,
      fetchWithTimeout,
      parseStationTable,
      matchStation,
      stationSuggestions,
      parseLeftTicket,
      sliceSchedule,
      normalizeStopTimes,
      normalizeLongDistanceRoutes,
      classifyOverseasService,
      routeIcon,
      trainIcon
    });

})(
  typeof window !== "undefined"
    ? window
    : globalThis
);
