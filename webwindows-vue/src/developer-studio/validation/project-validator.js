import validateManifestV1 from "../manifest/generated-manifest-validator.js";
import validateManifestV2 from "../manifest/generated-manifest-v2-validator.js";
import { selectManifestVersion } from "../manifest/manifest-version.js";
import { normalizeProjectPath } from "../project/path-policy.js";
import { getSnapshotFile } from "../snapshot/project-snapshot.js";
import { loadStudioPlatformContracts } from "./platform-contracts.js";

export const VALIDATION_REPORT_CONTRACT = "webwindows-studio-validation-report-v1";

export async function validateProjectSnapshot(snapshot, options = {}) {
  const contracts = options.contracts || await loadStudioPlatformContracts();
  const rules = createRuleIndex(contracts.ruleCatalog);
  const diagnostics = [];
  const add = (ruleId, details = {}) => diagnostics.push(createDiagnostic(rules, ruleId, details));
  validateCompatibility(contracts, add);
  validatePackage(snapshot, contracts.packagePolicy, add);

  const manifestFile = snapshot.files.find((file) => file.path === "manifest.json");
  let manifest = null;
  if (!manifestFile) {
    add("WWP001", { path: "manifest.json", message: "ZIP root 必须包含 manifest.json。" });
  } else {
    try {
      manifest = JSON.parse(manifestFile.content);
    } catch (error) {
      add("WWM001", {
        path: "manifest.json",
        location: jsonErrorLocation(manifestFile.content, error.message),
        message: error.message
      });
    }
  }

  if (manifest) {
    validateManifest(manifest, contracts, add);
    validateEntry(snapshot, manifest, contracts.packagePolicy, add);
  }
  scanSources(snapshot, manifest, contracts, add);
  const uniqueDiagnostics = [...new Map(diagnostics.map((item) => [diagnosticKey(item), item])).values()]
    .sort(compareDiagnostics);
  const errorCount = uniqueDiagnostics.filter((item) => item.severity === "error").length;
  const warningCount = uniqueDiagnostics.filter((item) => item.severity === "warning").length;
  const entry = typeof manifest?.entry === "string" ? manifest.entry : null;
  return {
    contract: VALIDATION_REPORT_CONTRACT,
    schemaVersion: 1,
    validatorVersion: contracts.ruleCatalog.validatorVersion,
    snapshotId: snapshot.snapshotId,
    projectUuid: snapshot.projectUuid,
    manifestIdentity: validIdentity(manifest),
    passed: errorCount === 0,
    errorCount,
    warningCount,
    diagnostics: uniqueDiagnostics,
    packageFacts: {
      fileCount: snapshot.fileCount,
      unpackedBytes: snapshot.totalBytes,
      entry,
      runtimeModel: contracts.packagePolicy.runtimeModel
    },
    scannerLimitations: [
      "Source diagnostics are conservative static checks, not a complete JavaScript security analysis.",
      "Dynamic URLs and computed property access may require future server/admin review."
    ]
  };
}

function validateCompatibility(contracts, add) {
  const runtime = contracts.runtimeCompatibility.packageRuntime;
  if (runtime?.status !== "supported" || runtime?.model !== contracts.packagePolicy.runtimeModel) {
    add("WWC001", { message: "Runtime compatibility baseline 与 Package Runtime Policy 不一致。" });
  }
}

function validatePackage(snapshot, policy, add) {
  if (!snapshot.files.length || snapshot.fileCount !== snapshot.files.length || snapshot.fileCount > policy.limits.maxFiles) {
    add("WWP003", {
      message: `文件数量必须为 1-${policy.limits.maxFiles}，当前为 ${snapshot.fileCount}。`,
      metadata: { limit: policy.limits.maxFiles, actual: snapshot.fileCount }
    });
  }
  if (snapshot.totalBytes > policy.limits.maxUnpackedBytes) {
    add("WWP004", {
      message: `项目解压后不能超过 ${policy.limits.maxUnpackedBytes} bytes。`,
      metadata: { limit: policy.limits.maxUnpackedBytes, actual: snapshot.totalBytes }
    });
  }
  const allowed = new Set(policy.allowedExtensions);
  for (const file of snapshot.files) {
    try {
      const normalized = normalizeProjectPath(file.path);
      if (normalized !== file.path || normalized.length > policy.limits.maxPathCharacters) {
        throw new Error("not canonical");
      }
    } catch {
      add("WWP002", { path: file.path, message: "文件路径不符合冻结的 normalized path policy。" });
      continue;
    }
    const ext = extension(file.path);
    if (!allowed.has(ext)) {
      add("WWP005", {
        path: file.path,
        message: `Package Runtime 不允许文件类型 ${ext || "(none)"}。`,
        metadata: { extension: ext }
      });
    }
  }
}

