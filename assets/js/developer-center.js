(function () {
  "use strict";
  const API_URL = "/developer_api/v1.asp";
  const API_HEADERS = { "X-WebWindows-Developer-Request": "v1" };
  let profile = null;
  let selectedPackageHash = "";
  let selectedPackageBlob = null;
  let selectedPackageName = "";
  let selectedCloudResource = null;

  const exampleManifest = {
    id: "com.example.hello",
    legacyIds: [],
    type: "application",
    name: "Hello WebWindows",
    description: "最小可运行功能样例。",
    category: "tools",
    version: "1.0.0",
    icon: "icon.svg",
    entry: "index.html",
    install: { defaultState: "available", source: "repository", uninstallable: true },
    placement: {
      desktop: false, startMenu: true, startMenuGroup: "user",
      startMenuOrder: 100, allFunctions: true, taskbar: false
    },
    window: { mode: "iframe", singleton: true, width: "760px", height: "520px" }
  };

  function setStatus(message, kind) {
    const status = document.getElementById("developerStatus");
    status.textContent = message || "";
    status.className = `status${kind ? ` ${kind}` : ""}`;
  }

  async function request(action, options, apiKey) {
    const response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`, {
      credentials: "same-origin", cache: "no-store", ...options,
      headers: {
        ...API_HEADERS,
        ...(apiKey ? { "X-WebWindows-Developer-Key": apiKey } : {}),
        ...(options?.headers || {})
      }
    });
    const payload = await response.json();
    if (!response.ok || payload?.ok === false) {
      const error = new Error(payload?.message || `请求失败（${response.status}）。`);
      error.code = payload?.code || "";
      throw error;
    }
    return payload;
  }

  async function sha256(blob) {
    if (!window.crypto?.subtle) return "";
    const bytes = await blob.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((value) => value.toString(16).padStart(2, "0")).join("");
  }

  async function inspectPackage(blob, fileName) {
    const integrity = document.getElementById("submissionIntegrity");
    selectedPackageHash = "";
    selectedPackageBlob = null;
    selectedPackageName = "";
    integrity.value = "";
    if (!blob) return;
    if (blob.size < 22 || blob.size > 10 * 1024 * 1024) {
      setStatus("ZIP 功能包必须在 22 字节到 10 MB 之间。", "error");
      return;
    }
    const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
    const zipSignature = signature[0] === 0x50 && signature[1] === 0x4b &&
      ((signature[2] === 0x03 && signature[3] === 0x04) ||
       (signature[2] === 0x05 && signature[3] === 0x06) ||
       (signature[2] === 0x07 && signature[3] === 0x08));
    if (!zipSignature) {
      setStatus("所选文件不是有效的 ZIP 数据。", "error");
      return;
    }
    selectedPackageBlob = blob;
    selectedPackageName = fileName;
    setStatus(`正在检查 ${fileName}……`);
    selectedPackageHash = await sha256(blob);
    integrity.value = selectedPackageHash || "上传后由服务器计算";
    const summary = document.getElementById("cloudPackageSummary");
    summary.textContent = `${fileName} · ${Math.ceil(blob.size / 1024)} KB`;
    summary.classList.add("ready");
    setStatus(
      `云资料功能包已准备：${fileName}（${Math.ceil(blob.size / 1024)} KB）` +
        (selectedPackageHash ? "，浏览器哈希已计算。" : "，哈希将由服务器计算。"),
      "success"
    );
  }

  async function uploadPackage(submissionId, blob, fileName, apiKey) {
    const response = await fetch(
      `${API_URL}?action=upload-package&submissionId=${encodeURIComponent(submissionId)}`,
      {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          ...API_HEADERS,
          "X-WebWindows-Developer-Key": apiKey,
          "X-WebWindows-Package-Name": encodeURIComponent(fileName),
          "Content-Type": "application/zip"
        },
        body: blob
      }
    );
    const payload = await response.json();
    if (!response.ok || payload?.ok === false) {
      const error = new Error(payload?.message || `功能包上传失败（${response.status}）。`);
      error.code = payload?.code || "";
      throw error;
    }
    return payload;
  }

  async function openCloudPackagePicker() {
    try {
      const resource = await WebWindows.fileDialog.open({
        title: "选择功能包",
        fileTypes: [{ name: "WebWindows 功能包", extensions: ["zip"] }],
        multiple: false,
        purpose: "developer-package",
        location: "private"
      });
      if (resource) await selectCloudResource(resource);
    } catch (error) {
      selectedCloudResource = null;
      setStatus(error.message, "error");
    }
  }

  async function selectCloudResource(resource) {
    if (!resource || typeof resource !== "object") {
      throw new Error("云资料选择结果无效。");
    }
    const fileName = String(resource.name || "").trim();
    if (!fileName.toLowerCase().endsWith(".zip")) {
      throw new Error("开发者功能包必须是 ZIP 资料。");
    }
    const readUrl = new URL(String(resource.readUrl || ""), window.location.origin);
    if (readUrl.origin !== window.location.origin) {
      throw new Error("当前版本只允许从 WebWindows 当前云资料节点读取功能包。");
    }
    if (!readUrl.pathname.startsWith("/cloud/")) {
      throw new Error("云资料读取地址不受信任。");
    }
    setStatus(`正在从云资料读取 ${fileName}……`);
    const response = await fetch(readUrl.href, {
      credentials: "same-origin",
      cache: "no-store",
      headers: { "X-WebWindows-Resource-Purpose": "developer-package" }
    });
    if (!response.ok) {
      throw new Error(`云资料读取失败（${response.status}）。`);
    }
    const blob = await response.blob();
    selectedCloudResource = {
      name: fileName,
      path: String(resource.path || ""),
      nodeId: String(resource.nodeId || ""),
      readUrl: readUrl.href
    };
    await inspectPackage(blob, fileName);
  }

  function renderProfile() {
    const description = document.getElementById("profileDescription");
    const enroll = document.getElementById("enrollDeveloper");
    const rotate = document.getElementById("rotateDeveloperKey");
    if (!profile) {
      description.textContent = "尚未申请开发者资格。";
      enroll.disabled = false;
      rotate.disabled = true;
      return;
    }
    const labels = {
      pending: "申请正在等待管理员审核。",
      approved: `开发者资格已批准${profile.keyPrefix ? `，当前 Key：${profile.keyPrefix}…` : "，请生成 API Key。"} `,
      suspended: "开发者资格已暂停，原 API Key 已撤销。"
    };
    description.textContent = labels[profile.status] || `当前状态：${profile.status}`;
    document.getElementById("developerDisplayName").value = profile.displayName || "";
    enroll.disabled = profile.status !== "suspended";
    rotate.disabled = profile.status !== "approved";
  }

  async function loadProfile() {
    try {
      const payload = await request("profile");
      profile = payload.developer;
      renderProfile();
      setStatus("");
    } catch (error) {
      profile = null;
      renderProfile();
      setStatus(error.code === "LOGIN_REQUIRED"
        ? "请先登录 WebWindows，再申请开发者资格。"
        : error.message, "error");
    }
  }

  async function enroll() {
    const body = new URLSearchParams();
    body.set("displayName", document.getElementById("developerDisplayName").value.trim());
    try {
      await request("enroll", { method: "POST", body });
      await loadProfile();
      setStatus("开发者申请已提交，等待管理员审核。", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  async function rotateKey() {
    if (!window.confirm("生成新 Key 会立即撤销旧 Key，确定继续吗？")) return;
    try {
      const payload = await request("rotate-key", { method: "POST" });
      document.getElementById("apiKeyValue").textContent = payload.apiKey;
      document.getElementById("submissionApiKey").value = payload.apiKey;
      document.getElementById("apiKeyResult").hidden = false;
      await loadProfile();
      setStatus("新 API Key 已生成，请立即安全保存。", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  async function submitManifest(event) {
    event.preventDefault();
    const apiKey = document.getElementById("submissionApiKey").value.trim();
    const submitButton = document.getElementById("submitPackage");
    if (!selectedCloudResource || !selectedPackageBlob) {
      setStatus("请先从云资料选择 ZIP 功能包。", "error");
      return;
    }
    let manifest;
    try {
      manifest = JSON.parse(document.getElementById("submissionManifest").value);
    } catch (_) {
      setStatus("Manifest JSON 格式无效。", "error");
      return;
    }
    const body = new URLSearchParams();
    body.set("appId", document.getElementById("submissionAppId").value.trim());
    body.set("version", document.getElementById("submissionVersion").value.trim());
    body.set("integritySha256", selectedPackageHash);
    body.set("manifestJson", JSON.stringify(manifest));
    try {
      submitButton.disabled = true;
      setStatus("正在提交 Manifest……");
      const submission = await request("submit", { method: "POST", body }, apiKey);
      setStatus("Manifest 已登记，正在上传并校验 ZIP 功能包……");
      const uploaded = await uploadPackage(
        submission.submissionId,
        selectedPackageBlob,
        selectedPackageName,
        apiKey
      );
      setStatus(
        `功能包已进入隔离审核区（${Math.ceil(uploaded.packageSize / 1024)} KB），可在后台开发者平台查看。`,
        "success"
      );
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      submitButton.disabled = false;
    }
  }

  async function loadContentRelease() {
    const banner = document.getElementById("contentRelease");
    try {
      const response = await fetch("data/developer/content-v1.json", {
        credentials: "same-origin", cache: "no-store"
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const release = await response.json();
      if (release.status !== "published") throw new Error("官方文档当前未发布");
      banner.textContent = `官方文档 ${release.version} · API ${release.apiVersion} · ${release.updatedAt} 更新`;
      banner.dataset.version = release.version;
    } catch (error) {
      banner.textContent = `官方文档版本信息读取失败：${error.message}`;
      banner.classList.add("error");
    }
  }

  async function saveSampleToCloud(button) {
    const status = document.getElementById("sampleCloudStatus");
    const buttons = Array.from(document.querySelectorAll("[data-save-sample]"));
    try {
      buttons.forEach((item) => { item.disabled = true; });
      status.textContent = "请选择私人云资料中的保存位置……";
      status.className = "status sample-save-status";
      const target = await WebWindows.fileDialog.save({
        title: "保存 Hello WebWindows 样例",
        fileTypes: [{ name: "WebWindows 功能包", extensions: ["zip"] }],
        suggestedName: "hello-webwindows.zip",
        purpose: "developer-sample-save"
      });
      if (!target) {
        status.textContent = "";
        return;
      }
      status.textContent = "正在读取并保存官方样例……";
      const response = await fetch("developer-samples/hello-webwindows.zip", {
        credentials: "same-origin",
        cache: "no-store"
      });
      if (!response.ok) throw new Error(`样例读取失败（${response.status}）。`);
      const blob = await response.blob();
      await WebWindows.fileDialog.write(target, new Blob([blob], {
        type: "application/zip"
      }), { overwrite: target.overwrite });
      status.textContent = `已保存到私人云资料：${target.path}`;
      status.className = "status sample-save-status success";
    } catch (error) {
      status.textContent = error.message || "样例保存失败。";
      status.className = "status sample-save-status error";
    } finally {
      buttons.forEach((item) => { item.disabled = false; });
      button?.blur();
    }
  }

  function bindDocumentationActions() {
    document.getElementById("returnWebWindows")?.addEventListener("click", (event) => {
      try {
        if (window.parent !== window && typeof window.parent.closeWindow === "function") {
          event.preventDefault();
          window.parent.closeWindow("developer-center");
        }
      } catch (_) {
        // 独立访问时保留链接的默认首页导航。
      }
    });
    document.querySelectorAll("[data-copy-target]").forEach((button) => {
      button.addEventListener("click", async () => {
        const target = document.getElementById(button.dataset.copyTarget);
        if (!target) return;
        await navigator.clipboard.writeText(target.textContent);
        const original = button.textContent;
        button.textContent = "已复制";
        setTimeout(() => { button.textContent = original; }, 1200);
      });
    });
    document.querySelectorAll("[data-save-sample]").forEach((button) => {
      button.addEventListener("click", () => saveSampleToCloud(button));
    });
    const sections = Array.from(document.querySelectorAll("main [id]"));
    const links = Array.from(document.querySelectorAll(".side-nav a"));
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        links.forEach((link) => link.classList.toggle("active", link.hash === `#${visible.target.id}`));
      }, { rootMargin: "-20% 0px -65%", threshold: [0.05, 0.3] });
      sections.forEach((section) => observer.observe(section));
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    loadContentRelease();
    bindDocumentationActions();
    document.getElementById("submissionManifest").value = JSON.stringify(exampleManifest, null, 2);
    document.getElementById("enrollDeveloper").addEventListener("click", enroll);
    document.getElementById("rotateDeveloperKey").addEventListener("click", rotateKey);
    document.getElementById("chooseCloudPackage").addEventListener("click", openCloudPackagePicker);
    document.getElementById("manifestSubmissionForm").addEventListener("submit", submitManifest);
    document.getElementById("copyApiKey").addEventListener("click", async () => {
      await navigator.clipboard.writeText(document.getElementById("apiKeyValue").textContent);
      setStatus("API Key 已复制。", "success");
    });
    loadProfile();
  });
})();
