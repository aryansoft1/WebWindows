import validate from "./generated-manifest-validator.js";

let validatorPromise;

export async function loadManifestValidator() {
  if (!validatorPromise) validatorPromise = createValidator();
  return validatorPromise;
}

async function createValidator() {
  const response = await fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" });
  if (!response.ok) throw new Error("无法载入 Manifest v1 Schema。");
  const schema = await response.json();
  const sourceProperties = schema.$defs?.sourceManifest?.properties || {};
  const reservedProperties = Object.entries(sourceProperties)
    .filter(([, definition]) => definition.readOnly === true
      || definition.description?.includes("Reserved")
      || definition.description?.includes("Platform-reserved"))
    .map(([name]) => name);
  return { schema, validate, reservedProperties };
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

  const { validate, reservedProperties } = await loadManifestValidator();
  validate(manifest);
  const diagnostics = (validate.errors || []).map((error) => ({
    severity: "error",
    path: pointerToJsonPath(error.instancePath || error.params?.missingProperty || ""),
    message: error.message || error.keyword
  }));
  reservedProperties.forEach((property) => {
    if (Object.prototype.hasOwnProperty.call(manifest, property)) {
      diagnostics.push({
        severity: "warning",
        path: `$.${property}`,
        message: `${property} 是平台保留或发布阶段只读字段，不应由 Source Manifest 编辑。`
      });
    }
  });
  return { manifest, diagnostics };
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
