// Verifies the DeskTalk file-search tool is actually reachable end to end.
//
// This is the check that was missing: tests/file-search-api-smoke.mjs only asserted the
// pages *reference* file-search.js, so a tool that registers but can never be invoked
// shipped unnoticed. Here the real scripts are loaded in index.html's order and the tool
// is invoked, which fails loudly if the parser name, the registry wiring or the model
// tool loop regress again.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

// Loads a browser script the way a <script> tag would, keeping document.currentScript
// correct because both file-search.js and file-query-parser.js resolve their endpoints
// relative to it.
function createPage({ searchResults = [], chatproxy } = {}) {
  const page = {
    location: { href: "https://example.test/index.html" },
    document: {
      currentScript: { src: "https://example.test/assets/js/placeholder.js" },
      body: { dataset: { language: "zh" } },
      addEventListener() {},
      removeEventListener() {},
      readyState: "complete"
    },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    WebWindows: {},
    URL, URLSearchParams, Date, console, setTimeout, clearTimeout,
    fetch: async (input) => {
      const url = String(input);
      if (url.includes("search.asp")) {
        return { ok: true, json: async () => ({ ok: true, results: searchResults, warnings: [], searchedSources: ["public"] }) };
      }
      if (url.includes("chatproxy.asp")) {
        if (!chatproxy) return { ok: false, status: 503, json: async () => ({ error: { message: "chat proxy unavailable" } }) };
        return chatproxy;
      }
      return { ok: true, json: async () => ({}) };
    }
  };
  page.window = page;
  page.context = vm.createContext(page);
  page.load = (relative) => {
    page.document.currentScript = { src: `https://example.test/${relative}` };
    vm.runInContext(read(relative), page.context, { filename: relative });
  };
  return page;
}

// index.html loads the parser before the search API, and both before the tool layer.
const LOAD_ORDER = [
  "assets/js/file-query-parser.js",
  "assets/js/file-search.js",
  "assets/js/ai-tool-registry.js",
  "assets/js/ai-file-tools.js"
];

// 1. The DeskTalk tool parses a natural-language query and returns structured criteria.
{
  const page = createPage();
  for (const file of LOAD_ORDER) page.load(file);

  const { aiTools, files, fileQuery } = page.WebWindows;
  assert.ok(aiTools, "ai-tool-registry.js must expose WebWindows.aiTools");
  assert.ok(files?.search, "file-search.js must expose WebWindows.files.search");
  assert.ok(fileQuery?.parseAsync, "file-query-parser.js must expose WebWindows.fileQuery.parseAsync");

  // The registry must be able to describe its tools to the model, otherwise DeskTalk has
  // nothing to send and the tool is unreachable no matter how correct the handler is.
  const openAiTools = aiTools.toOpenAITools();
  assert.ok(Array.isArray(openAiTools), "aiTools.toOpenAITools() must return an array");
  const searchTool = openAiTools.find((tool) => tool.function?.name === "searchFiles");
  assert.ok(searchTool, "searchFiles must be advertised to the model via toOpenAITools()");
  assert.equal(searchTool.type, "function");
  assert.equal(searchTool.function.parameters.type, "object");
  assert.ok(searchTool.function.description, "searchFiles needs a description for the model");

  aiTools.setPermissionResolver(async () => true);
  const payload = await aiTools.invoke("searchFiles", { query: "上周修改的 PDF" }, { origin: "desktalk" });
  assert.equal(payload.kind, "file-search-results");
  assert.deepEqual([...payload.criteria.extensions], ["pdf"], "the v2 parser must resolve the PDF type alias");
  assert.ok(payload.criteria.modifiedFrom && payload.criteria.modifiedTo, "「上周修改」must produce a modified date range");
  assert.ok(payload.criteria.modifiedTo > payload.criteria.modifiedFrom, "the modified range must be ordered");
}

// 2. The same tool must work when only the v1 parser is present (no file-query-parser.js),
//    so a window that loads file-search.js alone does not hard-fail.
{
  const page = createPage();
  page.load("assets/js/file-search.js");
  page.load("assets/js/ai-tool-registry.js");
  page.load("assets/js/ai-file-tools.js");
  page.WebWindows.aiTools.setPermissionResolver(async () => true);
  const payload = await page.WebWindows.aiTools.invoke("searchFiles", { query: "report.pdf" }, { origin: "desktalk" });
  assert.equal(payload.kind, "file-search-results");
  assert.deepEqual([...payload.criteria.extensions], ["pdf"]);
}

