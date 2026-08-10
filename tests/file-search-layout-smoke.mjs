import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../cloud/browser/file-search.css", import.meta.url), "utf8");
const ui = await readFile(new URL("../cloud/browser/search-ui.js", import.meta.url), "utf8");

assert.match(css, /\.file-list\[hidden\][^{]*\{display:none!important\}/,
  "directory view must leave layout when search results are visible");
assert.match(css, /\.file-search-state[^\{]*\.file-search-empty\{grid-column:1\/-1\}/,
  "search heading, understanding and empty states must span the result grid");
assert.match(css, /\.main>\.file-search-view\{flex:1 1 auto\}/,
  "public search results must occupy the full content pane beside the sidebar");
assert.match(ui, /directory\.hidden=true;view\.hidden=false/,
  "search mode must hide directory content before rendering results");

console.log("File search layout smoke tests passed");
