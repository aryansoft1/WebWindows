import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const parserSource = fs.readFileSync(new URL("../assets/js/file-query-parser.js", import.meta.url), "utf8");
const searchSource = fs.readFileSync(new URL("../assets/js/file-search.js", import.meta.url), "utf8");
const now = new Date("2026-08-10T12:00:00+09:00");
const fixtures = [
  { id:"md-1",nodeId:"main",source:"public",scope:"public",name:"README.md",path:"Documents/README.md",folderPath:"Documents",extension:"md",mimeType:"text/markdown",size:1200,createdAt:"2026-07-01T08:00:00",modifiedAt:"2026-08-08T09:00:00",uploadedAt:"2026-07-01T08:00:00",readUrl:"openResource.asp?path=Documents%2FREADME.md" },
  { id:"md-2",nodeId:"main",source:"public",scope:"public",name:"WebWindows Guide.md",path:"Documents/WebWindows Guide.md",folderPath:"Documents",extension:"md",mimeType:"text/markdown",size:2200,createdAt:"2026-07-03T08:00:00",modifiedAt:"2026-08-09T09:00:00",uploadedAt:"2026-07-03T08:00:00",readUrl:"openResource.asp?path=Documents%2FWebWindows%20Guide.md" },
  { id:"xlsx-1",nodeId:"main",source:"public",scope:"public",name:"7月3日统计.xlsx",path:"Samples/7月3日统计.xlsx",folderPath:"Samples",extension:"xlsx",mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",size:5200,createdAt:"2026-07-03T10:00:00",modifiedAt:"2026-07-04T09:00:00",uploadedAt:"2026-07-03T10:00:00",readUrl:"openResource.asp?path=Samples%2F7.xlsx" },
  { id:"pdf-1",nodeId:"main",source:"public",scope:"public",name:"变更记录.pdf",path:"Documents/变更记录.pdf",folderPath:"Documents",extension:"pdf",mimeType:"application/pdf",size:6200,createdAt:"2026-06-01T08:00:00",modifiedAt:"2026-07-03T15:00:00",uploadedAt:"2026-06-01T08:00:00",readUrl:"openResource.asp?path=Documents%2Fchange.pdf" },
  { id:"docx-1",nodeId:"main",source:"public",scope:"public",name:"周报.docx",path:"Documents/周报.docx",folderPath:"Documents",extension:"docx",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",size:7200,createdAt:"2026-08-05T08:00:00",modifiedAt:"2026-08-06T08:00:00",uploadedAt:"2026-08-05T08:00:00",readUrl:"openResource.asp?path=Documents%2Fweekly.docx" }
];
let aiCalls = 0;
let aiArguments = null;
const windowObject = {
  location: { href: "https://www.y0.hk/cloud/browser/files.asp" },
  localStorage: { getItem(){ return "zh"; } },
  WebWindows: { device: { storage: { async listVolumes(){ return []; }, async listDirectory(){ return []; } } } }
};
const context = vm.createContext({
  window: windowObject,
  document: { currentScript: { src: "https://www.y0.hk/assets/js/file-query-parser.js" }, body: { dataset: { language:"zh" } } },
  console, Date, Math, JSON, Object, Array, Map, Set, String, Number, Boolean, Promise,
  URL, URLSearchParams, AbortController, Blob, TextEncoder,
  fetch: async (url) => {
    if (String(url).includes("chatproxy.asp")) {
      aiCalls += 1;
      if (aiArguments) return { ok:true, status:200, async json(){ return { choices:[{ message:{ tool_calls:[{ function:{ name:"parseFileSearchQuery", arguments:JSON.stringify(aiArguments) } }] } }] }; } };
      return { ok:false, status:503, async json(){ return { error:{ message:"not needed" } }; } };
    }
    return { ok:true, status:200, async json(){ return { ok:true,version:"2.0",results:fixtures,sources:{public:true,private:false},warnings:[] }; } };
  }
});
vm.runInContext(parserSource, context, { filename:"file-query-parser.js" });
context.document.currentScript.src = "https://www.y0.hk/assets/js/file-search.js";
vm.runInContext(searchSource, context, { filename:"file-search.js" });

const parser = windowObject.WebWindows.fileQuery;
const files = windowObject.WebWindows.files;
const cases = [
  ["所有的md扩展名的文件", ["md"], null],
  ["所有md文件", ["md"], null],
  [".md", ["md"], null],
  ["Markdown", ["md"], null],
  ["所有Excel文件", ["xlsx","xls","csv"], null],
  ["7月3日存的Excel", ["xlsx","xls","csv"], null],
  ["7月3日修改的PDF", ["pdf"], null],
  ["名字里有WebWindows的文件", [], null],
  ["上周的Word", ["docx","doc"], null],
  ["最近修改的文件", [], null],
  ["WebWindows", [], "WebWindows"],
  ["一个完全不存在的文件名", [], "一个完全不存在的文件名"]
];
for (const [query, extensions, text] of cases) {
  const parsed = parser.parse(query, { now });
  assert.deepEqual(Array.from(parsed.extensions || []), extensions, query);
  assert.equal(parsed.text || null, text, `${query} residual text`);
}
assert.equal(parser.parse("名字里有WebWindows的文件", { now }).nameContains, "WebWindows");
assert.equal(parser.parse("7月3日存的Excel", { now }).uploadedFrom.startsWith("2026-07-03"), true);
assert.equal(parser.parse("7月3日修改的PDF", { now }).modifiedFrom.startsWith("2026-07-03"), true);
assert.equal(parser.parse("最近修改的文件", { now }).sort, "modifiedAt");
assert.equal(parser.parse("最近打开的文件", { now }).ast.unsupported.includes("openedAt"), true);
assert.deepEqual(Array.from(parser.parse("文档", { now }).extensions), ["docx","doc","odt","rtf","pdf","md","txt"]);
assert.deepEqual(Array.from(parser.parse("Word文件", { now }).extensions), ["docx","doc"]);
assert.deepEqual(Array.from(parser.parse("表格", { now }).extensions), ["xlsx","xls","csv"]);

const mdResult = await files.search("所有的md扩展名的文件", { now, allowAI:true, sources:["public"] });
assert.equal(aiCalls, 0, "deterministic queries must not call GLM");
assert.deepEqual(Array.from(mdResult.results, item => item.name), ["README.md", "WebWindows Guide.md"]);
assert.equal(mdResult.criteria.text, undefined);
assert.deepEqual(Array.from(mdResult.criteria.understanding), ["Markdown / MD"]);

const excelResult = await files.search("7月3日存的Excel", { now, sources:["public"] });
assert.deepEqual(Array.from(excelResult.results, item => item.name), ["7月3日统计.xlsx"]);
const pdfResult = await files.search("7月3日修改的PDF", { now, sources:["public"] });
assert.deepEqual(Array.from(pdfResult.results, item => item.name), ["变更记录.pdf"]);
const nameResult = await files.search("名字里有WebWindows的文件", { now, sources:["public"] });
assert.deepEqual(Array.from(nameResult.results, item => item.name), ["WebWindows Guide.md"]);
const missingResult = await files.search("一个完全不存在的文件名", { now, sources:["public"] });
assert.equal(missingResult.total, 0);

const complexQuery = "项目文件夹里超过5MB的PDF";
assert.equal(parser.parse(complexQuery, { now }).ast.needsAI, true);
await parser.parseAsync(complexQuery, { now, allowAI:false });
assert.equal(aiCalls, 0, "typing/debounce parsing must not call GLM");
aiArguments = { intent:"searchFiles", extensions:["pdf"], fileCategory:"pdf", path:"项目", size:{min:5242880}, source:["private","public"], sort:"relevance", order:"desc", limit:50 };
const aiParsed = await parser.parseAsync(complexQuery, { now, allowAI:true });
assert.equal(aiCalls, 1, "only an explicitly submitted complex query may call GLM");
assert.equal(aiParsed.ast.parser, "ai");
assert.equal(aiParsed.folderPath, "项目");
assert.equal(aiParsed.sizeMin, 5242880);
aiArguments = null;
const fallbackParsed = await parser.parseAsync(complexQuery, { now, allowAI:true });
assert.equal(fallbackParsed.ast.parser, "fallback");
assert.equal(fallbackParsed.text, complexQuery);
assert.deepEqual(Array.from(fallbackParsed.parserWarnings), ["ai-query-parser-fallback"]);

console.log("Natural Language Query Understanding v2 smoke tests passed");
