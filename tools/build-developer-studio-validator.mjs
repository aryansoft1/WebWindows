import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = resolve(root, "data/sdk/manifest-v1.schema.json");
const outputPath = resolve(root, "webwindows-vue/src/developer-studio/manifest/generated-manifest-validator.js");
const schema = JSON.parse(await readFile(schemaPath, "utf8"));
const ajv = new Ajv2020({ allErrors: true, code: { source: true, esm: true }, strict: false });
const validate = ajv.compile(schema);
const standalone = standaloneCode(ajv, validate)
  .replace('require("ajv/dist/runtime/ucs2length").default', "ucs2length");
const unicodeLength = `function ucs2length(value) {
  let length = 0;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) index += 1;
    }
    length += 1;
  }
  return length;
}`;
const source = `// Generated from data/sdk/manifest-v1.schema.json. Do not edit.\n${unicodeLength}\n${standalone}\n`;
await writeFile(outputPath, source, "utf8");
console.log(`Generated ${outputPath}`);
