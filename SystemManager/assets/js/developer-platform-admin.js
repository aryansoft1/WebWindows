(function () {
  "use strict";
  const API_URL = "/admin_api/developerPlatform.asp";
  const CATALOG_API = "/admin_api/functionCatalog.asp";
  const PLATFORM_HEADERS = { "X-WebWindows-Admin-Request": "developer-platform" };
  const CATALOG_HEADERS = { "X-WebWindows-Admin-Request": "function-catalog" };
  let developers = [];
  let submissions = [];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function setStatus(message, kind) {
    const status = document.getElementById("platformStatus");
    status.textContent = message || "";
    status.className = `status${kind ? ` ${kind}` : ""}`;
  }

  async function request(url, action, options, headers) {
    const separator = url.includes("?") ? "&" : "?";
    const response = await fetch(`${url}${separator}action=${encodeURIComponent(action)}`, {
      credentials: "same-origin", cache: "no-store", ...options,
      headers: { ...(headers || PLATFORM_HEADERS), ...(options?.headers || {}) }
    });
    const payload = await response.json();
    if (!response.ok || payload?.ok === false) {
      throw new Error(payload?.message || `请求失败（${response.status}）。`);
    }
    return payload;
  }

  function button(label, className, handler, disabled) {
    const node = element("button", className, label);
    node.type = "button";
    node.disabled = Boolean(disabled);
    node.addEventListener("click", handler);
    return node;
  }

  function emptyRow(text) {
    const row = document.createElement("tr");
    const cell = element("td", "empty", text);
    cell.colSpan = 5;
    row.appendChild(cell);
    return row;
  }

  async function setDeveloperStatus(developer, status) {
    const body = new URLSearchParams();
    body.set("developerId", developer.id);
    body.set("status", status);
    await request(API_URL, "developer-status", { method: "POST", body });
    await loadPlatform();
    setStatus(`${developer.displayName} 的开发者状态已更新。`, "success");
  }

  function renderDevelopers() {
    const tbody = document.getElementById("developerRows");
    tbody.replaceChildren();
    document.getElementById("developerCount").textContent = developers.length;
    if (!developers.length) {
      tbody.appendChild(emptyRow("暂无开发者申请。"));
      return;
    }
    developers.forEach((developer) => {
      const row = document.createElement("tr");
      const identity = document.createElement("td");
      identity.append(element("strong", "", developer.displayName), element("small", "", `ID ${developer.id}`));
      row.appendChild(identity);
      row.appendChild(element("td", "", developer.username || `用户 ${developer.userId}`));
      row.appendChild(element("td", "", developer.keyPrefix ? `${developer.keyPrefix}…` : "尚未生成"));
      const statusCell = document.createElement("td");
      statusCell.appendChild(element("span", `badge ${developer.status}`, developer.status));
      row.appendChild(statusCell);
      const actionCell = document.createElement("td");
      const actions = element("div", "actions");
      actions.append(
        button("批准", "primary", () => setDeveloperStatus(developer, "approved"), developer.status === "approved"),
        button("暂停并撤钥", "danger", () => setDeveloperStatus(developer, "suspended"), developer.status === "suspended"),
        button("改为待审", "", () => setDeveloperStatus(developer, "pending"), developer.status === "pending")
      );
      actionCell.appendChild(actions);
      row.appendChild(actionCell);
      tbody.appendChild(row);
    });
  }

  function viewManifest(submission) {
    document.getElementById("manifestTitle").textContent =
      `${submission.appId} ${submission.version}`;
    document.getElementById("manifestContent").textContent =
      JSON.stringify(submission.manifest, null, 2);
    document.getElementById("manifestDialog").showModal();
  }

  function viewValidationReport(submission) {
    document.getElementById("manifestTitle").textContent =
      submission.appId + " " + submission.version + " · Server Validation";
    document.getElementById("manifestContent").textContent =
      JSON.stringify(submission.validationReport, null, 2);
    document.getElementById("manifestDialog").showModal();
  }

  async function downloadPackage(submission) {
    setStatus(`正在读取 ${submission.appId} ${submission.version} 的隔离功能包……`);
    const response = await fetch(
      `/admin_api/developerPackage.asp?submissionId=${encodeURIComponent(submission.id)}`,
      { credentials: "same-origin", cache: "no-store", headers: PLATFORM_HEADERS }
    );
    if (!response.ok) {
      let message = `功能包读取失败（${response.status}）。`;
      try { message = (await response.json()).message || message; } catch (_) {}
      throw new Error(message);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${submission.appId}-${submission.version}.zip`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("功能包已下载；请继续在隔离环境中检查内容。", "success");
  }

  async function setSubmissionStatus(submission, status, note, approvedPermissions) {
    const body = new URLSearchParams();
    body.set("submissionId", submission.id);
    body.set("status", status);
    body.set("note", note || "");
    body.set("approvedPermissionsJson", JSON.stringify(approvedPermissions || []));
    await request(API_URL, "submission-status", { method: "POST", body });
  }

  async function reviewSubmission(submission, status) {
    const requested = Array.isArray(submission.validationReport?.requestedPermissions)
      ? submission.validationReport.requestedPermissions : [];
    const approved = status === "approved"
      ? requested.filter((permission) => window.confirm(
          `批准权限 ${permission} 吗？\n\nReview approved ≠ Runtime enabled；当前 Production Broker 仍保持禁用。`
        ))
      : [];
    const note = window.prompt(
      status === "approved" ? "审核说明（可留空）" : "请填写驳回原因",
      status === "approved" ? "Manifest 审核通过" : ""
    );
    if (note == null) return;
    if (status === "rejected" && !note.trim()) {
      window.alert("驳回时必须填写原因。");
      return;
    }
    await setSubmissionStatus(submission, status, note, approved);
    await loadPlatform();
    setStatus(`${submission.appId} 已${status === "approved" ? "批准" : "驳回"}。`, "success");
  }

  function catalogVersion() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}.${pad(now.getHours())}${pad(now.getMinutes())}`;
  }

  function packageEntry(manifest) {
    const entry = String(manifest.entry || "index.html").replace(/\\/g, "/").replace(/^\.\/+/, "");
    if (!entry || entry.startsWith("/") || /^[a-z]+:/i.test(entry) ||
        entry.split("/").some((part) => !part || part === "." || part === "..") ||
        !/\.html?$/i.test(entry)) {
      throw new Error("功能包入口必须是 ZIP 内部安全的 HTML 相对路径。");
    }
    return entry;
  }

  async function publishSubmission(submission) {
    if (!window.confirm(`将 ${submission.appId} ${submission.version} 发布到功能仓库吗？`)) return;
    setStatus("正在合并 Manifest 并发布功能目录……");
    const catalogPayload = await request(CATALOG_API, "", null, CATALOG_HEADERS);
    const catalog = structuredClone(catalogPayload.catalog);
    const manifest = structuredClone(submission.manifest);
    const originalEntry = packageEntry(manifest);
    manifest.catalog = { ...(manifest.catalog || {}), status: "published" };
    manifest.package = {
      format: "zip",
      size: submission.packageSize,
      sha256: submission.packageSha256,
      entry: originalEntry,
      downloadUrl: `/api/function-package.asp?appId=${encodeURIComponent(submission.appId)}&version=${encodeURIComponent(submission.version)}`
    };
    manifest.entry = `/package-runtime.html?runtime=1&appId=${encodeURIComponent(submission.appId)}` +
      `&version=${encodeURIComponent(submission.version)}&entry=${encodeURIComponent(originalEntry)}`;
    manifest.window = {
      ...(manifest.window || {}),
      mode: "iframe"
    };
    manifest.runtime = {
      model: "browser-zip-sandbox-v1",
      network: "none",
      sameOrigin: false
    };
    const index = catalog.apps.findIndex((app) => app.id === manifest.id);
    if (index >= 0) catalog.apps[index] = manifest;
    else catalog.apps.push(manifest);
    const version = catalogVersion();
    catalog.repository = {
      ...(catalog.repository || {}),
      catalogVersion: version,
      updatedAt: new Date().toISOString()
    };
    const body = new URLSearchParams();
    body.set("version", version);
    body.set("note", `开发者提交：${submission.appId} ${submission.version}`);
    body.set("catalogJson", JSON.stringify(catalog));
    body.set("submissionId", submission.id);
    await request(API_URL, "publish-release", { method: "POST", body });
    await loadPlatform();
    setStatus(`${submission.appId} ${submission.version} 已发布。`, "success");
  }

  async function revokeSubmission(submission) {
    if (!window.confirm("撤销提交状态不会自动删除服务器程序文件，确定继续吗？")) return;
    const body = new URLSearchParams();
    body.set("submissionId", submission.id);
    body.set("status", "revoked");
    body.set("note", "管理员撤销发布");
    await request(API_URL, "release-status", { method: "POST", body });
    await loadPlatform();
    setStatus(`${submission.appId} 已标记为撤销；如需下架，请同时在功能仓库操作。`);
  }

  function renderSubmissions() {
    const tbody = document.getElementById("submissionRows");
    tbody.replaceChildren();
    document.getElementById("submissionCount").textContent = submissions.length;
    if (!submissions.length) {
      tbody.appendChild(emptyRow("暂无功能提交。"));
      return;
    }
    submissions.forEach((submission) => {
      const row = document.createElement("tr");
      const appCell = document.createElement("td");
      appCell.append(element("strong", "", submission.appId), element("small", "", submission.version));
      row.appendChild(appCell);
      row.appendChild(element("td", "", submission.developerName || submission.username));
      const integrityCell = document.createElement("td");
      integrityCell.append(
        element("strong", submission.packageReady ? "package-ready" : "package-missing",
          submission.packageReady
            ? `已上传 · ${Math.ceil(submission.packageSize / 1024)} KB`
            : "等待上传"),
        element("small", "", `${submission.integritySha256.slice(0, 16)}…`),
        element("small", "", "Server validation: " + (submission.validationStatus || "not-validated")),
        element("small", "", "Requested: " +
          ((submission.validationReport?.requestedPermissions || []).join(", ") || "none")),
        element("small", "", submission.reviewDecision
          ? `Review ${submission.reviewDecision.reviewDecisionId}: ${submission.reviewDecision.decision}`
          : "Review: none"),
        element("small", "", submission.reviewDecision
          ? `Approved: ${submission.reviewDecision.approvedPermissions.join(", ") || "none"}; Denied: ${submission.reviewDecision.deniedPermissions.join(", ") || "none"}`
          : "Review approved ≠ Runtime enabled"),
        element("small", "", submission.publishedRelease
          ? `Release ${submission.publishedRelease.publishedReleaseId}: ${submission.publishedRelease.releaseStatus}`
          : "Published release: none"),
        element("small", "", `Package SHA: ${submission.packageSha256 || "none"}`)
      );
      row.appendChild(integrityCell);
      const statusCell = document.createElement("td");
      statusCell.appendChild(element("span", `badge ${submission.status}`, submission.status));
      row.appendChild(statusCell);
      const actionCell = document.createElement("td");
      const actions = element("div", "actions");
      actions.appendChild(button("查看 Manifest", "", () => viewManifest(submission)));
      actions.appendChild(button(
        "验证报告", "", () => viewValidationReport(submission), !submission.validationReport
      ));
      actions.appendChild(button(
        "下载隔离包", "", () => downloadPackage(submission).catch((error) => setStatus(error.message, "error")),
        !submission.packageReady
      ));
      actions.appendChild(button(
        "批准", "primary", () => reviewSubmission(submission, "approved"),
        !submission.serverValidated ||
          (submission.status !== "submitted" && submission.status !== "rejected")
      ));
      actions.appendChild(button(
        "驳回", "danger", () => reviewSubmission(submission, "rejected"),
        submission.status !== "submitted" && submission.status !== "approved"
      ));
      actions.appendChild(button(
        "发布到仓库", "primary", () => publishSubmission(submission),
        submission.status !== "approved"
      ));
      actions.appendChild(button(
        "撤销", "danger", () => revokeSubmission(submission),
        submission.status !== "published"
      ));
      actionCell.appendChild(actions);
      row.appendChild(actionCell);
      tbody.appendChild(row);
    });
  }

  async function loadPlatform() {
    setStatus("正在读取开发者与功能提交……");
    try {
      const [developerPayload, submissionPayload] = await Promise.all([
        request(API_URL, "developers"),
        request(API_URL, "submissions")
      ]);
      developers = developerPayload.developers || [];
      submissions = submissionPayload.submissions || [];
      renderDevelopers();
      renderSubmissions();
      setStatus("");
    } catch (error) {
      setStatus(error.message || "开发者平台读取失败。", "error");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("refreshPlatform").addEventListener("click", loadPlatform);
    loadPlatform();
  });
})();
