import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [publicPage, privatePage, styles, searchStyles] = await Promise.all([
  read("cloud/browser/files.asp"),
  read("cloud/browser/private-files.asp"),
  read("cloud/browser/styles.css"),
  read("cloud/browser/file-search.css")
]);

assert.match(publicPage, /styles\.css\?v=20260809-device-1/);
for (const page of [publicPage, privatePage]) {
  assert.match(page, /file-search\.css\?v=20260809-search-1/);
}
assert.match(searchStyles, /\.file-search-view\[hidden\]\{display:none!important\}/);
assert.match(searchStyles, /white-space:nowrap/);
assert.match(searchStyles, /word-break:keep-all/);
assert.match(styles, /\.file-list\.large\s*\{[^}]*repeat\(auto-fill,\s*minmax\(116px,\s*1fr\)\)/s);
assert.doesNotMatch(styles, /@media \(max-width: 1100px\)/);

console.log("cloud layout smoke test passed");
