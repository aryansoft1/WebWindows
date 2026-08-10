(function installUnifiedFileSearch(global) {
  "use strict";

  const scriptUrl = (() => {
    try { return new URL(document.currentScript?.src || "assets/js/file-search.js", global.location?.href || "http://localhost/"); }
    catch (_) { return new URL("http://localhost/assets/js/file-search.js"); }
  })();
  const endpoint = new URL("../../cloud/browser/search.asp", scriptUrl).href;
  const SOURCE_ORDER = { private: 0, public: 1, device: 2 };
  const TYPE_ALIASES = Object.freeze({
    excel: ["xlsx", "xls"], 表格: ["xlsx", "xls", "csv"], 电子表格: ["xlsx", "xls", "csv"],
    word: ["docx", "doc"], 文档: ["docx", "doc"],
    powerpoint: ["pptx", "ppt"], ppt: ["pptx", "ppt"], 演示文稿: ["pptx", "ppt"],
    pdf: ["pdf"], zip: ["zip"], 压缩包: ["zip"],
    图片: ["png", "jpg", "jpeg", "gif", "webp"], image: ["png", "jpg", "jpeg", "gif", "webp"],
    markdown: ["md"], md: ["md"], json: ["json"]
  });
  const MIME_BY_EXTENSION = Object.freeze({
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xls: "application/vnd.ms-excel",
    csv: "text/csv", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", doc: "application/msword",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", ppt: "application/vnd.ms-powerpoint",
    pdf: "application/pdf", zip: "application/zip", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
    gif: "image/gif", webp: "image/webp", json: "application/json", md: "text/markdown", txt: "text/plain"
  });

  function startOfDay(date) { const value = new Date(date); value.setHours(0, 0, 0, 0); return value; }
  function endOfDay(date) { const value = startOfDay(date); value.setDate(value.getDate() + 1); return value; }
  function dateRange(text, now) {
    const current = new Date(now || Date.now());
    if (/今天|今日|today/i.test(text)) return [startOfDay(current), endOfDay(current)];
    if (/昨天|昨日|yesterday/i.test(text)) { const value = startOfDay(current); value.setDate(value.getDate() - 1); return [value, endOfDay(value)]; }
    if (/上周|先週|last\s+week/i.test(text)) {
      const end = startOfDay(current); const day = end.getDay() || 7; end.setDate(end.getDate() - day + 1);
      const start = new Date(end); start.setDate(start.getDate() - 7); return [start, end];
    }
    if (/本周|这周|今週|this\s+week/i.test(text)) {
      const start = startOfDay(current); const day = start.getDay() || 7; start.setDate(start.getDate() - day + 1);
      const end = new Date(start); end.setDate(end.getDate() + 7); return [start, end];
    }
    let match = text.match(/(?:(\d{4})[年\/-])?(\d{1,2})[月\/-](\d{1,2})日?/);
    if (!match) return null;
    let year = Number(match[1] || current.getFullYear());
    const month = Number(match[2]) - 1; const day = Number(match[3]);
    let start = new Date(year, month, day);
    if (!match[1] && start > endOfDay(current)) start = new Date(year - 1, month, day);
    return [startOfDay(start), endOfDay(start)];
  }

  function unique(values) { return [...new Set((values || []).map((value) => String(value).toLowerCase()))]; }
  function uniqueStable(values) { return [...new Set((values || []).map((value) => String(value)))]; }
  function parseQuery(query, options) {
    const original = String(query || "").trim();
    let residual = original;
    const criteria = { query: original, sources: ["private", "public", "device"] };
    const lower = original.toLowerCase();
    const extensions = [];
    Object.entries(TYPE_ALIASES).forEach(([alias, values]) => {
      const expression = new RegExp(`(^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
      if (expression.test(lower)) { extensions.push(...values); residual = residual.replace(expression, " "); }
    });
    const explicitExtensions = [...lower.matchAll(/(?:\.|\b)(xlsx?|docx?|pptx?|pdf|zip|csv|png|jpe?g|gif|webp|json|md|txt)\b/g)].map((match) => match[1]);
    extensions.push(...explicitExtensions);
    if (extensions.length) criteria.extensions = unique(extensions);

    const nameMatch = original.match(/(?:名字|名称|文件名)(?:里|中)?(?:有|包含|含|是|为)?\s*[“\"']?([^”\"']+?)[”\"']?(?:的文件|文件)?$/i)
      || original.match(/(?:named?|filename)\s*(?:contains?|is|=)?\s*[“\"']?([^”\"']+)[”\"']?/i);
    if (nameMatch) { criteria.nameContains = nameMatch[1].trim().replace(/\s*的文件$/, ""); residual = residual.replace(nameMatch[0], " "); }

    const range = dateRange(original, options?.now);
    if (range) {
      const prefix = /修改|更新|edited?|modified?|更新日/i.test(original) ? "modified" :
        (/创建|建立|created?/i.test(original) ? "created" : "uploaded");
      criteria[`${prefix}From`] = range[0].toISOString(); criteria[`${prefix}To`] = range[1].toISOString();
      residual = residual.replace(/(?:今天|今日|昨天|昨日|上周|先週|本周|这周|今週|today|yesterday|last\s+week|this\s+week|(?:(?:\d{4})[年\/-])?\d{1,2}[月\/-]\d{1,2}日?)/ig, " ");
      residual = residual.replace(/(?:存的?|保存|上传|修改的?|更新的?|创建的?|建立的?|edited?|modified?|created?|uploaded?)/ig, " ");
    }
    if (/我的云资料|私人文件|my\s+(?:cloud|files?)/i.test(original)) criteria.sources = ["private"];
    else if (/公共资料|公共区域|public\s+(?:cloud|files?)/i.test(original)) criteria.sources = ["public"];
    else if (/此设备|本地文件|this\s+device|local\s+files?/i.test(original)) criteria.sources = ["device"];
    residual = residual.replace(/我的云资料|私人文件|公共资料|公共区域|此设备|本地文件|my\s+(?:cloud|files?)|public\s+(?:cloud|files?)|this\s+device|local\s+files?/ig, " ");
    residual = residual.replace(/\b(?:xlsx?|docx?|pptx?|pdf|zip|csv|png|jpe?g|gif|webp|json|md|txt)\b/ig, " ")
      .replace(/(?:的)?文件/g, " ").replace(/\s+/g, " ").trim();
    if (residual && !criteria.nameContains) criteria.text = residual;
    return criteria;
  }

  function extensionOf(name) { const match = String(name || "").toLowerCase().match(/\.([^.]+)$/); return match ? match[1] : ""; }
  function containsSubsequence(value, query) { let index = 0; for (const char of value) if (char === query[index]) index += 1; return index === query.length; }
  function nameScore(name, query) {
    const value = String(name || "").toLowerCase(); const wanted = String(query || "").toLowerCase().trim();
    if (!wanted) return { score: 20, reason: null };
    if (value === wanted) return { score: 100, reason: "fileNameExact" };
    if (value.startsWith(wanted)) return { score: 88, reason: "fileNamePrefix" };
    if (value.includes(wanted)) return { score: 78, reason: "fileNameContains" };
    const tokens = wanted.split(/\s+/).filter(Boolean);
    if (tokens.length && tokens.every((token) => value.includes(token))) return { score: 66, reason: "fileNameTokens" };
    if (wanted.length > 2 && containsSubsequence(value, wanted)) return { score: 48, reason: "fileNameFuzzy" };
    return { score: 0, reason: null };
  }
  function inRange(value, from, to) {
    const time = typeof value === "number" ? value : Date.parse(value);
    return (!from || time >= Date.parse(from)) && (!to || time < Date.parse(to));
  }
  function matchAndScore(item, criteria) {
    const extension = String(item.extension || extensionOf(item.name)); const mimeType = String(item.mimeType || MIME_BY_EXTENSION[extension] || "application/octet-stream");
    const reasons = []; const query = criteria.nameContains || criteria.text || ""; const nameMatch = nameScore(item.name, query);
    if (query && !nameMatch.score) return null;
    if (nameMatch.reason) reasons.push(nameMatch.reason);
    if (criteria.extensions?.length && !criteria.extensions.map((value) => String(value).replace(/^\./, "").toLowerCase()).includes(extension)) return null;
    if (criteria.extensions?.length) reasons.push("fileType");
    if (criteria.mimeTypes?.length && !criteria.mimeTypes.some((value) => mimeType.toLowerCase().startsWith(String(value).toLowerCase()))) return null;
    if (criteria.mimeTypes?.length) reasons.push("mimeType");
    if (criteria.folderPath && !String(item.folderPath || "").toLowerCase().includes(String(criteria.folderPath).toLowerCase())) return null;
    if (criteria.folderPath) reasons.push("folderPath");
    for (const field of ["created", "modified", "uploaded"]) {
      if (!inRange(item[`${field}At`], criteria[`${field}From`], criteria[`${field}To`])) return null;
      if (criteria[`${field}From`] || criteria[`${field}To`]) reasons.push(`${field}At`);
    }
    const conditionBonus = Math.min(20, Math.max(0, reasons.length - (nameMatch.reason ? 1 : 0)) * 5);
    return Object.assign({}, item, { extension, mimeType, relevanceScore: Math.min(100, nameMatch.score + conditionBonus), matchReasons: uniqueStable(reasons) });
  }

  async function searchDevice(criteria, limits) {
    const device = global.WebWindows?.device || (() => { try { return global.parent?.WebWindows?.device; } catch (_) { return null; } })();
    const storage = device?.storage; if (!storage?.listVolumes || !storage?.listDirectory) return { results: [], warning: "device-unavailable" };
    const results = []; let scanned = 0; const maxScanned = Math.min(Number(limits?.maxScanned) || 5000, 10000);
    async function walk(volume, path, depth) {
      if (depth > 12 || scanned >= maxScanned) return;
      let entries; try { entries = await storage.listDirectory(volume.id, path); } catch (_) { return; }
      for (const entry of entries || []) {
        if (scanned >= maxScanned) break; scanned += 1;
        const entryPath = Array.isArray(entry.path) ? entry.path : [...path, entry.name];
        if (entry.kind === "directory") await walk(volume, entryPath, depth + 1);
        else {
          const modifiedAt = Number(entry.lastModified) || null;
          const matched = matchAndScore({ id: `device:${volume.id}:${entryPath.join("/")}`, nodeId: volume.id, source: "device", scope: "device",
            name: entry.name, path: `device://${encodeURIComponent(volume.id)}/${entryPath.map(encodeURIComponent).join("/")}`,
            folderPath: entryPath.slice(0, -1).join("/"), size: Number(entry.size) || 0, modifiedAt, createdAt: null, uploadedAt: null,
            mimeType: entry.type || MIME_BY_EXTENSION[extensionOf(entry.name)] || "application/octet-stream", readUrl: null }, criteria);
          if (matched) results.push(matched);
        }
      }
    }
    const volumes = await storage.listVolumes();
    for (const volume of volumes || []) await walk(volume, [], 0);
    return { results, warning: scanned >= maxScanned ? "device-scan-limit" : null };
  }

  function criteriaParams(criteria) {
    const params = new URLSearchParams();
    const copy = (key, value) => { if (value !== undefined && value !== null && value !== "") params.set(key, Array.isArray(value) ? value.join(",") : String(value)); };
    const localEpoch = (value) => {
      const date = new Date(value);
      return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()) / 1000);
    };
    copy("q", criteria.nameContains || criteria.text); copy("nameExact", criteria.nameExact); copy("extensions", criteria.extensions);
    copy("mimeTypes", criteria.mimeTypes); copy("folderPath", criteria.folderPath); copy("sources", (criteria.sources || []).filter((value) => value !== "device"));
    for (const field of ["created", "modified", "uploaded"]) {
      copy(`${field}From`, criteria[`${field}From`] ? localEpoch(criteria[`${field}From`]) : null);
      copy(`${field}To`, criteria[`${field}To`] ? localEpoch(criteria[`${field}To`]) : null);
    }
    copy("limit", criteria.limit || 200); copy("sort", criteria.sort || "relevance"); copy("order", criteria.order || "desc");
    copy("lang", criteria.lang || global.WebWindowsI18n?.getLanguage?.() || global.localStorage?.getItem("lang") || global.document?.body?.dataset?.language || "zh");
    return params;
  }
  async function searchCloud(criteria, signal) {
    const sources = criteria.sources || ["private", "public", "device"];
    if (!sources.some((value) => value === "public" || value === "private")) return { results: [], warnings: [] };
    const response = await fetch(`${endpoint}?${criteriaParams(criteria)}`, { credentials: "same-origin", signal, headers: { Accept: "application/json" } });
    const payload = await response.json(); if (!response.ok || payload.ok === false) throw new Error(payload.error?.message || `file-search-${response.status}`);
    payload.results = (payload.results || []).map((item) => Object.assign({}, item, {
      readUrl: item.readUrl ? new URL(item.readUrl, endpoint).href : null
    }));
    return payload;
  }
  function sortResults(results, criteria) {
    const sort = criteria.sort || "relevance"; const direction = criteria.order === "asc" ? 1 : -1;
    return results.sort((left, right) => {
      let compared = 0;
      if (sort === "name") compared = String(left.name).localeCompare(String(right.name));
      else if (["createdAt", "modifiedAt", "uploadedAt", "size"].includes(sort)) compared = (Number(left[sort]) || 0) - (Number(right[sort]) || 0);
      else compared = (Number(left.relevanceScore) || 0) - (Number(right.relevanceScore) || 0);
      if (compared) return compared * direction;
      compared = (SOURCE_ORDER[left.source] ?? 9) - (SOURCE_ORDER[right.source] ?? 9);
      if (compared) return compared;
      return String(left.path).localeCompare(String(right.path));
    });
  }
  async function search(input, overrides) {
    const criteria = Object.assign({}, typeof input === "string" ? parseQuery(input, overrides) : (input || {}), overrides || {});
    criteria.sources = unique(criteria.sources?.length ? criteria.sources : ["private", "public", "device"]);
    criteria.extensions = unique(criteria.extensions || []); criteria.mimeTypes = unique(criteria.mimeTypes || []);
    const warnings = []; const tasks = [searchCloud(criteria, criteria.signal).catch((error) => ({ results: [], warnings: [`cloud:${error.message}`] }))];
    if (criteria.sources.includes("device")) tasks.push(searchDevice(criteria, criteria));
    const parts = await Promise.all(tasks); const combined = [];
    for (const part of parts) { (part.results || []).forEach((item) => combined.push(matchAndScore(item, criteria) || item)); (part.warnings || []).forEach((warning) => warnings.push(warning)); if (part.warning) warnings.push(part.warning); }
    const deduped = [...new Map(combined.filter(Boolean).map((item) => [`${item.source}:${item.nodeId}:${item.path}`, item])).values()];
    const results = sortResults(deduped, criteria).slice(0, Math.min(Number(criteria.limit) || 200, 500));
    return { ok: true, query: criteria.query || "", criteria, results, total: results.length, searchedSources: criteria.sources, warnings };
  }

  const namespace = global.WebWindows = global.WebWindows || {};
  const previous = namespace.files || {};
  namespace.files = Object.freeze(Object.assign({}, previous, { search, parseQuery, matchAndScore, version: "1.0" }));
})(window);
