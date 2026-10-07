import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { buildYouTubeFeedCache, YOUTUBE_CHANNELS, YOUTUBE_TREND_REGIONS } from "../tools/refresh-aplay-youtube-feeds.mjs";

const read = async (relative) => fs.readFile(new URL(`../${relative}`, import.meta.url), "utf8");

const html = await read("aplay.html");
const manifest = JSON.parse(await read("data/apps/system-apps.json"));
const resourceOpenSource = await read("assets/js/resource-open.js");
const cloudDialogSource = await read("assets/js/cloud-file-dialog.js");
const deviceSource = await read("cloud/browser/device-locations.js");
const sourceApi = await read("api/aplay-source.asp");
const feedWorkflow = await read(".github/workflows/refresh-aplay-youtube-feeds.yml");
const publicPicker = await read("cloud/browser/files.asp");
const privatePicker = await read("cloud/browser/private-files.asp");

for (const [index, source] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .filter((source) => source.trim())
  .entries()) {
  new vm.Script(source, { filename: `aplay.html#inline-${index + 1}` });
}

assert.match(html, /const I18N_TEXT=/);
assert.match(html, /tw:\s*\{/);
assert.match(html, /en:\s*\{/);
assert.match(html, /jp:\s*\{/);
assert.match(html, /webwindows-language-changed/);
assert.match(html, /WebWindows\.fileDialog\.open/);
assert.match(html, /await host\.openResource/);
assert.doesNotMatch(html, /showOpenFilePicker|type\s*=\s*["']file["']/i);
assert.match(html, /new URL\('\/api\/aplay-source\.asp', location\.origin\)/);
assert.match(html, /fetchAPlaySource\('apple-chart'/);
assert.match(html, /fetchAPlaySource\('apple-search'/);
assert.match(html, /sourceUrl\.searchParams\.set\('source','bili-popular'\)/);
assert.match(html, /id:'yt-local',\s+name:'YouTube·当地热门'/);
assert.match(html, /'YouTube·当地热门':'YouTube · Local trends'/);
assert.match(html, /id="btn-video-refresh"/);
assert.match(html, /YOUTUBE_FEED_CACHE_URLS = \[/);
assert.match(html, /https:\/\/raw\.githubusercontent\.com\/aryansoft1\/WebWindows\/main\/data\/aplay\/youtube-feeds\.json/);
assert.match(html, /https:\/\/raw\.githubusercontent\.com\/aryansoft1\/WebWindows\/codex\/aplay-cloud-media\/data\/aplay\/youtube-feeds\.json/);
assert.doesNotMatch(html, /searchParams\.set\('source','youtube-channel'\)/);
assert.doesNotMatch(html, /YOUTUBE_API_KEY|googleapis\.com\/youtube\/v3/i, "the client must never receive or use the API key");
assert.doesNotMatch(html, /https:\/\/(?:rsshub\.app|r\.jina\.ai|api\.allorigins\.win|itunes\.apple\.com|www\.youtube\.com\/feeds\/videos\.xml)/i);
assert.match(html, /CC BY 4\.0 · 需署名/);
assert.match(html, /incompetech\.com\/music\/royalty-free\/mp3-royaltyfree\/Carefree\.mp3/);
assert.match(html, /incompetech\.com\/music\/royalty-free\/mp3-royaltyfree\/New%20Friendly\.mp3/);
assert.match(html, /sourceUrl:'https:\/\/incompetech\.com\/music\/royalty-free\/index\.html\?isrc=/);
assert.doesNotMatch(html, /freepd\.com|SoundHelix|ice1\.somafm\.com/i);
assert.match(html, /title:'Radio Paradise'.*stream\.radioparadise\.com\/mp3-192/s);
assert.doesNotMatch(html, /somafm\.com/i);
assert.match(html, /querySelectorAll\('entry, item'\)/);
assert.ok(html.includes("/^[A-Za-z0-9_-]{11}$/"), "YouTube ids from fallback feeds must be validated");
assert.match(html, /audio\.addEventListener\('error',onError,\{once:true\}\)/);
assert.match(html, /title\.textContent=v\.title/);
assert.match(html, /songTitle\.textContent=s\.title/);
assert.match(html, /数据源暂不可用，已显示上次成功结果/);
assert.match(html, /localStorage\.setItem\(storageKey,JSON\.stringify\(\{time:now,items\}\)\)/);
assert.match(html, /cover\.src=v\.thumbnail/);
assert.match(html, /shield\.classList\.add\('hidden'\); shield\.onclick=null/);
assert.match(html, /function safeVideoCover\(value,source\)/);
assert.match(manifest.apps.find((candidate) => candidate.id === "com.aryansoft.webwindows.aplay")?.entry || "", /source-proxy-3/);

assert.match(sourceApi, /Case "apple-chart"/);
assert.match(sourceApi, /Case "apple-search"/);
assert.match(sourceApi, /Case "bili-popular"/);
assert.match(sourceApi, /Case "bili-partition"/);
assert.match(sourceApi, /upstream = "https:\/\/rsshub\.bili\.ren\/bilibili\/popular\/all"/);
assert.match(sourceApi, /fallbackUpstream = "https:\/\/rsshub\.mt\.cd\/bilibili\/popular\/all"/);
assert.match(sourceApi, /upstream = "https:\/\/rsshub\.bili\.ren\/bilibili\/partion\/"/);
assert.match(sourceApi, /fallbackUpstream = "https:\/\/rsshub\.mt\.cd\/bilibili\/partion\/"/);
assert.doesNotMatch(sourceApi, /x-web-interface\/(?:newlist|popular)/);
assert.match(sourceApi, /If IsNull\(value\) Then Exit Function/);
assert.match(sourceApi, /InStr\(normalizedBody, "<item"\)/);
assert.match(sourceApi, /IsAllowedChannel/);
assert.doesNotMatch(sourceApi, /QueryString\("url"\)/i);
assert.match(sourceApi, /APLAY_MAX_RESPONSE_CHARS/);
assert.match(feedWorkflow, /cron: "23 \* \* \* \*"/);
assert.match(feedWorkflow, /permissions:\s*\n\s+contents: write/);
assert.match(feedWorkflow, /node tools\/refresh-aplay-youtube-feeds\.mjs/);
assert.match(feedWorkflow, /YOUTUBE_API_KEY:\s*\$\{\{\s*secrets\.YOUTUBE_API_KEY\s*\}\}/);
assert.doesNotMatch(feedWorkflow, /AIza[\w-]{30,}/);
assert.equal(YOUTUBE_CHANNELS.length, 3);

const mockedApiCalls = [];
const mockedRegionCodes = [];
const fixtureKey = "test-only-fixture-key";
const generatedCache = await buildYouTubeFeedCache({
  apiKey: fixtureKey,
  now: new Date("2026-10-08T00:00:00.000Z"),
  fetchImpl: async (input, options) => {
    const url = new URL(input);
    assert.equal(options.headers["x-goog-api-key"], fixtureKey);
    assert.equal(url.searchParams.has("key"), false, "API key must not appear in URLs");
    mockedApiCalls.push(url.pathname);
    if (url.pathname.endsWith("/videos")) {
      assert.equal(url.searchParams.get("chart"), "mostPopular");
      mockedRegionCodes.push(url.searchParams.get("regionCode"));
      return { ok: true, status: 200, async json() { return { items: [{
        id: "dQw4w9WgXcQ",
        snippet: { title: `Local ${url.searchParams.get("regionCode")}`, publishedAt: "2026-10-08T00:00:00Z", thumbnails: { high: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" } } }
      }] }; } };
    }
    const payload = url.pathname.endsWith("/channels")
      ? { items: YOUTUBE_CHANNELS.map(channelId => ({ id: channelId, contentDetails: { relatedPlaylists: { uploads: `UU${channelId.slice(2)}` } } })) }
      : { items: [
        { contentDetails: { videoId: "dQw4w9WgXcQ", videoPublishedAt: "2026-10-08T00:00:00Z" }, snippet: { title: "Fixture video", thumbnails: { high: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" } } } },
        { contentDetails: { videoId: "invalid" }, snippet: { title: "Rejected video" } }
      ] };
    return { ok: true, status: 200, async json() { return payload; } };
  }
});
assert.equal(mockedApiCalls.filter(endpoint => endpoint.endsWith("/channels")).length, 1);
assert.equal(mockedApiCalls.filter(endpoint => endpoint.endsWith("/playlistItems")).length, 3);
assert.deepEqual([...mockedRegionCodes].sort(), [...YOUTUBE_TREND_REGIONS].sort());
assert.equal(generatedCache.channels[YOUTUBE_CHANNELS[0]].videos[0].videoId, "dQw4w9WgXcQ");
assert.equal(generatedCache.channels[YOUTUBE_CHANNELS[0]].videos[0].thumbnail, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
assert.equal(generatedCache.regions.JP.videos[0].title, "Local JP");
assert.equal(generatedCache.regions.JP.videos[0].thumbnail, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
assert.doesNotMatch(JSON.stringify(generatedCache), /test-only-fixture-key/);

const rssFallbackChannel = YOUTUBE_CHANNELS[1];
const rssFallbackCalls = [];
const rssFallbackCache = await buildYouTubeFeedCache({
  apiKey: fixtureKey,
  now: new Date("2026-10-08T00:00:00.000Z"),
  fetchImpl: async (input, options) => {
    const url = new URL(input);
    if (url.pathname.endsWith("/channels")) {
      assert.equal(options.headers["x-goog-api-key"], fixtureKey);
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            items: YOUTUBE_CHANNELS.map(channelId => ({
              id: channelId,
              contentDetails: { relatedPlaylists: { uploads: "UU" + channelId.slice(2) } }
            }))
          };
        }
      };
    }
    if (url.pathname.endsWith("/playlistItems")) {
      assert.equal(options.headers["x-goog-api-key"], fixtureKey);
      if (url.searchParams.get("playlistId") === "UU" + rssFallbackChannel.slice(2)) {
        return {
          ok: false,
          status: 404,
          async json() { return { error: { errors: [{ reason: "playlistNotFound" }] } }; }
        };
      }
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            items: [{
              contentDetails: { videoId: "dQw4w9WgXcQ", videoPublishedAt: "2026-10-08T00:00:00Z" },
              snippet: { title: "API video" }
            }]
          };
        }
      };
    }
    if (url.pathname.endsWith("/videos")) {
      return {
        ok: true,
        status: 200,
        async json() {
          return { items: [{ id: "dQw4w9WgXcQ", snippet: { title: "Regional video", thumbnails: { medium: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg" } } } }] };
        }
      };
    }
    assert.equal(url.hostname, "www.youtube.com");
    assert.equal(url.pathname, "/feeds/videos.xml");
    assert.equal(url.searchParams.get("channel_id"), rssFallbackChannel);
    assert.equal(url.searchParams.has("key"), false);
    assert.equal(options.headers["x-goog-api-key"], undefined, "RSS fallback must not receive the API key");
    rssFallbackCalls.push(url.searchParams.get("channel_id"));
    return {
      ok: true,
      status: 200,
      async text() {
        return '<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"><entry><yt:videoId>9bZkp7q19f0</yt:videoId><title>RSS &amp; fallback</title><published>2026-10-08T00:00:00Z</published></entry></feed>';
      }
    };
  }
});
assert.deepEqual(rssFallbackCalls, [rssFallbackChannel]);
assert.equal(rssFallbackCache.channels[rssFallbackChannel].videos[0].videoId, "9bZkp7q19f0");
assert.equal(rssFallbackCache.channels[rssFallbackChannel].videos[0].title, "RSS & fallback");
assert.equal(rssFallbackCache.channels[YOUTUBE_CHANNELS[0]].videos[0].title, "API video");

await assert.rejects(() => buildYouTubeFeedCache({ apiKey: "", fetchImpl: async () => { throw new Error("must not fetch"); } }), /YOUTUBE_API_KEY/);

const app = manifest.apps.find((candidate) => candidate.id === "com.aryansoft.webwindows.aplay");
assert.ok(app, "APlay must be registered");
const mediaHandler = app.fileHandlers.find((handler) => handler.adapter === "cloud-media");
assert.ok(mediaHandler, "APlay must own the unified cloud-media association");
for (const extension of [".mp3", ".flac", ".mp4", ".webm", ".mkv"]) {
  assert.ok(mediaHandler.extensions.includes(extension), `${extension} must resolve to APlay`);
}

const frameMessages = [];
const frameWindow = { postMessage(message, origin) { frameMessages.push({ message, origin }); } };
const frame = { contentWindow: frameWindow, addEventListener() {} };
const listeners = new Map();
const windowObject = {
  location: { origin: "https://webwindows.test", href: "https://webwindows.test/index.html" },
  WebWindows: {
    apps: {
      async resolveResource() {
        return { app: { id: app.id, name: app.name, entry: app.entry }, handler: mediaHandler };
      },
      async launch() {}
    }
  },
  addEventListener(type, listener) { listeners.set(type, listener); },
  alert(message) { throw new Error(`Unexpected alert: ${message}`); }
};
const context = vm.createContext({
  window: windowObject,
  document: { querySelector: (selector) => selector === "#win-aplay iframe" ? frame : null },
  console,
  URL,
  URLSearchParams,
  Object,
  String,
  Array,
  Error,
  RegExp
});
new vm.Script(resourceOpenSource, { filename: "resource-open.js" }).runInContext(context);

await windowObject.openResource({
  protocol: "webwindows-cloud-resource",
  scope: "private",
  nodeId: "private-node",
  path: "private/hidden/song.mp3",
  name: "song.mp3",
  mimeType: "audio/mpeg",
  url: "https://webwindows.test/cloud/browser/private-resource.asp?id=42"
});
assert.deepEqual(
  JSON.parse(JSON.stringify(frameMessages.at(-1))),
  {
    message: {
      type: "webwindows-aplay-open-media",
      media: {
        name: "song.mp3",
        mimeType: "audio/mpeg",
        kind: "audio",
        url: "https://webwindows.test/cloud/browser/private-resource.asp?id=42",
        source: "private"
      }
    },
    origin: "https://webwindows.test"
  }
);
assert.doesNotMatch(JSON.stringify(frameMessages.at(-1)), /private-node|private\/hidden/);

await windowObject.openResource({
  protocol: "webwindows-cloud-resource",
  scope: "device",
  nodeId: "local-volume",
  path: "content:\/\/provider\/secret\/movie.mp4",
  name: "movie.mp4",
  mimeType: "video/mp4",
  url: "blob:https://webwindows.test/controlled-media"
});
const devicePayload = JSON.stringify(frameMessages.at(-1));
assert.match(devicePayload, /controlled-media/);
assert.doesNotMatch(devicePayload, /local-volume|content:|provider|secret/);

await assert.rejects(
  () => windowObject.openResource({
    protocol: "webwindows-cloud-resource",
    scope: "device",
    name: "unsafe.mp3",
    mimeType: "audio/mpeg",
    url: "content:\/\/provider\/unsafe.mp3"
  }),
  /读取地址不安全|受控临时地址/
);

assert.match(deviceSource, /scope:\s*"device"/);
assert.match(deviceSource, /blob,/);
assert.match(deviceSource, /pickerAccepts/);
assert.match(cloudDialogSource, /URL\.createObjectURL\(resource\.blob\)/);
assert.match(cloudDialogSource, /delete safe\.path/);
assert.match(cloudDialogSource, /delete safe\.nodeId/);
assert.match(publicPicker, /Case "mp3"/);
assert.match(publicPicker, /Case "mp4", "m4v"/);
assert.match(privatePicker, /Case "mp3": FileMime = "audio\/mpeg"/);
assert.match(privatePicker, /Case "mp4", "m4v": FileMime = "video\/mp4"/);

const parseItemsSource = html.match(/function parseItems\(doc, feed\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(parseItemsSource, "YouTube feed parser must exist");
const safeVideoCoverSource = html.match(/function safeVideoCover\(value,source\)\{[\s\S]*?\n\}/)?.[0];
const makeVideoEntrySource = html.match(/function makeVideoEntry\(title,bvid,cover\)\{[\s\S]*?\n\}/)?.[0];
const parseBilibiliApiSource = html.match(/function parseBilibiliApi\(data,feed\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(safeVideoCoverSource && makeVideoEntrySource && parseBilibiliApiSource, "Bilibili entries must be parsed with safe cover URLs");
const parseItems = vm.runInNewContext(`${safeVideoCoverSource}; ${makeVideoEntrySource}; ${parseItemsSource}; parseItems`, { URL });
const rssItem = {
  querySelector(selector) {
    if (selector === "title") return { textContent: "Fallback upload" };
    if (selector === "yt\\:videoId, videoId") return null;
    if (selector === "link") return { getAttribute: () => "https://www.youtube.com/watch?v=dQw4w9WgXcQ", textContent: "" };
    return null;
  }
};
const fallbackItems = parseItems({ querySelectorAll: (selector) => selector === "entry, item" ? [rssItem] : [] }, { kind: "yt_channel" });
assert.equal(fallbackItems.length, 1);
assert.equal(fallbackItems[0].url, "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1");
assert.equal(fallbackItems[0].thumbnail, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");

const biliItem = {
  querySelector(selector) {
    if (selector === "title") return { textContent: "Bili cover" };
    if (selector === "link") return { textContent: "https://www.bilibili.com/video/BV1xx411c7mD" };
    if (selector === "description") return { textContent: '<img src="http://i0.hdslb.com/bfs/archive/cover.jpg">' };
    return null;
  }
};
const biliRssItems = parseItems({ querySelectorAll: (selector) => selector === "item" ? [biliItem] : [] }, { kind: "bili-partition" });
assert.equal(biliRssItems[0].thumbnail, "https://i0.hdslb.com/bfs/archive/cover.jpg");
const parseBilibiliApi = vm.runInNewContext(`${safeVideoCoverSource}; ${makeVideoEntrySource}; ${parseBilibiliApiSource}; parseBilibiliApi`, { URL });
const biliApiItems = parseBilibiliApi({ code: 0, data: { list: [{ title: "Bili API cover", bvid: "BV1xx411c7mD", pic: "//i0.hdslb.com/bfs/archive/api-cover.jpg" }] } }, { kind: "bili-pop" });
assert.equal(biliApiItems[0].thumbnail, "https://i0.hdslb.com/bfs/archive/api-cover.jpg");
assert.equal(parseBilibiliApi({ code: 0, data: { archives: [{ title: "Music archive", bvid: "BV1xx411c7mD", pic: "https://i0.hdslb.com/bfs/archive/music.jpg" }] } }, { kind: "bili-partition" })[0].title, "Music archive");
assert.equal(parseBilibiliApi({ code: 0, data: { list: [{ title: "unsafe", bvid: "BV1xx411c7mD", pic: "https://evil.example/cover.jpg" }] } }, { kind: "bili-pop" })[0].thumbnail, "");

const parseCacheSource = html.match(/function parseYouTubeCache\(data,feed\)\{[\s\S]*?\n\}/)?.[0];
const regionHelpersSource = html.match(/const YOUTUBE_REGION_FALLBACKS=[\s\S]*?function getLocalYouTubeRegion\(regions\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(parseCacheSource && regionHelpersSource, "APlay must parse regional YouTube caches");
const regionIntl = { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: "Asia/Tokyo" }) }) };
const parseYouTubeCache = vm.runInNewContext(`${safeVideoCoverSource}; ${regionHelpersSource}; ${parseCacheSource}; parseYouTubeCache`, { URL, Intl: regionIntl, navigator: { language: "en-US", languages: ["en-US"] } });
const cacheItems = parseYouTubeCache(generatedCache, { kind: "yt_channel", id: YOUTUBE_CHANNELS[0] });
assert.equal(cacheItems.length, 1);
assert.equal(cacheItems[0].url, "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1");
assert.equal(cacheItems[0].thumbnail, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
assert.throws(() => parseYouTubeCache({ schemaVersion: 1, channels: {} }, { kind: "yt_channel", id: "UC0000000000000000000000" }), /youtube_channel_missing/);
const localVideos = parseYouTubeCache(generatedCache, { kind: "yt_local" });
assert.equal(localVideos[0].title, "Local JP");
assert.equal(localVideos[0].thumbnail, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");

const playVideoEntrySource = html.match(/function playVideoEntry\(entry\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(playVideoEntrySource, "Video entries must be playable");
const classes = () => { const values = new Set(); return { add: value => values.add(value), remove: value => values.delete(value), contains: value => values.has(value) }; };
const videoElements = {
  "#video-now": { textContent: "" },
  "#video-player": { classList: classes(), parentElement: {}, pause() {}, removeAttribute() {}, load() {} },
  "#video-iframe": { classList: classes(), parentElement: {}, src: "" },
  "#video-shield": { classList: classes(), onclick: null, oncontextmenu: null }
};
vm.runInNewContext(`${playVideoEntrySource}; playVideoEntry`, { $: selector => videoElements[selector], pauseAudio() {}, tx: value => value })({ type: "embed", title: "Bilibili", url: "https://player.bilibili.com/player.html?bvid=BV1xx411c7mD" });
assert.equal(videoElements["#video-iframe"].classList.contains("hidden"), false);
assert.equal(videoElements["#video-shield"].classList.contains("hidden"), true);

const cacheUrlsSource = html.match(/const YOUTUBE_FEED_CACHE_URLS = \[[\s\S]*?\];/)?.[0];
const fetchVideoFeedSource = html.match(/async function fetchVideoFeed\(feed,url\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(cacheUrlsSource && fetchVideoFeedSource, "YouTube cache must have a tested fallback fetch path");
const requestedCacheUrls = [];
const fetchYouTubeFeed = vm.runInNewContext(
  `${safeVideoCoverSource}; ${cacheUrlsSource}; ${parseCacheSource}; ${fetchVideoFeedSource}; fetchVideoFeed`,
  {
    fetch: async (url) => {
      requestedCacheUrls.push(url);
      if (url.includes("/main/")) return { ok: false, status: 404 };
      return { ok: true, status: 200, async json() { return generatedCache; } };
    }
  }
);
const recoveredFeed = await fetchYouTubeFeed({ kind: "yt_channel", id: YOUTUBE_CHANNELS[0] }, "https://raw.githubusercontent.com/aryansoft1/WebWindows/main/data/aplay/youtube-feeds.json");
assert.equal(recoveredFeed.length, 1);
assert.deepEqual(requestedCacheUrls, [
  "https://raw.githubusercontent.com/aryansoft1/WebWindows/main/data/aplay/youtube-feeds.json",
  "https://raw.githubusercontent.com/aryansoft1/WebWindows/codex/aplay-cloud-media/data/aplay/youtube-feeds.json"
]);
const regionalCacheRequests = [];
const fetchYouTubeLocalFeed = vm.runInNewContext(
  `${safeVideoCoverSource}; ${cacheUrlsSource}; ${regionHelpersSource}; ${parseCacheSource}; ${fetchVideoFeedSource}; fetchVideoFeed`,
  {
    Intl: regionIntl,
    navigator: { language: "en-US", languages: ["en-US"] },
    fetch: async (url) => {
      regionalCacheRequests.push(url);
      if (url.includes("/main/")) return { ok: true, status: 200, async json() { return { schemaVersion: 1, channels: generatedCache.channels }; } };
      return { ok: true, status: 200, async json() { return generatedCache; } };
    }
  }
);
const regionalFeed = await fetchYouTubeLocalFeed({ kind: "yt_local" }, "https://raw.githubusercontent.com/aryansoft1/WebWindows/main/data/aplay/youtube-feeds.json");
assert.equal(regionalFeed[0].title, "Local JP", "local trends must use the regional cache before the legacy main cache");
assert.deepEqual(regionalCacheRequests, ["https://raw.githubusercontent.com/aryansoft1/WebWindows/codex/aplay-cloud-media/data/aplay/youtube-feeds.json"]);

console.log("APlay i18n and unified cloud media smoke test passed");
