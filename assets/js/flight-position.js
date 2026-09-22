(function (global) {
  "use strict";

  const EARTH_RADIUS_KM = 6371.0088;
  const radians = degrees => degrees * Math.PI / 180;
  const degrees = radiansValue => radiansValue * 180 / Math.PI;
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const normalizeLongitude = value => ((value + 540) % 360) - 180;

  function validPoint(point) {
    return point?.latitude!==null&&point?.latitude!==undefined&&point?.latitude!==''&&point?.longitude!==null&&point?.longitude!==undefined&&point?.longitude!==''&&Number.isFinite(Number(point.latitude))&&Number.isFinite(Number(point.longitude));
  }

  function timeMilliseconds(value) {
    if (!value) return null;
    if (Number.isFinite(Number(value.timestamp))) {
      const timestamp = Number(value.timestamp);
      return timestamp > 1e12 ? timestamp : timestamp * 1000;
    }
    const parsed = Date.parse(value.utc || value.local || value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  class GreatCircleRoute {
    constructor(departure, arrival) {
      if (!validPoint(departure) || !validPoint(arrival)) throw new Error("Both airport coordinates are required.");
      this.departure = {latitude:Number(departure.latitude), longitude:Number(departure.longitude)};
      this.arrival = {latitude:Number(arrival.latitude), longitude:Number(arrival.longitude)};
      const lat1=radians(this.departure.latitude), lon1=radians(this.departure.longitude);
      const lat2=radians(this.arrival.latitude), lon2=radians(this.arrival.longitude);
      this.start=[Math.cos(lat1)*Math.cos(lon1),Math.cos(lat1)*Math.sin(lon1),Math.sin(lat1)];
      this.end=[Math.cos(lat2)*Math.cos(lon2),Math.cos(lat2)*Math.sin(lon2),Math.sin(lat2)];
      this.angle=Math.acos(clamp(this.start[0]*this.end[0]+this.start[1]*this.end[1]+this.start[2]*this.end[2],-1,1));
    }
    pointAt(progress) {
      const fraction=clamp(Number(progress)||0,0,1), sine=Math.sin(this.angle);
      if (sine < 1e-10) return {...this.departure};
      const a=Math.sin((1-fraction)*this.angle)/sine, b=Math.sin(fraction*this.angle)/sine;
      const x=a*this.start[0]+b*this.end[0], y=a*this.start[1]+b*this.end[1], z=a*this.start[2]+b*this.end[2];
      return {latitude:degrees(Math.atan2(z,Math.sqrt(x*x+y*y))),longitude:normalizeLongitude(degrees(Math.atan2(y,x)))};
    }
    bearingAt(progress) {
      const from=this.pointAt(progress), to=this.pointAt(Math.min(1,Number(progress)+0.002));
      const lat1=radians(from.latitude), lat2=radians(to.latitude), delta=radians(to.longitude-from.longitude);
      return (degrees(Math.atan2(Math.sin(delta)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(delta)))+360)%360;
    }
    points(count=128) { return Array.from({length:Math.max(2,count)},(_,index)=>this.pointAt(index/(Math.max(2,count)-1))); }
    segments(count=128) {
      const segments=[[]];
      this.points(count).forEach(point=>{
        const current=segments[segments.length-1], previous=current[current.length-1];
        if (previous && Math.abs(point.longitude-previous[0])>180) segments.push([]);
        segments[segments.length-1].push([point.longitude,point.latitude]);
      });
      return segments.filter(segment=>segment.length>1);
    }
    distanceKm() { return this.angle*EARTH_RADIUS_KM; }
  }

  class FlightPositionResolver {
    routeFor(flight) {
      try { return new GreatCircleRoute(flight?.departure,flight?.arrival); } catch (_) { return null; }
    }
    timingFor(flight) {
      const dep=flight?.departure||{}, arr=flight?.arrival||{};
      const candidates=[
        [dep.actual,arr.estimated?.timestamp||arr.estimated?.utc||arr.estimated?.local?arr.estimated:arr.scheduled],
        [dep.estimated,arr.estimated?.timestamp||arr.estimated?.utc||arr.estimated?.local?arr.estimated:arr.scheduled],
        [dep.scheduled,arr.scheduled]
      ];
      for (const [departure,arrival] of candidates) {
        const start=timeMilliseconds(departure), end=timeMilliseconds(arrival);
        if (Number.isFinite(start)&&Number.isFinite(end)&&end>start) return {start,end};
      }
      return null;
    }
    resolvePosition(flight, options={}) {
      const now=Number.isFinite(options.now)?options.now:Date.now(), point=flight?.position||{};
      if (!options.ignoreLive && validPoint(point)) return {positionStatus:"live",position:{...point,source:"live"},route:this.routeFor(flight),progress:null};
      const status=String(flight?.status||"").toLowerCase();
      if (!['active','en-route','airborne'].includes(status)||flight?.cancelled) return {positionStatus:"unavailable",position:null,route:this.routeFor(flight),progress:null};
      const route=this.routeFor(flight), timing=this.timingFor(flight);
      if (!route||!timing) return {positionStatus:"unavailable",position:null,route,progress:null};
      const progress=clamp((now-timing.start)/(timing.end-timing.start),0,1), estimated=route.pointAt(progress);
      return {positionStatus:"estimated",position:{...estimated,altitude:null,groundSpeed:null,heading:route.bearingAt(progress),verticalSpeed:null,timestamp:Math.floor(now/1000),source:"estimated"},route,progress};
    }
  }

  function splitCoordinates(coordinates) {
    const segments=[[]];
    coordinates.forEach(coordinate=>{
      const current=segments[segments.length-1], previous=current[current.length-1];
      if (previous && Math.abs(coordinate[0]-previous[0])>180) segments.push([]);
      segments[segments.length-1].push(coordinate);
    });
    return segments.filter(segment=>segment.length>1);
  }

  function nearestRouteProgress(route, point, count=180) {
    if (!route || !validPoint(point)) return null;
    const samples=route.points(count), latitude=radians(Number(point.latitude));
    let bestIndex=0, bestDistance=Infinity;
    samples.forEach((sample,index)=>{
      const dx=(sample.longitude-Number(point.longitude))*Math.cos(latitude), dy=sample.latitude-Number(point.latitude), distance=dx*dx+dy*dy;
      if (distance<bestDistance) { bestDistance=distance; bestIndex=index; }
    });
    return bestIndex/(samples.length-1);
  }

  function flightPathLayers(resolved, observedTrack=[]) {
    const route=resolved?.route, position=resolved?.position;
    const referenceRoute=route ? route.segments(180) : [];
    const actualCoordinates=observedTrack.filter(point=>point?.source==='live'&&validPoint(point)).map(point=>[Number(point.longitude),Number(point.latitude)]);
    const actualTrack=splitCoordinates(actualCoordinates);
    if (!route || !validPoint(position)) return {referenceRoute,actualTrack,estimatedFlownSegment:[]};
    const progress=Number.isFinite(resolved.progress)?resolved.progress:nearestRouteProgress(route,position);
    if (!Number.isFinite(progress)) return {referenceRoute,actualTrack,estimatedFlownSegment:[]};
    const count=180, lastIndex=Math.max(1,Math.floor(clamp(progress,0,1)*(count-1)));
    const coordinates=route.points(count).slice(0,lastIndex+1).map(point=>[point.longitude,point.latitude]);
    const current=[Number(position.longitude),Number(position.latitude)], last=coordinates[coordinates.length-1];
    if (!last || last[0]!==current[0] || last[1]!==current[1]) coordinates.push(current);
    return {referenceRoute,actualTrack,estimatedFlownSegment:splitCoordinates(coordinates)};
  }

  class FlightRefreshPolicy {
    constructor(options={}) {
      this.normalMs=options.normalMs||30000;
      this.maximumMs=options.maximumMs||300000;
      this.failures=0;
      this.lastLiveAt=null;
      this.forceEstimated=false;
    }
    recordLive(now=Date.now()) {
      this.failures=0; this.lastLiveAt=now; this.forceEstimated=false;
      return this.normalMs;
    }
    recordFailure(options={}) {
      const now=Number.isFinite(options.now)?options.now:Date.now();
      this.failures+=1;
      if (!this.lastLiveAt||this.failures>=2||now-this.lastLiveAt>90000) this.forceEstimated=true;
      const backoff=[60000,120000,300000][Math.min(this.failures-1,2)];
      const retryAfter=Number(options.retryAfterMs)||0;
      return Math.min(this.maximumMs,Math.max(backoff,retryAfter,options.rateLimited?60000:0));
    }
  }

  global.WebWindowsFlightPosition=Object.freeze({GreatCircleRoute,FlightPositionResolver,FlightRefreshPolicy,flightPathLayers,nearestRouteProgress,timeMilliseconds,validPoint});
})(typeof window!=="undefined"?window:globalThis);
