import validateV1 from "./generated-manifest-validator.js";
import validateV2 from "./generated-manifest-v2-validator.js";
import { selectManifestVersion } from "./manifest-version.js";

let validatorPromise;

export async function loadManifestValidator() {
  if (!validatorPromise) validatorPromise = createValidator();
  return validatorPromise;
}

async function createValidator() {
  const responses = await Promise.all([
    fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/manifest-v2.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/permissions-v1.json", { credentials: "same-origin" })
  ]);
  if (responses.some((response) => !response.ok)) throw new Error("无法载入 Manifest 平台契约。");
  const [v1, v2, permissionRegistry] = await Promise.all(responses.map((response) => response.json()));
  return {
    schemas: { 1: v1, 2: v2 },
    validators: { 1: validateV1, 2: validateV2 },
    permissionRegistry,
    permissionIds: new Set(permissionRegistry.permissions.map((permission) => permission.id)),
    sourceDeclarableIds: new Set(permissionRegistry.sourceDeclaration?.declarablePermissionIds || [])
  };
}

export async function validateManifestText(text) {
  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch (error) {
    return {
      manifest: null,
      diagnostics: [{
        severity: "error",
        path: "$",
        message: error.message,
        ...jsonErrorLocation(text, error.message)
      }]
    };
  }

  const version = selectManifestVersion(manifest);
  if (version == null) {
    return {
      manifest,
      manifestVersion: null,
      diagnostics: [{
        ruleId: "WWM005",
        severity: "error",
        path: "$.manifestVersion",
        message: "不支持的 Manifest 版本；v1 必须省略 manifestVersion，v2 必须显式使用数字 2。"
      }]
    };
  }
  const contracts = await loadManifestValidator();
  const schema = contracts.schemas[version];
  const validate = contracts.validators[version];
  validate(manifest);
  const diagnostics = (validate.errors || []).filter((error) => !isSpecializedV2Error(version, error)).map((error) => ({
    ruleId: "WWM002",
    severity: "error",
    path: pointerToJsonPath(error.instancePath || error.params?.missingProperty || ""),
    message: error.message || error.keyword
  }));
  validatePermissionDeclaration(manifest, version, contracts.permissionIds, contracts.sourceDeclarableIds, diagnostics);
  if (version === 2 && manifest.sdk?.apiVersion !== undefined && manifest.sdk.apiVersion !== "1") {
    diagnostics.push({
      ruleId: "WWM009",
      severity: "error",
      path: "$.sdk.apiVersion",
      message: "当前只支持 WebWindows Public SDK API version 1。"
    });
  }
  const sourceProperties = schema.$defs?.sourceManifest?.properties || {};
  const reservedProperties = Object.entries(sourceProperties)
    .filter(([, definition]) => definition.readOnly === true
      || definition.description?.includes("Reserved")
      || definition.description?.includes("Platform-reserved"))
    .map(([name]) => name);
  reservedProperties.forEach((property) => {
    if (Object.prototype.hasOwnProperty.call(manifest, property)) {
      diagnostics.push({
        ruleId: property === "launch" ? "WWM004" : "WWM003",
        severity: "warning",
        path: `$.${property}`,
        message: `${property} 是平台保留或发布阶段只读字段，不应由 Source Manifest 编辑。`
      });
    }
  });
  return { manifest, manifestVersion: version, diagnostics };
}

function validatePermissionDeclaration(manifest, version, permissionIds, sourceDeclarableIds, diagnostics) {
  if (version === 1) {
    if (Object.prototype.hasOwnProperty.call(manifest, "permissions")) {
      diagnostics.push({
        ruleId: "WWM008",
        severity: "error",
        path: "$.permissions",
        message: "Manifest v1 不承载权限声明；请显式迁移到 Manifest v2。"
      });
    }
    return;
  }
  if (!Array.isArray(manifest.permissions)) return;
  const seen = new Set();
  manifest.permissions.forEach((permission, index) => {
    if (typeof permission !== "string") return;
    const path = `$.permissions[${index}]`;
    if (seen.has(permission)) {
      diagnostics.push({ ruleId: "WWM007", severity: "error", path, message: `重复权限：${permission}` });
    }
    seen.add(permission);
    if (isForbiddenPermission(permission)) {
      diagnostics.push({ ruleId: "WWM008", severity: "error", path, message: `禁止声明超级或私有权限：${permission}` });
    } else if (!permissionIds.has(permission)) {
      diagnostics.push({ ruleId: "WWM006", severity: "error", path, message: `未知权限：${permission}` });
    } else if (!sourceDeclarableIds.has(permission)) {
      diagnostics.push({ ruleId: "WWM008", severity: "error", path, message: `权限尚未开放 Source Manifest 声明：${permission}` });
    }
  });
}

function isForbiddenPermission(permission) {
  return permission === "native" || permission === "system" || permission === "device.*"
    || permission.includes("*") || /(?:^|[.-])(?:private|internal)(?:[.-]|$)/i.test(permission);
}

function isSpecializedV2Error(version, error) {
  if (version !== 2) return false;
  return (error.instancePath === "/sdk/apiVersion" && error.keyword === "const")
    || (error.instancePath === "/permissions" && error.keyword === "uniqueItems")
    || (error.instancePath.startsWith("/permissions/") && error.keyword === "enum");
}

function pointerToJsonPath(pointer) {
  if (!pointer) return "$";
  if (!pointer.startsWith("/")) return `$.${pointer}`;
  return `$${pointer.split("/").slice(1).map((part) => {
    const decoded = part.replace(/~1/g, "/").replace(/~0/g, "~");
    return /^\d+$/.test(decoded) ? `[${decoded}]` : `.${decoded}`;
  }).join("")}`;
}

function jsonErrorLocation(text, message) {
  const match = /position\s+(\d+)/i.exec(message);
  if (!match) return { line: 1, column: 1 };
  const offset = Math.min(Number(match[1]), text.length);
  const before = text.slice(0, offset).split("\n");
  return { line: before.length, column: before.at(-1).length + 1 };
}
