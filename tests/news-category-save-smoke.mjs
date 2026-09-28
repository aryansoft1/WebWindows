import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const js = readFileSync(new URL("../SystemManager/assets/js/news.js", import.meta.url), "utf8");
const asp = readFileSync(new URL("../admin_api/news.asp", import.meta.url), "utf8");
const code = js.slice(js.indexOf("  async function openNews("), js.indexOf("  async function removeNews("));
const fields = new Map();
const calls = [];
const context = vm.createContext({
  categories: [{ id: 8, name: "公告" }, { id: 17, name: "系统更新" }],
  editId: null,
  contentLoaded: false, editorRequest: 0,
  record: {id:42,title:"中文标题",category:"系统更新",content:"<p>中文正文</p>",publish_at:"2026-09-19 11:57"},
  readError: false,
  editor: {setContent: value => {context.el("newsContent").innerHTML=value;}, getContent: () => context.el("newsContent").innerHTML, setEnabled: value => {context.el("newsContent").contentEditable=String(value);}, close(){}},
  el: id => { if (!fields.has(id)) fields.set(id, {}); return fields.get(id); },
  write: async (action, data) => calls.push({ action, data }),
  reload: async () => {}, report: () => {}
});
context.read = async () => {if(context.readError) throw new Error("detail failed"); return context.record;};
vm.runInContext(code, context);
await vm.runInContext("openNews()", context);
assert.equal(fields.get("newsCategory").value, "8");
await vm.runInContext('openNews({id:42,title:"过期标题",content:""})', context);
assert.equal(fields.get("newsTitle").value, "中文标题", "edit must use fresh detail, not stale list data");
assert.equal(fields.get("newsContent").innerHTML, "<p>中文正文</p>");
assert.equal(fields.get("newsCategory").value, "17", "edit must select the category ID, not its Chinese name");
await vm.runInContext("saveNews({preventDefault(){}})", context);
assert.equal(calls[0].data.category_id, "17");
assert.equal(calls[0].data.category, undefined);
assert.equal(calls[0].data.title, "中文标题");
assert.equal(calls[0].data.content, "<p>中文正文</p>");
context.record.category = "已删除分类";
await vm.runInContext('openNews({id:42})', context);
assert.equal(fields.get("newsCategory").value, "", "missing category must not silently select another");
context.readError = true;
await vm.runInContext('openNews({id:42})', context);
assert.equal(fields.get("newsSave").disabled, true);
await vm.runInContext("saveNews({preventDefault(){}})", context);
assert.equal(calls.length, 1, "failed detail must never save an empty body");
const save = asp.slice(asp.indexOf('If action = "save"'), asp.indexOf('If action = "delete"'));
assert.match(save, /WHERE id=\? LIMIT 1/);
assert.match(save, /CreateParameter\("category_id", 3,/);
assert.match(save, /category = CStr\(rs\("name"\)\)/);
assert.match(save, /CreateParameter\("title", 202,/);
assert.match(save, /CreateParameter\("category", 202,/);
assert.match(save, /CreateParameter\("content", 203,/);
assert.doesNotMatch(asp, /CreateParameter\([^\n]*, 201,/);
assert.match(save, /content = NewsHtmlSanitize\(content\)/);
assert.match(save, /NewsHtmlHasContent\(content\)/);
console.log("news category save passed: IDs, edit selection, missing category, Unicode bindings");
