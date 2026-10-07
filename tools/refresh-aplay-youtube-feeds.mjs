import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const YOUTUBE_CHANNELS = Object.freeze([
  "UC4eYXhJI4-7wSWc8UNRwD4A",
  "UCXuqSBlHAE6Xw-yeJA0Tunw",
  "UCSJ4gkVC6NrvII8umztf0Ow"
]);
export const YOUTUBE_TREND_REGIONS = Object.freeze([
  "JP", "US", "GB", "CA", "AU", "KR", "IN", "SG",
  "TW", "HK", "CN", "FR", "DE", "BR", "MX", "ES"
]);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "data", "aplay", "youtube-feeds.json");
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const API_BASE = "https://www.googleapis.com/youtube/v3";

async function apiGet(resource, params, { apiKey, fetchImpl }) {
  const url = new URL(`${API_BASE}/${resource}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetchImpl(url, {
    headers: { Accept: "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) {
    let reason = "";
    try {
      const payload = await response.json();
      reason = String(payload?.error?.errors?.[0]?.reason || payload?.error?.status || "");
    } catch {}
    const error = new Error("YouTube Data API " + resource + " returned HTTP " + response.status + (reason ? " (" + reason + ")" : ""));
    error.status = response.status;
    error.reason = reason;
    throw error;
  }
  const payload = await response.json();
  if (!payload || typeof payload !== "object") throw new Error(`YouTube Data API ${resource} returned invalid JSON`);
  return payload;
}

function parsePlaylistItems(payload) {
  if (!Array.isArray(payload?.items)) throw new Error("YouTube playlist response is missing items");
  const seen = new Set();
  return payload.items.flatMap(item => {
    const videoId = String(item?.contentDetails?.videoId || item?.snippet?.resourceId?.videoId || "").trim();
    const title = String(item?.snippet?.title || "").trim().slice(0, 240);
    if (!VIDEO_ID.test(videoId) || !title || seen.has(videoId)) return [];
    seen.add(videoId);
    const publishedAt = String(item?.contentDetails?.videoPublishedAt || item?.snippet?.publishedAt || "");
    const thumbnail = ["maxres", "high", "medium", "default"].map(size => item?.snippet?.thumbnails?.[size]?.url).find(url => /^https:\/\/i\.ytimg\.com\//i.test(String(url || ""))) || "";
    return [{ videoId, title, publishedAt: /^\d{4}-\d\d-\d\dT/.test(publishedAt) ? publishedAt.slice(0, 40) : "", thumbnail }];
  }).slice(0, 15);
}

function parseMostPopularItems(payload) {
  if (!Array.isArray(payload?.items)) throw new Error("YouTube popular response is missing items");
  const seen = new Set();
  return payload.items.flatMap(item => {
    const videoId = String(typeof item?.id === "string" ? item.id : item?.id?.videoId || "").trim();
    const title = String(item?.snippet?.title || "").trim().slice(0, 240);
    if (!VIDEO_ID.test(videoId) || !title || seen.has(videoId)) return [];
    seen.add(videoId);
    const publishedAt = String(item?.snippet?.publishedAt || "");
    const thumbnail = ["maxres", "high", "medium", "default"].map(size => item?.snippet?.thumbnails?.[size]?.url).find(url => /^https:\/\/i\.ytimg\.com\//i.test(String(url || ""))) || "";
    return [{ videoId, title, publishedAt: /^\d{4}-\d\d-\d\dT/.test(publishedAt) ? publishedAt.slice(0, 40) : "", thumbnail }];
  }).slice(0, 15);
}


function decodeXmlValue(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseYouTubeRssItems(xml) {
  const entries = [...String(xml || "").matchAll(/<(entry|item)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  const seen = new Set();
  return entries.flatMap(match => {
    const entry = match[2];
    const title = decodeXmlValue(entry.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim().slice(0, 240);
    const taggedId = entry.match(/<yt:videoId\b[^>]*>([\s\S]*?)<\/yt:videoId>/i)?.[1];
    const atomId = entry.match(/<id\b[^>]*>[\s\S]*?:video:([A-Za-z0-9_-]{11})\s*<\/id>/i)?.[1];
    let videoId = decodeXmlValue(taggedId || atomId || "").trim();
    if (!videoId) {
      const href = entry.match(/<link\b[^>]*href=["']([^"']+)["']/i)?.[1];
      try {
        videoId = new URL(decodeXmlValue(href || "")).searchParams.get("v") || "";
      } catch {}
    }
    if (!VIDEO_ID.test(videoId) || !title || seen.has(videoId)) return [];
    seen.add(videoId);
    const publishedAt = decodeXmlValue(
      entry.match(/<(?:published|updated)\b[^>]*>([\s\S]*?)<\/(?:published|updated)>/i)?.[1] || ""
    ).trim();
    return [{
      videoId,
      title,
      publishedAt: /^\d{4}-\d\d-\d\dT/.test(publishedAt) ? publishedAt.slice(0, 40) : ""
    }];
  }).slice(0, 15);
}

async function fetchYouTubeRssChannel(channelId, fetchImpl) {
  const url = new URL("https://www.youtube.com/feeds/videos.xml");
  url.searchParams.set("channel_id", channelId);
  const response = await fetchImpl(url, {
    headers: { Accept: "application/atom+xml, application/xml;q=0.9" },
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) throw new Error("YouTube public RSS feed returned HTTP " + response.status);
  return parseYouTubeRssItems(await response.text());
}

export async function buildYouTubeFeedCache({ apiKey, fetchImpl = fetch, now = new Date() } = {}) {
  if (!apiKey || !String(apiKey).trim()) throw new Error("Missing YOUTUBE_API_KEY GitHub Actions secret");
  const channelResponse = await apiGet("channels", {
    part: "contentDetails",
    id: YOUTUBE_CHANNELS.join(","),
    maxResults: "50"
  }, { apiKey, fetchImpl });
  if (!Array.isArray(channelResponse.items)) throw new Error("YouTube channels response is missing items");
  const uploads = new Map();
  for (const channel of channelResponse.items) {
    if (YOUTUBE_CHANNELS.includes(channel?.id) && channel?.contentDetails?.relatedPlaylists?.uploads) {
      uploads.set(channel.id, channel.contentDetails.relatedPlaylists.uploads);
    }
  }
  if (uploads.size !== YOUTUBE_CHANNELS.length) throw new Error("YouTube API did not return all configured channels");

  const channels = Object.fromEntries(await Promise.all(YOUTUBE_CHANNELS.map(async channelId => {
    const playlistId = uploads.get(channelId);
    try {
      const response = await apiGet("playlistItems", {
        part: "snippet,contentDetails",
        playlistId,
        maxResults: "15"
      }, { apiKey, fetchImpl });
      return [channelId, { channelId, videos: parsePlaylistItems(response) }];
    } catch (error) {
      if (error?.status !== 404) {
        throw new Error("YouTube upload playlist request failed for channel " + channelId + ": " + error.message);
      }
      console.warn("YouTube upload playlist missing for channel " + channelId + "; trying the public RSS feed.");
      try {
        const videos = await fetchYouTubeRssChannel(channelId, fetchImpl);
        if (!videos.length) console.warn("YouTube RSS fallback returned no videos for channel " + channelId + ".");
        return [channelId, { channelId, videos }];
      } catch (rssError) {
        console.warn("YouTube RSS fallback failed for channel " + channelId + ": " + rssError.message);
        return [channelId, { channelId, videos: [] }];
      }
    }
  })));
  const regions = Object.fromEntries(await Promise.all(YOUTUBE_TREND_REGIONS.map(async regionCode => {
    try {
      const response = await apiGet("videos", {
        part: "snippet,contentDetails",
        chart: "mostPopular",
        regionCode,
        maxResults: "15"
      }, { apiKey, fetchImpl });
      const videos = parseMostPopularItems(response);
      if (!videos.length) console.warn("YouTube most-popular chart returned no videos for region " + regionCode + ".");
      return [regionCode, { regionCode, videos }];
    } catch (error) {
      console.warn("YouTube most-popular chart unavailable for region " + regionCode + ": " + error.message);
      return [regionCode, { regionCode, videos: [] }];
    }
  })));
  if (!Object.values(channels).some(channel => channel.videos.length)) {
    throw new Error("YouTube API and public RSS returned no valid videos; keeping the existing cache");
  }
  return {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    source: "YouTube Data API v3 with regional popular charts and public RSS fallback",
    channels,
    regions
  };
}

export async function refreshYouTubeFeedCache({
  apiKey = process.env.YOUTUBE_API_KEY,
  fetchImpl = fetch,
  now = new Date(),
  output = OUTPUT
} = {}) {
  const payload = await buildYouTubeFeedCache({ apiKey, fetchImpl, now });
  await fs.mkdir(path.dirname(output), { recursive: true });
  const temporary = `${output}.tmp`;
  await fs.writeFile(temporary, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await fs.rename(temporary, output);
  return payload;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  refreshYouTubeFeedCache()
    .then(({ channels }) => {
      const count = Object.values(channels).reduce((total, channel) => total + channel.videos.length, 0);
      console.log(`Updated APlay YouTube cache: ${count} videos across ${Object.keys(channels).length} channels.`);
    })
    .catch(error => {
      console.error(`APlay YouTube cache refresh failed: ${error.message}`);
      process.exitCode = 1;
    });
}