function validateManifest(manifest, contracts, add) {
  const manifestVersion = selectManifestVersion(manifest);
  if (manifestVersion == null) {
    add("WWM005", {
      path: "manifest.json$.manifestVersion",
      message: "不支持的 Manifest 版本；legacy v1 省略 manifestVersion，v2 显式使用数字 2。"
    });
    return;
  }
  const schema = contracts.manifestSchemas?.[manifestVersion] || contracts.manifestSchema;
  const validateSchema = manifestVersion === 2 ? validateManifestV2 : validateManifestV1;
  if (!validateSchema(manifest)) {
    for (const error of validateSchema.errors || []) {
      if (isSpecializedManifestError(manifestVersion, error)) continue;
      add("WWM002", {
        path: `manifest.json${pointerPath(error.instancePath, error.params?.missingProperty)}`,
        message: error.message || error.keyword,
        metadata: { keyword: error.keyword, schemaPath: error.schemaPath }
      });
    }
  }
  validatePermissionDeclaration(manifest, manifestVersion, contracts.permissionRegistry, add);
  if (manifestVersion === 2 && manifest.sdk?.apiVersion !== undefined && manifest.sdk.apiVersion !== "1") {
    add("WWM009", {
      path: "manifest.json$.sdk.apiVersion",
      message: "当前只支持 WebWindows Public SDK API version 1。",
      metadata: { actual: manifest.sdk.apiVersion }
    });
  }
  const properties = schema.$defs?.sourceManifest?.properties || {};
  for (const [name, definition] of Object.entries(properties)) {
    if (!Object.prototype.hasOwnProperty.call(manifest, name)) continue;
    const resolved = resolveSchemaDefinition(schema, definition);
    const description = `${definition.description || ""} ${resolved.description || ""}`;
    if (resolved.readOnly === true || /server-(?:managed|generated)|published catalog/i.test(description)) {
      add("WWM003", {
        path: `manifest.json$.${name}`,
        message: `${name} 是发布端生成的只读字段，不能进入 Source Manifest。`
      });
    } else if (/platform-reserved/i.test(description)) {
      add("WWM004", {
        path: `manifest.json$.${name}`,
        message: `${name} 是平台保留字段。`
      });
    }
  }
  const reservedValues = [
    [manifest.type === "system", "$.type", "system 类型属于第一方平台能力。"],
    [manifest.install?.source && manifest.install.source !== "repository", "$.install.source", "第三方 Source Manifest 应使用 repository source。"],
    [manifest.window?.mode && manifest.window.mode !== "iframe", "$.window.mode", "第三方功能当前仅兼容 iframe window mode。"]
  ];
  for (const [matched, path, message] of reservedValues) {
    if (matched) add("WWM004", { path: `manifest.json${path}`, message });
  }
}

function validatePermissionDeclaration(manifest, manifestVersion, registry, add) {
  if (manifestVersion === 1) {
    if (Object.prototype.hasOwnProperty.call(manifest, "permissions")) {
      add("WWM008", {
        path: "manifest.json$.permissions",
        message: "Manifest v1 不承载权限声明；该字段不会授予能力，请显式迁移到 v2。"
      });
    }
    return;
  }
  if (!Array.isArray(manifest.permissions)) return;
  const registered = new Set((registry?.permissions || []).map((permission) => permission.id));
  const declarable = new Set(registry?.sourceDeclaration?.declarablePermissionIds || []);
  const seen = new Set();
  manifest.permissions.forEach((permission, index) => {
    if (typeof permission !== "string") return;
    const path = `manifest.json$.permissions[${index}]`;
    if (seen.has(permission)) {
      add("WWM007", { path, message: `重复权限：${permission}`, metadata: { permission } });
    }
    seen.add(permission);
    if (isForbiddenPermission(permission)) {
      add("WWM008", { path, message: `禁止声明超级或私有权限：${permission}`, metadata: { permission } });
    } else if (!registered.has(permission)) {
      add("WWM006", { path, message: `未知权限：${permission}`, metadata: { permission } });
    } else if (!declarable.has(permission)) {
      add("WWM008", { path, message: `权限尚未开放 Source Manifest 声明：${permission}`, metadata: { permission } });
    }
  });
}

