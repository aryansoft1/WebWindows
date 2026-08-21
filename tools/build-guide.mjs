import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "docs", "guide");
const outputFile = path.join(root, "assets", "data", "guide-content.json");
const required = ["id", "title", "summary", "category", "order", "status", "product_version", "last_verified"];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inline(value) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (list) output.push(`</${list}>`);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextList = ordered ? "ol" : "ul";
      if (list !== nextList) {
        closeList();
        list = nextList;
        output.push(`<${list}>`);
      }
      output.push(`<li>${inline((unordered || ordered)[1])}</li>`);
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph();
      closeList();
      output.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  closeList();
  return output.join("\n");
}

function parseDocument(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: 缺少 Front Matter`);
  const metadata = {};
  match[1].split(/\r?\n/).forEach((line) => {
    const separator = line.indexOf(":");
    if (separator < 0) return;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    metadata[key] = value;
  });
  required.forEach((key) => {
    if (!metadata[key]) throw new Error(`${file}: 缺少 ${key}`);
  });
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(metadata.id)) {
    throw new Error(`${file}: id 格式无效`);
  }
  if (!["verified", "testing", "planned"].includes(metadata.status)) {
    throw new Error(`${file}: status 格式无效`);
  }
  const body = match[2].trim().replace(/^#\s+.*?\r?\n+/, "");
  return {
    id: metadata.id,
    title: metadata.title,
    navTitle: metadata.nav_title || metadata.title,
    summary: metadata.summary,
    category: metadata.category,
    categoryOrder: Number(metadata.category_order || 999),
    order: Number(metadata.order),
    status: metadata.status,
    productVersion: metadata.product_version,
    lastVerified: metadata.last_verified,
    keywords: (metadata.keywords || "").split(",").map((value) => value.trim()).filter(Boolean),
    html: renderMarkdown(body),
    searchText: [metadata.title, metadata.summary, metadata.keywords, body].join(" ")
  };
}

async function collectMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectMarkdown(resolved));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(resolved);
  }
  return files;
}

const files = await collectMarkdown(sourceDirectory);
const articles = [];
for (const file of files) {
  articles.push(parseDocument(await readFile(file, "utf8"), path.relative(root, file)));
}
const ids = new Set();
articles.forEach((article) => {
  if (ids.has(article.id)) throw new Error(`重复的文章 id: ${article.id}`);
  ids.add(article.id);
});
articles.sort((left, right) =>
  left.categoryOrder - right.categoryOrder ||
  left.order - right.order ||
  left.title.localeCompare(right.title, "zh-CN")
);

const payload = {
  release: {
    schemaVersion: 1,
    version: "2026.07.29.1",
    generatedAt: new Date().toISOString(),
    homeTopic: "getting-started"
  },
  articles
};
await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`使用向导已生成：${articles.length} 篇文章 -> ${path.relative(root, outputFile)}`);
