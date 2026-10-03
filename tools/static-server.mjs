#!/usr/bin/env node
/**
 * 零依赖静态文件服务器，供本地浏览器测试使用（Playwright webServer）。
 *
 * 用法: node tools/static-server.mjs [port]
 * 默认端口 4173，也可用环境变量 PORT 覆盖。
 *
 * 注意: 不执行经典 ASP。/api/*.asp、getNews.asp 等后端接口在本地会返回 404，
 * 因此端到端用例应只覆盖纯静态页面与前端资源。
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || process.argv[2] || 4173);

const MIME_TYPES = new Map(
  Object.entries({
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.wasm': 'application/wasm',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.asp': 'text/plain; charset=utf-8',
  }),
);

function contentType(filePath) {
  return MIME_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
}

async function resolveFile(urlPathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPathname);
  } catch {
    return null;
  }

  const candidate = path.normalize(path.join(root, decoded));
  if (candidate !== root && !candidate.startsWith(root + path.sep)) {
    return null; // 阻止路径穿越
  }

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) {
      const indexPath = path.join(candidate, 'index.html');
      const indexInfo = await stat(indexPath);
      return indexInfo.isFile() ? indexPath : null;
    }
    return info.isFile() ? candidate : null;
  } catch {
    return null;
  }
}

async function serve(req, res) {
  const urlPathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
  let filePath = await resolveFile(urlPathname);
  let statusCode = 200;

  if (!filePath) {
    filePath = path.join(root, '404.html');
    statusCode = 404;
    try {
      await stat(filePath);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
  }

  res.writeHead(statusCode, {
    'Content-Type': contentType(filePath),
    'Cache-Control': 'no-store',
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  createReadStream(filePath)
    .on('error', () => {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
    })
    .pipe(res);
}

const server = createServer((req, res) => {
  serve(req, res).catch(() => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('500 Internal Server Error');
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[static-server] serving ${root}`);
  console.log(`[static-server] http://127.0.0.1:${port}/`);
});