// 3. search-ui.js submits with allowAI:true, and file-search.js must act on it rather than
//    dropping it. Both cloud pages must load the v2 parser so WebWindows.fileQuery exists.
{
  const page = createPage();
  for (const file of LOAD_ORDER) page.load(file);
  assert.ok(read("assets/js/file-search.js").includes("allowAI"),
    "file-search.js must read the allowAI option that search-ui.js passes");

  const aiParsed = await page.WebWindows.files.search("上周修改的 PDF", { allowAI: true, signal: undefined });
  assert.ok(aiParsed.criteria.modifiedFrom, "allowAI:true must reach the v2 parser");
  assert.ok(Array.isArray(aiParsed.criteria.understanding), "the v2 parser supplies understanding for the results header");

  // 3b. understanding must be structured and language-free. It used to be a list of Chinese
  //     strings ("上周 修改", "名称包含 X"), which the Japanese and English pages rendered
  //     verbatim, and which merely repeated the words the user had already typed.
  const understanding = aiParsed.criteria.understanding;
  assert.ok(understanding.every((entry) => entry && typeof entry === "object" && typeof entry.kind === "string"),
    "every understanding entry must be a structured object with a kind");
  assert.doesNotMatch(JSON.stringify(understanding), /[一-鿿]/,
    "the parser must not emit Chinese UI text; search-ui.js assembles the wording per language");
  const dateEntry = understanding.find((entry) => entry.kind === "dateModified");
  assert.ok(dateEntry?.from && dateEntry?.to, "a date filter must report the range it resolved to");
  assert.equal(understanding.some((entry) => entry.kind === "sort"), false,
    "the sort intent is what the user typed, so repeating it adds nothing");
  // Every date kind the parser can emit, so search-ui.js can key its verb table on all of them.
  assert.deepEqual([...page.WebWindows.fileQuery.parse("昨天创建的文件", {}).understanding]
    .map((entry) => entry.kind), ["dateCreated"]);
  assert.deepEqual([...page.WebWindows.fileQuery.parse("昨天上传的文件", {}).understanding]
    .map((entry) => entry.kind), ["dateUploaded"]);

  // A query that already names the type produces a category entry the UI can suppress.
  // The objects come from the script realm, so compare their serialized form.
  const readable = (criteria) => JSON.parse(JSON.stringify(criteria.understanding));
  assert.deepEqual(readable(page.WebWindows.fileQuery.parse("所有md文件", {})),
    [{ kind: "fileCategory", category: "markdown" }]);
  // A type word the UI would have to translate is still reported, because the label differs.
  assert.deepEqual(readable(page.WebWindows.fileQuery.parse("表格", {})),
    [{ kind: "fileCategory", category: "spreadsheet" }]);

  // Deterministic path must be unchanged when allowAI is absent.
  const plain = await page.WebWindows.files.search("上周修改的 PDF", {});
  assert.ok(plain.criteria.modifiedFrom, "the local parser still handles the query on its own");

  for (const page of ["cloud/browser/files.asp", "cloud/browser/private-files.asp"]) {
    const html = read(page);
    const parserAt = html.indexOf("assets/js/file-query-parser.js");
    const searchAt = html.indexOf("assets/js/file-search.js");
    assert.ok(parserAt > 0, `${page} must load file-query-parser.js so WebWindows.fileQuery exists`);
    assert.ok(parserAt < searchAt, `${page} must load the v2 parser before file-search.js`);
  }
}

// 4. DeskTalk must send the tool definitions to the model and run what the model asks for.
{
  const desktalk = read("assets/js/desktalk.js");
  assert.match(desktalk, /function aiToolDefinitions\(\)/,
    "desktalk.js must be able to describe the registered tools to the model");
  assert.match(desktalk, /payload\.tool_choice\s*=\s*'auto'/,
    "desktalk.js must offer the tools to the model");
  assert.match(desktalk, /handleAIToolCalls\(data,\s*v\)/,
    "desktalk.js must run the tool call the model returns");
  assert.match(desktalk, /aiTools\.invoke\('searchFiles'/,
    "desktalk.js must invoke searchFiles through the controlled registry");
  // The tool loop must not regress the newer model parameters.
  assert.match(desktalk, /max_completion_tokens:\s*1200/);
  assert.match(desktalk, /reasoning_effort:\s*'low'/);
  // Results are rendered locally and never sent back to the model.
  assert.match(desktalk, /文件列表未发送给模型/);
  // A tool call that we do not execute must be retried without tools rather than shown raw.
  assert.match(desktalk, /delete fallbackPayload\.tool_choice/);
}

// 5. The intent gate must exist, so ordinary chat never triggers a file search.
{
  const desktalk = read("assets/js/desktalk.js");
  assert.match(desktalk, /plausibleFileSearchIntent\(userText\)/,
    "DeskTalk must only run the file tool when the message really looks like a file request");
  assert.match(read("assets/js/ai-file-tools.js"), /isSearchIntent/);
}

console.log("desktalk file search smoke test passed");
