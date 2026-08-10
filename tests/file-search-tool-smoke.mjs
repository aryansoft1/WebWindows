import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const registrySource = fs.readFileSync(new URL("../assets/js/ai-tool-registry.js", import.meta.url), "utf8");
const fileToolSource = fs.readFileSync(new URL("../assets/js/ai-file-tools.js", import.meta.url), "utf8");
const deviceLocationsSource = fs.readFileSync(new URL("../cloud/browser/device-locations.js", import.meta.url), "utf8");
assert.equal(/\.pickDirectory\s*\(|showDirectoryPicker\s*\(/.test(deviceLocationsSource), false,
  "Cloud Files must not invoke a browser or OS directory picker");
let searchCalls = [];
let searchResults = [];
let openedResource = null;

const windowObject = {
  WebWindows: {
    files: {
      parseQuery(query) { return { query, text: query, sources: ["private", "public", "device"] }; },
      async search(criteria) {
        searchCalls.push(criteria);
        return { ok: true, results: searchResults, searchedSources: criteria.sources, warnings: [] };
      }
    },
    device: { storage: { async listVolumes() { return []; } } }
  },
  async openResource(resource) { openedResource = resource; }
};
const context = vm.createContext({
  window: windowObject,
  console,
  Date,
  JSON,
  Object,
  Array,
  Map,
  Set,
  String,
  Number,
  Boolean,
  Promise,
  decodeURIComponent,
  URL,
  Blob
});
vm.runInContext(registrySource, context, { filename: "ai-tool-registry.js" });
vm.runInContext(fileToolSource, context, { filename: "ai-file-tools.js" });

const registry = windowObject.WebWindows.aiTools;
const helpers = windowObject.WebWindows.aiFileTools;
const modelTools = registry.toOpenAITools();
assert.deepEqual(modelTools.map((tool) => tool.function.name), ["searchFiles"]);
assert.equal(registry.list().find((tool) => tool.name === "openFile").modelVisible, false);

assert.equal(helpers.isSearchIntent("找一下7月3日存的Excel"), true);
assert.equal(helpers.isSearchIntent("我上周修改的 PDF"), true);
assert.equal(helpers.isSearchIntent("找名字里有 WebWindows 的文件"), true);
assert.equal(helpers.isSearchIntent("最近的 Word 文件"), true);
assert.equal(helpers.isSearchIntent("解释一下光合作用"), false);
assert.equal(helpers.isSearchIntent("如何打开云资料"), false);
assert.equal(helpers.isExplicitOpenIntent("打开7月3日的Excel"), true);

searchResults = [{
  id: "server-public-1", source: "public", scope: "public", nodeId: "main",
  name: "7月3日统计.xlsx", extension: "xlsx", path: "reports/7-3.xlsx",
  folderPath: "reports", modifiedAt: "2026-07-03T09:00:00", relevanceScore: 88,
  matchReasons: ["fileType", "uploadedAt"], readUrl: "/cloud/browser/openResource.asp?id=1",
  mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 1234
}];
const single = await registry.invoke("searchFiles", {
  query: "找一下7月3日存的Excel",
  extensions: ["xlsx", "xls"],
  uploadedFrom: "2026-07-03T00:00:00",
  uploadedTo: "2026-07-04T00:00:00",
  limit: 10,
  openIfUnique: false
}, { origin: "desktalk" });
assert.equal(searchCalls.length, 1, "searchFiles must delegate exactly once to WebWindows.files.search");
assert.equal(single.total, 1);
assert.equal(single.highConfidence, true);
assert.equal(single.results[0].logicalLocation, "公共资料/reports");
assert.equal("path" in single.results[0], false, "raw paths must not leave the controlled tool");
assert.equal("readUrl" in single.results[0], false, "read URLs must not leave the controlled tool");

await assert.rejects(
  registry.invoke("openFile", { fileId: single.results[0].fileId }, { origin: "desktalk" }),
  /permission denied/i
);
await registry.invoke("openFile", { fileId: single.results[0].fileId }, { origin: "desktalk", userConfirmed: true });
assert.equal(openedResource.name, "7月3日统计.xlsx");
assert.equal(openedResource.permissions.edit, false);

searchResults = [searchResults[0], Object.assign({}, searchResults[0], {
  id: "server-public-2", name: "WebWindows说明.docx", extension: "docx",
  path: "docs/WebWindows.docx", relevanceScore: 78, readUrl: "/cloud/browser/openResource.asp?id=2"
})];
const multiple = await registry.invoke("searchFiles", { query: "找WebWindows相关文件", limit: 10 }, { origin: "desktalk" });
assert.equal(multiple.total, 2);
assert.equal(multiple.highConfidence, false);

searchResults = [];
const empty = await registry.invoke("searchFiles", { query: "找不存在的文件", limit: 10 }, { origin: "desktalk" });
assert.equal(empty.total, 0);

const device = await registry.invoke("searchFiles", {
  query: "找此设备里的PDF", sources: ["device"], extensions: ["pdf"]
}, { origin: "desktalk" });
assert.equal(device.total, 0);
assert.ok(device.warnings.includes("device-unavailable"));

await assert.rejects(
  registry.invoke("searchFiles", { query: "越权", userId: 99 }, { origin: "desktalk" }),
  /Unexpected argument/
);
assert.equal(searchCalls.every((criteria) => !("userId" in criteria)), true);

console.log("File Search Tool smoke tests passed");
