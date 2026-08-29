import fs from "node:fs/promises";

export async function loadStudioContracts() {
  const json = async (path) => JSON.parse(await fs.readFile(new URL(`../../${path}`, import.meta.url), "utf8"));
  const manifestV1 = await json("data/sdk/manifest-v1.schema.json");
  const manifestV2 = await json("data/sdk/manifest-v2.schema.json");
  return {
    manifestSchema: manifestV1,
    manifestSchemas: { 1: manifestV1, 2: manifestV2 },
    permissionRegistry: await json("data/sdk/permissions-v1.json"),
    brokerMethods: await json("data/sdk/capability-broker-methods-v1.json"),
    packagePolicy: await json("data/sdk/package-runtime-policy-v1.json"),
    runtimeCompatibility: await json("data/sdk/runtime-compatibility-v1.json"),
    ruleCatalog: await json("data/sdk/studio-validator-rules-v1.json"),
    publicApiText: await fs.readFile(new URL("../../data/sdk/webwindows-public-api-v1.d.ts", import.meta.url), "utf8")
  };
}
