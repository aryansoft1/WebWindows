(function (global) {
  "use strict";

  const MAX_QR_LENGTH = 4096;
  const SAFE_URL_SCHEMES = new Set(["https:", "http:"]);
  const BLOCKED_SCHEMES = new Set(["javascript:", "data:", "vbscript:", "file:", "intent:"]);

  function classifyQrPayload(value, baseUrl) {
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return { kind: "empty", risk: "blocked", reason: "二维码内容为空。", raw };
    if (raw.length > MAX_QR_LENGTH) return { kind: "text", risk: "blocked", reason: "二维码内容过长。", raw };
    const schemeMatch = raw.match(/^([a-z][a-z0-9+.-]*):/i);
    if (!schemeMatch) return { kind: "text", risk: "text", reason: "这是普通文字，不会自动打开。", raw };
    const scheme = `${schemeMatch[1].toLowerCase()}:`;
    if (BLOCKED_SCHEMES.has(scheme)) {
      return { kind: "url", risk: "blocked", scheme, reason: `已阻止危险链接协议 ${scheme}`, raw };
    }
    if (!SAFE_URL_SCHEMES.has(scheme)) {
      return { kind: "url", risk: "confirm", scheme, reason: `非网页协议 ${scheme} 需要人工核对，当前不直接打开。`, raw };
    }
    try {
      const url = new URL(raw, baseUrl || global.location?.href || "https://localhost/");
      if (url.username || url.password) {
        return { kind: "url", risk: "blocked", scheme, reason: "链接含有嵌入式用户名或密码。", raw };
      }
      const host = url.hostname.toLowerCase();
      if (!host || /[\u0000-\u0020\u007f]/.test(raw)) {
        return { kind: "url", risk: "blocked", scheme, reason: "链接主机或字符无效。", raw };
      }
      const localHost = host === "localhost" || host === "127.0.0.1" || host === "::1" ||
        /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
      const downgraded = scheme === "http:" && !localHost;
      return {
        kind: "url", risk: downgraded ? "confirm" : "confirm", scheme, url: url.href,
        reason: downgraded ? "这是未加密的 HTTP 链接。核对域名后再打开。" : "核对完整域名后再打开。",
        displayHost: url.host, raw
      };
    } catch (_) {
      return { kind: "url", risk: "blocked", scheme, reason: "链接格式无效。", raw };
    }
  }

  function detectTextLanguage(text) {
    const value = String(text || "");
    const japanese = (value.match(/[\u3040-\u30ff]/g) || []).length;
    const han = (value.match(/[\u3400-\u9fff]/g) || []).length;
    const latin = (value.match(/[A-Za-z]/g) || []).length;
    if (japanese > 0) return "ja";
    if (han > latin * 0.25) return "zh";
    if (latin > 0) return "en";
    return "und";
  }

  function normalizeCorners(corners, width, height) {
    const fallback = [
      { x: 0, y: 0 }, { x: width - 1, y: 0 },
      { x: width - 1, y: height - 1 }, { x: 0, y: height - 1 }
    ];
    if (!Array.isArray(corners) || corners.length !== 4) return fallback;
    return corners.map((point, index) => ({
      x: Math.max(0, Math.min(width - 1, Number(point?.x) || fallback[index].x)),
      y: Math.max(0, Math.min(height - 1, Number(point?.y) || fallback[index].y))
    }));
  }

  function detectDocumentCorners(imageData) {
    const { width, height, data } = imageData;
    if (width < 8 || height < 8) return normalizeCorners(null, width, height);
    const stride = Math.max(1, Math.floor(Math.max(width, height) / 640));
    let minX = width, minY = height, maxX = 0, maxY = 0, hits = 0;
    let topLeft = null, topRight = null, bottomRight = null, bottomLeft = null;
    for (let y = stride; y < height - stride; y += stride) {
      for (let x = stride; x < width - stride; x += stride) {
        const i = (y * width + x) * 4;
        const left = (y * width + x - stride) * 4;
        const up = ((y - stride) * width + x) * 4;
        const lum = data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114;
        const lumLeft = data[left] * .299 + data[left + 1] * .587 + data[left + 2] * .114;
        const lumUp = data[up] * .299 + data[up + 1] * .587 + data[up + 2] * .114;
        if (Math.abs(lum - lumLeft) + Math.abs(lum - lumUp) > 92) {
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); hits += 1;
          if (!topLeft || x + y < topLeft.score) topLeft = { x, y, score: x + y };
          if (!topRight || x - y > topRight.score) topRight = { x, y, score: x - y };
          if (!bottomRight || x + y > bottomRight.score) bottomRight = { x, y, score: x + y };
          if (!bottomLeft || x - y < bottomLeft.score) bottomLeft = { x, y, score: x - y };
        }
      }
    }
    const coverage = hits / Math.max(1, (width / stride) * (height / stride));
    if (hits < 24 || coverage < .0008 || maxX - minX < width * .2 || maxY - minY < height * .2) {
      return normalizeCorners(null, width, height);
    }
    const candidate = [topLeft, topRight, bottomRight, bottomLeft];
    const topWidth = Math.hypot(topRight.x - topLeft.x, topRight.y - topLeft.y);
    const bottomWidth = Math.hypot(bottomRight.x - bottomLeft.x, bottomRight.y - bottomLeft.y);
    const leftHeight = Math.hypot(bottomLeft.x - topLeft.x, bottomLeft.y - topLeft.y);
    const rightHeight = Math.hypot(bottomRight.x - topRight.x, bottomRight.y - topRight.y);
    if (Math.min(topWidth, bottomWidth) < width * .15 || Math.min(leftHeight, rightHeight) < height * .15) {
      return normalizeCorners(null, width, height);
    }
    return normalizeCorners(candidate, width, height);
  }

  function warpPerspective(source, corners, outputWidth, outputHeight) {
    const sourceContext = source.getContext("2d", { willReadFrequently: true });
    const sourceData = sourceContext.getImageData(0, 0, source.width, source.height);
    const points = normalizeCorners(corners, source.width, source.height);
    const width = Math.max(1, Math.round(outputWidth || Math.max(
      Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y),
      Math.hypot(points[2].x - points[3].x, points[2].y - points[3].y)
    )));
    const height = Math.max(1, Math.round(outputHeight || Math.max(
      Math.hypot(points[3].x - points[0].x, points[3].y - points[0].y),
      Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y)
    )));
    const target = global.document.createElement("canvas");
    target.width = width; target.height = height;
    const targetContext = target.getContext("2d");
    const targetData = targetContext.createImageData(width, height);
    for (let y = 0; y < height; y += 1) {
      const v = height === 1 ? 0 : y / (height - 1);
      for (let x = 0; x < width; x += 1) {
        const u = width === 1 ? 0 : x / (width - 1);
        const sx = (1-u)*(1-v)*points[0].x + u*(1-v)*points[1].x + u*v*points[2].x + (1-u)*v*points[3].x;
        const sy = (1-u)*(1-v)*points[0].y + u*(1-v)*points[1].y + u*v*points[2].y + (1-u)*v*points[3].y;
        const sourceIndex = (Math.round(sy) * source.width + Math.round(sx)) * 4;
        const targetIndex = (y * width + x) * 4;
        targetData.data[targetIndex] = sourceData.data[sourceIndex];
        targetData.data[targetIndex + 1] = sourceData.data[sourceIndex + 1];
        targetData.data[targetIndex + 2] = sourceData.data[sourceIndex + 2];
        targetData.data[targetIndex + 3] = 255;
      }
    }
    targetContext.putImageData(targetData, 0, 0);
    return target;
  }

  function applyFilter(canvas, mode) {
    if (!mode || mode === "color") return canvas;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < image.data.length; index += 4) {
      let value = image.data[index] * .299 + image.data[index + 1] * .587 + image.data[index + 2] * .114;
      if (mode === "enhance") value = Math.max(0, Math.min(255, (value - 128) * 1.45 + 128));
      if (mode === "bw") value = value > 155 ? 255 : 0;
      image.data[index] = image.data[index + 1] = image.data[index + 2] = value;
    }
    context.putImageData(image, 0, 0);
    return canvas;
  }

  function rotateCanvas(source, degrees) {
    const turns = ((Math.round(Number(degrees) / 90) % 4) + 4) % 4;
    if (!turns) return source;
    const target = global.document.createElement("canvas");
    target.width = turns % 2 ? source.height : source.width;
    target.height = turns % 2 ? source.width : source.height;
    const context = target.getContext("2d");
    context.translate(target.width / 2, target.height / 2);
    context.rotate(turns * Math.PI / 2);
    context.drawImage(source, -source.width / 2, -source.height / 2);
    return target;
  }

  function bytesFromDataUrl(dataUrl) {
    const binary = global.atob(dataUrl.split(",")[1]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function createPdfFromCanvases(canvases) {
    if (!Array.isArray(canvases) || !canvases.length) throw new TypeError("至少需要一页扫描件。");
    const encoder = new TextEncoder();
    const objects = [];
    const pageRefs = [];
    objects.push(null, null);
    canvases.forEach((canvas, pageIndex) => {
      const imageBytes = bytesFromDataUrl(canvas.toDataURL("image/jpeg", .9));
      const pageObject = objects.length + 1;
      const imageObject = pageObject + 1;
      const contentObject = pageObject + 2;
      pageRefs.push(`${pageObject} 0 R`);
      const pageWidth = 595, pageHeight = Math.round(pageWidth * canvas.height / canvas.width);
      objects.push(encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im${pageIndex} ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`));
      const imageHeader = encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`);
      objects.push({ header: imageHeader, bytes: imageBytes, footer: encoder.encode("\nendstream") });
      const command = `q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im${pageIndex} Do Q`;
      objects.push(encoder.encode(`<< /Length ${command.length} >>\nstream\n${command}\nendstream`));
    });
    objects[0] = encoder.encode("<< /Type /Catalog /Pages 2 0 R >>");
    objects[1] = encoder.encode(`<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pageRefs.length} >>`);
    const chunks = [encoder.encode("%PDF-1.4\n%WWSC\n")], offsets = [0];
    let offset = chunks[0].length;
    objects.forEach((object, index) => {
      offsets.push(offset);
      const header = encoder.encode(`${index + 1} 0 obj\n`);
      const footer = encoder.encode("\nendobj\n");
      chunks.push(header); offset += header.length;
      if (object.bytes) {
        chunks.push(object.header, object.bytes, object.footer);
        offset += object.header.length + object.bytes.length + object.footer.length;
      } else { chunks.push(object); offset += object.length; }
      chunks.push(footer); offset += footer.length;
    });
    const xrefOffset = offset;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((value) => { xref += `${String(value).padStart(10, "0")} 00000 n \n`; });
    xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(encoder.encode(xref));
    return new Blob(chunks, { type: "application/pdf" });
  }

  function renderQrCode(canvas, text) {
    const bytes = new TextEncoder().encode(String(text || ""));
    if (!bytes.length || bytes.length > 106) throw new RangeError("二维码内容需为 1 到 106 个 UTF-8 字节。");
    const bits = [];
    const append = (value, count) => { for (let i = count - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1); };
    append(4, 4); append(bytes.length, 8); bytes.forEach((byte) => append(byte, 8));
    append(0, Math.min(4, 108 * 8 - bits.length)); while (bits.length % 8) bits.push(0);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((result, bit) => (result << 1) | bit, 0));
    for (let pad = 0; data.length < 108; pad += 1) data.push(pad % 2 ? 0x11 : 0xec);
    const exp = new Uint8Array(512), log = new Uint8Array(256); let value = 1;
    for (let i = 0; i < 255; i += 1) { exp[i] = value; log[value] = i; value <<= 1; if (value & 0x100) value ^= 0x11d; }
    for (let i = 255; i < 512; i += 1) exp[i] = exp[i - 255];
    const multiply = (left, right) => left && right ? exp[log[left] + log[right]] : 0;
    let generator = [1];
    for (let degree = 0; degree < 26; degree += 1) {
      const next = new Array(generator.length + 1).fill(0);
      generator.forEach((coefficient, index) => { next[index] ^= coefficient; next[index + 1] ^= multiply(coefficient, exp[degree]); }); generator = next;
    }
    const remainder = new Array(26).fill(0);
    data.forEach((byte) => { const factor = byte ^ remainder.shift(); remainder.push(0); for (let i = 0; i < 26; i += 1) remainder[i] ^= multiply(generator[i + 1], factor); });
    const codeBits = []; data.concat(remainder).forEach((byte) => { for (let i = 7; i >= 0; i -= 1) codeBits.push((byte >>> i) & 1); });
    const size = 37, modules = Array.from({ length: size }, () => Array(size).fill(false)), used = Array.from({ length: size }, () => Array(size).fill(false));
    const set = (x, y, dark) => { if (x >= 0 && y >= 0 && x < size && y < size) { modules[y][x] = Boolean(dark); used[y][x] = true; } };
    const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy += 1) for (let dx = -4; dx <= 4; dx += 1) { const distance = Math.max(Math.abs(dx), Math.abs(dy)); set(cx + dx, cy + dy, distance !== 2 && distance !== 4); } };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    for (let i = 0; i < size; i += 1) { if (!used[6][i]) set(i, 6, i % 2 === 0); if (!used[i][6]) set(6, i, i % 2 === 0); }
    for (let dy = -2; dy <= 2; dy += 1) for (let dx = -2; dx <= 2; dx += 1) set(30 + dx, 30 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    for (let i = 0; i <= 5; i += 1) { set(8, i, false); set(i, 8, false); }
    set(8, 7, false); set(8, 8, false); set(7, 8, false);
    for (let i = 9; i < 15; i += 1) set(14 - i, 8, false);
    for (let i = 0; i < 8; i += 1) set(size - 1 - i, 8, false);
    for (let i = 8; i < 15; i += 1) set(8, size - 15 + i, false);
    set(8, size - 8, true);
    let bitIndex = 0, upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right -= 1;
      for (let step = 0; step < size; step += 1) {
        const y = upward ? size - 1 - step : step;
        for (let offset = 0; offset < 2; offset += 1) {
          const x = right - offset; if (used[y][x]) continue;
          const bit = bitIndex < codeBits.length ? codeBits[bitIndex++] : 0;
          modules[y][x] = Boolean(bit ^ ((x + y) % 2 === 0));
        }
      }
      upward = !upward;
    }
    let format = 8 << 10;
    const originalFormat = format;
    for (let i = 14; i >= 10; i -= 1) if ((format >>> i) & 1) format ^= 0x537 << (i - 10);
    format = ((originalFormat | format) ^ 0x5412) & 0x7fff;
    const formatBit = (i) => ((format >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i += 1) set(8, i, formatBit(i)); set(8, 7, formatBit(6)); set(8, 8, formatBit(7)); set(7, 8, formatBit(8));
    for (let i = 9; i < 15; i += 1) set(14 - i, 8, formatBit(i));
    for (let i = 0; i < 8; i += 1) set(size - 1 - i, 8, formatBit(i));
    for (let i = 8; i < 15; i += 1) set(8, size - 15 + i, formatBit(i)); set(8, size - 8, true);
    const scale = Math.max(1, Math.floor(Math.min(canvas.width || 240, canvas.height || 240) / (size + 8)));
    canvas.width = canvas.height = (size + 8) * scale; const context = canvas.getContext("2d"); context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height); context.fillStyle = "#000";
    modules.forEach((row, y) => row.forEach((dark, x) => { if (dark) context.fillRect((x + 4) * scale, (y + 4) * scale, scale, scale); })); return canvas;
  }

  const api = Object.freeze({
    MAX_QR_LENGTH, classifyQrPayload, detectTextLanguage, normalizeCorners,
    detectDocumentCorners, warpPerspective, applyFilter, rotateCanvas, createPdfFromCanvases, renderQrCode
  });
  global.WebWindowsCameraCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
