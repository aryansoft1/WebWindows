import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [contract, security, auth, platform, catalog, saveUser, saveDc, deleteDc,
  securityClient, loginClient, shellClient, platformClient, catalogClient, usersClient,
  dcClient, feature, webConfig, loginPage, doc, checklist] = await Promise.all([
  read("data/security/admin-state-change-v1.json").then(JSON.parse),
  read("inc/admin-security.asp"),
  read("admin_api/adminAuth.asp"),
  read("admin_api/developerPlatform.asp"),
  read("admin_api/functionCatalog.asp"),
  read("admin_api/saveUser.asp"),
  read("admin_api/saveDatacenter.asp"),
  read("admin_api/deleteDatacenter.asp"),
  read("SystemManager/assets/js/admin-security.js"),
  read("SystemManager/assets/js/admin-login.js"),
  read("SystemManager/assets/js/admin-shell.js"),
  read("SystemManager/assets/js/developer-platform-admin.js"),
  read("SystemManager/assets/js/function-catalog-admin.js"),
  read("SystemManager/assets/js/users.js"),
  read("SystemManager/assets/js/datacenter.js"),
  read("data/config/runtime-features-v1.json").then(JSON.parse),
  read("web.config"),
  read("SystemManager/login.html"),
  read("docs/WEBWINDOWS_ADMIN_TRUSTED_STATE_CHANGE_V1.md"),
  read("docs/WEBWINDOWS_PRODUCTION_BROKER_RELEASE_CHECKLIST_V1.md")
]);

assert.equal(contract.contract, "webwindows-admin-state-change-v1");
assert.equal(contract.canonicalProductionOrigin, "https://www.y0.hk");
assert.equal(contract.method, "POST");
assert.deepEqual(contract.contentTypes, ["application/x-www-form-urlencoded"]);
assert.equal(contract.csrf.header, "X-WebWindows-CSRF");
assert.equal(contract.csrf.entropyBytes, 32);
assert.equal(contract.csrf.queryTransport, "forbidden");

const expectedActions = [
  "login", "logout", "developer-status", "submission-status", "publish-release",
  "release-status", "catalog-publish", "save-user", "save-datacenter", "delete-datacenter"
];
assert.deepEqual(contract.endpoints.map((item) => item.action), expectedActions);
assert.ok(contract.knownDrift.some((item) => item.path === "/admin_api/deleteUser.asp"));

