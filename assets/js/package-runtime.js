(function () {
  "use strict";
  const MAX_FILES = 500;
  const MAX_UNCOMPRESSED_BYTES = 30 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = new Set([".html", ".htm", ".css", ".js", ".json", ".txt", ".md", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".mp3", ".wav", ".ogg", ".mp4", ".webm"]);
  const MIME_TYPES = { ".html":"text/html;charset=utf-8", ".htm":"text/html;charset=utf-8", ".css":"text/css;charset=utf-8", ".js":"text/javascript;charset=utf-8", ".json":"application/json;charset=utf-8", ".txt":"text/plain;charset=utf-8", ".md":"text/markdown;charset=utf-8", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif", ".webp":"image/webp", ".svg":"image/svg+xml", ".ico":"image/x-icon", ".woff":"font/woff", ".woff2":"font/woff2", ".ttf":"font/ttf", ".otf":"font/otf", ".mp3":"audio/mpeg", ".wav":"audio/wav", ".ogg":"audio/ogg", ".mp4":"video/mp4", ".webm":"video/webm" };
  const TRUST_STATES = Object.freeze({ SYSTEM:"system-trusted", VERIFIED:"verified-release", LEGACY:"legacy-unverified", FAILED:"verification-failed" });
  let runtimeTrustState = TRUST_STATES.FAILED;
  let verifiedRuntimePackageIdentity = null;

  class RuntimeVerificationError extends Error {
    constructor(code, message) { super(message); this.name = "RuntimeVerificationError"; this.code = code; }
  }
  function fail(code, message) { throw new RuntimeVerificationError(code, message); }
  function extension(path) { const match = String(path).toLowerCase().match(/(\.[a-z0-9]+)$/); return match ? match[1] : ""; }
  function normalizePath(path) {
    const value = String(path || "").replace(/\\/g, "/").replace(/^\.\/+/, "");
    if (!value || value.startsWith("/") || /^[a-z]:/i.test(value) || value.includes("\0")) throw new Error("功能包包含无效路径。");
    const parts = value.split("/");
    if (parts.some((part) => !part || part === "." || part === "..")) throw new Error(`功能包路径不安全：${value}`);
    if (value.length > 240) throw new Error("功能包包含过长路径。");
    return parts.join("/");
  }
  function resolvePath(basePath, reference) {
    const clean = String(reference || "").split(/[?#]/, 1)[0];
    if (!clean || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(clean)) return null;
    const stack = basePath.split("/").slice(0, -1);
    clean.replace(/\\/g, "/").split("/").forEach((part) => { if (!part || part === ".") return; if (part === "..") stack.pop(); else stack.push(part); });
    return stack.join("/");
  }
  function createDataUrl(bytes, type) {
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    return `data:${type};base64,${btoa(binary)}`;
  }
  function rewriteCss(css, cssPath, urls) {
    return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (whole, _quote, reference) => {
      const resolved = resolvePath(cssPath, reference); return resolved && urls.has(resolved) ? `url("${urls.get(resolved)}")` : whole;
    });
  }
  function rewriteHtml(html, entryPath, urls, textAssets) {
    const documentNode = new DOMParser().parseFromString(html, "text/html");
    if (documentNode.querySelector('script[type="module"]')) throw new Error("当前沙箱版本暂不支持 ES Module，请使用经典脚本。");
    const csp = documentNode.createElement("meta");
    csp.httpEquiv = "Content-Security-Policy";
    csp.content = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
    documentNode.head.prepend(csp);
    documentNode.querySelectorAll("script[src]").forEach((node) => {
      const reference = node.getAttribute("src"), resolved = resolvePath(entryPath, reference);
      if (!resolved || !textAssets.has(resolved) || extension(resolved) !== ".js") throw new Error(`脚本必须包含在功能包内：${reference}`);
      node.removeAttribute("src"); node.textContent = textAssets.get(resolved);
    });
    documentNode.querySelectorAll('link[rel~="stylesheet"][href]').forEach((node) => {
      const reference = node.getAttribute("href"), resolved = resolvePath(entryPath, reference);
      if (!resolved || !textAssets.has(resolved) || extension(resolved) !== ".css") throw new Error(`样式必须包含在功能包内：${reference}`);
      const style = documentNode.createElement("style"); style.textContent = textAssets.get(resolved); node.replaceWith(style);
    });
    documentNode.querySelectorAll("style").forEach((node) => { node.textContent = rewriteCss(node.textContent, entryPath, urls); });
    documentNode.querySelectorAll("[src],[href],[poster]").forEach((node) => ["src", "href", "poster"].forEach((attribute) => {
      if (!node.hasAttribute(attribute)) return; const resolved = resolvePath(entryPath, node.getAttribute(attribute)); if (resolved && urls.has(resolved)) node.setAttribute(attribute, urls.get(resolved));
    }));
    documentNode.querySelectorAll("[srcset]").forEach((node) => {
      node.setAttribute("srcset", node.getAttribute("srcset").split(",").map((candidate) => {
        const parts = candidate.trim().split(/\s+/), resolved = resolvePath(entryPath, parts[0]); if (resolved && urls.has(resolved)) parts[0] = urls.get(resolved); return parts.join(" ");
      }).join(", "));
    });
    return "<!DOCTYPE html>\n" + documentNode.documentElement.outerHTML;
  }
  function canonicalizeJson(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(canonicalizeJson).join(",")}]`;
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalizeJson(value[key])}`).join(",")}}`;
  }
  async function sha256Hex(bytes) {
    if (!globalThis.crypto?.subtle) fail("runtime-release-verification-failed", "当前环境无法验证功能包完整性。");
    const input = bytes instanceof ArrayBuffer ? bytes : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const digest = await globalThis.crypto.subtle.digest("SHA-256", input);
    return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
  }
  function validateExpectedIdentity(identity, releaseId) {
    const strings = ["publishedReleaseId", "appId", "publisherId", "version", "packageSha256", "sourceManifestSha256", "reviewDecisionId"];
    const permissions = identity?.approvedPermissions;
    if (!identity || strings.some((key) => typeof identity[key] !== "string" || !identity[key]) || identity.publishedReleaseId !== releaseId ||
        !/^[a-f0-9]{64}$/.test(identity.packageSha256) || !/^[a-f0-9]{64}$/.test(identity.sourceManifestSha256) ||
        ![1, 2].includes(identity.manifestVersion) || !Array.isArray(permissions) || new Set(permissions).size !== permissions.length ||
        !["active", "delisted"].includes(identity.releaseStatus) ||
        !Number.isInteger(identity.reviewPolicyVersion) || identity.reviewPolicyVersion < 1 ||
        (identity.manifestVersion === 1 ? identity.sdkVersion !== null : typeof identity.sdkVersion !== "string") ||
        identity.packageDownloadIdentity?.publishedReleaseId !== releaseId ||
        String(identity.packageDownloadIdentity?.downloadUrl || "") !== `/api/function-package.asp?release=${encodeURIComponent(releaseId)}`) {
      fail("runtime-release-verification-failed", "无法确认发布版本身份。");
    }
    return identity;
  }
  async function lookupExpectedIdentity(releaseId, appId, version) {
    const url = `/api/runtime-release.asp?release=${encodeURIComponent(releaseId)}` + (appId ? `&appId=${encodeURIComponent(appId)}` : "") + (version ? `&version=${encodeURIComponent(version)}` : "");
    const response = await fetch(url, { credentials:"same-origin", cache:"no-store" });
    let payload = null; try { payload = await response.json(); } catch (_) {}
    if (!response.ok || payload?.ok !== true) fail(payload?.code || (response.status === 404 ? "release-not-found" : "runtime-release-verification-failed"), payload?.message || "无法验证发布版本。");
    return validateExpectedIdentity(payload.identity, releaseId);
  }
  async function readArchive(packageBytes) {
    const archive = await JSZip.loadAsync(packageBytes, { checkCRC32: true, createFolders: false });
    const files = Object.values(archive.files).filter((file) => !file.dir);
    if (!files.length || files.length > MAX_FILES) throw new Error("功能包文件数量无效。");
    const contents = new Map(); let totalSize = 0;
    for (const file of files) {
      const path = normalizePath(file.name);
      if (contents.has(path)) throw new Error("功能包包含重复路径。");
      const ext = extension(path);
      if (!ALLOWED_EXTENSIONS.has(ext)) throw new Error(`功能包包含不允许的文件类型：${path}`);
      if ((Number(file.unixPermissions || 0) & 0xf000) === 0xa000) throw new Error("功能包不能包含符号链接。");
      const bytes = await file.async("uint8array"); totalSize += bytes.byteLength;
      if (totalSize > MAX_UNCOMPRESSED_BYTES) throw new Error("功能包解压后超过 30 MB。");
      contents.set(path, bytes);
    }
    return contents;
  }
  async function verifySourceManifest(contents, expected, entryHint) {
    if (!contents.has("manifest.json")) fail("manifest-integrity-failed", "功能包根目录缺少 Manifest。");
    let manifest;
    try { manifest = JSON.parse(new TextDecoder("utf-8", { fatal:true }).decode(contents.get("manifest.json"))); }
    catch (_) { fail("manifest-integrity-failed", "功能包 Manifest 无法读取。"); }
    if (await sha256Hex(new TextEncoder().encode(canonicalizeJson(manifest))) !== expected.sourceManifestSha256) fail("manifest-integrity-failed", "功能包 Manifest 完整性验证失败。");
    const manifestVersion = Object.prototype.hasOwnProperty.call(manifest, "manifestVersion") ? manifest.manifestVersion : 1;
    const sdkVersion = manifestVersion === 2 ? manifest?.sdk?.apiVersion : null;
    const requestedPermissions = manifestVersion === 2 ? manifest.permissions : [];
    if (manifest.id !== expected.appId || manifest.version !== expected.version || manifestVersion !== expected.manifestVersion || sdkVersion !== expected.sdkVersion || (entryHint && manifest.entry !== entryHint)) fail("manifest-identity-mismatch", "功能包 Manifest 身份与发布版本不一致。");
    if (!Array.isArray(requestedPermissions) || new Set(requestedPermissions).size !== requestedPermissions.length || expected.approvedPermissions.some((permission) => !requestedPermissions.includes(permission))) fail("release-binding-mismatch", "发布权限与功能包声明不一致。");
    return { entry:normalizePath(manifest.entry || "index.html") };
  }
  function createVerifiedIdentity(expected) {
    return Object.freeze({ publishedReleaseId:expected.publishedReleaseId, appId:expected.appId, publisherId:expected.publisherId, version:expected.version,
      packageSha256:expected.packageSha256, sourceManifestSha256:expected.sourceManifestSha256, manifestVersion:expected.manifestVersion, sdkVersion:expected.sdkVersion,
      reviewDecisionId:expected.reviewDecisionId, approvedPermissions:Object.freeze([...expected.approvedPermissions]), reviewPolicyVersion:expected.reviewPolicyVersion,
      verificationTimestamp:new Date().toISOString() });
  }
  async function downloadPackage(url) {
    const response = await fetch(url, { credentials:"same-origin", cache:"no-store" });
    if (!response.ok) fail("runtime-release-verification-failed", `功能包读取失败（${response.status}）。`);
    return response.arrayBuffer();
  }
  async function prepareVerified(params) {
    const releaseId = String(params.get("release") || "").trim(), appId = String(params.get("appId") || "").trim(), version = String(params.get("version") || "").trim();
    const entryHint = params.has("entry") ? normalizePath(params.get("entry")) : "";
    const expected = await lookupExpectedIdentity(releaseId, appId, version);
    const packageBytes = await downloadPackage(expected.packageDownloadIdentity.downloadUrl);
    if (await sha256Hex(packageBytes) !== expected.packageSha256) fail("package-integrity-failed", "功能包完整性验证失败。");
    const contents = await readArchive(packageBytes), source = await verifySourceManifest(contents, expected, entryHint);
    verifiedRuntimePackageIdentity = createVerifiedIdentity(expected); runtimeTrustState = TRUST_STATES.VERIFIED;
    return { contents, entry:source.entry };
  }
  async function prepareLegacy(params) {
    const appId = String(params.get("appId") || "").trim(), version = String(params.get("version") || "").trim(), entry = normalizePath(params.get("entry") || "index.html");
    if (!/^[a-z0-9]+([._-][a-z0-9]+)+$/.test(appId) || !/^[0-9]+(\.[0-9]+){1,3}([._-][a-z0-9]+)?$/.test(version)) throw new Error("功能 ID 或版本号无效。");
    const packageUrl = `/api/function-package.asp?appId=${encodeURIComponent(appId)}&version=${encodeURIComponent(version)}`;
    const contents = await readArchive(await downloadPackage(packageUrl));
    runtimeTrustState = TRUST_STATES.LEGACY; verifiedRuntimePackageIdentity = null; return { contents, entry };
  }
  async function executePreparedPackage(contents, entry) {
    if (!contents.has(entry) || ![".html", ".htm"].includes(extension(entry))) throw new Error("Manifest 指定的 HTML 入口不存在。");
    const urls = new Map(), textAssets = new Map();
    for (const [path, bytes] of contents) if (![".html", ".htm", ".css", ".js"].includes(extension(path))) urls.set(path, createDataUrl(bytes, MIME_TYPES[extension(path)] || "application/octet-stream"));
    for (const [path, bytes] of contents) if ([".css", ".js"].includes(extension(path))) { const text = new TextDecoder("utf-8", { fatal:true }).decode(bytes); textAssets.set(path, extension(path) === ".css" ? rewriteCss(text, path, urls) : text); }
    const html = new TextDecoder("utf-8", { fatal:true }).decode(contents.get(entry));
    const frame = document.getElementById("packageFrame"); frame.srcdoc = rewriteHtml(html, entry, urls, textAssets); frame.hidden = false; document.getElementById("runtimeState").hidden = true;
  }
  function setError(error) {
    runtimeTrustState = TRUST_STATES.FAILED; verifiedRuntimePackageIdentity = null;
    const state = document.getElementById("runtimeState"); state.dataset.errorCode = error?.code || "runtime-release-verification-failed"; state.classList.add("error"); state.querySelector("h1").textContent = "功能无法启动";
    document.getElementById("runtimeMessage").textContent = error?.message || "功能运行验证失败。";
  }
  async function start() {
    if (!window.JSZip) throw new Error("ZIP 运行组件加载失败，请检查网络后重试。");
    const params = new URLSearchParams(location.search), prepared = params.has("release") ? await prepareVerified(params) : await prepareLegacy(params);
    await executePreparedPackage(prepared.contents, prepared.entry);
  }
  document.addEventListener("DOMContentLoaded", () => start().catch((error) => setError(error)));
})();
