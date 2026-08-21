import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const source = read("assets/js/file-search.js");
new vm.Script(source, { filename: "file-search.js" });

const window = {
  location: { href: "https://example.test/index.html" },
  document: { currentScript: { src: "https://example.test/assets/js/file-search.js" } },
  WebWindows: {},
  fetch: async () => ({ ok: true, json: async () => ({ ok: true, results: [], warnings: [] }) }),
  URL, URLSearchParams, Date, console
};
window.window = window;
vm.runInNewContext(source, window, { filename: "file-search.js" });
assert.equal(window.WebWindows.files.version, "1.0");

const fixedNow = new Date("2026-08-09T12:00:00+09:00");
const excel = window.WebWindows.files.parseQuery("7月3日存的 Excel", { now: fixedNow });
assert.deepEqual([...excel.extensions], ["xlsx", "xls"]);
assert.ok(excel.uploadedFrom.startsWith("2026-07-02T15:00:00.000Z"));
assert.ok(excel.uploadedTo.startsWith("2026-07-03T15:00:00.000Z"));

const pdf = window.WebWindows.files.parseQuery("上周修改的 PDF", { now: fixedNow });
assert.deepEqual([...pdf.extensions], ["pdf"]);
assert.ok(pdf.modifiedFrom && pdf.modifiedTo);

const named = window.WebWindows.files.parseQuery("名字里有 WebWindows 的文件", { now: fixedNow });
assert.equal(named.nameContains, "WebWindows");

const exact = window.WebWindows.files.matchAndScore({ name: "WebWindows.xlsx", path: "Docs/WebWindows.xlsx", folderPath: "Docs", modifiedAt: fixedNow.valueOf() }, { text: "WebWindows.xlsx" });
assert.equal(exact.relevanceScore, 100);
assert.ok(exact.matchReasons.includes("fileNameExact"));
const conditional = window.WebWindows.files.matchAndScore({ name: "report.pdf", folderPath: "Reports", modifiedAt: fixedNow.valueOf() }, { extensions: ["pdf"], folderPath: "Reports" });
assert.ok(conditional.matchReasons.includes("fileType"));
assert.ok(conditional.matchReasons.includes("folderPath"));

window.fetch = async () => ({ ok: true, json: async () => ({ ok: true, warnings: [], results: [
  { name: "report.pdf", path: "Public/report.pdf", source: "public", nodeId: "public", relevanceScore: 78, readUrl: "openResource.asp?path=Public/report.pdf" },
  { name: "report.pdf", path: "Private/report.pdf", source: "private", nodeId: "private", relevanceScore: 78, readUrl: "private-resource.asp?op=content&path=Private/report.pdf" }
] }) });
const sorted = await window.WebWindows.files.search({ text: "report", sources: ["private", "public"], limit: 10 });
assert.equal(sorted.results[0].source, "private");

const endpoint = read("cloud/browser/search.asp");
assert.match(endpoint, /SEARCH_MAX_SCANNED/);
assert.match(endpoint, /Session\("webwindows_user_id"\)/);
assert.match(endpoint, /SourceRequested\("public"\)/);
assert.match(endpoint, /SourceRequested\("private"\)/);
assert.match(endpoint, /matchReasons/);
assert.match(endpoint, /DateCreated/);
assert.match(endpoint, /DateLastModified/);
assert.match(endpoint, /EpochLocalIso/);
assert.doesNotMatch(endpoint, /physicalPath.*Response|file\.Path.*resultJson/i);

for (const page of ["cloud/browser/files.asp", "cloud/browser/private-files.asp"]) {
  const html = read(page);
  assert.match(html, /assets\/js\/file-search\.js/);
  assert.match(html, /search-ui\.js/);
}
assert.match(read("index.html"), /assets\/js\/file-search\.js/);
assert.match(read("cloud/browser/FILE_SEARCH_API.md"), /WebWindows\.files\.search/);

console.log("file search API smoke test passed");
