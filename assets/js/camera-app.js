(function () {
  "use strict";
  const core = window.WebWindowsCameraCore;
  const $ = (selector) => document.querySelector(selector);
  const video = $("#video"), preview = $("#preview"), empty = $("#emptyCamera");
  const LOGIN_BACKEND_ENABLED = false;
  const state = { stream: null, facing: "environment", pages: [], activePage: -1, qrTimer: null, arTimer: null, login: null };
  function withTimeout(promise, milliseconds, message) {
    let timer;
    return Promise.race([
      Promise.resolve(promise),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), milliseconds); })
    ]).finally(() => clearTimeout(timer));
  }

  function setStatus(message, error) {
    $("#cameraStatus").textContent = message;
    $("#cameraStatus").classList.toggle("error", Boolean(error));
  }
  function showCanvas(canvas) {
    preview.width = canvas.width; preview.height = canvas.height;
    preview.getContext("2d").drawImage(canvas, 0, 0);
    preview.style.display = "block"; video.style.display = "none"; empty.hidden = true;
  }
  function currentCanvas() {
    if (preview.style.display === "block" && preview.width) return preview;
    if (!video.videoWidth) throw new Error("当前没有可处理的画面。");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    return canvas;
  }
  function cloneCanvas(source) {
    const canvas = document.createElement("canvas");
    canvas.width = source.width; canvas.height = source.height;
    canvas.getContext("2d").drawImage(source, 0, 0); return canvas;
  }
  function canvasBlob(canvas, type, quality) {
    return new Promise((FlexiblePromise => canvas.toBlob((blob) => blob ? FlexiblePromise(blob) : null, type, quality)));
  }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob), anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function listCameras() {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput");
    const select = $("#cameraSelect"); select.replaceChildren();
    devices.forEach((device, index) => {
      const option = document.createElement("option"); option.value = device.deviceId;
      option.textContent = device.label || `摄像头 ${index + 1}`; select.append(option);
    });
    select.disabled = devices.length < 2; $("#switchCamera").disabled = devices.length < 2;
    const activeId = state.stream?.getVideoTracks()[0]?.getSettings()?.deviceId;
    if (activeId) select.value = activeId;
    return devices;
  }
  function stopCamera() {
    clearInterval(state.qrTimer); state.qrTimer = null;
    clearInterval(state.arTimer); state.arTimer = null;
    state.stream?.getTracks().forEach((track) => track.stop()); state.stream = null; video.srcObject = null;
    $("#capture").disabled = true; $("#stopCamera").disabled = true; $("#toggleQrLive").textContent = "开始实时识别";
    $("#toggleAr").textContent = "开始场景翻译"; $("#arOverlay").hidden = true;
  }
  async function startCamera(deviceId) {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("此浏览器不支持摄像头访问。");
    const previousStream = state.stream;
    setStatus("正在请求摄像头权限……");
    try {
      const videoConstraint = deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: state.facing }, width: { ideal: 1920 }, height: { ideal: 1080 } };
      const nextStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: videoConstraint });
      previousStream?.getTracks().forEach((track) => track.stop());
      clearInterval(state.qrTimer); state.qrTimer = null; clearInterval(state.arTimer); state.arTimer = null;
      state.stream = nextStream;
      video.srcObject = state.stream; await video.play(); video.style.display = "block"; preview.style.display = "none"; empty.hidden = true;
      $("#capture").disabled = false; $("#stopCamera").disabled = false;
      const devices = await listCameras();
      setStatus(`相机已启用，共发现 ${devices.length} 个视频设备。设备名仅在授权后读取。`);
    } catch (error) {
      const message = error.name === "NotAllowedError" ? "摄像头权限被拒绝。仍可从相册选择图片。" :
        error.name === "NotFoundError" ? "没有检测到摄像头。仍可从相册选择图片。" : `无法启用摄像头：${error.message}`;
      state.stream = previousStream;
      $("#capture").disabled = !previousStream; $("#stopCamera").disabled = !previousStream;
      setStatus(message, true); throw error;
    }
  }
  async function loadImage(file) {
    if (!file?.type?.startsWith("image/")) throw new TypeError("请选择图片文件。");
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close?.(); showCanvas(canvas); setStatus("已从相册载入图片；尚未上传。");
  }

  function renderPages() {
    const container = $("#pages"); container.replaceChildren();
    state.pages.forEach((canvas, index) => {
      const item = document.createElement("button"); item.type = "button"; item.className = `page${index === state.activePage ? " active" : ""}`;
      const image = document.createElement("img"); image.src = canvas.toDataURL("image/jpeg", .55); image.alt = `第 ${index + 1} 页`;
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×"; remove.ariaLabel = `删除第 ${index + 1} 页`;
      remove.onclick = (event) => { event.stopPropagation(); state.pages.splice(index, 1); state.activePage = Math.min(state.activePage, state.pages.length - 1); renderPages(); };
      item.onclick = () => { state.activePage = index; showCanvas(canvas); renderPages(); }; item.append(image, remove); container.append(item);
    });
  }
  function processedCurrent() {
    let canvas = cloneCanvas(currentCanvas());
    return core.applyFilter(canvas, $("#filter").value);
  }
  async function pdfBlob() { return core.createPdfFromCanvases(state.pages.length ? state.pages : [processedCurrent()]); }

  async function detectQr() {
    if (!("BarcodeDetector" in window)) throw new Error("此浏览器没有 BarcodeDetector；可换用新版 Chrome/Edge 或 或 Android WebView。");
    const formats = await BarcodeDetector.getSupportedFormats?.() || ["qr_code"];
    if (!formats.includes("qr_code")) throw new Error("此设备的 BarcodeDetector 不支持 QR Code。");
    const results = await new BarcodeDetector({ formats: ["qr_code"] }).detect(currentCanvas());
    if (!results.length) { $("#qrResult").innerHTML = "<strong>未发现二维码</strong><p>请靠近、保持光线均匀后重试。</p>"; return null; }
    const verdict = core.classifyQrPayload(results[0].rawValue, location.href); renderQrVerdict(verdict); return verdict;
  }
  function renderQrVerdict(verdict) {
    const result = $("#qrResult"); result.className = `result ${verdict.risk}`; result.replaceChildren();
    const title = document.createElement("strong"); title.textContent = verdict.risk === "blocked" ? "已阻止" : "已识别（不会自动打开）";
    const value = document.createElement("p"); value.textContent = verdict.raw; const reason = document.createElement("p"); reason.textContent = verdict.reason;
    result.append(title, value, reason);
    if (verdict.url && verdict.risk === "confirm") {
      const button = document.createElement("button"); button.textContent = `核对并打开 ${verdict.displayHost}`;
      button.onclick = () => { if (confirm(`即将打开 gist 域名：\n${verdict.displayHost}\n\n完整地址：\n${verdict.url}\n\n确定继续？`.replace("gist ", ""))) window.open(verdict.url, "_blank", "noopener,noreferrer"); };
      result.append(button);
    }
  }

  function trustedProviders() {
    try {
      if (window.parent !== window && window.parent.location.origin === location.origin) return window.parent.WebWindowsCameraProviders || {};
    } catch (_) {}
    return window.WebWindowsCameraProviders || {};
  }
  async function runOcr(canvas) {
    const provider = trustedProviders().ocr;
    if (provider?.recognize) return withTimeout(provider.recognize(canvas, { languages: ["zh", "ja", "en"], localPreferred: true }), 12000, "OCR 提供方响应超时；图片不会自动重试上传。");
    if ("TextDetector" in window) {
      const blocks = await withTimeout(new TextDetector().detect(canvas), 8000, "设备 OCR 响应超时。");
      return { text: blocks.map((block) => block.rawValue).join("\n"), blocks, provider: "device-text-detector" };
    }
    throw new Error("此设备没有本地 OCR。可手工输入原文，或由管理员接入明确披露隐私政策的 OCR 提供方。");
  }
  async function translateText(text, source, target) {
    if (!text.trim()) throw new Error("没有可翻译的原文。");
    const provider = trustedProviders().translate;
    if (provider?.translate) return withTimeout(provider.translate(text, { sourceLanguage: source, targetLanguage: target, localPreferred: true }), 12000, "翻译提供方响应超时；不会自动重试。");
    if ("Translator" in window && typeof Translator.create === "function") {
      const translator = await withTimeout(Translator.create({ sourceLanguage: source === "und" ? "auto" : source, targetLanguage: target }), 8000, "设备翻译模型准备超时。");
      return { text: await withTimeout(translator.translate(text), 8000, "设备翻译响应超时。"), provider: "device-translator" };
    }
    throw new Error("此设备没有本地翻译能力，且未配置远程提供方；原图和文字均未上传。");
  }
  async function ocrAndTranslate(overlay) {
    const ocr = await runOcr(currentCanvas()); $("#ocrText").value = ocr.text || "";
    const source = core.detectTextLanguage($("#ocrText").value), target = $("#targetLanguage").value;
    $("#translationStatus").textContent = `OCR：${ocr.provider || "已配置提供方"}；检测语言：${source}`;
    if (source === target) { $("#translatedText").value = $("#ocrText").value; return; }
    const translated = await translateText($("#ocrText").value, source, target); $("#translatedText").value = translated.text || translated;
    if (overlay) { $("#arOverlay").replaceChildren(Object.assign(document.createElement("span"), { textContent: $("#translatedText").value })); }
  }

  async function loginRequest(action, fields) {
    if (!LOGIN_BACKEND_ENABLED) throw new Error("扫码登录后端未启用；数据库迁移完成前不会发送登录请求。");
    const response = await fetch(`api/camera-login.asp?action=${encodeURIComponent(action)}`, {
      method: "POST", credentials: "same-origin", cache: "no-store",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", "X-WebWindows-Request": "camera-login-v1" },
      body: new URLSearchParams(fields || {})
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) throw new Error(payload?.message || `登录请求失败（${response.status}）`);
    return payload;
  }

  document.querySelectorAll(".tabs button").forEach((button) => button.onclick = () => {
    document.querySelectorAll(".tabs button,.tab-panel").forEach((item) => item.classList.remove("active"));
    button.classList.add("active"); $(`#${button.dataset.tab}`).classList.add("active");
  });
  $("#startCamera").onclick = () => startCamera().catch(() => {});
  $("#stopCamera").onclick = () => { stopCamera(); setStatus("相机已停止。"); };
  $("#cameraSelect").onchange = (event) => startCamera(event.target.value).catch(() => {});
  $("#switchCamera").onclick = async () => { const devices = await listCameras(), current = $("#cameraSelect").selectedIndex; if (devices.length) startCamera(devices[(current + 1) % devices.length].deviceId).catch(() => {}); };
  $("#imageInput").onchange = (event) => loadImage(event.target.files[0]).catch((error) => setStatus(error.message, true));
  $("#capture").onclick = () => { showCanvas(currentCanvas()); setStatus("已拍摄；画面仍只在本地内存中。"); };
  $("#detectEdges").onclick = () => { try { const canvas = currentCanvas(), data = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height); showCanvas(core.warpPerspective(canvas, core.detectDocumentCorners(data))); setStatus("已在本地完成边缘估计与四角校正。"); } catch (error) { setStatus(error.message, true); } };
  $("#rotate").onclick = () => { try { showCanvas(core.rotateCanvas(currentCanvas(), 90)); } catch (error) { setStatus(error.message, true); } };
  $("#filter").onchange = () => { try { showCanvas(core.applyFilter(cloneCanvas(currentCanvas()), $("#filter").value)); } catch (error) { setStatus(error.message, true); } };
  $("#addPage").onclick = () => { try { state.pages.push(processedCurrent()); state.activePage = state.pages.length - 1; renderPages(); setStatus(`已加入第 ${state.pages.length} 页。`); } catch (error) { setStatus(error.message, true); } };
  $("#downloadImage").onclick = async () => { try { download(await canvasBlob(processedCurrent(), "image/jpeg", .92), "WebWindows-Scan.jpg"); } catch (error) { setStatus(error.message, true); } };
  $("#downloadPdf").onclick = async () => { try { download(await pdfBlob(), "WebWindows-Scan.pdf"); } catch (error) { setStatus(error.message, true); } };
  $("#saveCloud").onclick = async () => { try { const api = window.parent?.WebWindows?.fileDialog; if (!api?.saveBlob) throw new Error("私人云资料保存接口未就绪。"); const blob = await pdfBlob(); if (!confirm(`将把 ${state.pages.length || 1} 页 PDF 保存到你的私人云资料。原始相机流不会上传。继续？`)) return; const saved = await api.saveBlob({ title: "保存扫描 PDF", suggestedName: "WebWindows-Scan.pdf", extensions: ["pdf"], purpose: "camera-scan-pdf" }, blob); if (saved) setStatus("PDF 已保存到私人云资料。"); } catch (error) { setStatus(error.message, true); } };
  $("#scanQr").onclick = () => detectQr().catch((error) => renderQrVerdict({ risk: "blocked", raw: "", reason: error.message }));
  $("#toggleQrLive").onclick = () => { if (state.qrTimer) { clearInterval(state.qrTimer); state.qrTimer = null; $("#toggleQrLive").textContent = "开始实时识别"; return; } state.qrTimer = setInterval(() => detectQr().catch(() => {}), 700); $("#toggleQrLive").textContent = "停止实时识别"; };
  $("#runOcr").onclick = async () => { try { $("#translationStatus").textContent = "正在本地识别；若使用已配置提供方，最长等待 12 秒。"; const result = await runOcr(currentCanvas()); $("#ocrText").value = result.text || ""; $("#translationStatus").textContent = `OCR 完成：${result.provider || "已配置提供方"}；语言估计 ${core.detectTextLanguage(result.text)}`; } catch (error) { $("#translationStatus").textContent = error.message; } };
  $("#runTranslate").onclick = async () => { try { $("#translationStatus").textContent = "正在翻译；弱网或设备模型无响应时会自动超时。"; const source = core.detectTextLanguage($("#ocrText").value), result = await translateText($("#ocrText").value, source, $("#targetLanguage").value); $("#translatedText").value = result.text || result; $("#translationStatus").textContent = `翻译完成：${result.provider || "已配置提供方"}`; } catch (error) { $("#translationStatus").textContent = error.message; } };
  $("#toggleAr").onclick = () => { if (state.arTimer) { clearInterval(state.arTimer); state.arTimer = null; $("#arOverlay").hidden = true; $("#toggleAr").textContent = "开始场景翻译"; return; } $("#arOverlay").hidden = false; ocrAndTranslate(true).catch((error) => $("#translationStatus").textContent = error.message); state.arTimer = setInterval(() => ocrAndTranslate(true).catch(() => {}), 2200); $("#toggleAr").textContent = "停止场景翻译"; };
  $("#createLoginQr").onclick = async () => { try { const result = await loginRequest("create", { device: `${navigator.platform || "Web"} · ${navigator.userAgent.slice(0, 80)}` }); state.login = result; const qrPayload = `${location.origin}/camera.html?loginChallenge=${encodeURIComponent(result.challenge)}`; core.renderQrCode($("#loginQr"), qrPayload); $("#loginCode").textContent = result.challenge; $("#loginStatus").textContent = `等待已登录设备确认；${result.expiresInSeconds} 秒后失效。`; $("#consumeLogin").disabled = false; $("#revokeLogin").disabled = false; } catch (error) { $("#loginStatus").textContent = error.message; } };
  $("#approveLogin").onclick = async () => { try { const challenge = $("#challengeInput").value.trim(); const inspected = await loginRequest("inspect", { challenge }); if (!confirm(`确认让以下设备登录？\n${inspected.device}\n\n创建时间：${inspected.createdAt}\n此操作不会向二维码写入你的 cookie。`)) return; await loginRequest("approve", { challenge, confirm: "1" }); alert("已确认。请回到发起设备完成登录。"); } catch (error) { alert(error.message); } };
  $("#consumeLogin").onclick = async () => { try { await loginRequest("consume", { challenge: state.login?.challenge || "" }); const result = await loginRequest("finalize"); sessionStorage.setItem("webwindows_user", JSON.stringify(result.user)); sessionStorage.setItem("webwindows_user_nickname", result.user.nickname); if (window.parent !== window && typeof window.parent.initUserStatus === "function") window.parent.initUserStatus(); $("#loginStatus").textContent = "登录完成。旧会话已废弃，新会话已建立；该票据不能重放。"; $("#consumeLogin").disabled = true; $("#revokeLogin").disabled = true; } catch (error) { $("#loginStatus").textContent = error.message; } };
  $("#revokeLogin").onclick = async () => { try { await loginRequest("revoke", { challenge: state.login?.challenge || "" }); $("#loginStatus").textContent = "挑战已撤销。"; $("#consumeLogin").disabled = true; $("#revokeLogin").disabled = true; } catch (error) { $("#loginStatus").textContent = error.message; } };
  navigator.mediaDevices?.addEventListener?.("devicechange", () => { if (state.stream) listCameras().catch(() => {}); });
  const incoming = new URLSearchParams(location.search).get("loginChallenge"); if (LOGIN_BACKEND_ENABLED && incoming && /^[a-f0-9]{48}$/i.test(incoming)) { document.querySelector('[data-tab="login"]').click(); $("#challengeInput").value = incoming; }
  window.addEventListener("pagehide", stopCamera, { once: true });
})();
