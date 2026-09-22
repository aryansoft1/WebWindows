(function (global) {
  "use strict";

  const ENDPOINT = "/api/flight-proxy.asp";
  const CACHE_MS = 30000;
  const cache = new Map();

  function cleanFlightNumber(value) {
    return String(value || "").toUpperCase().replace(/\s+/g, "").trim();
  }

  function parseFlightNumber(value) {
    const normalized = cleanFlightNumber(value);
    const iataMatch = normalized.match(/^([A-Z0-9]{2})(\d{1,4}[A-Z]?)$/);
    if (iataMatch) return Object.freeze({flightIata:normalized, airlineIata:iataMatch[1], flightNumber:iataMatch[2]});
    const icaoMatch = normalized.match(/^([A-Z]{3})(\d{1,4}[A-Z]?)$/);
    return icaoMatch ? Object.freeze({flightIcao:normalized, airlineIcao:icaoMatch[1], flightNumber:icaoMatch[2]}) : null;
  }

  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
  }

  function nullableNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeStatus(raw) {
    const data = raw && raw.flight ? raw.flight : raw || {};
    const text = value => value === null || value === undefined || value === "" ? null : String(value);
    const time = value => value && typeof value === "object" ? {
      local: text(value.local), utc: text(value.utc), timestamp: nullableNumber(value.timestamp), timezone: text(value.timezone)
    } : {local: text(value), utc: null, timestamp: null, timezone: null};
    const point = data.position || {};
    return Object.freeze({
      provider: text(data.provider) || "airlabs",
      flightNumber: text(data.flightNumber),
      airlineCode: text(data.airlineCode),
      airlineName: text(data.airlineName),
      flightIata: text(data.flightIata), flightIcao: text(data.flightIcao),
      airlineIata: text(data.airlineIata), airlineIcao: text(data.airlineIcao),
      csFlightIata: text(data.csFlightIata), csAirlineIata: text(data.csAirlineIata),
      requestedDate: text(data.requestedDate),
      departure: Object.freeze({
        airportCode: text(data.departure?.airportCode), airportName: text(data.departure?.airportName),
        terminal: text(data.departure?.terminal), gate: text(data.departure?.gate),
        scheduled: time(data.departure?.scheduled), estimated: time(data.departure?.estimated), actual: time(data.departure?.actual),
        latitude: nullableNumber(data.departure?.latitude), longitude: nullableNumber(data.departure?.longitude)
      }),
      arrival: Object.freeze({
        airportCode: text(data.arrival?.airportCode), airportName: text(data.arrival?.airportName),
        terminal: text(data.arrival?.terminal), gate: text(data.arrival?.gate), baggage: text(data.arrival?.baggage),
        scheduled: time(data.arrival?.scheduled), estimated: time(data.arrival?.estimated), actual: time(data.arrival?.actual),
        latitude: nullableNumber(data.arrival?.latitude), longitude: nullableNumber(data.arrival?.longitude)
      }),
      status: text(data.status), delayedMinutes: nullableNumber(data.delayedMinutes), cancelled: Boolean(data.cancelled),
      aircraft: Object.freeze({model:text(data.aircraft?.model), registration:text(data.aircraft?.registration), icao24:text(data.aircraft?.icao24)}),
      position: Object.freeze({
        latitude: nullableNumber(point.latitude), longitude: nullableNumber(point.longitude), altitude: nullableNumber(point.altitude),
        groundSpeed: nullableNumber(point.groundSpeed), heading: nullableNumber(point.heading), verticalSpeed: nullableNumber(point.verticalSpeed), timestamp: nullableNumber(point.timestamp),
        source: point.source === "estimated" ? "estimated" : (nullableNumber(point.latitude)!==null&&nullableNumber(point.longitude)!==null ? "live" : null)
      }),
      positionStatus: text(data.positionStatus) || (nullableNumber(point.latitude)!==null&&nullableNumber(point.longitude)!==null ? "live" : "unavailable"),
      track: Object.freeze(Array.isArray(data.track) ? data.track.map(item => Object.freeze({
        latitude: nullableNumber(item.latitude), longitude: nullableNumber(item.longitude), altitude: nullableNumber(item.altitude), timestamp: nullableNumber(item.timestamp)
      })).filter(item => item.latitude !== null && item.longitude !== null) : [])
    });
  }

  class FlightProvider {
    async searchFlight() { throw new Error("Flight provider is not implemented."); }
    async getFlightStatus() { throw new Error("Flight provider is not implemented."); }
    async getLivePosition() { throw new Error("Flight provider is not implemented."); }
    async getSchedule() { throw new Error("Flight provider is not implemented."); }
    async getAirportInfo() { throw new Error("Flight provider is not implemented."); }
    async getTrack() { return []; }
  }

  class AirLabsFlightProvider extends FlightProvider {
    constructor(endpoint = ENDPOINT) { super(); this.endpoint = endpoint; this.id = "airlabs"; }
    async getAirlines(signal) {
      const saved = cache.get("airlines");
      if (saved && Date.now() - saved.time < 86400000) return saved.value;
      const url = new URL(this.endpoint, global.location.origin);
      url.searchParams.set("action", "airlines");
      const response = await global.fetch(url.href, {
        method:"POST", credentials:"same-origin", signal,
        headers:{Accept:"application/json", "Content-Type":"application/json"}, body:"{}"
      });
      let body;
      try { body = await response.json(); } catch (_) {
        const error = new Error("航空公司目录返回了无法解析的数据。"); error.code = "malformed_response"; throw error;
      }
      if (!response.ok) {
        const error = new Error(body?.error?.message || "航空公司目录暂时不可用。");
        error.code = body?.error?.code || "provider_error"; error.httpStatus = response.status; throw error;
      }
      const value = Object.freeze((Array.isArray(body?.airlines) ? body.airlines : []).map(item => Object.freeze({
        name:String(item?.name || "").trim(), iataCode:String(item?.iata_code || "").toUpperCase(), icaoCode:String(item?.icao_code || "").toUpperCase()
      })).filter(item => item.name && (item.iataCode || item.icaoCode)));
      cache.set("airlines", {time:Date.now(), value});
      return value;
    }
    async request(action, params, signal) {
      const flightNumber = cleanFlightNumber(params.flightNumber);
      const parsed = parseFlightNumber(flightNumber);
      if (!/^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(flightNumber)) {
        const error = new Error("航班号格式不正确。"); error.code = "invalid_flight_number"; throw error;
      }
      if (!validDate(params.date)) { const error = new Error("请选择有效日期。"); error.code = "invalid_date"; throw error; }
      const key = `${action}:${flightNumber}:${params.date}`;
      const saved = cache.get(key);
      if (action!=="live" && saved && Date.now() - saved.time < CACHE_MS) return saved.value;
      const url = new URL(this.endpoint, global.location.origin);
      url.searchParams.set("action", action);
      const response = await global.fetch(url.href, {
        method: "POST", credentials: "same-origin", signal,
        headers: {Accept:"application/json", "Content-Type":"application/json"},
        body: JSON.stringify({flightNumber, airlineCode:parsed?.airlineIata || parsed?.airlineIcao || String(params.airlineCode || "").trim().toUpperCase(), date:params.date})
      });
      let body = null;
      try { body = await response.json(); } catch (_) {
        const error = new Error("航班数据服务返回了无法解析的数据。"); error.code = "malformed_response"; throw error;
      }
      if (!response.ok) {
        const error = new Error(body?.error?.message || "航班数据服务暂时不可用。");
        error.code = body?.error?.code || "provider_error";
        error.httpStatus = response.status;
        const retryAfter = Number(response.headers?.get?.("Retry-After"));
        error.retryAfterMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter*1000 : null;
        throw error;
      }
      const value = normalizeStatus(body);
      if (action!=="live") cache.set(key, {time:Date.now(), value});
      return value;
    }
    searchFlight(params, signal) { return this.request("search", params, signal); }
    getFlightStatus(params, signal) { return this.request("status", params, signal); }
    getLivePosition(params, signal) { return this.request("live", params, signal); }
    getSchedule(params, signal) { return this.request("schedule", params, signal); }
    getAirportInfo(params, signal) { return this.request("airport", params, signal); }
    async getTrack(params, signal) { const result = await this.request("track", params, signal); return result.track; }
  }

  global.WebWindowsFlight = Object.freeze({FlightProvider, AirLabsFlightProvider, normalizeStatus, cleanFlightNumber, parseFlightNumber});
})(typeof window !== "undefined" ? window : globalThis);
