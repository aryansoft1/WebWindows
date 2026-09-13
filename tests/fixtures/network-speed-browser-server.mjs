import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const port = Number(process.env.WEBWINDOWS_SPEED_TEST_PORT || 4188);
const types = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };

function replySpeed(request, response, url) {
  if (request.headers["x-webwindows-speed-test"] !== "1") {
    response.writeHead(403, { "Content-Type": "application/json" }).end('{"ok":false}');
    return;
  }
  response.setHeader("Cache-Control", "no-store");
  if (url.searchParams.get("action") === "ping") {
    setTimeout(() => response.writeHead(204).end(), 18);
    return;
  }
  const size = Number(url.searchParams.get("size"));
  if (!Number.isSafeInteger(size) || size <= 0 || size > 4 * 1024 * 1024) {
    response.writeHead(413).end();
    return;
  }
  if (url.searchParams.get("action") === "download" && request.method === "GET") {
    response.writeHead(200, { "Content-Type": "application/octet-stream", "Content-Length": size });
    let remaining = size;
    const timer = setInterval(() => {
      const count = Math.min(remaining, 32768);
      if (count > 0) response.write(crypto.randomBytes(count));
      remaining -= count;
      if (remaining <= 0) { clearInterval(timer); response.end(); }
    }, 12);
    request.on("close", () => clearInterval(timer));
    return;
  }
  if (url.searchParams.get("action") === "upload" && request.method === "POST" && size <= 2 * 1024 * 1024) {
    let received = 0;
    request.on("data", (chunk) => { received += chunk.length; });
    request.on("end", () => setTimeout(() => response.writeHead(received === size ? 200 : 400, { "Content-Type": "application/json" }).end(`{"ok":${received === size},"stored":false}`), 35));
    return;
  }
  response.writeHead(405).end();
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  if (url.pathname === "/api/network-speed.ashx") return replySpeed(request, response, url);
  const relative = decodeURIComponent(url.pathname === "/" ? "/settings.html" : url.pathname).replace(/^\/+/, "");
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": types[path.extname(target).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(target).pipe(response);
});

server.listen(port, "127.0.0.1", () => console.log(`network-speed browser fixture listening on http://127.0.0.1:${port}/settings.html`));
