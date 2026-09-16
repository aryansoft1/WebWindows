import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const providerSource=await fs.readFile(new URL("../assets/js/navigation-providers.js",import.meta.url),"utf8");
const html=await fs.readFile(new URL("../road.html",import.meta.url),"utf8");
const appSource=await fs.readFile(new URL("../assets/js/navigation-app.js",import.meta.url),"utf8");
const catalog=JSON.parse(await fs.readFile(new URL("../data/apps/system-apps.json",import.meta.url),"utf8"));

function load({config={},fetchImpl=async()=>{throw new Error("offline")}}={}){
  const values=new Map(),window={location:{origin:"https://webwindows.example"},WebWindowsNavigationConfig:config,localStorage:{getItem:key=>values.get(key)||null},fetch:fetchImpl};
  window.window=window;
  vm.runInContext(providerSource,vm.createContext({window,globalThis:window,URL,Math,Object,Array,String,Number,Boolean,Error,Promise}),{filename:"navigation-providers.js"});
  return window.WebWindowsNavigation;
}

const api=load();
assert.equal(api.chooseProvider("auto",[]).id,"community");
assert.equal(api.chooseProvider("community",[]).id,"community");
assert.equal(api.chooseProvider("offline",[]).id,"offline");
assert.equal(api.basemap.resolve("community",[]).id,"community");
assert.equal(api.geocoder.search,api.search);
assert.equal(api.router.route,api.route);
assert.throws(()=>api.sameOriginEndpoint("https://evil.example/maps"),/同源/);

const beijing={lat:39.9042,lng:116.4074},gcj=api.wgs84ToGcj02(beijing.lat,beijing.lng);
assert.ok(Math.abs(gcj.lat-beijing.lat)>.001&&Math.abs(gcj.lng-beijing.lng)>.001);
const roundTrip=api.gcj02ToWgs84(gcj.lat,gcj.lng);
assert.ok(Math.abs(roundTrip.lat-beijing.lat)<.0001&&Math.abs(roundTrip.lng-beijing.lng)<.0001);
const tokyo=api.wgs84ToGcj02(35.6762,139.6503);
assert.equal(tokyo.lat,35.6762);
assert.equal(tokyo.lng,139.6503);

const online=load({fetchImpl:async url=>{
  if(String(url).startsWith("https://photon.komoot.io/api/"))return {ok:true,status:200,json:async()=>({features:[{properties:{name:"东京站",city:"东京",country:"日本",countrycode:"JP"},geometry:{coordinates:[139.7671,35.6812]}}]})};
  if(String(url).startsWith("https://router.project-osrm.org/route/v1/driving/"))return {ok:true,status:200,json:async()=>({routes:[{distance:12340,duration:1800,geometry:{type:"LineString",coordinates:[[139.7671,35.6812],[139.6917,35.6895]]},legs:[{steps:[{name:"东京站",distance:0,maneuver:{type:"depart"}},{name:"中央通",distance:12340,maneuver:{type:"turn",modifier:"right"}},{name:"新宿",distance:0,maneuver:{type:"arrive"}}]}]}]})};
  throw new Error("unexpected URL");
}});
const search=await online.search("东京站","community");
assert.equal(search.provider.id,"community");
assert.equal(search.results[0].name,"东京站");
const route=await online.route({name:"东京",lat:35.6812,lng:139.7671},{name:"新宿",lat:35.6895,lng:139.6917},"driving","community");
assert.equal(route.estimated,false);
assert.equal(route.geometry.length,2);
assert.match(route.steps[1].instruction,/右转/);

const walking=await online.route({name:"东京",lat:35.6812,lng:139.7671},{name:"新宿",lat:35.6895,lng:139.6917},"walking","community");
assert.equal(walking.estimated,true);
assert.equal(walking.unsupportedMode,true);
const offlineSearch=await api.search("Tokyo","community");
assert.equal(offlineSearch.fallback,true);
assert.equal(offlineSearch.results[0].name,"东京");

const navApp=catalog.apps.find(app=>app.id==="webwindows.system.navigation");
assert.ok(navApp&&navApp.placement.desktop&&navApp.placement.startMenu);
assert.match(html,/maplibre-gl@5\.6\.1/);
assert.match(html,/tiles\.openfreemap\.org/);
assert.match(html,/photon\.komoot\.io/);
assert.match(html,/router\.project-osrm\.org/);
assert.doesNotMatch(html,/tile\.openstreetmap\.org|api[_-]?key|access_token/i);
assert.doesNotMatch(appSource,/\.innerHTML\s*=/);
assert.match(appSource,/new maplibregl\.Map/);
assert.match(appSource,/getCurrentPosition/);
assert.match(appSource,/visibilitychange/);
assert.match(appSource,/ResizeObserver/);
assert.match(appSource,/定位权限已拒绝/);

console.log("navigation map, provider, and integration smoke tests passed");
