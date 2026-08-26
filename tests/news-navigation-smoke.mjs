import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [listPage, detailPage, listScript, detailScript, catalog] = await Promise.all([
  readFile(new URL("../news.html", import.meta.url), "utf8"),
  readFile(new URL("../news_view.html", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/news.js", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/news_view.js", import.meta.url), "utf8"),
  readFile(new URL("../data/apps/system-apps.json", import.meta.url), "utf8").then(JSON.parse),
]);

const releaseToken = "20260826-news-nav-1";
assert.match(listPage, new RegExp(`assets/js/news\\.js\\?v=${releaseToken}`));
assert.match(detailPage, new RegExp(`news\\.html\\?v=${releaseToken}`),
  "the detail back link must bypass cached legacy news.html");
assert.match(detailPage, new RegExp(`name="v"[^>]+value="${releaseToken}"`),
  "detail search submissions must keep the current news release token");
assert.match(listScript, new RegExp(`news_view\\.html\\?id=\\$\\{encodeURIComponent\\(item\\.id\\)\\}&v=${releaseToken}`));
assert.match(detailScript, new RegExp(`&v=${releaseToken}`));

const newsApp = catalog.apps.find(app => app.id === "com.aryansoft.webwindows.news");
assert.ok(newsApp, "the news center must remain registered");
assert.equal(newsApp.entry, `news.html?v=${releaseToken}`,
  "launching News Center must bypass cached legacy markup");

console.log("News navigation smoke tests passed");
