import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read = relative => readFile(new URL(`../${relative}`, import.meta.url), "utf8");
const [searchCss, publicCss, privateCss, searchUi, publicPage, privatePage, newsHtml, newsCss, newsJs, newsViewHtml, newsViewJs] = await Promise.all([
  read("cloud/browser/file-search.css"), read("cloud/browser/styles.css"), read("cloud/browser/private-files.css"),
  read("cloud/browser/search-ui.js"), read("cloud/browser/files.asp"), read("cloud/browser/private-files.asp"),
  read("news.html"), read("assets/css/news.css"), read("assets/js/news.js"), read("news_view.html"), read("assets/js/news_view.js")
]);

assert.match(searchCss, /\.file-search-box button[^}]*white-space:nowrap/,
  "search button must remain on one line in narrow folder toolbars");
assert.match(publicCss, /\.view-btn\s*\{[^}]*flex:\s*0 0 auto[^}]*white-space:\s*nowrap/s,
  "public view buttons must not shrink or wrap");
assert.match(privateCss, /\.private-view-btn\{[^}]*flex:0 0 auto[^}]*white-space:nowrap/,
  "private view buttons must not shrink or wrap");
assert.ok(searchUi.indexOf('localStorage?.getItem("lang")') < searchUi.indexOf("document.body.dataset.language"),
  "search UI must prefer the WebWindows language setting over browser-derived server language");
assert.match(searchUi, /change-language/);
assert.match(publicPage, /20260815-toolbar-layout-1/);
assert.match(privatePage, /20260815-toolbar-layout-1/);
assert.match(searchCss, /@media\(max-width:1100px\)/);
assert.match(publicCss, /@media \(max-width: 1100px\)/);
assert.match(privateCss, /@media\(max-width:1100px\)/);

assert.match(newsHtml, /news-help-shell/);
assert.match(newsHtml, /id="news-search"/);
assert.match(newsHtml, /id="news-categories"/);
assert.match(newsCss, /\.news-help-sidebar/);
assert.match(newsCss, /\.news-hero/);
assert.match(newsCss, /@media\(max-width:760px\)/);
assert.doesNotMatch(newsJs, /item\.title[^\n]*innerHTML|news\.title[^\n]*innerHTML/,
  "server-provided news titles must use textContent");
assert.match(newsViewHtml, /news-detail-card/);
assert.match(newsViewHtml, /news-help-sidebar/);
assert.match(newsViewHtml, /news-detail-search/);
assert.match(newsViewJs, /\^\\d\+\$/);
new vm.Script(newsJs, { filename: "assets/js/news.js" });
new vm.Script(newsViewJs, { filename: "assets/js/news_view.js" });

console.log("Cloud toolbar and Windows-help news smoke tests passed");