function isForbiddenPermission(permission) {
  return permission === "native" || permission === "system" || permission === "device.*"
    || permission.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(permission);
}

function isSpecializedManifestError(manifestVersion, error) {
  if (manifestVersion !== 2) return false;
  return (error.instancePath === "/sdk/apiVersion" && error.keyword === "const")
    || (error.instancePath === "/permissions" && error.keyword === "uniqueItems")
    || (error.instancePath.startsWith("/permissions/") && error.keyword === "enum");
}

function validateEntry(snapshot, manifest, policy, add) {
  if (typeof manifest.entry !== "string") return;
  let entry;
  try {
    entry = normalizeProjectPath(manifest.entry);
  } catch {
    add("WWP006", { path: "manifest.json$.entry", message: "Manifest entry 不是安全相对路径。" });
    return;
  }
  if (!policy.entryExtensions.includes(extension(entry)) || !getSnapshotFile(snapshot, entry)) {
    add("WWP006", {
      path: "manifest.json$.entry",
      message: "Manifest 指定的 HTML 入口不存在或不是 .html/.htm。",
      metadata: { entry }
    });
  }
}

function scanSources(snapshot, manifest, contracts, add) {
  const allowedRoots = publicApiRoots(contracts.publicApiText);
  const paths = new Set(snapshot.files.map((file) => file.path));
  for (const file of snapshot.files) {
    const ext = extension(file.path);
    if (ext === ".js") scanJavaScript(file, allowedRoots, manifest, add);
    if (ext === ".html" || ext === ".htm") scanHtml(file, paths, add);
    if (ext === ".css") scanCss(file, add);
  }
  if (contracts.runtimeCompatibility.packageRuntime.execution.modules !== "unsupported"
      || contracts.runtimeCompatibility.packageRuntime.execution.network !== "none") {
    add("WWC001", { message: "Source scanner assumptions do not match Runtime compatibility baseline." });
  }
  void manifest;
}

