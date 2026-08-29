let contractsPromise;

export async function loadStudioPlatformContracts() {
  if (!contractsPromise) contractsPromise = loadContracts();
  return contractsPromise;
}

async function loadContracts() {
  const resources = await Promise.all([
    fetchJson("/data/sdk/manifest-v1.schema.json"),
    fetchJson("/data/sdk/package-runtime-policy-v1.json"),
    fetchJson("/data/sdk/runtime-compatibility-v1.json"),
    fetchJson("/data/sdk/studio-validator-rules-v1.json"),
    fetchText("/data/sdk/webwindows-public-api-v1.d.ts")
  ]);
  return Object.freeze({
    manifestSchema: resources[0],
    packagePolicy: resources[1],
    runtimeCompatibility: resources[2],
    ruleCatalog: resources[3],
    publicApiText: resources[4]
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
