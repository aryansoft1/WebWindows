(function installUnifiedFileSearch(global) {
  "use strict";

  const scriptUrl = (() => {
    try { return new URL(document.currentScript?.src || "assets/js/file-search.js", global.location?.href || "http://localhost/"); }
    catch (_) { return new URL("http://localhost/assets/js/file-search.js"); }
  })();
  const endpoint = new URL("../../cloud/browser/search.asp", scriptUrl).href;
  const SOURCE_ORDER = { private: 0, public: 1, device: 2 };
  const parser = global.WebWindows?.fileQuery;
  if (!parser?.parse || !parser?.parseAsync) throw new Error("Unified File Query Parser v2 is not loaded.");
  const MIME_BY_EXTENSION = parser.mimeByExtension;

  function unique(values) { return [...new Set((values || []).map((value) => String(value).toLowerCase()))]; }
  function uniqueStable(values) { return [...new Set((values || []).map((value) => String(value)))]; }
  function parseQuery(query, options) { return parser.parse(query, options); }
  function parseQueryAsync(query, options) { return parser.parseAsync(query, options); }

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
    const size = Number(item.size) || 0;
    if (criteria.sizeMin !== undefined && size < Number(criteria.sizeMin)) return null;
    if (criteria.sizeMax !== undefined && size > Number(criteria.sizeMax)) return null;
    if (criteria.sizeMin !== undefined || criteria.sizeMax !== undefined) reasons.push("size");
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
    copy("mimeTypes", criteria.mimeTypes); copy("folderPath", criteria.folderPath); copy("sizeMin", criteria.sizeMin); copy("sizeMax", criteria.sizeMax); copy("sources", (criteria.sources || []).filter((value) => value !== "device"));
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
      else if (["createdAt", "modifiedAt", "uploadedAt"].includes(sort)) {
        compared = (Date.parse(left[sort]) || Number(left[sort]) || 0) - (Date.parse(right[sort]) || Number(right[sort]) || 0);
      }
      else if (sort === "size") compared = (Number(left.size) || 0) - (Number(right.size) || 0);
      else compared = (Number(left.relevanceScore) || 0) - (Number(right.relevanceScore) || 0);
      if (compared) return compared * direction;
      compared = (SOURCE_ORDER[left.source] ?? 9) - (SOURCE_ORDER[right.source] ?? 9);
      if (compared) return compared;
      return String(left.path).localeCompare(String(right.path));
    });
  }
  async function search(input, overrides) {
    const parsed = typeof input === "string" ? await parseQueryAsync(input, overrides || {}) : (input || {});
    const criteria = Object.assign({}, parsed, overrides || {});
    criteria.sources = unique(criteria.sources?.length ? criteria.sources : ["private", "public", "device"]);
    criteria.extensions = unique(criteria.extensions || []); criteria.mimeTypes = unique(criteria.mimeTypes || []);
    const warnings = [...(criteria.parserWarnings || [])];
    if (criteria.ast?.unsupported?.includes("openedAt")) {
      warnings.push("opened-at-metadata-unavailable");
      return { ok: true, query: criteria.query || "", criteria, results: [], total: 0, searchedSources: [], warnings };
    }
    const tasks = [searchCloud(criteria, criteria.signal).catch((error) => ({ results: [], warnings: [`cloud:${error.message}`] }))];
    if (criteria.sources.includes("device")) tasks.push(searchDevice(criteria, criteria));
    const parts = await Promise.all(tasks); const combined = [];
    for (const part of parts) {
      (part.results || []).forEach((item) => {
        const matched = matchAndScore(item, criteria);
        if (matched) combined.push(matched);
      });
      (part.warnings || []).forEach((warning) => warnings.push(warning));
      if (part.warning) warnings.push(part.warning);
    }
    const deduped = [...new Map(combined.filter(Boolean).map((item) => [`${item.source}:${item.nodeId}:${item.path}`, item])).values()];
    const results = sortResults(deduped, criteria).slice(0, Math.min(Number(criteria.limit) || 200, 500));
    return { ok: true, query: criteria.query || "", criteria, results, total: results.length, searchedSources: criteria.sources, warnings };
  }

  const namespace = global.WebWindows = global.WebWindows || {};
  const previous = namespace.files || {};
  namespace.files = Object.freeze(Object.assign({}, previous, { search, parseQuery, parseQueryAsync, matchAndScore, querySchema: parser.schema, version: "2.0" }));
})(window);
