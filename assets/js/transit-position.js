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
          /^(\d{1,2}):(\d{2}):(\d{2})$/
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

  function nowServiceSeconds(
  journey,
  now
) {
    const date =
      new Date(now);

    let seconds =
      date.getHours() *
        3600 +
      date.getMinutes() *
        60 +
      date.getSeconds();

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
      Number.isFinite(
        departure
      ) &&
      Number.isFinite(
        arrival
      ) &&
      arrival >= 86400 &&
      seconds <
        Math.min(
          departure,
          21600
        )
    ) {
      seconds +=
        86400;
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

    if (
      total <= 0
    ) {
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
       nowServiceSeconds(
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
      TransitPositionResolver
    });

})(
  typeof window !== "undefined"
    ? window
    : globalThis
);