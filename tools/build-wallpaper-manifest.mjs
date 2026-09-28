import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "assets", "wallpapers");
const outputFile = path.join(root, "assets", "data", "wallpaper-index.json");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp"]);

async function collectImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectImages(resolved));
    else if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(resolved);
    }
  }
  return files;
}

const files = await collectImages(sourceDirectory);
const wallpapers = [];
const seen = new Set();
for (const file of files) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (seen.has(relative)) throw new Error(`重复的壁纸路径: ${relative}`);
  seen.add(relative);
  const info = await stat(file);
  wallpapers.push({
    path: relative,
    name: path.basename(file, path.extname(file)),
    bytes: info.size
  });
}
wallpapers.sort((left, right) =>
  left.path.localeCompare(right.path, undefined, { numeric: true, sensitivity: "base" })
);
if (!wallpapers.length) throw new Error(`未在 ${path.relative(root, sourceDirectory)} 找到任何壁纸图片`);

const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceDirectory: "assets/wallpapers",
  count: wallpapers.length,
  wallpapers
};
await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`壁纸清单已生成：${wallpapers.length} 张 -> ${path.relative(root, outputFile)}`);
