import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
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
  index.wallpapers.map((item) => item.url).sort(),
  collected.sort(),
  "壁纸清单必须覆盖 assets/wallpapers 下的全部图片，且不能残留已删除的壁纸"
);
assert.equal(new Set(index.wallpapers.map((item) => item.url)).size, index.wallpapers.length);
assert.ok(index.wallpapers.every((item) => item.url.startsWith("assets/wallpapers/")));
assert.ok(index.wallpapers.every((item) => item.name && !path.extname(item.name)));
assert.ok(index.wallpapers.every((item) => Number.isInteger(item.bytes) && item.bytes > 0));

assert.match(script, /assets\/data\/wallpaper-index\.json/,
  "壁纸库必须从清单文件读取全部壁纸路径");
assert.doesNotMatch(script, /assets\/wallpapers\/wall\d/,
  "壁纸库不得再内置固定的墙纸路径列表");
assert.match(page, /id="wallpaperThumbnails"/);
assert.match(page, /assets\/js\/wallpaper\.js/);

/* Runs assets/js/wallpaper.js in a stubbed DOM so the manifest-to-thumbnail
 * mapping is verified for real. A field name mismatch between the generator
 * and the runtime once shipped an empty wallpaper library. */
function createElement(tagName) {
  const classes = new Set();
  return {
    tagName,
    className: "",
    src: "",
    alt: "",
    title: "",
    textContent: "",
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      has: (name) => classes.has(name)
    },
    addEventListener: () => {}
  };
}

function runWallpaperLibrary({ manifest, storage = {}, failUrls = [] }) {
  const requested = [];
  const listeners = new Map();
  const container = {
    children: [],
    replaceChildren() {
      this.children = [];
    },
    querySelectorAll() {
      return this.children;
    },
    appendChild(node) {
      this.children.push(node);
    }
  };
  const store = new Map(Object.entries(storage));
  const sandbox = {
    console,
    document: {
      addEventListener: (type, handler) => listeners.set(type, handler),
      getElementById: (id) => (id === "wallpaperThumbnails" ? container : null),
      createElement
    },
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, value)
    },
    fetch: async (url) => {
      requested.push(url);
      if (failUrls.includes(url)) throw new Error("network unavailable");
      return { ok: true, json: async () => manifest };
    }
  };
  sandbox.window = {
    addEventListener: (type, handler) => listeners.set(type, handler),
    parent: null
  };
  sandbox.window.parent = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { filename: "wallpaper.js" });
  return { sandbox, container, requested, storage: store, fire: (type) => listeners.get(type)?.() };
}

const liveCatalog = { ok: true, defaultWallpaper: "", wallpapers: index.wallpapers };

const loaded = runWallpaperLibrary({ manifest: liveCatalog });
await loaded.fire("DOMContentLoaded");
assert.deepEqual(loaded.requested, ["api/wallpapers.asp"],
  "壁纸库必须优先读取线上目录接口");
assert.equal(loaded.container.children.length, index.wallpapers.length,
  "清单里的每一张壁纸都必须渲染成缩略图");
assert.deepEqual(
  loaded.container.children.map((node) => node.src),
  index.wallpapers.map((item) => item.url)
);
assert.ok(loaded.container.children.every((node) => node.className === "wallpaper-thumb"));
assert.ok(loaded.container.children.every((node) => node.alt && node.title),
  "缩略图必须有可访问的名称");

const fallback = runWallpaperLibrary({ manifest: index, failUrls: ["api/wallpapers.asp"] });
await fallback.fire("DOMContentLoaded");
assert.deepEqual(fallback.requested, ["api/wallpapers.asp", "assets/data/wallpaper-index.json"],
  "线上接口不可用时必须回退到静态清单");
assert.equal(fallback.container.children.length, index.wallpapers.length,
  "回退到静态清单后仍要显示全部壁纸");

const active = runWallpaperLibrary({
  manifest: liveCatalog,
  storage: { selectedWallpaper: index.wallpapers[2].url }
});
await active.fire("DOMContentLoaded");
assert.equal(active.container.children.filter((node) => node.classList.has("active")).length, 1,
  "当前壁纸必须保持选中状态");

const withCloud = runWallpaperLibrary({
  manifest: liveCatalog,
  storage: {
    "webwindows.wallpaper.library.v1": JSON.stringify([
      { url: "https://cdn.example.com/custom.jpg", name: "云端壁纸" }
    ])
  }
});
await withCloud.fire("DOMContentLoaded");
assert.equal(withCloud.container.children.length, index.wallpapers.length + 1,
  "云端壁纸库必须与内置清单合并");

const offline = runWallpaperLibrary({
  manifest: index,
  failUrls: ["api/wallpapers.asp", "assets/data/wallpaper-index.json"]
});
await offline.fire("DOMContentLoaded");
assert.equal(offline.container.children.length, 1);
assert.equal(offline.container.children[0].textContent, "壁纸库暂时为空。",
  "清单读取失败时必须给出空状态提示，而不是静默空白");

console.log(`wallpaper library smoke test passed (${index.wallpapers.length} wallpapers)`);
