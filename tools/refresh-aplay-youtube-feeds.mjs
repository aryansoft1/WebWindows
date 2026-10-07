import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const YOUTUBE_CHANNELS = Object.freeze([
  "UC-9-kyTW8ZkZNDHQJ6FgpwQ",
  "UCXuqSBlHAE6Xw-yeJA0Tunw",
  "UCSJ4gkVC6NrvII8umztf0Ow"
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
  if (!response.ok) throw new Error(`YouTube Data API ${resource} returned HTTP ${response.status}`);
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
    return [{ videoId, title, publishedAt: /^\d{4}-\d\d-\d\dT/.test(publishedAt) ? publishedAt.slice(0, 40) : "" }];
  }).slice(0, 15);
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
    const response = await apiGet("playlistItems", {
      part: "snippet,contentDetails",
      playlistId,
      maxResults: "15"
    }, { apiKey, fetchImpl });
    return [channelId, { channelId, videos: parsePlaylistItems(response) }];
  })));
  if (!Object.values(channels).some(channel => channel.videos.length)) {
    throw new Error("YouTube API returned no valid videos; keeping the existing cache");
  }
  return {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    source: "YouTube Data API v3",
    channels
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
