(function installUnifiedFileQueryParser(global) {
  "use strict";

  const VERSION = "2.0";
  const MAX_QUERY_LENGTH = 240;
  const ALL_SOURCES = Object.freeze(["private", "public", "device"]);
  const MIME_BY_EXTENSION = Object.freeze({
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    odt: "application/vnd.oasis.opendocument.text",
    rtf: "application/rtf",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ppt: "application/vnd.ms-powerpoint",
    pdf: "application/pdf",
    zip: "application/zip",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    m4v: "video/x-m4v",
    json: "application/json",
    md: "text/markdown",
    txt: "text/plain"
  });
  const GROUPS = Object.freeze({
    markdown: { label: "Markdown / MD", extensions: ["md"] },
    spreadsheet: { label: "Excel", extensions: ["xlsx", "xls", "csv"] },
    word: { label: "Word", extensions: ["docx", "doc"] },
    document: { label: "文档", extensions: ["docx", "doc", "odt", "rtf", "pdf", "md", "txt"] },
    presentation: { label: "PowerPoint", extensions: ["pptx", "ppt"] },
    pdf: { label: "PDF", extensions: ["pdf"] },
    image: { label: "图片", extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"], mimeTypes: ["image/"] },
    video: { label: "视频", extensions: ["mp4", "webm", "mov", "m4v"], mimeTypes: ["video/"] },
    archive: { label: "压缩文件", extensions: ["zip"] }
  });
  const GROUP_PATTERNS = Object.freeze([
    ["markdown", /markdown|マークダウン/ig],
    ["spreadsheet", /excel|(?:电子)?表格|試算表|スプレッドシート|spreadsheet/ig],
    ["word", /microsoft\s*word|word\s*(?:文档|文書|documents?)?|ワード/ig],
    ["presentation", /powerpoint|演示文稿|演示文件|プレゼン(?:テーション)?|スライド/ig],
    ["pdf", /pdf/ig],
    ["image", /图片|图像|照片|画像|写真|images?|pictures?/ig],
    ["video", /视频|影片|動画|videos?/ig],
    ["archive", /压缩包|压缩文件|アーカイブ|archives?|zip/ig],
    ["document", /文档|文書|documents?/ig]
  ]);
  const EXTENSION_PATTERN = /(^|[^a-z0-9])(\.?)(xlsx|xls|csv|docx|doc|odt|rtf|pptx|ppt|pdf|md|txt|json|zip|png|jpg|jpeg|gif|webp|svg|mp4|webm|mov|m4v)(?=$|[^a-z0-9])/ig;

  function unique(values) {
    return [...new Set((values || []).map(value => String(value).trim().toLowerCase()).filter(Boolean))];
  }

  function startOfDay(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function nextDay(value) {
    const date = startOfDay(value);
    date.setDate(date.getDate() + 1);
    return date;
  }

  function localIso(value) {
    const date = new Date(value);
    const pad = part => String(part).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function parseDateExpression(text, nowValue) {
    const now = new Date(nowValue || Date.now());
    if (/今天|今日|きょう|today/i.test(text)) return { from: startOfDay(now), to: nextDay(now), label: "今天" };
    if (/昨天|昨日|きのう|yesterday/i.test(text)) {
      const from = startOfDay(now);
      from.setDate(from.getDate() - 1);
      return { from, to: nextDay(from), label: "昨天" };
    }
    if (/上周|上週|先週|last\s+week/i.test(text)) {
      const to = startOfDay(now);
      const day = to.getDay() || 7;
      to.setDate(to.getDate() - day + 1);
      const from = new Date(to);
      from.setDate(from.getDate() - 7);
      return { from, to, label: "上周" };
    }
    if (/本周|这周|今週|this\s+week/i.test(text)) {
      const from = startOfDay(now);
      const day = from.getDay() || 7;
      from.setDate(from.getDate() - day + 1);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      return { from, to, label: "本周" };
    }
    const match = text.match(/(?:(\d{4})[年\/-])?(\d{1,2})[月\/-](\d{1,2})日?/);
    if (!match) return null;
    let year = Number(match[1] || now.getFullYear());
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    let from = new Date(year, month, day);
    if (!match[1] && from > nextDay(now)) from = new Date(year - 1, month, day);
    from = startOfDay(from);
    return { from, to: nextDay(from), label: `${month + 1}月${day}日` };
  }

  function dateField(text) {
    if (/修改|更新|编辑|変更|更新した|modified?|edited?/i.test(text)) return "modified";
    if (/创建|建立|新建|作成|created?/i.test(text)) return "created";
    return "uploaded";
  }

  function createAst(query) {
    return {
      version: VERSION,
      intent: "searchFiles",
      text: null,
      extensions: [],
      mimeTypes: [],
      fileCategory: null,
      dateCreated: null,
      dateModified: null,
      dateUploaded: null,
      size: null,
      path: null,
      source: [...ALL_SOURCES],
      sort: "relevance",
      order: "desc",
      limit: 200,
      parser: "local",
      confidence: "high",
      needsAI: false,
      unsupported: [],
      original: query
    };
  }

  function criteriaFromAst(ast, query) {
    const criteria = {
      query,
      intent: ast.intent,
      sources: unique(ast.source?.length ? ast.source : ALL_SOURCES),
      sort: ast.sort || "relevance",
      order: ast.order === "asc" ? "asc" : "desc",
      limit: Math.min(Math.max(Number(ast.limit) || 200, 1), 500),
      ast,
      understanding: []
    };
    if (ast.text) criteria.text = String(ast.text).slice(0, 160);
    if (ast.extensions?.length) criteria.extensions = unique(ast.extensions);
    if (ast.mimeTypes?.length) criteria.mimeTypes = unique(ast.mimeTypes);
    if (ast.fileCategory) criteria.fileCategory = ast.fileCategory;
    if (ast.path) criteria.folderPath = String(ast.path).slice(0, 240);
    for (const [astKey, prefix] of [["dateCreated", "created"], ["dateModified", "modified"], ["dateUploaded", "uploaded"]]) {
      const range = ast[astKey];
      if (range?.from) criteria[`${prefix}From`] = range.from;
      if (range?.to) criteria[`${prefix}To`] = range.to;
    }
    if (ast.size?.min !== undefined) criteria.sizeMin = Number(ast.size.min);
    if (ast.size?.max !== undefined) criteria.sizeMax = Number(ast.size.max);
    if (ast.nameContains) {
      criteria.nameContains = String(ast.nameContains).slice(0, 120);
      delete criteria.text;
    }
    if (ast.fileCategory) criteria.understanding.push(GROUPS[ast.fileCategory]?.label || ast.fileCategory);
    else if (criteria.extensions?.length) criteria.understanding.push(criteria.extensions.map(item => item.toUpperCase()).join(" / "));
    if (ast.dateCreated?.label) criteria.understanding.push(`${ast.dateCreated.label} 创建`);
    if (ast.dateModified?.label) criteria.understanding.push(`${ast.dateModified.label} 修改`);
    if (ast.dateUploaded?.label) criteria.understanding.push(`${ast.dateUploaded.label} 保存`);
    if (criteria.nameContains) criteria.understanding.push(`名称包含 ${criteria.nameContains}`);
    if (ast.path) criteria.understanding.push(`位置 ${ast.path}`);
    if (ast.sort === "modifiedAt" && !ast.dateModified) {
      criteria.understanding.push(/最新(?:的)?|最新の|latest/i.test(ast.original || "") ? "最新" : "最近修改");
    }
    if (ast.unsupported?.includes("openedAt")) criteria.understanding.push("最近打开（暂无元数据）");
    return criteria;
  }

  function parse(query, options) {
    const original = String(query || "").trim().slice(0, MAX_QUERY_LENGTH);
    const ast = createAst(original);
    let residual = original;
    let structured = false;
    const categories = [];
    const extensions = [];
    const mimeTypes = [];

    const nameMatch = original.match(/(?:文件名|名字|名称)(?:里|中)?(?:包含|含有|有|为|是)\s*[“"']?(.+?)[”"']?(?:的文件)?$/i)
      || original.match(/(?:file\s*name|filename|named?)\s*(?:contains?|is|=)\s*[“"']?(.+?)[”"']?$/i);
    if (nameMatch) {
      ast.nameContains = nameMatch[1].trim().replace(/\s*(?:的)?文件$/i, "");
      residual = residual.replace(nameMatch[0], " ");
      structured = true;
    }

    if (/我的云资料|私人文件|マイクラウド|my\s+(?:cloud|files?)/i.test(original)) ast.source = ["private"];
    else if (/公共资料|公共区域|パブリック|public\s+(?:cloud|files?)/i.test(original)) ast.source = ["public"];
    else if (/此设备|本地文件|このデバイス|this\s+device|local\s+files?/i.test(original)) ast.source = ["device"];
    if (ast.source.length !== ALL_SOURCES.length) structured = true;
    residual = residual.replace(/我的云资料|私人文件|公共资料|公共区域|此设备|本地文件|マイクラウド|パブリック|このデバイス|my\s+(?:cloud|files?)|public\s+(?:cloud|files?)|this\s+device|local\s+files?/ig, " ");

    const range = parseDateExpression(original, options?.now);
    if (range) {
      const field = dateField(original);
      ast[`date${field[0].toUpperCase()}${field.slice(1)}`] = {
        from: localIso(range.from), to: localIso(range.to), label: range.label
      };
      residual = residual.replace(/(?:今天|今日|きょう|昨天|昨日|きのう|上周|上週|先週|本周|这周|今週|today|yesterday|last\s+week|this\s+week|(?:(?:\d{4})[年\/-])?\d{1,2}[月\/-]\d{1,2}日?)/ig, " ");
      residual = residual.replace(/(?:存的?|保存(?:的)?|上传(?:的)?|修改(?:的)?|更新(?:的)?|创建(?:的)?|建立(?:的)?|edited?|modified?|created?|uploaded?)/ig, " ");
      structured = true;
    }

    if (/最近(?:修改|更新)|最近更新|recently?\s+(?:modified|updated)/i.test(original)) {
      ast.sort = "modifiedAt";
      ast.order = "desc";
      ast.limit = 50;
      residual = residual.replace(/最近(?:修改|更新)(?:的)?|最近更新(?:的)?|recently?\s+(?:modified|updated)/ig, " ");
      structured = true;
    }
    if (/最新(?:的)?|最新の|latest/i.test(original)) {
      ast.sort = "modifiedAt";
      ast.order = "desc";
      ast.limit = 50;
      residual = residual.replace(/最新(?:的)?|最新の|latest/ig, " ");
      structured = true;
    }
    if (/最近打开|recently?\s+opened|最近開いた/i.test(original)) {
      ast.unsupported.push("openedAt");
      residual = residual.replace(/最近打开(?:的)?|recently?\s+opened|最近開いた/ig, " ");
      structured = true;
    }

    residual = residual.replace(EXTENSION_PATTERN, (match, prefix, dot, extension) => {
      extensions.push(String(extension).toLowerCase());
      structured = true;
      return prefix || " ";
    });
    for (const [category, pattern] of GROUP_PATTERNS) {
      pattern.lastIndex = 0;
      if (!pattern.test(residual)) continue;
      pattern.lastIndex = 0;
      residual = residual.replace(pattern, " ");
      const group = GROUPS[category];
      categories.push(category);
      extensions.push(...group.extensions);
      mimeTypes.push(...(group.mimeTypes || []));
      structured = true;
    }
    ast.extensions = unique(extensions);
    ast.mimeTypes = unique(mimeTypes);
    ast.fileCategory = categories.length === 1 ? categories[0] : (categories.length > 1 ? "mixed" : null);
    if (!ast.fileCategory && ast.extensions.length === 1 && ast.extensions[0] === "md") ast.fileCategory = "markdown";
    if (!ast.fileCategory && ast.extensions.length === 1 && ast.extensions[0] === "pdf") ast.fileCategory = "pdf";

    if (structured) {
      residual = residual
        .replace(/(?:所有(?:的)?|全部(?:的)?|全部の|すべての?|all(?:\s+of\s+the)?)/ig, " ")
        .replace(/(?:扩展名|副檔名|拡張子|extension|格式|フォーマット|format|类型|種類|type)/ig, " ")
        .replace(/(?:的)?(?:文件|檔案|ファイル|files?)/ig, " ");
    }
    residual = residual.replace(/[，,。！？!?;；:：]+/g, " ").replace(/\s+/g, " ").trim();
    if (structured) residual = residual.replace(/^[的之をは]+|[的之をは]+$/g, "").trim();
    if (residual && !ast.nameContains) ast.text = residual;

    const complexMarkers = /(?:大于|小于|超过|不少于|不超过|之前|之后|介于|除了|排除|文件夹|目录|路径|larger\s+than|smaller\s+than|before|after|except|folder|path)/i;
    ast.needsAI = complexMarkers.test(original) && Boolean(residual);
    if (ast.needsAI) ast.confidence = "low";
    if (!original) ast.confidence = "low";
    return criteriaFromAst(ast, original);
  }

  const aiSchema = Object.freeze({
    type: "object",
    additionalProperties: false,
    required: ["intent"],
    properties: {
      intent: { type: "string", enum: ["searchFiles"] },
      text: { type: "string", maxLength: 160 },
      nameContains: { type: "string", maxLength: 120 },
      extensions: { type: "array", maxItems: 16, items: { type: "string", maxLength: 12 } },
      mimeTypes: { type: "array", maxItems: 16, items: { type: "string", maxLength: 80 } },
      fileCategory: { type: "string", enum: ["markdown", "spreadsheet", "word", "document", "presentation", "pdf", "image", "video", "archive", "mixed"] },
      dateCreated: { type: "object", additionalProperties: false, properties: { from: { type: "string" }, to: { type: "string" }, label: { type: "string" } } },
      dateModified: { type: "object", additionalProperties: false, properties: { from: { type: "string" }, to: { type: "string" }, label: { type: "string" } } },
      dateUploaded: { type: "object", additionalProperties: false, properties: { from: { type: "string" }, to: { type: "string" }, label: { type: "string" } } },
      size: { type: "object", additionalProperties: false, properties: { min: { type: "number", minimum: 0 }, max: { type: "number", minimum: 0 } } },
      path: { type: "string", maxLength: 240 },
      source: { type: "array", minItems: 1, maxItems: 3, items: { type: "string", enum: ["private", "public", "device"] } },
      sort: { type: "string", enum: ["relevance", "name", "createdAt", "modifiedAt", "uploadedAt", "size"] },
      order: { type: "string", enum: ["asc", "desc"] },
      limit: { type: "integer", minimum: 1, maximum: 500 }
    }
  });

  function validRange(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const output = {};
    for (const key of ["from", "to"]) {
      if (value[key] !== undefined && Number.isNaN(Date.parse(value[key]))) throw new Error(`AI search date ${key} is invalid.`);
      if (value[key] !== undefined) output[key] = String(value[key]);
    }
    if (value.label !== undefined) output.label = String(value.label).slice(0, 40);
    return output;
  }

  function validateAI(value, localCriteria) {
    if (!value || typeof value !== "object" || Array.isArray(value) || value.intent !== "searchFiles") throw new Error("AI query parser returned an invalid intent.");
    const allowed = new Set(Object.keys(aiSchema.properties));
    for (const key of Object.keys(value)) if (!allowed.has(key)) throw new Error(`AI query parser returned unknown field ${key}.`);
    const ast = Object.assign({}, localCriteria.ast, {
      parser: "ai",
      confidence: "high",
      needsAI: false,
      original: localCriteria.query
    });
    if (value.text !== undefined) ast.text = String(value.text).trim().slice(0, 160) || null;
    if (value.nameContains !== undefined) ast.nameContains = String(value.nameContains).trim().slice(0, 120) || null;
    if (value.extensions !== undefined) ast.extensions = unique(value.extensions).filter(item => /^[a-z0-9]{1,12}$/.test(item)).slice(0, 16);
    if (value.mimeTypes !== undefined) ast.mimeTypes = unique(value.mimeTypes).filter(item => /^[a-z0-9.+-]+\/[a-z0-9.*+-]+$/i.test(item)).slice(0, 16);
    if (value.fileCategory !== undefined && (GROUPS[value.fileCategory] || value.fileCategory === "mixed")) ast.fileCategory = value.fileCategory;
    for (const key of ["dateCreated", "dateModified", "dateUploaded"]) if (value[key] !== undefined) ast[key] = validRange(value[key]);
    if (value.size !== undefined) ast.size = { min: Math.max(0, Number(value.size.min) || 0), max: value.size.max === undefined ? undefined : Math.max(0, Number(value.size.max) || 0) };
    if (value.path !== undefined) ast.path = String(value.path).trim().slice(0, 240) || null;
    if (value.source !== undefined) ast.source = unique(value.source).filter(item => ALL_SOURCES.includes(item));
    if (value.sort !== undefined && aiSchema.properties.sort.enum.includes(value.sort)) ast.sort = value.sort;
    if (value.order !== undefined) ast.order = value.order === "asc" ? "asc" : "desc";
    if (value.limit !== undefined) ast.limit = Math.min(Math.max(Number(value.limit) || 200, 1), 500);
    return criteriaFromAst(ast, localCriteria.query);
  }

  async function callAI(query, localCriteria, signal) {
    const scriptUrl = (() => {
      try { return new URL(document.currentScript?.src || "assets/js/file-query-parser.js", global.location?.href || "http://localhost/"); }
      catch (_) { return new URL("http://localhost/assets/js/file-query-parser.js"); }
    })();
    const endpoint = new URL("../../cloud/desktalk/chatproxy.asp", scriptUrl).href;
    const payload = {
      messages: [
        { role: "system", content: "Convert one file-search request into the provided strict schema. Do not invent file IDs, file names, paths, results, or file contents. Return only a tool call. Use uploaded dates for saved/uploaded wording and modified dates for changed/edited wording." },
        { role: "user", content: query }
      ],
      tools: [{ type: "function", function: { name: "parseFileSearchQuery", description: "Parse natural language into a WebWindows file search query.", parameters: aiSchema } }],
      tool_choice: { type: "function", function: { name: "parseFileSearchQuery" } },
      temperature: 0,
      stream: false
    };
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      signal,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.error?.message || `AI query parser failed (${response.status}).`);
    const call = body?.choices?.[0]?.message?.tool_calls?.find(item => item?.function?.name === "parseFileSearchQuery");
    if (!call) throw new Error("AI query parser did not return a tool call.");
    return validateAI(JSON.parse(call.function.arguments || "{}"), localCriteria);
  }

  async function parseAsync(query, options) {
    const local = parse(query, options);
    if (!options?.allowAI || !local.ast.needsAI) return local;
    try {
      return await callAI(local.query, local, options.signal);
    } catch (error) {
      const fallbackAst = createAst(local.query);
      fallbackAst.parser = "fallback";
      fallbackAst.text = local.query;
      fallbackAst.source = [...(local.sources || ALL_SOURCES)];
      const fallback = criteriaFromAst(fallbackAst, local.query);
      fallback.parserWarnings = ["ai-query-parser-fallback"];
      return fallback;
    }
  }

  global.WebWindows = global.WebWindows || {};
  global.WebWindows.fileQuery = Object.freeze({
    version: VERSION,
    schema: aiSchema,
    mimeByExtension: MIME_BY_EXTENSION,
    groups: GROUPS,
    parse,
    parseAsync,
    criteriaFromAst
  });
})(window);