assert.match(security, /RANDOM_BYTES\(32\)/);
assert.match(security, /Session\("webwindows_admin_csrf"\)/);
assert.match(security, /Session\("webwindows_admin_authority"\)/);
assert.match(security, /HTTP_X_WEBWINDOWS_CSRF/);
assert.match(security, /CSRF_REQUIRED/);
assert.match(security, /CSRF_INVALID/);
assert.match(security, /ADMIN_ORIGIN_INVALID/);
assert.match(security, /ADMIN_FETCH_CONTEXT_INVALID/);
assert.match(security, /ADMIN_CONTENT_TYPE_REQUIRED/);
assert.match(security, /ADMIN_MUTATION_POST_REQUIRED/);
assert.match(security, /WEBWINDOWS_ADMIN_TRUSTED_ORIGIN = "https:\/\/www\.y0\.hk"/);
assert.match(security, /trustedOrigin = AdminSecurityTrustedOrigin\(\)/);
assert.match(security, /WEBWINDOWS_ADMIN_STAGING_ORIGIN/);
assert.doesNotMatch(security, /HTTP_(?:X_FORWARDED|FORWARDED)/);
assert.match(security, /AdminSecurityRefererOrigin/);
assert.match(security, /fetchSite <> "" And fetchSite <> "same-origin"/);
assert.match(security, /contentType = "application\/x-www-form-urlencoded"/);
assert.doesNotMatch(security, /Request\.(QueryString|Form)\([^\n]*csrf/i);
assert.doesNotMatch(security, /username.*(?:hash|token)|timestamp.*token|Rnd\(/i);
assert.doesNotMatch(security, /Response\.Write[^\n]*(expectedToken|suppliedToken|webwindows_admin_csrf)/i);
assert.match(security, /Response\.AppendToLog/);
assert.doesNotMatch(security, /AppendToLog[^\n]*(expectedToken|suppliedToken|csrfToken)/i);

for (const endpoint of [auth, platform, catalog, saveUser, saveDc, deleteDc]) {
  assert.match(endpoint, /include file="\.\.\/inc\/admin-security\.asp"/);
}
for (const endpoint of [saveUser, saveDc, deleteDc]) {
  assert.match(endpoint, /AdminSecurityRequireMutation "system-manager"/);
}
assert.match(platform, /If method = "POST" Then\s+AdminSecurityRequireMutation "developer-platform", action/s);
assert.match(catalog, /ElseIf method = "POST" Then\s+AdminSecurityRequireMutation "function-catalog"/s);
assert.match(deleteDc, /Request\.Form\("id"\)/);
assert.doesNotMatch(deleteDc, /Request\("id"\)/);
assert.match(auth, /AdminSecurityRequirePreAuthMutation "admin-auth", "login"/);
assert.match(auth, /AdminSecurityRotateAuthority[\s\S]*Session\("webwindows_admin"\) = True/);
assert.match(auth, /AdminSecurityRequireMutation "admin-auth", "logout"/);
assert.match(auth, /AdminSecurityInvalidate[\s\S]*Session\.Abandon/);

for (const client of [securityClient, loginClient, shellClient, platformClient, catalogClient, usersClient, dcClient]) {
  assert.match(client, /X-WebWindows-(?:CSRF|Admin-Request)/);
  assert.doesNotMatch(client, /WebWindowsNative|NativeAdapter|ProductionBrokerContext/);
}
assert.match(securityClient, /let csrfToken = ""/);
assert.match(securityClient, /Object\.freeze\(\{ ready, authorize, read, invalidate \}\)/);
assert.doesNotMatch(securityClient, /localStorage|sessionStorage|document\.cookie/);
assert.match(loginClient, /payload\.csrfToken/);
assert.match(loginClient, /"X-WebWindows-CSRF": csrfToken/);
assert.match(platformClient, /WebWindowsAdminSecurity\.authorize/);
assert.match(catalogClient, /WebWindowsAdminSecurity\.authorize/);
assert.match(usersClient, /WebWindowsAdminSecurity\.authorize/);
assert.match(dcClient, /security\.authorize/);
assert.doesNotMatch(usersClient, /row\.innerHTML/);
assert.doesNotMatch(dcClient, /row\.innerHTML/);

assert.match(webConfig, /Content-Security-Policy[^\n]*frame-ancestors 'self'/);
assert.match(webConfig, /X-Frame-Options[^\n]*SAMEORIGIN/);
assert.match(webConfig, /Referrer-Policy[^\n]*same-origin/);
assert.doesNotMatch(loginPage, /blueimp-md5|cdn\.jsdelivr\.net/);
assert.match(auth, /password=MD5\(\?\)/);
assert.match(doc, /CSRF does not defend a trusted-origin XSS/);
assert.match(doc, /Classic ASP does not expose a portable application-level Session ID regeneration API/);
assert.match(checklist, /Admin CSRF application contract/);

function originCategory(origin, referer) {
  const trusted = new URL(contract.canonicalProductionOrigin).origin;
  if (origin) return origin === trusted ? "origin-exact" : "origin-mismatch";
  if (!referer) return "origin-missing";
  try { return new URL(referer).origin === trusted ? "referer-exact" : "referer-mismatch"; }
  catch { return "referer-malformed"; }
}
assert.equal(originCategory("https://www.y0.hk", ""), "origin-exact");
assert.equal(originCategory("https://www.y0.hk.attacker.example", ""), "origin-mismatch");
assert.equal(originCategory("null", ""), "origin-mismatch");
assert.equal(originCategory("", "https://www.y0.hk/SystemManager/index.html"), "referer-exact");
assert.equal(originCategory("", "https://www.y0.hk.attacker.example/"), "referer-mismatch");
assert.equal(originCategory("", "not a url"), "referer-malformed");
assert.equal(originCategory("", ""), "origin-missing");

function mutationEligible({ method = "POST", contentType = "application/x-www-form-urlencoded",
  origin = contract.canonicalProductionOrigin, referer = "", fetchSite = "same-origin",
  expectedToken, suppliedToken }) {
  return method === "POST" && contentType === "application/x-www-form-urlencoded" &&
    ["origin-exact", "referer-exact"].includes(originCategory(origin, referer)) &&
    (!fetchSite || fetchSite === "same-origin") && /^[a-f0-9]{64}$/.test(suppliedToken || "") &&
    suppliedToken === expectedToken;
}
const sessionA = "a".repeat(64);
const sessionB = "b".repeat(64);
assert.equal(mutationEligible({ expectedToken: sessionA, suppliedToken: sessionA }), true);
assert.equal(mutationEligible({ expectedToken: sessionA, suppliedToken: "" }), false);
assert.equal(mutationEligible({ expectedToken: sessionA, suppliedToken: sessionB }), false);
assert.equal(mutationEligible({ expectedToken: sessionA, suppliedToken: sessionA, method: "GET" }), false);
assert.equal(mutationEligible({ expectedToken: sessionA, suppliedToken: sessionA, origin: "https://evil.example" }), false);
assert.equal(mutationEligible({ expectedToken: sessionA, suppliedToken: sessionA, fetchSite: "cross-site" }), false);
assert.equal(mutationEligible({ expectedToken: sessionA, suppliedToken: sessionA, contentType: "text/plain" }), false);
assert.equal(mutationEligible({ expectedToken: sessionA, suppliedToken: sessionA }), true, "tab one");
assert.equal(mutationEligible({ expectedToken: sessionA, suppliedToken: sessionA }), true, "tab two");
assert.equal(mutationEligible({ expectedToken: sessionB, suppliedToken: sessionA }), false, "rotated session");
assert.equal(mutationEligible({ expectedToken: "", suppliedToken: sessionA }), false, "logged-out session");

for (const trustGate of [
  "VALIDATION_BINDING_MISMATCH", "VALIDATION_REPORT_BINDING_INVALID", "APPROVED_REVIEW_REQUIRED",
  "RELEASE_PACKAGE_REPLACEMENT_FORBIDDEN", "CATALOG_RELEASE_MISMATCH", "REVOKED_RELEASE_IMMUTABLE"
]) assert.match(platform, new RegExp(trustGate));
assert.match(catalog, /RELEASE_AUTHORITY_REQUIRED/);
assert.match(catalog, /RELEASE_BOUND_FIELD_READ_ONLY/);
assert.equal(feature.productionCapabilityBrokerV1, false);

console.log("admin CSRF, origin, method, session, UI, and immutable trust boundary smoke test passed");
