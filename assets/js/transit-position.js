(function (global) {
  "use strict";

  function validPoint(point) {
    return (
      Number.isFinite(
        Number(
          point?.latitude
        )
      ) &&
      Number.isFinite(
        Number(
          point?.longitude
        )
      ) &&
      Math.abs(
        Number(
          point.latitude
        )
      ) <= 90 &&
      Math.abs(
        Number(
          point.longitude
        )
      ) <= 180
    );
  }

  function haversine(
    a,
    b
  ) {
    const radius =
      6371000;

    const rad =
      value =>
        Number(value) *
        Math.PI /
        180;

    const lat1 =
      rad(a[1]);

    const lat2 =
      rad(b[1]);

    const dLat =
      lat2 - lat1;

    const dLon =
      rad(
        b[0] - a[0]
      );

    const value =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

    return (
      radius *
      2 *
      Math.atan2(
        Math.sqrt(value),
        Math.sqrt(1 - value)
      )
    );
  }

  function nearestIndex(
    shape,
    point
  ) {
    if (
      !Array.isArray(shape) ||
      !validPoint(point)
    ) {
      return -1;
    }

    let bestIndex =
      -1;

    let bestDistance =
      Infinity;

    shape.forEach(
      (
        coordinate,
        index
      ) => {
        const distance =
          haversine(
            coordinate,
            [
              Number(
                point.longitude
              ),
              Number(
                point.latitude
              )
            ]
          );

        if (
          distance <
          bestDistance
        ) {
          bestDistance =
            distance;

          bestIndex =
            index;
        }
      }
    );

    return bestIndex;
  }

  function clippedShape(
    journey
  ) {
    const shape =
      Array.isArray(
        journey?.shape
      )
        ? journey.shape
        : [];

    if (
      shape.length < 2
    ) {
      return [];
    }

    const originIndex =
      nearestIndex(
        shape,
        journey.origin
      );

    const destinationIndex =
      nearestIndex(
        shape,
        journey.destination
      );

    if (
      originIndex < 0 ||
      destinationIndex < 0
    ) {
      return shape;
    }

    if (
      originIndex <=
      destinationIndex
    ) {
      return shape.slice(
        originIndex,
        destinationIndex + 1
      );
    }

    return shape
      .slice(
        destinationIndex,
        originIndex + 1
      )
      .reverse();
  }

  function gtfsSeconds(value) {
    const match =
      String(value || "")
        .match(
          /^(\d{1,3}):(\d{2}):(\d{2})$/
        );

    if (!match) {
      return null;
    }

    return (
      Number(match[1]) *
        3600 +
      Number(match[2]) *
        60 +
      Number(match[3])
    );
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  /*
   * 行程使用的时区。
   * 12306 提供 serviceTimezoneOffsetMinutes（中国标准时间 = 480），
   * 没有该字段时沿用浏览器本地时区（GTFS feed 默认本地时间）。
   */
  function serviceTimezoneOffset(journey) {
    const value = Number(
      journey?.serviceTimezoneOffsetMinutes
    );

    return Number.isFinite(value)
      ? value
      : null;
  }

  /*
   * 把时间戳换算成“服务日 + 当日秒数”。
   * offset 为 null 时用浏览器本地时区，否则用固定 UTC 偏移。
   */
  function serviceClock(now, offset) {
    const date = new Date(now);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const fixed =
      offset !== null;

    const shifted = fixed
      ? new Date(
          date.getTime() + offset * 60000
        )
      : date;

    const get =
      unit =>
        fixed
          ? shifted[`getUTC${unit}`]()
          : shifted[`get${unit}`]();

    return {
      dateKey:
        `${get("FullYear")}-${pad(
          get("Month") + 1
        )}-${pad(get("Date"))}`,

      seconds:
        get("Hours") * 3600 +
        get("Minutes") * 60 +
        get("Seconds")
    };
  }

  function dayDifference(fromKey, toKey) {
    const from = Date.parse(
      `${fromKey}T00:00:00Z`
    );

    const to = Date.parse(
      `${toKey}T00:00:00Z`
    );

    if (
      !Number.isFinite(from) ||
      !Number.isFinite(to)
    ) {
      return null;
    }

    return Math.round(
      (from - to) / 86400000
    );
  }

  /*
   * 当前时间在该 service day 中的秒数。
   *
   * 有 journey.serviceDate 时按“服务日偏差”进位：
   * 例如 23:50 发车、次日 01:10 到达的车次，
   * 次日 00:30 查询会得到 86400 + 1800，可直接与 88800 比较。
   * 没有 serviceDate 时退回旧行为（GTFS >24h 时刻 + 凌晨回卷）。
   */
  function serviceSeconds(journey, now) {
    const clock = serviceClock(
      now,
      serviceTimezoneOffset(journey)
    );

    if (!clock) {
      return 0;
    }

    const serviceDate =
      String(
        journey?.serviceDate || ""
      )
        .slice(0, 10);

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        serviceDate
      )
    ) {
      const difference =
        dayDifference(
          clock.dateKey,
          serviceDate
        );

      if (difference !== null) {
        return (
          clock.seconds +
          difference * 86400
        );
      }
    }

    let seconds = clock.seconds;

    const departure =
      gtfsSeconds(
        journey
          ?.origin
          ?.departureTime
      );

    const arrival =
      gtfsSeconds(
        journey
          ?.destination
          ?.arrivalTime
      );

    /*
     * GTFS 允许 24:00:00 以上的 service time。
     *
     * 例如：
     * departure = 23:50:00
     * arrival   = 25:10:00
     *
     * 实际当前时间如果是次日 00:30，
     * 浏览器只能得到 00:30 = 1800 秒。
     *
     * 但在该 GTFS service day 中，
     * 应视为：
     * 24:30 = 88200 秒。
     */
    if (
      Number.isFinite(departure) &&
      Number.isFinite(arrival) &&
      arrival >= 86400 &&
      seconds <
        Math.min(departure, 21600)
    ) {
      seconds += 86400;
    }

    return seconds;
  }

  function pointAlongShape(
    shape,
    fraction
  ) {
    if (
      !Array.isArray(shape) ||
      shape.length < 2
    ) {
      return null;
    }

    const distances = [
      0
    ];

    let total =
      0;

    for (
      let i = 1;
      i < shape.length;
      i++
    ) {
      total +=
        haversine(
          shape[i - 1],
          shape[i]
        );

      distances.push(
        total
      );
    }

    if (total <= 0) {
      return null;
    }

    const target =
      total *
      Math.max(
        0,
        Math.min(
          1,
          fraction
        )
      );

    for (
      let i = 1;
      i < distances.length;
      i++
    ) {
      if (
        distances[i] >=
        target
      ) {
        const segment =
          distances[i] -
          distances[i - 1];

        const local =
          segment > 0
            ? (
                target -
                distances[i - 1]
              ) /
              segment
            : 0;

        return {
          longitude:
            shape[i - 1][0] +
            (
              shape[i][0] -
              shape[i - 1][0]
            ) *
            local,

          latitude:
            shape[i - 1][1] +
            (
              shape[i][1] -
              shape[i - 1][1]
            ) *
            local
        };
      }
    }

    return {
      longitude:
        shape[
          shape.length - 1
        ][0],

      latitude:
        shape[
          shape.length - 1
        ][1]
    };
  }

  function stopName(stopTime) {
    return String(
      stopTime?.stop?.stop_name ||
      stopTime?.stop?.name ||
      ""
    );
  }

  function stopPoint(stopTime) {
    const stop =
      stopTime?.stop;

    const latitude =
      Number(stop?.latitude);

    const longitude =
      Number(stop?.longitude);

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      return {
        latitude,
        longitude
      };
    }

    const coordinates =
      stop?.geometry?.coordinates;

    if (
      Array.isArray(coordinates) &&
      Number.isFinite(
        Number(coordinates[1])
      ) &&
      Number.isFinite(
        Number(coordinates[0])
      )
    ) {
      return {
        latitude:
          Number(coordinates[1]),

        longitude:
          Number(coordinates[0])
      };
    }

    return {
      latitude: null,
      longitude: null
    };
  }

  /*
   * 描述行程当前的运行状态：
   * - state: before（未发车）/ running（运行中）/ arrived（已到达）/ unknown
   * - stops[].status: passed（已通过）/ next（下一站）/ upcoming（未到）/ waiting（未发车）
   * - passedCount: 已通过站数
   * - currentSegment: 当前区间的上一站与下一站
   *
   * 全部结论只来自时刻表与当前时间，不推断虚构位置。
   */
  function describeService(
    journey,
    now = Date.now()
  ) {
    const stopTimes =
      Array.isArray(journey?.stopTimes)
        ? journey.stopTimes
        : [];

    if (!stopTimes.length) {
      return {
        state: "unknown",

        stops: [],

        nextIndex: -1,

        passedCount: 0,

        currentSegment: null,

        seconds: serviceSeconds(
          journey,
          now
        )
      };
    }

    const seconds =
      serviceSeconds(journey, now);

    const departure =
      gtfsSeconds(
        journey
          ?.origin
          ?.departureTime
      ) ??
      gtfsSeconds(
        stopTimes[0]?.departure_time
      );

    const lastIndex =
      stopTimes.length - 1;

    const arrival =
      gtfsSeconds(
        journey
          ?.destination
          ?.arrivalTime
      ) ??
      gtfsSeconds(
        stopTimes[lastIndex]?.arrival_time
      );

    let state = "running";

    if (
      departure === null &&
      arrival === null
    ) {
      state = "unknown";
    } else if (
      departure !== null &&
      seconds < departure
    ) {
      state = "before";
    } else if (
      arrival !== null &&
      seconds >= arrival
    ) {
      state = "arrived";
    }

    const stops =
      stopTimes.map((stopTime, index) => {
        const isLast =
          index === lastIndex;

        const reference =
          isLast
            ? gtfsSeconds(
                stopTime?.arrival_time
              ) ??
              gtfsSeconds(
                stopTime?.departure_time
              )
            : gtfsSeconds(
                stopTime?.departure_time
              ) ??
              gtfsSeconds(
                stopTime?.arrival_time
              );

        const point =
          stopPoint(stopTime);

        let status = "upcoming";

        if (state === "before") {
          status = "waiting";
        } else if (
          state === "arrived" ||
          (reference !== null &&
            reference <= seconds)
        ) {
          status = "passed";
        }

        return {
          index,

          name:
            stopName(stopTime),

          arrivalTime:
            stopTime?.arrival_time || "",

          departureTime:
            stopTime?.departure_time || "",

          status,

          latitude:
            point.latitude,

          longitude:
            point.longitude
        };
      });

    let nextIndex =
      stops.findIndex(
        stop =>
          stop.status === "upcoming"
      );

    if (state === "before") {
      nextIndex = 0;
    } else if (state === "arrived") {
      nextIndex = -1;
    }

    if (nextIndex < 0 && state === "running") {
      nextIndex = -1;
    }

    stops.forEach((stop, index) => {
      if (
        state === "running" &&
        index === nextIndex
      ) {
        stop.status = "next";
      }
    });

    const passedCount =
      stops.filter(
        stop =>
          stop.status === "passed"
      ).length;

    let currentSegment = null;

    if (
      state === "running" &&
      nextIndex >= 0
    ) {
      currentSegment = {
        from:
          stops[
            Math.max(
              0,
              nextIndex - 1)
          ] || null,

        to:
          stops[nextIndex] || null
      };
    }

    return {
      state,

      stops,

      nextIndex,

      passedCount,

      currentSegment,

      seconds
    };
  }

  class TransitPositionResolver {

    resolve(
      journey,
      now = Date.now()
    ) {
      const live =
        journey
          ?.realtime
          ?.vehiclePosition;

      if (
        validPoint(live)
      ) {
        return {
          positionStatus:
            "live",

          position: {
            ...live,
            source:
              "live"
          }
        };
      }

      const estimated =
        this.estimate(
          journey,
          now
        );

      if (estimated) {
        return {
          positionStatus:
            "estimated",

          position: {
            ...estimated,
            source:
              "estimated"
          }
        };
      }

      return {
        positionStatus:
          "unavailable",

        position:
          null
      };
    }

    estimate(
      journey,
      now
    ) {
      const departure =
        gtfsSeconds(
          journey
            ?.origin
            ?.departureTime
        );

      const arrival =
        gtfsSeconds(
          journey
            ?.destination
            ?.arrivalTime
        );

      if (
        departure === null ||
        arrival === null ||
        arrival <= departure
      ) {
        return null;
      }

      const current =
       serviceSeconds(
        journey,
        now
      );

      if (
        current <
          departure ||
        current >
          arrival
      ) {
        return null;
      }

      const shape =
        clippedShape(
          journey
        );

      if (
        shape.length < 2
      ) {
        return null;
      }

      const fraction =
        (
          current -
          departure
        ) /
        (
          arrival -
          departure
        );

      return pointAlongShape(
        shape,
        fraction
      );
    }

    getDisplayShape(
      journey
    ) {
      return clippedShape(
        journey
      );
    }
  }

  global.WebWindowsTransitPosition =
    Object.freeze({
      validPoint,
      TransitPositionResolver,
      gtfsSeconds,
      serviceSeconds,
      describeService
    });

})(
  typeof window !== "undefined"
    ? window
    : globalThis
);
