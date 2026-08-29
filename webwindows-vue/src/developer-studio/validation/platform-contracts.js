let contractsPromise;

export async function loadStudioPlatformContracts() {
  if (!contractsPromise) contractsPromise = loadContracts();
  return contractsPromise;
}

async function loadContracts() {
  const resources = await Promise.all([
    fetchJson("/data/sdk/manifest-v1.schema.json"),
    fetchJson("/data/sdk/manifest-v2.schema.json"),
    fetchJson("/data/sdk/permissions-v1.json"),
    fetchJson("/data/sdk/capability-broker-methods-v1.json"),
    fetchJson("/data/sdk/package-runtime-policy-v1.json"),
    fetchJson("/data/sdk/runtime-compatibility-v1.json"),
    fetchJson("/data/sdk/studio-validator-rules-v1.json"),
    fetchText("/data/sdk/webwindows-public-api-v1.d.ts")
  ]);
  return Object.freeze({
    manifestSchema: resources[0],
    manifestSchemas: Object.freeze({ 1: resources[0], 2: resources[1] }),
    permissionRegistry: resources[2],
    brokerMethods: resources[3],
    packagePolicy: resources[4],
    runtimeCompatibility: resources[5],
    ruleCatalog: resources[6],
    publicApiText: resources[7]
  });
}

async function fetchJson(url) {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) throw new Error(`无法载入平台契约：${url}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) throw new Error(`无法载入平台契约：${url}`);
  return response.text();
}
