import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = async (relative) =>
  fs.readFile(new URL(`../${relative}`, import.meta.url), "utf8");

const [page, script, style, index, settings, main, manifestSource, contentSource] =
  await Promise.all([
    read("guide.html"),
    read("assets/js/guide.js"),
    read("assets/css/guide.css"),
    read("index.html"),
    read("settings.html"),
    read("assets/js/main.js"),
    read("data/apps/system-apps.json"),
    read("assets/data/guide-content.json")
  ]);

const manifest = JSON.parse(manifestSource);
const content = JSON.parse(contentSource);
const guide = manifest.apps.find((app) => app.id === "webwindows.system.guide");

assert.ok(guide);
assert.equal(guide.name, "使用向导");
assert.equal(guide.install.uninstallable, false);
assert.equal(guide.placement.startMenu, true);
assert.equal(guide.entry, "guide.html");
assert.match(page, /id="guideSearch"/);
assert.match(page, /id="guideSidebar"/);
assert.match(script, /guide-content\.json/);
assert.match(script, /URL\(location\.href\)\.searchParams\.get\("topic"\)/);
assert.match(style, /\.guide-layout/);
assert.match(index, /使用向导/);
assert.match(index, /我们公司/);
assert.match(index, /我能做什么/);
assert.doesNotMatch(index, />WebWindows能做什么</);
assert.match(settings, /使用向导/);
assert.match(main, /function openGuide\(topic\)/);
assert.equal(content.release.homeTopic, "getting-started");
assert.equal(content.release.registryVersion, manifest.repository.catalogVersion);
assert.equal(
  content.release.updatedAt,
  content.articles.map((article) => article.lastVerified).sort().at(-1)
);
assert.ok(content.articles.length >= 18);
assert.ok(content.articles.every((article) => article.lastVerified));
assert.ok(content.articles.every((article) =>
  ["verified", "testing", "planned"].includes(article.status)
));
assert.ok(content.articles.every((article) => article.media && article.mediaAlt && article.mediaCaption));
assert.ok(content.articles.every((article) => {
  const steps = article.html.match(/<h2>操作步骤<\/h2>\s*<ol>([\s\S]*?)<\/ol>/)?.[1] || "";
  return (steps.match(/<li>/g) || []).length >= 4;
}));
assert.ok(content.articles.every((article) => /常见问题与权限提示/.test(article.html)));
const covered = new Set(content.articles.flatMap((article) => article.covers));
assert.deepEqual(
  manifest.apps.map((app) => app.id).filter((id) => !covered.has(id)),
  []
);
assert.equal(content.release.coverage.registeredApps, manifest.apps.length);
assert.equal(content.release.coverage.coveredApps, covered.size);
assert.match(script, /loading="eager"/);
assert.match(script, /versionedLocalUrl/);
assert.match(script, /media\.naturalWidth/);
assert.match(style, /\.guide-media-error/);
assert.match(page, /20261004-1/);
assert.match(script, /languageNotes/);
assert.match(script, /data-i18n-ignore/);
assert.match(script, /Traditional Chinese/);
assert.match(script, /日本語/);
assert.match(style, /\.guide-language-note/);
const navigation = content.articles.find((article) => article.id === "navigation");
assert.match(navigation.searchText, /问地/);
assert.match(navigation.searchText, /问天/);
assert.match(navigation.searchText, /问乡/);
assert.match(navigation.searchText, /12306/);
const settingsGuide = content.articles.find((article) => article.id === "settings-device");
assert.match(settingsGuide.searchText, /启动项/);
assert.match(settingsGuide.searchText, /Personalization/);
assert.match(settingsGuide.searchText, /カーソル/);
const desktopGuide = content.articles.find((article) => article.id === "desktop-windows");
assert.match(desktopGuide.searchText, /工作空间/);
assert.match(desktopGuide.searchText, /Workspaces/);
const previewGuide = content.articles.find((article) => article.id === "file-preview-edit");
assert.match(previewGuide.searchText, /Open with/);
const mailboxGuide = content.articles.find((article) => article.id === "desktalk");
assert.match(mailboxGuide.searchText, /IMAP/);
assert.match(mailboxGuide.searchText, /SMTP/);
assert.match(page, /id="guideMenuButton"/);

console.log("guide smoke test passed");
