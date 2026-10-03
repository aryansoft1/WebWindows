import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
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
const scalarEqual = `function equal(left, right) {
  return left === right;
}`;
const permissionRegistry = JSON.parse(await readFile(resolve(root, "data/sdk/permissions-v1.json"), "utf8"));
const targets = [
  {
    schema: "data/sdk/manifest-v1.schema.json",
    output: "webwindows-vue/src/developer-studio/manifest/generated-manifest-validator.js"
  },
  {
    schema: "data/sdk/manifest-v2.schema.json",
    output: "webwindows-vue/src/developer-studio/manifest/generated-manifest-v2-validator.js"
  }
];

for (const target of targets) {
  const schemaPath = resolve(root, target.schema);
  const outputPath = resolve(root, target.output);
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, code: { source: true, esm: true }, strict: false });
  ajv.addSchema(permissionRegistry);
  const validate = ajv.compile(schema);
  const rawStandalone = standaloneCode(ajv, validate);
  const usesScalarEqual = rawStandalone.includes('require("ajv/dist/runtime/equal").default');
  const standalone = rawStandalone
    .replaceAll('require("ajv/dist/runtime/ucs2length").default', "ucs2length")
    .replaceAll('require("ajv/dist/runtime/equal").default', "equal");
  const source = `// Generated from ${target.schema}. Do not edit.\n${unicodeLength}\n${usesScalarEqual ? `${scalarEqual}\n` : ""}${standalone}\n`;
  await writeFile(outputPath, source, "utf8");
  console.log(`Generated ${outputPath}`);
}

const brokerSchema = JSON.parse(await readFile(resolve(root, "data/sdk/capability-broker-v1.schema.json"), "utf8"));
const brokerMethods = JSON.parse(await readFile(resolve(root, "data/sdk/capability-broker-methods-v1.json"), "utf8"));
const refreshMethod = brokerMethods.methods.find((method) => method.id === "device.battery.refresh");
const stateMethod = brokerMethods.methods.find((method) => method.id === "device.battery.getState");
if (!refreshMethod || !stateMethod) throw new Error("Battery Pilot method contracts are missing.");
const brokerAjv = new Ajv2020({ allErrors: true, code: { source: true, esm: true }, strict: false });
const refreshParamsSchema = { $id: "https://www.y0.hk/data/sdk/generated/battery-refresh-params-v1", ...refreshMethod.parameterSchema };
const batteryResultSchema = { $id: "https://www.y0.hk/data/sdk/generated/battery-result-v1", $defs: brokerMethods.$defs, ...stateMethod.resultSchema };
brokerAjv.addSchema(brokerSchema);
brokerAjv.addSchema(refreshParamsSchema);
brokerAjv.addSchema(batteryResultSchema);
const brokerStandaloneRaw = standaloneCode(brokerAjv, {
  validateEnvelope: brokerSchema.$id,
  validateRefreshParams: refreshParamsSchema.$id,
  validateBatteryResult: batteryResultSchema.$id
});
const brokerStandalone = brokerStandaloneRaw
  .replaceAll('require("ajv/dist/runtime/ucs2length").default', "ucs2length")
  .replaceAll('require("ajv/dist/runtime/equal").default', "equal");
const brokerOutput = resolve(root, "webwindows-vue/src/developer-studio/broker/generated-broker-validator.js");
const brokerSource = `// Generated from Capability Broker v1 contracts. Do not edit.\n${unicodeLength}\n${scalarEqual}\n${brokerStandalone}\n`;
await writeFile(brokerOutput, brokerSource, "utf8");
console.log(`Generated ${brokerOutput}`);
