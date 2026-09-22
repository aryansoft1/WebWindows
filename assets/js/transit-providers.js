(function (global) {
  "use strict";

  const ENDPOINT = "/api/transit-proxy.asp";

  function text(value) {
    return value === null || value === undefined
      ? ""
      : String(value);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
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
        await fetch(
          url.href,
          {
            credentials:
              "same-origin",

            headers: {
              Accept:
                "application/json"
            },

            signal
          }
        );

      const payload =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (!response.ok) {
        const error =
          new Error(
            payload
              ?.error
              ?.message ||
            `Transit request failed (${response.status})`
          );

        error.code =
          payload
            ?.error
            ?.code ||
          "transit_request_failed";

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
        const error =
          new Error(
            "未找到出发站或到达站。"
          );

        error.code =
          "stop_not_found";

        throw error;
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

      const error =
        new Error(
          "当前仅支持无需换乘的直达行程，未找到可用直达班次。"
        );

      error.code =
        "direct_trip_not_found";

      throw error;
    }
  }

  global.WebWindowsTransit =
    Object.freeze({
      TransitProvider,
      TransitlandTransitProvider
    });

})(
  typeof window !== "undefined"
    ? window
    : globalThis
);