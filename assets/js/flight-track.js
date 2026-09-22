(function(global){
  "use strict";

  const ENDPOINT="/api/adsb-trace-proxy.asp";

  function validHex(value){
    return /^[0-9a-f]{6}$/i.test(String(value||""));
  }

  function normalizeFlight(value){
    return String(value||"")
      .trim()
      .toUpperCase()
      .replace(/\s+/g,"");
  }

  function parseTrace(raw){
    if(!raw || !Array.isArray(raw.trace)){
      return [];
    }

    const base=Number(raw.timestamp);

    if(!Number.isFinite(base)){
      return [];
    }

    return raw.trace
      .map(row=>{
        if(!Array.isArray(row) || row.length<7){
          return null;
        }

        const offset=Number(row[0]);
        const latitude=Number(row[1]);
        const longitude=Number(row[2]);
        const altitude=
          typeof row[3]==="number"
            ?Number(row[3])
            :null;

        const groundSpeed=
          Number.isFinite(Number(row[4]))
            ?Number(row[4])
            :null;

        const heading=
          Number.isFinite(Number(row[5]))
            ?Number(row[5])
            :null;

        const flags=Number(row[6])||0;

        const aircraft=
          row[8] && typeof row[8]==="object"
            ?row[8]
            :null;

        if(
          !Number.isFinite(offset) ||
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ){
          return null;
        }

        return {
          latitude,
          longitude,
          altitude,
          groundSpeed,
          heading,

          timestamp:base+offset,

          newLeg:(flags&2)!==0,

          callsign:normalizeFlight(
            aircraft?.flight
          ),

          source:"live"
        };
      })
      .filter(Boolean);
  }

  /*
   * 只取 trace 最后一个航段。
   *
   * readsb flags bit 2 表示 new leg，
   * 因此不用自己猜飞机何时起飞。
   */
  function latestLeg(points){
    if(!points.length){
      return [];
    }

    let start=0;

    for(let i=0;i<points.length;i++){
      if(points[i].newLeg){
        start=i;
      }
    }

    return points.slice(start);
  }

  /*
   * 如果 trace 中有 callsign，
   * 再确认当前航段确实属于当前航班。
   *
   * 如果 ADS-B 点没有 callsign，
   * 不因此删除合法的位置历史。
   */
  function matchFlight(points,flightIcao){
    const target=normalizeFlight(flightIcao);

    if(!target){
      return points;
    }

    const known=points.filter(p=>p.callsign);

    if(!known.length){
      return points;
    }

    const matching=points.filter(
      p=>!p.callsign || p.callsign===target
    );

    return matching.length>=2
      ?matching
      :[];
  }

  class AdsbTraceProvider{

    async getCurrentTrack(
      {
        icao24,
        flightIcao,
        departureTimestamp
      },
      signal
    ){
      if(!validHex(icao24)){
        return [];
      }

      const url=new URL(
        ENDPOINT,
        global.location.origin
      );

      url.searchParams.set(
        "hex",
        String(icao24).toLowerCase()
      );

      url.searchParams.set(
        "mode",
        "full"
      );

      const response=await fetch(url,{
        credentials:"same-origin",
        signal,
        headers:{
          Accept:"application/json"
        }
      });

      if(response.status===404){
        return [];
      }

      if(!response.ok){
        return [];
      }

      const raw=await response.json();

      let points=parseTrace(raw);

      points=latestLeg(points);

      points=matchFlight(
        points,
        flightIcao
      );

      /*
       * 再按今天航班实际/预计/计划起飞时间裁剪。
       * 给 30 分钟余量，避免起飞时刻误差。
       */
      if(
        Number.isFinite(
          Number(departureTimestamp)
        )
      ){
        const minimum=
          Number(departureTimestamp)-1800;

        points=points.filter(
          p=>p.timestamp>=minimum
        );
      }

      return points;
    }
  }

  global.WebWindowsFlightTrack=
    Object.freeze({
      AdsbTraceProvider,
      parseTrace,
      latestLeg
    });

})(typeof window!=="undefined"
  ?window
  :globalThis);