function scanJavaScript(file, allowedRoots, manifest, add) {
  const code = maskStringsAndComments(file.content);
  matchAll(code, /(^|[;\n{}])\s*(?:import\s|export\s)/gm, (match, offset) => {
    add("WWS001", { path: file.path, location: locationAt(file.content, offset), message: "Package Runtime 仅支持 classic JavaScript。" });
  });
  matchAll(code, /\b(?:window\s*\.\s*)?WebWindowsNative\b|\bNativeAdapter\b/g, (_match, offset) => {
    add("WWS003", { path: file.path, location: locationAt(file.content, offset), message: "功能代码不能引用私有 Native API。" });
  });
  matchAll(code, /\bparent\s*\.\s*WebWindows\b/g, (_match, offset) => {
    add("WWS004", { path: file.path, location: locationAt(file.content, offset), message: "功能代码不能访问 parent.WebWindows。" });
  });
  matchAll(code, /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*([A-Za-z_$][\w$]*)/g, (match, offset) => {
    const root = match[1];
    if (!allowedRoots.has(root)) {
      add("WWS004", {
        path: file.path,
        location: locationAt(file.content, offset),
        message: `WebWindows.${root} 不属于 Public API v1。`,
        metadata: { namespace: root }
      });
    }
  });
  matchAll(code, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/g, (match, offset) => {
    add("WWS005", {
      path: file.path,
      location: locationAt(file.content, offset),
      message: `${match[0]} 可能依赖网络，但当前 Package Runtime 的 connect-src 为 none。`
    });
  });
  const batteryCall = /\b(?:window\s*\.\s*)?WebWindows\s*\.\s*device\s*\.\s*battery\s*\.\s*(?:getState|refresh)\s*\(/g.exec(code);
  if (batteryCall && (selectManifestVersion(manifest) !== 2
      || !manifest.permissions?.includes("device.battery-status.read"))) {
    add("WWM010", {
      path: file.path,
      location: locationAt(file.content, batteryCall.index),
      message: "Battery Broker API 需要 Manifest v2 声明 device.battery-status.read；静态提示不会自动授予权限。",
      metadata: { requiredPermission: "device.battery-status.read" }
    });
  }
}

function scanHtml(file, paths, add) {
  matchAll(file.content, /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/gi, (_match, offset) => {
    add("WWS001", { path: file.path, location: locationAt(file.content, offset), message: "Package Runtime 不支持 script type=module。" });
  });
  matchAll(file.content, /<(script|link)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi, (match, offset) => {
    const reference = match[2];
    const resolved = resolvePackageReference(file.path, reference);
    if (!resolved || !paths.has(resolved)) {
      add("WWS002", {
        path: file.path,
        location: locationAt(file.content, offset),
        message: `脚本或样式依赖必须包含在功能包内：${reference}`,
        metadata: { reference }
      });
    }
  });
  matchAll(file.content, /\b(?:src|href|poster)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi, (match, offset) => {
    add("WWS002", {
      path: file.path,
      location: locationAt(file.content, offset),
      message: `外部资源在无网络 Runtime 中不可用：${match[1]}`,
      metadata: { reference: match[1] }
    });
  });
}

function scanCss(file, add) {
  matchAll(file.content, /(?:url\(|@import\s+)["']?((?:https?:)?\/\/[^"')\s]+)/gi, (match, offset) => {
    add("WWS002", {
      path: file.path,
      location: locationAt(file.content, offset),
      message: `外部 CSS 资源在无网络 Runtime 中不可用：${match[1]}`,
      metadata: { reference: match[1] }
    });
  });
}

function createRuleIndex(catalog) {
  return new Map(catalog.rules.map((rule) => [rule.ruleId, rule]));
}

function createDiagnostic(rules, ruleId, details) {
  const rule = rules.get(ruleId);
  if (!rule) throw new Error(`Unknown validator rule: ${ruleId}`);
  return {
    ruleId,
    category: rule.category,
    severity: details.severity || rule.defaultSeverity,
    path: details.path || null,
    location: details.location || null,
    message: details.message || rule.title,
    ...(details.metadata ? { metadata: details.metadata } : {})
  };
}

function publicApiRoots(dts) {
  const block = /interface\s+WebWindowsNamespace\s*\{([\s\S]*?)\n\s*\}/.exec(dts)?.[1] || "";
  return new Set([...block.matchAll(/readonly\s+([A-Za-z_$][\w$]*)\s*:/g)].map((match) => match[1]));
}

function resolveSchemaDefinition(schema, definition) {
  if (!definition?.$ref?.startsWith("#/$defs/")) return definition || {};
  return schema.$defs?.[definition.$ref.slice("#/$defs/".length)] || definition;
}

function resolvePackageReference(basePath, reference) {
  const clean = String(reference || "").split(/[?#]/, 1)[0];
  if (!clean || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(clean)) return null;
  const stack = basePath.split("/").slice(0, -1);
  for (const part of clean.replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return stack.join("/");
}

function maskStringsAndComments(source) {
  return source.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    (value) => value.replace(/[^\n]/g, " "));
}

function matchAll(source, expression, callback) {
  for (const match of source.matchAll(expression)) callback(match, match.index || 0);
}

function locationAt(source, offset) {
  const lines = source.slice(0, offset).split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function jsonErrorLocation(source, message) {
  const match = /position\s+(\d+)/i.exec(message);
  return locationAt(source, match ? Number(match[1]) : 0);
}

function pointerPath(instancePath, missingProperty) {
  const pointer = instancePath || (missingProperty ? `/${missingProperty}` : "");
  return `$${pointer.split("/").slice(1).map((part) => /^\d+$/.test(part) ? `[${part}]` : `.${part.replace(/~1/g, "/").replace(/~0/g, "~")}`).join("")}`;
}

function validIdentity(manifest) {
  if (!manifest || typeof manifest.id !== "string" || typeof manifest.version !== "string") return null;
  return {
    id: manifest.id,
    version: manifest.version,
    name: typeof manifest.name === "string" ? manifest.name : null,
    manifestVersion: selectManifestVersion(manifest),
    sdkApiVersion: typeof manifest.sdk?.apiVersion === "string" ? manifest.sdk.apiVersion : null
  };
}

function extension(path) {
  return String(path).toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || "";
}

function compareDiagnostics(left, right) {
  return left.ruleId.localeCompare(right.ruleId)
    || String(left.path || "").localeCompare(String(right.path || ""))
    || (left.location?.line || 0) - (right.location?.line || 0)
    || left.message.localeCompare(right.message);
}

function diagnosticKey(diagnostic) {
  return [
    diagnostic.ruleId,
    diagnostic.severity,
    diagnostic.path || "",
    diagnostic.location?.line || 0,
    diagnostic.location?.column || 0,
    diagnostic.message
  ].join("\0");
}
