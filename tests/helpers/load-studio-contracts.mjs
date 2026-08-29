import fs from "node:fs/promises";

export async function loadStudioContracts() {
  const json = async (path) => JSON.parse(await fs.readFile(new URL(`../../${path}`, import.meta.url), "utf8"));
  return {
    manifestSchema: await json("data/sdk/manifest-v1.schema.json"),
    packagePolicy: await json("data/sdk/package-runtime-policy-v1.json"),
    runtimeCompatibility: await json("data/sdk/runtime-compatibility-v1.json"),
    ruleCatalog: await json("data/sdk/studio-validator-rules-v1.json"),
    publicApiText: await fs.readFile(new URL("../../data/sdk/webwindows-public-api-v1.d.ts", import.meta.url), "utf8")
  };
}
