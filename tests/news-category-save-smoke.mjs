import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const js = readFileSync(new URL("../SystemManager/assets/js/news.js", import.meta.url), "utf8");
const asp = readFileSync(new URL("../admin_api/news.asp", import.meta.url), "utf8");
const code = js.slice(js.indexOf("  function openNews("), js.indexOf("  async function removeNews("));
const fields = new Map();
const calls = [];
const context = vm.createContext({
  categories: [{ id: 8, name: "公告" }, { id: 17, name: "系统更新" }],
  editId: null,
  el: id => { if (!fields.has(id)) fields.set(id, {}); return fields.get(id); },
  write: async (action, data) => calls.push({ action, data }),
  reload: async () => {}, report: () => {}
});
vm.runInContext(code, context);
vm.runInContext("openNews()", context);
assert.equal(fields.get("newsCategory").value, "8");
vm.runInContext('openNews({id:42,title:"中文标题",category:"系统更新",content:"中文正文",publish_at:"2026-09-19 11:57"})', context);
assert.equal(fields.get("newsCategory").value, "17", "edit must select the category ID, not its Chinese name");
await vm.runInContext("saveNews({preventDefault(){}})", context);
assert.equal(calls[0].data.category_id, "17");
assert.equal(calls[0].data.category, undefined);
assert.equal(calls[0].data.title, "中文标题");
assert.equal(calls[0].data.content, "中文正文");
vm.runInContext('openNews({id:42,category:"已删除分类"})', context);
assert.equal(fields.get("newsCategory").value, "", "missing category must not silently select another");
const save = asp.slice(asp.indexOf('If action = "save"'), asp.indexOf('If action = "delete"'));
assert.match(save, /WHERE id=\? LIMIT 1/);
assert.match(save, /CreateParameter\("category_id", 3,/);
assert.match(save, /category = CStr\(rs\("name"\)\)/);
assert.match(save, /CreateParameter\("title", 202,/);
assert.match(save, /CreateParameter\("category", 202,/);
assert.match(save, /CreateParameter\("content", 203,/);
assert.doesNotMatch(asp, /CreateParameter\([^\n]*, 201,/);
console.log("news category save passed: IDs, edit selection, missing category, Unicode bindings");
