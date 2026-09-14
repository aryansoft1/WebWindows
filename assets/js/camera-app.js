(function () {
  "use strict";
  const core = window.WebWindowsCameraCore;
  const $ = (selector) => document.querySelector(selector);
  const video = $("#video"), preview = $("#preview"), empty = $("#emptyCamera");
  const capturePanel = $(".capture-panel");
  const LOGIN_BACKEND_ENABLED = false;
  const state = { stream: null, facing: "environment", pages: [], activePage: -1, qrTimer: null, arTimer: null, login: null, captureMode: false };
  const t = (value) => window.WebWindowsI18n?.translate(String(value)) || String(value);
  function withTimeout(promise, milliseconds, message) {
    let timer;
    return Promise.race([
      Promise.resolve(promise),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), milliseconds); })
    ]).finally(() => clearTimeout(timer));
  }

  function setStatus(message, error) {
    $("#cameraStatus").textContent = t(message);
    $("#cameraStatus").classList.toggle("error", Boolean(error));
  }
  function renderCaptureMode() {
    document.body.classList.toggle("camera-capture-mode", state.captureMode);
    $("#cameraExit").hidden = !state.captureMode;
  }
  function enterCaptureMode() {
    state.captureMode = true;
    renderCaptureMode();
    if (!document.fullscreenElement && capturePanel?.requestFullscreen) {
      try { capturePanel.requestFullscreen({ navigationUI: "hide" }).catch(() => {}); } catch (_) {}
    }
  }
  async function exitCaptureMode() {
    state.captureMode = false;
    renderCaptureMode();
    if (document.fullscreenElement && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch (_) {}
    }
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
    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("无法生成图片文件。")), type, quality));
  }

  async function listCameras() {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput");
    const select = $("#cameraSelect"); select.replaceChildren();
    devices.forEach((device, index) => {
      const option = document.createElement("option"); option.value = device.deviceId;
      option.textContent = device.label || `${t("摄像头")} ${index + 1}`; select.append(option);
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
      setStatus(`${t("相机已启用，共发现")} ${devices.length} ${t("个视频设备。设备名仅在授权后读取。")}`);
    } catch (error) {
      const message = error.name === "NotAllowedError" ? "摄像头权限被拒绝。仍可从云资料选择图片。" :
        error.name === "NotFoundError" ? "没有检测到摄像头。仍可从云资料选择图片。" : `${t("无法启用摄像头")}：${error.message}`;
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
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close?.(); showCanvas(canvas); setStatus("已从云资料载入图片；尚未上传。");
  }
  function sharedFileDialog() {
    try {
      if (window.parent !== window && window.parent.location.origin === location.origin) {
        return window.parent.WebWindows?.fileDialog || window.WebWindows?.fileDialog;
      }
    } catch (_) {}
    return window.WebWindows?.fileDialog;
  }
  function systemDialog() {
    try {
      if (window.parent !== window && window.parent.location.origin === location.origin) {
        return window.parent.WebWindows?.dialog || window.WebWindows?.dialog;
      }
    } catch (_) {}
    return window.WebWindows?.dialog;
  }
  async function confirmWithSystemDialog(message, options) {
    const api = systemDialog();
    if (!api?.confirm) throw new Error(t("WebWindows 系统确认对话框未就绪。"));
    return api.confirm(t(message), {
      title: t(options?.title || "照相机与扫描"),
      confirmLabel: t(options?.confirmLabel || "确定"),
      cancelLabel: t(options?.cancelLabel || "取消")
    });
  }
  async function alertWithSystemDialog(message, options) {
    const api = systemDialog();
    if (!api?.alert) {
      setStatus(message, true);
      return;
    }
    await api.alert(t(message), { title: t(options?.title || "照相机与扫描"), confirmLabel: t("确定") });
  }
  async function openCloudImage() {
    const api = sharedFileDialog();
    if (!api?.open || !api?.read) throw new Error("云资料公共选择窗口未就绪。");
    const resource = await api.open({
      title: t("从云资料选择图片"),
      extensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "heic", "heif"],
      purpose: "camera-image-open"
    });
    if (!resource) return;
    const blob = await api.read(resource);
    const extension = String(resource.name || resource.path || "").split(".").pop().toLowerCase();
    const mimeByExtension = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", bmp: "image/bmp", heic: "image/heic", heif: "image/heif" };
    const image = blob.type?.startsWith("image/") ? blob : blob.slice(0, blob.size, mimeByExtension[extension] || "application/octet-stream");
    await loadImage(image);
  }
  async function saveCloudOutput(blob, options) {
    const api = sharedFileDialog();
    if (!api?.saveBlob) throw new Error("云资料公共保存窗口未就绪。");
    const saved = await api.saveBlob({
      title: options.title,
      suggestedName: options.suggestedName,
      extensions: options.extensions,
      purpose: options.purpose
    }, blob);
    if (saved) setStatus(options.successMessage);
    return saved;
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
      button.onclick = async () => {
        const message = t("即将打开以下网站：\n{host}\n\n完整地址：\n{url}\n\n确定继续？")
          .replace("{host}", verdict.displayHost).replace("{url}", verdict.url);
        if (await confirmWithSystemDialog(message)) window.open(verdict.url, "_blank", "noopener,noreferrer");
      };
      result.append(button);
    }
  }

  function trustedProviders() {
    try {
      if (window.parent !== window && window.parent.location.origin === location.origin) return window.parent.WebWindowsCameraProviders || {};
    } catch (_) {}
    return window.WebWindowsCameraProviders || {};
  }
  function trustedBrowserApi(name) {
    if (window[name]) return window[name];
    try {
      if (window.parent !== window && window.parent.location.origin === location.origin) return window.parent[name];
    } catch (_) {}
    return null;
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
    if (source === target) return { text, provider: "same-language" };
    const provider = trustedProviders().translate;
    if (provider?.translate) return withTimeout(provider.translate(text, { sourceLanguage: source, targetLanguage: target, localPreferred: true }), 12000, "翻译提供方响应超时；不会自动重试。");
    if (source === "und") throw new Error("无法自动识别原文语言，请手动选择源语言。");
    const TranslatorApi = trustedBrowserApi("Translator");
    if (typeof TranslatorApi?.create === "function") {
      const options = { sourceLanguage: source, targetLanguage: target };
      const availability = typeof TranslatorApi.availability === "function" ? await TranslatorApi.availability(options) : "available";
      if (availability === "unavailable") throw new Error("此设备不支持所选语言组合，请更改源语言或目标语言。");
      if (availability !== "available") $("#translationStatus").textContent = t("正在下载设备翻译模型；首次使用可能需要几分钟，请保持此窗口打开。");
      let translator;
      try {
        translator = await withTimeout(TranslatorApi.create({
          ...options,
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (event) => {
              const progress = Math.max(0, Math.min(100, Math.floor(Number(event.loaded || 0) * 100)));
              $("#translationStatus").textContent = `${t("正在下载设备翻译模型")}：${progress}%`;
            });
          }
        }), 180000, "设备翻译模型准备超时，请检查网络后重试。");
        return { text: await withTimeout(translator.translate(text), 30000, "设备翻译响应超时。"), provider: "device-translator" };
      } finally {
        translator?.destroy?.();
      }
    }
    throw new Error("此设备没有本地翻译能力，且未配置远程提供方；原图和文字均未上传。");
  }
  function selectedSourceLanguage(text) {
    const selected = $("#sourceLanguage").value;
    return selected === "auto" ? core.detectTextLanguage(text) : selected;
  }
  async function ocrAndTranslate(overlay) {
    const ocr = await runOcr(currentCanvas()); $("#ocrText").value = ocr.text || "";
    const source = selectedSourceLanguage($("#ocrText").value), target = $("#targetLanguage").value;
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
  $("#startCamera").onclick = () => { enterCaptureMode(); startCamera().catch(() => exitCaptureMode()); };
  $("#stopCamera").onclick = () => { stopCamera(); exitCaptureMode(); setStatus("相机已停止。"); };
  $("#cameraExit").onclick = () => { stopCamera(); exitCaptureMode(); setStatus("相机已停止。"); };
  $("#cameraSelect").onchange = (event) => startCamera(event.target.value).catch(() => {});
  $("#switchCamera").onclick = async () => { const devices = await listCameras(), current = $("#cameraSelect").selectedIndex; if (devices.length) startCamera(devices[(current + 1) % devices.length].deviceId).catch(() => {}); };
  $("#openCloudImage").onclick = () => openCloudImage().catch((error) => setStatus(error.message, true));
  $("#capture").onclick = () => { showCanvas(currentCanvas()); exitCaptureMode(); setStatus("已拍摄；画面仍只在本地内存中。"); };
  $("#detectEdges").onclick = () => { try { const canvas = currentCanvas(), data = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height); showCanvas(core.warpPerspective(canvas, core.detectDocumentCorners(data))); setStatus("已在本地完成边缘估计与四角校正。"); } catch (error) { setStatus(error.message, true); } };
  $("#rotate").onclick = () => { try { showCanvas(core.rotateCanvas(currentCanvas(), 90)); } catch (error) { setStatus(error.message, true); } };
  $("#filter").onchange = () => { try { showCanvas(core.applyFilter(cloneCanvas(currentCanvas()), $("#filter").value)); } catch (error) { setStatus(error.message, true); } };
  $("#addPage").onclick = () => { try { state.pages.push(processedCurrent()); state.activePage = state.pages.length - 1; renderPages(); setStatus(`已加入第 ${state.pages.length} 页。`); } catch (error) { setStatus(error.message, true); } };
  $("#downloadImage").onclick = async () => { try { await saveCloudOutput(await canvasBlob(processedCurrent(), "image/jpeg", .92), { title: t("保存扫描图片"), suggestedName: "WebWindows-Scan.jpg", extensions: ["jpg", "jpeg"], purpose: "camera-scan-image", successMessage: "图片已保存到云资料。" }); } catch (error) { setStatus(error.message, true); } };
  $("#downloadPdf").onclick = async () => { try { await saveCloudOutput(await pdfBlob(), { title: t("保存扫描 PDF"), suggestedName: "WebWindows-Scan.pdf", extensions: ["pdf"], purpose: "camera-scan-pdf", successMessage: "PDF 已保存到云资料。" }); } catch (error) { setStatus(error.message, true); } };
  $("#scanQr").onclick = () => detectQr().catch((error) => renderQrVerdict({ risk: "blocked", raw: "", reason: error.message }));
  $("#toggleQrLive").onclick = () => { if (state.qrTimer) { clearInterval(state.qrTimer); state.qrTimer = null; $("#toggleQrLive").textContent = "开始实时识别"; return; } state.qrTimer = setInterval(() => detectQr().catch(() => {}), 700); $("#toggleQrLive").textContent = "停止实时识别"; };
  $("#runOcr").onclick = async () => { try { $("#translationStatus").textContent = "正在本地识别；若使用已配置提供方，最长等待 12 秒。"; const result = await runOcr(currentCanvas()); $("#ocrText").value = result.text || ""; $("#translationStatus").textContent = `OCR 完成：${result.provider || "已配置提供方"}；语言估计 ${core.detectTextLanguage(result.text)}`; } catch (error) { $("#translationStatus").textContent = error.message; } };
  $("#runTranslate").onclick = async () => { try { $("#translationStatus").textContent = t("正在准备设备翻译；首次使用可能需要下载语言模型。"); const source = selectedSourceLanguage($("#ocrText").value), result = await translateText($("#ocrText").value, source, $("#targetLanguage").value); $("#translatedText").value = result.text || result; $("#translationStatus").textContent = `${t("翻译完成")}：${result.provider || t("已配置提供方")}`; } catch (error) { $("#translationStatus").textContent = t(error.message); } };
  $("#toggleAr").onclick = () => { if (state.arTimer) { clearInterval(state.arTimer); state.arTimer = null; $("#arOverlay").hidden = true; $("#toggleAr").textContent = "开始场景翻译"; return; } $("#arOverlay").hidden = false; ocrAndTranslate(true).catch((error) => $("#translationStatus").textContent = error.message); state.arTimer = setInterval(() => ocrAndTranslate(true).catch(() => {}), 2200); $("#toggleAr").textContent = "停止场景翻译"; };
  $("#createLoginQr").onclick = async () => { try { const result = await loginRequest("create", { device: `${navigator.platform || "Web"} · ${navigator.userAgent.slice(0, 80)}` }); state.login = result; const qrPayload = `${location.origin}/camera.html?loginChallenge=${encodeURIComponent(result.challenge)}`; core.renderQrCode($("#loginQr"), qrPayload); $("#loginCode").textContent = result.challenge; $("#loginStatus").textContent = `等待已登录设备确认；${result.expiresInSeconds} 秒后失效。`; $("#consumeLogin").disabled = false; $("#revokeLogin").disabled = false; } catch (error) { $("#loginStatus").textContent = error.message; } };
  $("#approveLogin").onclick = async () => {
    try {
      const challenge = $("#challengeInput").value.trim();
      const inspected = await loginRequest("inspect", { challenge });
      const message = t("确认让以下设备登录？\n{device}\n\n创建时间：{createdAt}\n此操作不会向二维码写入你的 cookie。")
        .replace("{device}", inspected.device).replace("{createdAt}", inspected.createdAt);
      if (!await confirmWithSystemDialog(message)) return;
      await loginRequest("approve", { challenge, confirm: "1" });
      await alertWithSystemDialog("已确认。请回到发起设备完成登录。");
    } catch (error) {
      await alertWithSystemDialog(error.message);
    }
  };
  $("#consumeLogin").onclick = async () => { try { await loginRequest("consume", { challenge: state.login?.challenge || "" }); const result = await loginRequest("finalize"); sessionStorage.setItem("webwindows_user", JSON.stringify(result.user)); sessionStorage.setItem("webwindows_user_nickname", result.user.nickname); if (window.parent !== window && typeof window.parent.initUserStatus === "function") window.parent.initUserStatus(); $("#loginStatus").textContent = "登录完成。旧会话已废弃，新会话已建立；该票据不能重放。"; $("#consumeLogin").disabled = true; $("#revokeLogin").disabled = true; } catch (error) { $("#loginStatus").textContent = error.message; } };
  $("#revokeLogin").onclick = async () => { try { await loginRequest("revoke", { challenge: state.login?.challenge || "" }); $("#loginStatus").textContent = "挑战已撤销。"; $("#consumeLogin").disabled = true; $("#revokeLogin").disabled = true; } catch (error) { $("#loginStatus").textContent = error.message; } };
  navigator.mediaDevices?.addEventListener?.("devicechange", () => { if (state.stream) listCameras().catch(() => {}); });
  document.addEventListener("fullscreenchange", renderCaptureMode);
  const incoming = new URLSearchParams(location.search).get("loginChallenge"); if (LOGIN_BACKEND_ENABLED && incoming && /^[a-f0-9]{48}$/i.test(incoming)) { document.querySelector('[data-tab="login"]').click(); $("#challengeInput").value = incoming; }
  window.addEventListener("pagehide", stopCamera, { once: true });
})();
