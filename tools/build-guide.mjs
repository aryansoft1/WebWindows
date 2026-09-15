import { access, readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "docs", "guide-v2");
const outputFile = path.join(root, "assets", "data", "guide-content.json");
const registryFile = path.join(root, "data", "apps", "system-apps.json");
const required = [
  "id", "title", "summary", "category", "order", "status", "product_version",
  "last_verified", "media", "media_alt", "media_caption", "tested_by"
];
const requiredSections = ["功能用途", "适用场景", "操作步骤", "操作结果", "常见问题与权限提示"];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inline(value) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, href) => {
      const safeHref = /^(?:https?:\/\/|[a-z0-9][a-z0-9./?&=_#%-]*$)/i.test(href) ? href : "#";
      return `<a href="${escapeHtml(safeHref)}">${label}</a>`;
    })
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
  requiredSections.forEach((section) => {
    if (!new RegExp(`^##\\s+${section}\\s*$`, "m").test(body)) {
      throw new Error(`${file}: 缺少“## ${section}”`);
    }
  });
  const steps = body.match(/^##[ \t]+操作步骤[ \t]*\r?\n([\s\S]*?)(?=^##[ \t]+|(?![\s\S]))/m)?.[1] || "";
  if ((steps.match(/^\d+\.\s+/gm) || []).length < 2) {
    throw new Error(`${file}: 操作步骤至少需要两个编号步骤`);
  }
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
    openUrl: metadata.open_url || "",
    openApp: metadata.open_app || "",
    media: metadata.media,
    mediaAlt: metadata.media_alt,
    mediaCaption: metadata.media_caption,
    covers: (metadata.covers || "").split(",").map((value) => value.trim()).filter(Boolean),
    testedBy: (metadata.tested_by || "").split(",").map((value) => value.trim()).filter(Boolean),
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

const registry = JSON.parse(await readFile(registryFile, "utf8"));
const appIds = new Set(registry.apps.map((app) => app.id));
const coveredIds = new Set(articles.flatMap((article) => article.covers));
const missingCoverage = [...appIds].filter((id) => !coveredIds.has(id));
const staleCoverage = [...coveredIds].filter((id) => !appIds.has(id));
if (missingCoverage.length) throw new Error(`以下已注册功能没有向导章节：${missingCoverage.join(", ")}`);
if (staleCoverage.length) throw new Error(`向导引用了未注册功能：${staleCoverage.join(", ")}`);
for (const article of articles) {
  if (article.openApp && !appIds.has(article.openApp)) throw new Error(`${article.id}: open_app 未注册：${article.openApp}`);
  const mediaFile = path.resolve(root, article.media);
  if (!mediaFile.startsWith(root + path.sep)) throw new Error(`${article.id}: media 必须位于仓库内`);
  await access(mediaFile).catch(() => { throw new Error(`${article.id}: 图片不存在：${article.media}`); });
  if (article.openUrl) {
    const openPath = article.openUrl.split(/[?#]/, 1)[0];
    const openFile = path.resolve(root, openPath);
    if (!openFile.startsWith(root + path.sep)) throw new Error(`${article.id}: open_url 必须位于仓库内`);
    await access(openFile).catch(() => { throw new Error(`${article.id}: 功能入口不存在：${article.openUrl}`); });
  }
  for (const evidence of article.testedBy) {
    if (evidence.includes(":")) continue;
    const evidenceFile = path.resolve(root, evidence);
    if (!evidenceFile.startsWith(root + path.sep)) throw new Error(`${article.id}: tested_by 必须位于仓库内`);
    await access(evidenceFile).catch(() => { throw new Error(`${article.id}: 核对依据不存在：${evidence}`); });
  }
}

const payload = {
  release: {
    schemaVersion: 2,
    version: "2026.09.15.1",
    generatedAt: new Date().toISOString(),
    updatedAt: "2026-09-15",
    homeTopic: "getting-started",
    registryVersion: registry.repository.catalogVersion,
    sourceDirectory: "docs/guide-v2",
    coverage: {
      registeredApps: appIds.size,
      coveredApps: coveredIds.size,
      articleCount: articles.length
    }
  },
  articles
};
await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`使用向导已生成：${articles.length} 篇文章 -> ${path.relative(root, outputFile)}`);
