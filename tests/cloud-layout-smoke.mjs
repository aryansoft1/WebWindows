import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [publicPage, privatePage, styles, searchStyles, toolbar] = await Promise.all([
  read("cloud/browser/files.asp"),
  read("cloud/browser/private-files.asp"),
  read("cloud/browser/styles.css"),
  read("cloud/browser/file-search.css"),
  read("cloud/browser/toolbar.js")
]);

assert.match(publicPage, /styles\.css\?v=20260926-folder-tree-1/);
for (const page of [publicPage, privatePage]) {
  assert.match(page, /file-search\.css\?v=20260809-search-1/);
}
assert.match(searchStyles, /\.file-search-view\[hidden\]\{display:none!important\}/);
assert.match(searchStyles, /white-space:nowrap/);
assert.match(searchStyles, /word-break:keep-all/);
assert.match(styles, /\.file-list\.large\s*\{[^}]*repeat\(auto-fill,\s*minmax\(116px,\s*1fr\)\)/s);
assert.doesNotMatch(styles, /@media \(max-width: 1100px\)/);

// The sidebar folder tree is filled by toolbar.js from getFolders.asp. toolbar.js calls
// window.WebWindowsCloudI18n.apply() unconditionally even though nothing in the site
// defines that optional global, and the TypeError used to abort its last statements, so
// the breadcrumb trail and #folder-tree stayed empty. files.asp must publish the facade
// before toolbar.js runs.
assert.match(publicPage, /<ul id="folder-tree">/);
const facadeScript = [...publicPage.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[0])
  .find((block) => block.includes("window.WebWindowsCloudI18n = {"));
assert.ok(facadeScript, "files.asp must publish the i18n facade from an inline script");
assert.doesNotMatch(facadeScript, /\ssrc=|defer/,
  "the facade has to be a blocking inline script so every deferred bundle sees it");
assert.match(facadeScript, /if \(window\.WebWindowsCloudI18n\) return;/);
assert.match(facadeScript, /apply: function \(\) \{\}/);
assert.ok(
  publicPage.indexOf("window.WebWindowsCloudI18n = {") < publicPage.indexOf('src="toolbar.js'),
  "files.asp must publish the i18n facade before toolbar.js runs");
assert.match(facadeScript, /language: function \(\) \{[\s\S]*?desktop\.getLanguage && desktop\.getLanguage\(\)/);
assert.match(publicPage, /data-language="<%=CloudHtml\(language\)%>"/);

// Folder rows must stay inside the 210px sidebar instead of stretching it.
assert.match(styles, /\.folder-label\s*\{[^}]*overflow:\s*hidden[^}]*text-overflow:\s*ellipsis/s);
assert.match(styles, /#folder-tree > \.folder-node > \.folder-label::before\s*\{\s*content:\s*"▰"/);

// The private page has no client folder tree, so it renders the subfolders of the current
// folder into a left sidebar on the server instead.
assert.match(privatePage, /<aside class="private-sidebar" aria-label="私人资料夹">/);
assert.match(privatePage, /<ul class="private-folder-tree">/);
assert.match(privatePage, /<ul class="private-folder-children">/);
assert.match(privatePage, /PrivateFolderUrl\(navPath & "\/" & navChild\.Name\)/);
assert.match(privatePage, /LCase\(navChild\.Name\) <> "_system"/);
assert.match(privatePage, /navIndex = UBound\(navParts\) Then Response\.Write " selected"" aria-current=""page"""/);
assert.match(privatePage, /<div class="private-layout">[\s\S]*?<main class="files">/);
assert.match(privatePage, /a\.private-tree-node\.selected\{color:#1d4ed8/);
assert.match(privatePage, /\.private-layout \.files\{flex:1;min-width:0;padding:0\}/);

// files.asp marks the current folder itself because toolbar.js re-renders the tree from
// getFolders.asp without a path parameter and never marks the active node. The page-side
// highlighter pairs the tree with a fresh getFolders.asp payload and matches on the
// physical path, because the tree labels and the breadcrumb labels come from two different
// name tables and can disagree. Pin that contract, the toolbar.js markup it depends on, and
// the fact that toolbar.js still does not mark the node itself. If toolbar.js is refactored
// to own the highlighting, delete the page-side script in files.asp and this contract.
assert.match(publicPage, /new MutationObserver\(schedule\)\.observe\(tree, \{ childList: true, subtree: true \}\)/);
assert.match(publicPage, /getFolders\.asp\?lang=\$\{encodeURIComponent\(language\)\}/,
  "the highlighter must read the same tree payload toolbar.js renders from");
assert.match(publicPage, /if \(!treePromise\) \{/,
  "repeated tree rebuilds must share one request");
assert.match(publicPage, /node\.path === currentPath/,
  "the highlighter must match on the physical path, not on the visible folder label");
assert.match(publicPage, /label\.classList\.add\("selected"\)/);
assert.match(publicPage, /label\.setAttribute\("aria-current", "page"\)/);
assert.match(publicPage, /if \(index < 0\) return;/);
assert.doesNotMatch(publicPage, /crumbTrail|getElementById\("breadcrumbs"\)/,
  "the highlighter must not match on breadcrumb text, which uses a different name table");
assert.match(toolbar, /item\.className = "folder-node"/);
assert.match(toolbar, /button\.className = "folder-label"/);
assert.match(toolbar, /list\.className = "subfolders"/);
// toolbar.js appends children depth-first after their parent, which is the order the
// highlighter relies on to line the payload up with the rendered buttons.
const renderFolderNode = toolbar.match(/function renderFolderNode\([\s\S]*?\n  \}/);
assert.ok(renderFolderNode, "toolbar.js must keep a renderFolderNode function");
assert.match(renderFolderNode[0], /parent\.appendChild\(item\)/);
assert.doesNotMatch(renderFolderNode[0], /selected|aria-current/,
  "toolbar.js renderFolderNode now marks the current folder; remove the page-side highlighter in files.asp");

// The cloud root row must only look selected while the user is actually at the root.
assert.match(publicPage, /<% If relativePath = "" Then %>[\s\S]*?class="root-node selected" aria-current="page"/);
assert.match(publicPage, /<% Else %>[\s\S]*?class="root-node"><img src="assets\/home\.svg"/);
assert.match(styles, /\.folder-label\.selected\s*\{[^}]*background:\s*#dbeafe/s);

console.log("cloud layout smoke test passed");
