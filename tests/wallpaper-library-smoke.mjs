import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (relative) => fs.readFile(path.join(root, relative), "utf8");
const readDir = (relative) => fs.readdir(path.join(root, relative), { withFileTypes: true });

const [script, page, indexSource] = await Promise.all([
  read("assets/js/wallpaper.js"),
  read("settings.html"),
  read("assets/data/wallpaper-index.json")
]);
const index = JSON.parse(indexSource);

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp"]);
const collected = [];
const walk = async (relative) => {
  for (const entry of await readDir(relative)) {
    const child = `${relative}/${entry.name}`;
    if (entry.isDirectory()) await walk(child);
    else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) collected.push(child);
  }
};
await walk("assets/wallpapers");

assert.equal(index.schemaVersion, 1);
assert.equal(index.sourceDirectory, "assets/wallpapers");
assert.equal(index.count, index.wallpapers.length);
assert.ok(index.wallpapers.length > 0, "壁纸清单不能为空");
assert.deepEqual(
  index.wallpapers.map((item) => item.path).sort(),
  collected.sort(),
  "壁纸清单必须覆盖 assets/wallpapers 下的全部图片，且不能残留已删除的壁纸"
);
assert.equal(new Set(index.wallpapers.map((item) => item.path)).size, index.wallpapers.length);
assert.ok(index.wallpapers.every((item) => item.path.startsWith("assets/wallpapers/")));
assert.ok(index.wallpapers.every((item) => item.name && !path.extname(item.name)));
assert.ok(index.wallpapers.every((item) => Number.isInteger(item.bytes) && item.bytes > 0));

assert.match(script, /assets\/data\/wallpaper-index\.json/,
  "壁纸库必须从清单文件读取全部壁纸路径");
assert.doesNotMatch(script, /assets\/wallpapers\/wall\d/,
  "壁纸库不得再内置固定的墙纸路径列表");
assert.match(script, /function refreshWallpaperLibrary\(\)/);
assert.match(page, /id="wallpaperThumbnails"/);
assert.match(page, /assets\/js\/wallpaper\.js/);

console.log(`wallpaper library smoke test passed (${index.wallpapers.length} wallpapers)`);
