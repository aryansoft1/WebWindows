import * as monaco from "monaco-editor/editor/editor.api.js";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import CssWorker from "monaco-editor/language/css/css.worker.js?worker";
import HtmlWorker from "monaco-editor/language/html/html.worker.js?worker";
import JsonWorker from "monaco-editor/language/json/json.worker.js?worker";
import TypeScriptWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import "monaco-editor/language/css/monaco.contribution.js";
import "monaco-editor/language/html/monaco.contribution.js";
import { jsonDefaults } from "monaco-editor/language/json/monaco.contribution.js";
import {
  javascriptDefaults,
  ScriptTarget
} from "monaco-editor/language/typescript/monaco.contribution.js";
import { selectManifestVersion } from "../manifest/manifest-version.js";

const SDK_URI = "inmemory://webwindows-sdk/webwindows-public-api-v1.d.ts";
let configuredPromise;
let manifestContracts;

self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    if (label === "json") return new JsonWorker();
    if (label === "css" || label === "scss" || label === "less") return new CssWorker();
    if (label === "html" || label === "handlebars" || label === "razor") return new HtmlWorker();
    if (label === "typescript" || label === "javascript") return new TypeScriptWorker();
    return new EditorWorker();
  }
};

export async function configureStudioMonaco() {
  if (!configuredPromise) configuredPromise = configure();
  return configuredPromise;
}

async function configure() {
  const [sdkResponse, v1Response, v2Response, permissionsResponse] = await Promise.all([
    fetch("/data/sdk/webwindows-public-api-v1.d.ts", { credentials: "same-origin" }),
    fetch("/data/sdk/manifest-v1.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/manifest-v2.schema.json", { credentials: "same-origin" }),
    fetch("/data/sdk/permissions-v1.json", { credentials: "same-origin" })
  ]);
  if (!sdkResponse.ok) throw new Error("无法载入 WebWindows Public API 类型定义。");
  if (!v1Response.ok || !v2Response.ok || !permissionsResponse.ok) throw new Error("无法载入 Manifest 平台契约。");
  const [sdkText, manifestV1, manifestV2, permissionRegistry] = await Promise.all([
    sdkResponse.text(), v1Response.json(), v2Response.json(), permissionsResponse.json()
  ]);
  manifestContracts = { schemas: { 1: manifestV1, 2: manifestV2 }, permissionRegistry };

  monaco.editor.defineTheme("webwindows-studio-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "708090", fontStyle: "italic" },
      { token: "keyword", foreground: "7C3AED" },
      { token: "string", foreground: "087F5B" },
      { token: "number", foreground: "B45309" },
      { token: "tag", foreground: "0759B5" },
      { token: "attribute.name", foreground: "9A4D00" },
      { token: "attribute.value", foreground: "087F5B" }
    ],
    colors: {
      "editor.background": "#FCFDFE",
      "editor.foreground": "#1F2937",
      "editor.lineHighlightBackground": "#F2F6FC",
      "editorLineNumber.foreground": "#9AA7B8",
      "editorLineNumber.activeForeground": "#315A8A",
      "editor.selectionBackground": "#BBD7FF80",
      "editor.inactiveSelectionBackground": "#DCE9FA80",
      "editorIndentGuide.background1": "#E5EAF1",
      "editorIndentGuide.activeBackground1": "#B8C5D6",
      "editorBracketHighlight.foreground1": "#1769E0",
      "editorBracketHighlight.foreground2": "#7C3AED",
      "editorBracketHighlight.foreground3": "#B45309"
    }
  });

  javascriptDefaults.setEagerModelSync(true);
  javascriptDefaults.setCompilerOptions({
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: true,
    noEmit: true,
    target: ScriptTarget.ES2022,
    lib: ["es2022", "dom"]
  });
  javascriptDefaults.addExtraLib(sdkText, SDK_URI);

  configureManifestSchemaForText("{}");
  return { monaco, manifestSchemas: manifestContracts.schemas };
}

export function configureManifestSchemaForText(text) {
  if (!manifestContracts) return null;
  const version = explicitManifestVersion(text);
  const schema = manifestContracts.schemas[version];
  const schemas = [{
    uri: manifestContracts.permissionRegistry.$id,
    fileMatch: [],
    schema: manifestContracts.permissionRegistry
  }];
  if (schema) {
    schemas.push({
      uri: schema.$id,
      fileMatch: ["**/manifest.json"],
      schema
    });
  }
  jsonDefaults.setDiagnosticsOptions({ validate: true, allowComments: false, schemas });
  return version;
}

function explicitManifestVersion(text) {
  try {
    return selectManifestVersion(JSON.parse(text));
  } catch {
    return null;
  }
}

export { monaco };
