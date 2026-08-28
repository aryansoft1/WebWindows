import assert from "node:assert/strict";
import fs from "node:fs/promises";

const schema = JSON.parse(await fs.readFile(
  new URL("../data/sdk/manifest-v1.schema.json", import.meta.url), "utf8"
));
const compatibility = JSON.parse(await fs.readFile(
  new URL("../data/sdk/runtime-compatibility-v1.json", import.meta.url), "utf8"
));
const sample = JSON.parse(await fs.readFile(
  new URL("../developer-samples/hello-webwindows/manifest.json", import.meta.url), "utf8"
));
const manifestDocument = await fs.readFile(
  new URL("../docs/WEBWINDOWS_MANIFEST_V1.md", import.meta.url), "utf8"
);
const singleSourceDocument = await fs.readFile(
  new URL("../docs/WEBWINDOWS_DEVELOPER_PLATFORM_SINGLE_SOURCE.md", import.meta.url), "utf8"
);

function resolveReference(reference) {
  assert.match(reference, /^#\/\$defs\//);
  return schema.$defs[reference.slice("#/$defs/".length)];
}

function validate(value, definition, path = "$") {
  const errors = [];
  if (definition.$ref) errors.push(...validate(value, resolveReference(definition.$ref), path));
  for (const child of definition.allOf || []) errors.push(...validate(value, child, path));
  if (definition.const !== undefined && value !== definition.const) {
    errors.push(`${path} must equal ${JSON.stringify(definition.const)}`);
  }
  if (definition.enum && !definition.enum.includes(value)) {
    errors.push(`${path} is outside enum`);
  }
  if (definition.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [...errors, `${path} must be object`];
    for (const required of definition.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, required)) errors.push(`${path}.${required} is required`);
    }
    for (const [key, child] of Object.entries(definition.properties || {})) {
      if (Object.prototype.hasOwnProperty.call(value, key)) errors.push(...validate(value[key], child, `${path}.${key}`));
    }
  }
  if (definition.type === "array") {
    if (!Array.isArray(value)) return [...errors, `${path} must be array`];
    value.forEach((item, index) => errors.push(...validate(item, definition.items || {}, `${path}[${index}]`)));
    if (definition.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
      errors.push(`${path} must contain unique items`);
    }
  }
  if (definition.type === "string") {
    if (typeof value !== "string") return [...errors, `${path} must be string`];
    if (definition.minLength != null && value.length < definition.minLength) errors.push(`${path} is too short`);
    if (definition.maxLength != null && value.length > definition.maxLength) errors.push(`${path} is too long`);
    if (definition.pattern && !(new RegExp(definition.pattern)).test(value)) errors.push(`${path} does not match pattern`);
  }
  if (definition.type === "boolean" && typeof value !== "boolean") errors.push(`${path} must be boolean`);
  if (definition.type === "number" && typeof value !== "number") errors.push(`${path} must be number`);
  if (definition.type === "integer" && !Number.isInteger(value)) errors.push(`${path} must be integer`);
  if (definition.minimum != null && value < definition.minimum) errors.push(`${path} is below minimum`);
  return errors;
}

assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
assert.equal(schema.$ref, "#/$defs/sourceManifest");
assert.deepEqual(validate(sample, schema.$defs.sourceManifest), []);
assert.equal(schema.$defs.sourceManifest.additionalProperties, true);
assert.deepEqual(schema.$defs.sourceManifest.required, [
  "id", "type", "name", "version", "icon", "entry", "install", "placement", "window"
]);
for (const generated of ["catalog", "package", "runtime"]) {
  assert.equal(schema.$defs[generated].readOnly, true, `${generated} must remain server-managed`);
  assert.equal(schema.$defs.sourceManifest.required.includes(generated), false);
}

const published = structuredClone(sample);
published.catalog = { status: "published" };
published.package = {
  format: "zip",
  size: 1024,
  sha256: "a".repeat(64),
  entry: sample.entry,
  downloadUrl: "/api/function-package.asp?appId=com.example.hello&version=1.0.0"
};
published.runtime = { model: "browser-zip-sandbox-v1", network: "none", sameOrigin: false };
published.entry = "/package-runtime.html?runtime=1&appId=com.example.hello&version=1.0.0&entry=index.html";
published.window.mode = "iframe";
assert.deepEqual(validate(published, schema.$defs.publishedCatalogManifest), []);
assert.ok(validate(published, schema.$defs.sourceManifest).some((error) => error.includes("entry")));

for (const unsafe of ["/index.html", "C:/index.html", "../index.html", "a/../index.html", "a//index.html"]){
  assert.ok(validate({ ...sample, entry: unsafe }, schema.$defs.sourceManifest).length, unsafe);
}
assert.match(manifestDocument, /Implementation drift/);
assert.match(manifestDocument, /ZIP 内 Manifest 未验证/);
assert.match(manifestDocument, /Published Catalog Manifest/);
assert.match(singleSourceDocument, /Studio validator/);
assert.match(singleSourceDocument, /Server-side submission validator/);
assert.match(singleSourceDocument, /SDK language service/);

assert.equal(compatibility.schemaVersion, 1);
assert.equal(compatibility.publicApiVersion, 1);
assert.deepEqual(compatibility.publicNamespaces, [
  "window.WebWindows.device",
  "window.WebWindows.fileDialog"
]);
assert.equal(compatibility.packageRuntime.model, "browser-zip-sandbox-v1");
assert.equal(compatibility.packageRuntime.execution.sameOrigin, false);
assert.equal(compatibility.packageRuntime.execution.network, "none");
assert.equal(compatibility.packageRuntime.execution.modules, "unsupported");
const runtimes = Object.fromEntries(compatibility.hostRuntimes.map((runtime) => [runtime.id, runtime]));
assert.equal(runtimes.browser.status, "supported");
assert.equal(runtimes.browser.capabilities["storage.write"].status, "unsupported");
assert.equal(runtimes["dreama-android"].status, "supported");
assert.equal(runtimes["dreama-android"].capabilities.updater.status, "unspecified");
assert.equal(runtimes["dreama-windows"].status, "unspecified");
assert.equal(runtimes["linux-native"].status, "unsupported");

console.log("developer platform contract smoke test passed");
