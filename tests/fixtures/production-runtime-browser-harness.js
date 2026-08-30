(function () {
  "use strict";
  const scenario = new URLSearchParams(location.search).get("scenario") || "valid";
  const releaseId = `rel_${"1".repeat(32)}`;
  const expectedAppId = "com.example.browser";
  const manifest = {
    manifestVersion: 2, sdk: { apiVersion: "1" }, permissions: ["device.battery-status.read"],
    id: scenario === "wrong-manifest" ? "com.example.wrong" : expectedAppId,
    type: "application", name: "Browser fixture", version: "1.0.0", icon: "icon.svg", entry: "index.html",
    install: { defaultState: "available", source: "repository", uninstallable: true },
    placement: { desktop: false, startMenu: true, allFunctions: true, taskbar: false },
    window: { mode: "iframe", singleton: true, width: "800px", height: "600px" }
  };
  globalThis.WebWindows = Object.freeze({
    device: Object.freeze({
      ready: async () => globalThis.WebWindows.device,
      battery: Object.freeze({
        isSupported: () => true,
        getCapabilities: () => ({ status: { supported: true, source: "browser-fixture" } })
      })
    })
  });
  function canonicalize(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  }
  async function digest(bytes) {
    return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (value) => value.toString(16).padStart(2, "0")).join("");
  }
  globalThis.__runtimeBrowserFixture = (async () => {
    const zip = new JSZip();
    if (scenario !== "legacy") zip.file("manifest.json", JSON.stringify(manifest));
    zip.file("index.html", "<!doctype html><script>parent.postMessage({type:'runtime-fixture-executed',webWindows:typeof window.WebWindows,context:typeof window.ProductionBrokerContext,verified:typeof window.VerifiedRuntimePackageIdentity}, '*')<\/script><p>fixture</p>");
    zip.file("icon.svg", "<svg xmlns='http://www.w3.org/2000/svg'/>");
    let bytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", platform: "UNIX" });
    const packageSha256 = await digest(bytes);
    if (scenario === "tampered") { bytes = Uint8Array.from(bytes); bytes[bytes.length - 1] ^= 1; }
    return {
      bytes,
      identity: {
        publishedReleaseId: releaseId, appId: expectedAppId, publisherId: "42", version: "1.0.0",
        packageSha256, sourceManifestSha256: await digest(new TextEncoder().encode(canonicalize(manifest))),
        manifestVersion: 2, sdkVersion: "1", reviewDecisionId: "rvd_browser", approvedPermissions: ["device.battery-status.read"],
        reviewPolicyVersion: 1, releaseStatus: scenario === "delisted" ? "delisted" : "active", catalogRevisionId: 10,
        packageDownloadIdentity: { publishedReleaseId: releaseId, downloadUrl: `/api/function-package.asp?release=${releaseId}` }
      }
    };
  })();
  const realFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.startsWith("/api/runtime-release.asp")) {
      if (scenario === "revoked") return new Response(JSON.stringify({ ok: false, code: "release-not-active", message: "release denied" }), { status: 409, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ ok: true, identity: (await globalThis.__runtimeBrowserFixture).identity }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url.startsWith("/api/function-package.asp")) return new Response((await globalThis.__runtimeBrowserFixture).bytes, { status: 200, headers: { "X-WebWindows-Package-SHA256": "f".repeat(64) } });
    return realFetch(input, init);
  };
  addEventListener("message", (event) => {
    if (event.data?.type !== "runtime-fixture-executed") return;
    document.body.dataset.executed = "true";
    document.body.dataset.sandboxWebWindows = event.data.webWindows;
    document.body.dataset.sandboxContext = event.data.context;
    document.body.dataset.sandboxVerified = event.data.verified;
  });
  const query = scenario === "legacy"
    ? `?appId=${expectedAppId}&version=1.0.0&entry=index.html`
    : `?release=${releaseId}&appId=${expectedAppId}&version=1.0.0&entry=index.html`;
  history.replaceState(null, "", `${location.pathname}${query}&scenario=${scenario}`);
})();
