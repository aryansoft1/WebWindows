(function installDeskTalkFileTools(global) {
  "use strict";

  const registry = global.WebWindows?.aiTools;
  if (!registry) throw new Error("WebWindows AI Tool Registry is not loaded.");

  const cache = new Map();
  const CACHE_TTL_MS = 10 * 60 * 1000;
  const SEARCH_LIMIT = 20;
  let sequence = 0;

  function isSearchIntent(text) {
    const value = String(text || "").toLowerCase();
    const action = /(找|查找|搜索|搜一下|打开|最近|上周|本周|昨天|今天|修改的|更新的|存的|保存的|find|search|open|recent|last\s+week)/i.test(value);
    const fileTarget = /(文件|文件名|名字里|excel|xlsx?|pdf|word|docx?|文档|表格|pptx?|powerpoint|演示文稿|csv|图片|照片|zip|压缩包|file)/i.test(value);
    return action && fileTarget;
  }

  function isExplicitOpenIntent(text) {
    const value = String(text || "").trim();
    return /^(请|帮我|麻烦)?\s*(打开|open)/i.test(value) || /(?:找到|找出|搜索到).{0,16}(?:后|就)?\s*(?:直接)?打开/i.test(value);
  }

  const sourceSchema = { type: "string", enum: ["private", "public", "device"] };
  const dateField = { type: "string", maxLength: 40, description: "ISO 8601 date-time" };
  const searchSchema = {
    type: "object",
    additionalProperties: false,
    required: ["query"],
    properties: {
      query: { type: "string", maxLength: 200, description: "The user's original file-search request." },
      nameContains: { type: "string", maxLength: 120 },
      extensions: { type: "array", items: { type: "string", maxLength: 12 }, maxItems: 12 },
      mimeTypes: { type: "array", items: { type: "string", maxLength: 80 }, maxItems: 12 },
      sources: { type: "array", items: sourceSchema, minItems: 1, maxItems: 3 },
      createdFrom: dateField, createdTo: dateField,
      modifiedFrom: dateField, modifiedTo: dateField,
      uploadedFrom: dateField, uploadedTo: dateField,
      sort: { type: "string", enum: ["relevance", "name", "createdAt", "modifiedAt", "uploadedAt", "size"] },
      order: { type: "string", enum: ["asc", "desc"] },
      limit: { type: "integer", minimum: 1, maximum: SEARCH_LIMIT },
      openIfUnique: { type: "boolean", description: "True only when the user explicitly asked to open the matched file." }
    }
  };
  const openSchema = {
    type: "object",
    additionalProperties: false,
    required: ["fileId"],
    properties: { fileId: { type: "string", maxLength: 100 } }
  };

  function unique(values) {
    return [...new Set((values || []).map((value) => String(value).toLowerCase()))];
  }

  function logicalLocation(result) {
    const sourceLabel = result.source === "private" ? "我的云资料" : result.source === "public" ? "公共资料" : "此设备";
    if (result.source === "device") return sourceLabel;
    const folder = String(result.folderPath || "").replace(/^\/+|\/+$/g, "");
    return folder ? `${sourceLabel}/${folder}` : sourceLabel;
  }

  function safeResult(result) {
    const random = global.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2)}`;
    const fileId = `ww-file-${random}`;
    cache.set(fileId, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    return {
      fileId,
      name: String(result.displayName || result.name || "未命名文件"),
      type: String(result.extension || result.mimeType || "file"),
      logicalLocation: logicalLocation(result),
      modifiedAt: result.modifiedAt || null,
      relevanceScore: Number(result.relevanceScore) || 0,
      matchReasons: unique(result.matchReasons || []),
      source: result.source
    };
  }

  function cleanupCache() {
    const now = Date.now();
    for (const [id, item] of cache) if (item.expiresAt <= now) cache.delete(id);
    while (cache.size > 100) cache.delete(cache.keys().next().value);
  }

  async function buildCriteria(args) {
    const files = global.WebWindows?.files;
    if (!files?.search || !files?.parseQueryAsync) throw new Error("统一文件搜索暂时不可用。");
    const parsed = await files.parseQueryAsync(args.query, { allowAI: false });
    const criteria = Object.assign({}, parsed);
    for (const key of ["nameContains", "extensions", "mimeTypes", "sources", "createdFrom", "createdTo", "modifiedFrom", "modifiedTo", "uploadedFrom", "uploadedTo", "sort", "order"]) {
      if (args[key] !== undefined) criteria[key] = args[key];
    }
    const structuredFilter = ["nameContains", "extensions", "mimeTypes", "createdFrom", "createdTo", "modifiedFrom", "modifiedTo", "uploadedFrom", "uploadedTo", "sort"]
      .some((key) => args[key] !== undefined);
    if (structuredFilter) delete criteria.text;
    criteria.query = args.query;
    criteria.limit = Math.min(Number(args.limit) || 10, SEARCH_LIMIT);
    criteria.extensions = unique(criteria.extensions);
    criteria.mimeTypes = unique(criteria.mimeTypes);
    criteria.sources = unique(criteria.sources?.length ? criteria.sources : ["private", "public", "device"])
      .filter((source) => ["private", "public", "device"].includes(source));
    return criteria;
  }

  async function searchFiles(args) {
    cleanupCache();
    const criteria = await buildCriteria(args);
    const payload = await global.WebWindows.files.search(criteria);
    const results = (payload.results || []).slice(0, SEARCH_LIMIT).map(safeResult);
    const deviceRequested = criteria.sources.includes("device");
    const deviceReturned = results.some((result) => result.source === "device");
    const warnings = unique(payload.warnings || []);
    if (deviceRequested && !deviceReturned) {
      const storage = global.WebWindows?.device?.storage;
      let available = false;
      try { available = Boolean(storage?.listVolumes && (await storage.listVolumes()).length); } catch (_) {}
      if (!available) warnings.push("device-unavailable");
    }
    return {
      kind: "file-search-results",
      query: args.query,
      criteria,
      results,
      total: results.length,
      searchedSources: payload.searchedSources || criteria.sources,
      warnings: unique(warnings),
      openIfUnique: args.openIfUnique === true,
      highConfidence: results.length === 1 && results[0].relevanceScore >= 78
    };
  }

  function resourceFor(result, url) {
    return {
      protocol: "webwindows-cloud-resource",
      version: "1.1",
      nodeId: result.nodeId,
      scope: result.scope || result.source,
      path: result.path,
      name: result.displayName || result.name,
      mimeType: result.mimeType,
      size: result.size,
      readUrl: url || result.readUrl,
      url: url || result.readUrl,
      editorDataUrl: result.editorDataUrl,
      permissions: { read: true, download: true, edit: false }
    };
  }

  async function openFile(args) {
    cleanupCache();
    const cached = cache.get(args.fileId);
    if (!cached || cached.expiresAt <= Date.now()) throw new Error("搜索结果已过期，请重新搜索。");
    const result = cached.result;
    let resource;
    if (result.source === "device") {
      const match = String(result.path || "").match(/^device:\/\/([^/]+)\/(.*)$/);
      const storage = global.WebWindows?.device?.storage;
      if (!match || !storage?.openFile) throw new Error("此设备当前不可访问。");
      const opened = await storage.openFile(
        decodeURIComponent(match[1]),
        match[2].split("/").filter(Boolean).map(decodeURIComponent)
      );
      const mimeType = opened.metadata?.type || result.mimeType || "application/octet-stream";
      const url = URL.createObjectURL(new Blob([opened.data], { type: mimeType }));
      resource = resourceFor(Object.assign({}, result, { mimeType }), url);
    } else {
      resource = resourceFor(result);
    }
    if (typeof global.openResource !== "function") throw new Error("文件打开服务暂时不可用。");
    await global.openResource(resource);
    return { opened: true, fileId: args.fileId, name: resource.name };
  }

  registry.setPermissionResolver(async function (permission, request) {
    const context = request?.runtimeContext || {};
    if (context.origin !== "desktalk") return false;
    if (permission === "files.search.metadata") return true;
    if (permission === "files.open") {
      return context.userConfirmed === true ||
        (context.explicitOpenIntent === true && context.highConfidence === true);
    }
    return false;
  });

  registry.register({
    name: "searchFiles",
    description: "Search files only when the user asks to find or open files. Convert names to nameContains, file kinds to extensions, saved dates to uploadedFrom/uploadedTo, changed dates to modifiedFrom/modifiedTo, and 'recent' to sort=modifiedAt order=desc. Set openIfUnique only for an explicit open command. Never use this tool for general questions. The controlled tool searches only currently permitted WebWindows sources and never returns file contents to the model.",
    permission: "files.search.metadata",
    parameters: searchSchema,
    enabled: true,
    modelVisible: true,
    handler: searchFiles
  });
  registry.register({
    name: "openFile",
    description: "Open one file selected from the current DeskTalk search results. It requires explicit user confirmation or an explicit open request with one high-confidence result.",
    permission: "files.open",
    parameters: openSchema,
    enabled: true,
    modelVisible: false,
    handler: openFile
  });
  global.WebWindows.aiFileTools = Object.freeze({
    version: 1,
    isSearchIntent,
    isExplicitOpenIntent,
    searchSchema,
    openSchema
  });
})(window);
