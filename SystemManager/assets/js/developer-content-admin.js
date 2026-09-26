(function () {
  "use strict";
  const security = window.WebWindowsAdminSecurity;
  const el = id => document.getElementById(id);
  const api = action => `/admin_api/developerContent.asp?action=${encodeURIComponent(action)}`;
  let draftId = null;
  function status(message) { el("developerContentStatus").textContent = message; }
  async function read(action, id) {
    const url = new URL(api(action), location.origin);
    if (id) url.searchParams.set("id", String(id));
    return security.read(url, "developer-platform").then(response => response.json());
  }
  async function write(action, data) {
    const options = await security.authorize({
      body: new URLSearchParams(data),
      headers: { "X-WebWindows-Admin-Request": "developer-platform" }
    });
    const response = await fetch(api(action), options);
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || result.message || `HTTP ${response.status}`);
    return result;
  }
  function makeButton(label, handler, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  }
  function resetForm() {
    draftId = null;
    el("developerContentForm").reset();
    el("contentFormTitle").textContent = "新建内容草稿";
    el("contentType").disabled = false;
    el("contentSlug").readOnly = false;
  }
  function fillForm(item, editDraft) {
    draftId = editDraft ? item.id : null;
    el("contentFormTitle").textContent = editDraft ? `编辑草稿 v${item.version}` : `新建 ${item.slug} 的下一版本草稿`;
    el("contentType").value = item.type;
    el("contentType").disabled = editDraft;
    el("contentSlug").value = item.slug;
    el("contentSlug").readOnly = editDraft;
    el("contentTitle").value = item.title;
    el("contentBody").value = item.body;
    el("contentSampleUrl").value = item.sampleUrl || "";
    el("developerContentForm").scrollIntoView({ block: "start", behavior: "smooth" });
  }
  async function preview(item) {
    try {
      const content = await read("preview", item.id);
      el("contentPreviewTitle").textContent = `${content.title} · v${content.version} · ${content.status}`;
      el("contentPreviewBody").textContent = content.body + (content.sampleUrl ? `\n\n样例：${content.sampleUrl}` : "");
      el("contentPreviewDialog").showModal();
    } catch (error) { status(`预览失败：${error.message}`); }
  }
  async function transition(action, item) {
    const verb = { publish:"发布", unpublish:"下线", rollback:"回滚到" }[action];
    if (!confirm(`确定${verb} ${item.slug} v${item.version}？`)) return;
    try {
      await write(action, { id: String(item.id) });
      await load();
      status(`${item.slug} ${verb}操作已完成。`);
    } catch (error) { status(`${verb}失败：${error.message}`); }
  }
  function render(items) {
    const tbody = el("contentVersionRows");
    tbody.replaceChildren();
    if (!items.length) {
      const row = tbody.insertRow();
      row.insertCell().colSpan = 5;
      row.cells[0].textContent = "暂无内容版本，可在上方创建草稿。";
    }
    items.forEach(item => {
      const row = tbody.insertRow();
      for (const value of [`${item.type} / ${item.slug}`, item.title, `v${item.version}`, item.status]) row.insertCell().textContent = value;
      const actions = row.insertCell();
      actions.className = "actions";
      actions.appendChild(makeButton("预览", () => preview(item)));
      if (item.status === "draft") {
        actions.append(makeButton("编辑草稿", () => fillForm(item, true)), makeButton("发布", () => transition("publish", item), "primary"));
      } else {
        actions.appendChild(makeButton("作为新草稿", () => fillForm(item, false)));
        if (item.status === "published") actions.appendChild(makeButton("下线", () => transition("unpublish", item), "danger"));
        else actions.appendChild(makeButton("回滚", () => transition("rollback", item)));
      }
    });
  }
  async function load() {
    status("正在读取内容版本…");
    try {
      const items = await read("list");
      render(items);
      status(items.length ? `共 ${items.length} 个内容版本。` : "暂无内容版本。");
    } catch (error) { status(`内容版本加载失败：${error.message}`); }
  }
  el("developerContentForm").addEventListener("submit", async event => {
    event.preventDefault();
    try {
      await write("save-draft", {
        id: draftId || "", content_type: el("contentType").value,
        slug: el("contentSlug").value.trim(), title: el("contentTitle").value.trim(),
        body: el("contentBody").value.trim(), sample_url: el("contentSampleUrl").value.trim()
      });
      resetForm();
      await load();
      status("草稿已保存。");
    } catch (error) { status(`草稿保存失败：${error.message}`); }
  });
  el("newContentDraft").addEventListener("click", resetForm);
  load();
})();
