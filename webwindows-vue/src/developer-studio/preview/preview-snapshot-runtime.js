import { getSnapshotFile } from "../snapshot/project-snapshot.js";
import { normalizeProjectPath } from "../project/path-policy.js";
import { PREVIEW_CSP } from "./preview-protocol.js";
import { createConsoleBootstrap } from "./preview-console-bootstrap.js";
import { createPreviewSdkBootstrap } from "./preview-sdk-bootstrap.js";

const MIME_TYPES = Object.freeze({
  ".css": "text/css;charset=utf-8", ".js": "text/javascript;charset=utf-8",
  ".json": "application/json;charset=utf-8", ".txt": "text/plain;charset=utf-8",
  ".md": "text/markdown;charset=utf-8", ".svg": "image/svg+xml;charset=utf-8"
});
const PREVIEW_TEXT_EXTENSIONS = new Set([".html", ".htm", ...Object.keys(MIME_TYPES)]);

export function createPreviewDocument(snapshot, session, options = {}) {
  const manifestFile = getSnapshotFile(snapshot, "manifest.json");
  if (!manifestFile) throw new Error("Preview Snapshot 缺少 manifest.json。");
  const manifest = JSON.parse(manifestFile.content);
  const entry = normalizeProjectPath(manifest.entry);
  const entryFile = getSnapshotFile(snapshot, entry);
  if (!entryFile || ![".html", ".htm"].includes(extension(entry))) {
    throw new Error("Preview Snapshot 的 HTML entry 不存在。");
  }
  const parser = options.domParser || new DOMParser();
  const documentNode = parser.parseFromString(entryFile.content, "text/html");
  if (documentNode.querySelector('script[type="module"]')) throw new Error("Developer Preview 不支持 ES Module。");

  const dataUrls = new Map();
  const textAssets = new Map();
  for (const file of snapshot.files) {
    const ext = extension(file.path);
    if (!PREVIEW_TEXT_EXTENSIONS.has(ext)) continue;
    if (Object.prototype.hasOwnProperty.call(MIME_TYPES, ext) && ![".css", ".js"].includes(ext)) {
      dataUrls.set(file.path, createTextDataUrl(file.content, MIME_TYPES[ext]));
    }
  }
  for (const file of snapshot.files) {
    const ext = extension(file.path);
    if (ext === ".js") textAssets.set(file.path, file.content);
    if (ext === ".css") textAssets.set(file.path, rewriteCss(file.content, file.path, dataUrls));
  }

  const csp = documentNode.createElement("meta");
  csp.httpEquiv = "Content-Security-Policy";
  csp.content = PREVIEW_CSP;
  documentNode.head.prepend(csp);
  const bootstrap = documentNode.createElement("script");
  bootstrap.setAttribute("data-webwindows-preview-bootstrap", "v1");
  bootstrap.textContent = createConsoleBootstrap(session);
  documentNode.head.insertBefore(bootstrap, csp.nextSibling);
  const sdkBootstrapSource = createPreviewSdkBootstrap(session, options.sdkLaunch);
  if (sdkBootstrapSource) {
    const sdkBootstrap = documentNode.createElement("script");
    sdkBootstrap.setAttribute("data-webwindows-preview-sdk", "v1");
    sdkBootstrap.textContent = sdkBootstrapSource;
    documentNode.head.insertBefore(sdkBootstrap, bootstrap.nextSibling);
  }

  documentNode.querySelectorAll("script[src]").forEach((node) => {
    const reference = node.getAttribute("src");
    const resolved = resolvePreviewPath(entry, reference);
    if (!resolved || extension(resolved) !== ".js" || !textAssets.has(resolved)) {
      throw new Error(`Preview 脚本必须来自 Snapshot：${reference}`);
    }
    node.removeAttribute("src");
    node.textContent = textAssets.get(resolved);
  });
  documentNode.querySelectorAll('link[rel~="stylesheet"][href]').forEach((node) => {
    const reference = node.getAttribute("href");
    const resolved = resolvePreviewPath(entry, reference);
    if (!resolved || extension(resolved) !== ".css" || !textAssets.has(resolved)) {
      throw new Error(`Preview 样式必须来自 Snapshot：${reference}`);
    }
    const style = documentNode.createElement("style");
    style.textContent = textAssets.get(resolved);
    node.replaceWith(style);
  });
  documentNode.querySelectorAll("style").forEach((node) => {
    node.textContent = rewriteCss(node.textContent, entry, dataUrls);
  });
  documentNode.querySelectorAll("[src],[href],[poster]").forEach((node) => {
    for (const attribute of ["src", "href", "poster"]) {
      if (!node.hasAttribute(attribute)) continue;
      const resolved = resolvePreviewPath(entry, node.getAttribute(attribute));
      if (resolved && dataUrls.has(resolved)) node.setAttribute(attribute, dataUrls.get(resolved));
    }
  });
  documentNode.querySelectorAll("[srcset]").forEach((node) => {
    const candidates = node.getAttribute("srcset").split(",").map((candidate) => {
      const parts = candidate.trim().split(/\s+/);
      const resolved = resolvePreviewPath(entry, parts[0]);
      if (resolved && dataUrls.has(resolved)) parts[0] = dataUrls.get(resolved);
      return parts.join(" ");
    });
    node.setAttribute("srcset", candidates.join(", "));
  });
  return "<!DOCTYPE html>\n" + documentNode.documentElement.outerHTML;
}

export function resolvePreviewPath(basePath, reference) {
  const clean = String(reference || "").split(/[?#]/, 1)[0];
  if (!clean || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(clean)) return null;
  const stack = basePath.split("/").slice(0, -1);
  for (const part of clean.replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  try { return normalizeProjectPath(stack.join("/")); } catch { return null; }
}

export function rewriteCss(css, cssPath, dataUrls) {
  return String(css).replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (whole, _quote, reference) => {
    const resolved = resolvePreviewPath(cssPath, reference);
    return resolved && dataUrls.has(resolved) ? `url("${dataUrls.get(resolved)}")` : whole;
  });
}

function createTextDataUrl(content, mimeType) {
  const bytes = new TextEncoder().encode(String(content));
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

function extension(path) {
  return String(path).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}
