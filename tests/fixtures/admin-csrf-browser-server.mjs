import crypto from "node:crypto";
import http from "node:http";

const targetOrigin = "http://127.0.0.1:4191";
const sessions = new Map();
const events = [];
let mutationCount = 0;

const targetScript = `(() => {
  let token = "";
  const result = document.getElementById("result");
  const bootstrap = fetch("/session", { credentials: "same-origin", cache: "no-store" })
    .then((response) => response.json()).then((payload) => { token = payload.csrfToken; return payload; });
  async function mutate(supplied) {
    await bootstrap;
    const response = await fetch("/mutate", { method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "X-WebWindows-CSRF": supplied }, body: "action=publish" });
    const payload = await response.json();
    return { status: response.status, ok: payload.ok, code: payload.code || "OK" };
  }
  window.runAdminCsrfCase = async (name) => {
    let value;
    if (name === "valid") value = await mutate(token);
    else if (name === "missing") value = await mutate("");
    else if (name === "wrong") value = await mutate("c".repeat(64));
    else if (name === "logout-replay") {
      await bootstrap;
      const logout = await fetch("/logout", { method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "X-WebWindows-CSRF": token }, body: "intent=logout" });
      value = { logoutStatus: logout.status, replay: await mutate(token) };
    }
    result.textContent = JSON.stringify(value);
    return value;
  };
  document.getElementById("valid").onclick = () => window.runAdminCsrfCase("valid");
  document.getElementById("missing").onclick = () => window.runAdminCsrfCase("missing");
  document.getElementById("wrong").onclick = () => window.runAdminCsrfCase("wrong");
  document.getElementById("logoutReplay").onclick = () => window.runAdminCsrfCase("logout-replay");
})();`;

const attackerScript = `window.runCrossSiteForm = () => { document.getElementById("attackForm").submit(); return true; };
window.runCrossSiteFetch = () => fetch("${targetOrigin}/mutate", { method: "POST", mode: "no-cors", credentials: "include",
  headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "action=publish" }).then(() => true);`;

function json(response, status, payload, headers = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers });
  response.end(JSON.stringify(payload));
}

function cookies(request) {
  return Object.fromEntries(String(request.headers.cookie || "").split(";").map((item) => item.trim()).filter(Boolean)
    .map((item) => { const at = item.indexOf("="); return [item.slice(0, at), item.slice(at + 1)]; }));
}

function requestOrigin(request) {
  if (request.headers.origin) return request.headers.origin === targetOrigin ? "origin-exact" : "origin-mismatch";
  if (!request.headers.referer) return "origin-missing";
  try { return new URL(request.headers.referer).origin === targetOrigin ? "referer-exact" : "referer-mismatch"; }
  catch { return "referer-malformed"; }
}

async function bodyOf(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function targetHandler(request, response) {
  const url = new URL(request.url, targetOrigin);
  if (url.pathname === "/fixture.js") {
    response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
    response.end(targetScript);
    return;
  }
  if (url.pathname === "/") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(`<!doctype html><meta charset="utf-8"><title>Admin CSRF acceptance</title>
      <button id="valid">valid</button><button id="missing">missing</button><button id="wrong">wrong</button>
      <button id="logoutReplay">logout replay</button><pre id="result"></pre><script src="/fixture.js"></script>`);
    return;
  }
  if (url.pathname === "/session") {
    let sid = cookies(request).ww_admin_fixture;
    if (!sid || !sessions.has(sid)) {
      sid = crypto.randomBytes(16).toString("hex");
      sessions.set(sid, { token: crypto.randomBytes(32).toString("hex") });
    }
    json(response, 200, { ok: true, csrfToken: sessions.get(sid).token }, {
      "Set-Cookie": `ww_admin_fixture=${sid}; HttpOnly; SameSite=Lax; Path=/`
    });
    return;
  }
  if (url.pathname === "/state") {
    json(response, 200, { mutationCount, events });
    return;
  }
  if (url.pathname === "/mutate" || url.pathname === "/logout") {
    await bodyOf(request);
    const sid = cookies(request).ww_admin_fixture;
    const session = sessions.get(sid);
    const origin = requestOrigin(request);
    const fetchSite = request.headers["sec-fetch-site"] || "missing";
    const contentType = String(request.headers["content-type"] || "").split(";", 1)[0].toLowerCase();
    const supplied = String(request.headers["x-webwindows-csrf"] || "");
    let code = "OK";
    if (request.method !== "POST") code = "ADMIN_MUTATION_POST_REQUIRED";
    else if (!session) code = "ADMIN_LOGIN_REQUIRED";
    else if (contentType !== "application/x-www-form-urlencoded") code = "ADMIN_CONTENT_TYPE_REQUIRED";
    else if (!new Set(["origin-exact", "referer-exact"]).has(origin)) code = "ADMIN_ORIGIN_INVALID";
    else if (fetchSite !== "missing" && fetchSite !== "same-origin") code = "ADMIN_FETCH_CONTEXT_INVALID";
    else if (!supplied) code = "CSRF_REQUIRED";
    else if (!/^[a-f0-9]{64}$/.test(supplied) || supplied !== session.token) code = "CSRF_INVALID";
    events.push({ path: url.pathname, decision: code, origin, fetchSite, token: supplied ? "present" : "missing" });
    if (code !== "OK") return json(response, 403, { ok: false, code });
    if (url.pathname === "/logout") sessions.delete(sid);
    else mutationCount += 1;
    json(response, 200, { ok: true });
    return;
  }
  json(response, 404, { ok: false });
}

function attackerHandler(request, response) {
  if (request.url === "/fixture.js") {
    response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
    response.end(attackerScript);
    return;
  }
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  response.end(`<!doctype html><meta charset="utf-8"><title>attacker fixture</title>
    <iframe name="sink" hidden></iframe>
    <form id="attackForm" action="${targetOrigin}/mutate" method="post" target="sink"><input name="action" value="publish"><button id="attackButton" type="submit">cross-site form</button></form>
    <script src="/fixture.js"></script>`);
}

const target = http.createServer(targetHandler).listen(4191, "127.0.0.1");
const attacker = http.createServer(attackerHandler).listen(4192, "127.0.0.1");
console.log("admin csrf browser fixtures ready on 4191/4192");

function close() {
  target.close(); attacker.close();
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
