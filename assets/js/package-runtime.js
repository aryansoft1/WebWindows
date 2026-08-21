(function () {
  "use strict";

  const MAX_FILES = 500;
  const MAX_UNCOMPRESSED_BYTES = 30 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = new Set([
    ".html", ".htm", ".css", ".js", ".json", ".txt", ".md",
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".otf", ".mp3", ".wav", ".ogg", ".mp4", ".webm"
  ]);
  const MIME_TYPES = {
    ".html": "text/html;charset=utf-8", ".htm": "text/html;charset=utf-8",
    ".css": "text/css;charset=utf-8", ".js": "text/javascript;charset=utf-8",
    ".json": "application/json;charset=utf-8", ".txt": "text/plain;charset=utf-8",
    ".md": "text/markdown;charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp",
    ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff",
    ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf",
    ".mp3": "audio/mpeg", ".wav": "audio/wav", ".ogg": "audio/ogg",
    ".mp4": "video/mp4", ".webm": "video/webm"
  };

  function extension(path) {
    const match = String(path).toLowerCase().match(/(\.[a-z0-9]+)$/);
    return match ? match[1] : "";
  }

  function normalizePath(path) {
    const value = String(path || "").replace(/\\/g, "/").replace(/^\.\/+/, "");
    if (!value || value.startsWith("/") || /^[a-z]:/i.test(value) || value.includes("\0")) {
      throw new Error("功能包包含无效路径。");
    }
    const parts = value.split("/");
    if (parts.some((part) => !part || part === "." || part === "..")) {
      throw new Error(`功能包路径不安全：${value}`);
    }
    if (value.length > 240) throw new Error("功能包包含过长路径。");
    return parts.join("/");
  }

  function resolvePath(basePath, reference) {
    const clean = String(reference || "").split(/[?#]/, 1)[0];
    if (!clean || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(clean)) return null;
    const stack = basePath.split("/").slice(0, -1);
    clean.replace(/\\/g, "/").split("/").forEach((part) => {
      if (!part || part === ".") return;
      if (part === "..") stack.pop();
      else stack.push(part);
    });
    return stack.join("/");
  }

  function createDataUrl(bytes, type) {
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return `data:${type};base64,${btoa(binary)}`;
  }

  function rewriteCss(css, cssPath, urls) {
    return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (whole, quote, reference) => {
      const resolved = resolvePath(cssPath, reference);
      return resolved && urls.has(resolved) ? `url("${urls.get(resolved)}")` : whole;
    });
  }

  function rewriteHtml(html, entryPath, urls, textAssets) {
    const documentNode = new DOMParser().parseFromString(html, "text/html");
    if (documentNode.querySelector('script[type="module"]')) {
      throw new Error("当前沙箱版本暂不支持 ES Module，请使用经典脚本。");
    }
    const csp = documentNode.createElement("meta");
    csp.httpEquiv = "Content-Security-Policy";
    csp.content = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
    documentNode.head.prepend(csp);
    documentNode.querySelectorAll("script[src]").forEach((node) => {
      const reference = node.getAttribute("src");
      const resolved = resolvePath(entryPath, reference);
      if (!resolved || !textAssets.has(resolved) || extension(resolved) !== ".js") {
        throw new Error(`脚本必须包含在功能包内：${reference}`);
      }
      node.removeAttribute("src");
      node.textContent = textAssets.get(resolved);
    });
    documentNode.querySelectorAll('link[rel~="stylesheet"][href]').forEach((node) => {
      const reference = node.getAttribute("href");
      const resolved = resolvePath(entryPath, reference);
      if (!resolved || !textAssets.has(resolved) || extension(resolved) !== ".css") {
        throw new Error(`样式必须包含在功能包内：${reference}`);
      }
      const style = documentNode.createElement("style");
      style.textContent = textAssets.get(resolved);
      node.replaceWith(style);
    });
    documentNode.querySelectorAll("style").forEach((node) => {
      node.textContent = rewriteCss(node.textContent, entryPath, urls);
    });
    documentNode.querySelectorAll("[src],[href],[poster]").forEach((node) => {
      ["src", "href", "poster"].forEach((attribute) => {
        if (!node.hasAttribute(attribute)) return;
        const resolved = resolvePath(entryPath, node.getAttribute(attribute));
        if (resolved && urls.has(resolved)) node.setAttribute(attribute, urls.get(resolved));
      });
    });
    documentNode.querySelectorAll("[srcset]").forEach((node) => {
      const rewritten = node.getAttribute("srcset").split(",").map((candidate) => {
        const parts = candidate.trim().split(/\s+/);
        const resolved = resolvePath(entryPath, parts[0]);
        if (resolved && urls.has(resolved)) parts[0] = urls.get(resolved);
        return parts.join(" ");
      }).join(", ");
      node.setAttribute("srcset", rewritten);
    });
    return "<!DOCTYPE html>\n" + documentNode.documentElement.outerHTML;
  }

  function setError(message) {
    const state = document.getElementById("runtimeState");
    state.classList.add("error");
    state.querySelector("h1").textContent = "功能无法启动";
    document.getElementById("runtimeMessage").textContent = message;
  }

  async function start() {
    const params = new URLSearchParams(location.search);
    const appId = String(params.get("appId") || "").trim();
    const version = String(params.get("version") || "").trim();
    const entry = normalizePath(params.get("entry") || "index.html");
    if (!/^[a-z0-9]+([._-][a-z0-9]+)+$/.test(appId) ||
        !/^[0-9]+(\.[0-9]+){1,3}([._-][a-z0-9]+)?$/.test(version)) {
      throw new Error("功能 ID 或版本号无效。");
    }
    if (!window.JSZip) throw new Error("ZIP 运行组件加载失败，请检查网络后重试。");

    const packageUrl = `/api/function-package.asp?appId=${encodeURIComponent(appId)}&version=${encodeURIComponent(version)}`;
    const response = await fetch(packageUrl, { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) throw new Error(`功能包读取失败（${response.status}）。`);
    const archive = await JSZip.loadAsync(await response.arrayBuffer(), {
      checkCRC32: true,
      createFolders: false
    });
    const files = Object.values(archive.files).filter((file) => !file.dir);
    if (!files.length || files.length > MAX_FILES) throw new Error("功能包文件数量无效。");

    const contents = new Map();
    let totalSize = 0;
    for (const file of files) {
      const path = normalizePath(file.name);
      const ext = extension(path);
      if (!ALLOWED_EXTENSIONS.has(ext)) throw new Error(`功能包包含不允许的文件类型：${path}`);
      const unixType = Number(file.unixPermissions || 0) & 0xf000;
      if (unixType === 0xa000) throw new Error("功能包不能包含符号链接。");
      const bytes = await file.async("uint8array");
      totalSize += bytes.byteLength;
      if (totalSize > MAX_UNCOMPRESSED_BYTES) throw new Error("功能包解压后超过 30 MB。");
      contents.set(path, bytes);
    }
    if (!contents.has(entry) || ![".html", ".htm"].includes(extension(entry))) {
      throw new Error("Manifest 指定的 HTML 入口不存在。");
    }

    const urls = new Map();
    const textAssets = new Map();
    for (const [path, bytes] of contents) {
      if ([".html", ".htm", ".css", ".js"].includes(extension(path))) continue;
      urls.set(path, createDataUrl(bytes, MIME_TYPES[extension(path)] || "application/octet-stream"));
    }
    for (const [path, bytes] of contents) {
      if (![".css", ".js"].includes(extension(path))) continue;
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      textAssets.set(path, extension(path) === ".css" ? rewriteCss(text, path, urls) : text);
    }
    const html = new TextDecoder("utf-8", { fatal: true }).decode(contents.get(entry));
    const frame = document.getElementById("packageFrame");
    frame.srcdoc = rewriteHtml(html, entry, urls, textAssets);
    frame.hidden = false;
    document.getElementById("runtimeState").hidden = true;
  }

  document.addEventListener("DOMContentLoaded", () => start().catch((error) => setError(error.message)));
})();
