(function () {
  "use strict";
  const security = window.WebWindowsAdminSecurity;
  const el = id => document.getElementById(id);
  const api = action => `/admin_api/feedback.asp?action=${encodeURIComponent(action)}`;
  let currentId = null;
  function status(message) { el("feedbackStatus").textContent = message; }
  function query(action) {
    const url = new URL(api(action), location.origin);
    if (action === "list" || action === "export") {
      url.searchParams.set("status", el("filterStatus").value);
      url.searchParams.set("urgency", el("filterUrgency").value);
    }
    return url;
  }
  async function write(action, values) {
    const options = await security.authorize({
      body: new URLSearchParams(values),
      headers: { "X-WebWindows-Admin-Request": "system-manager" }
    });
    const response = await fetch(api(action), options);
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || result.message || `HTTP ${response.status}`);
    return result;
  }
  async function load() {
    status("正在加载咨询…");
    try {
      const data = await security.read(query("list")).then(r => r.json());
      const tbody = el("feedbackRows");
      tbody.replaceChildren();
      if (!data.length) {
        const row = tbody.insertRow();
        row.insertCell().colSpan = 9;
        row.cells[0].textContent = "暂无符合条件的咨询";
      }
      data.forEach(item => {
        const row = tbody.insertRow();
        for (const value of [item.id, item.submitter, item.contact, item.subject, item.created_at, item.urgency, item.rating || "—", item.status]) {
          row.insertCell().textContent = String(value || "");
        }
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "详情 / 回复";
        button.addEventListener("click", () => open(item.id));
        row.insertCell().appendChild(button);
      });
      status(data.length ? `共 ${data.length} 条咨询` : "暂无咨询");
    } catch (error) { status(`咨询加载失败：${error.message}`); }
  }
  async function open(id) {
    currentId = id;
    try {
      const url = new URL(api("detail"), location.origin);
      url.searchParams.set("id", String(id));
      const item = await security.read(url).then(r => r.json());
      el("feedbackTitle").textContent = `咨询 #${item.id} · ${item.subject}`;
      el("feedbackContact").textContent = `${item.submitter} · ${item.contact}`;
      el("editStatus").value = item.status;
      el("editUrgency").value = item.urgency;
      el("editRating").value = item.rating || "";
      const list = el("feedbackHistory");
      list.replaceChildren();
      item.messages.forEach(message => {
        const li = document.createElement("li");
        const heading = document.createElement("strong");
        heading.textContent = `${message.author_role === "admin" ? "管理员" : item.submitter} · ${message.created_at}`;
        const body = document.createElement("div");
        body.textContent = message.body;
        li.append(heading, body);
        if (message.attachment_url) {
          const link = document.createElement("a");
          link.href = message.attachment_url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "查看附件";
          li.appendChild(link);
        }
        list.appendChild(li);
      });
      el("feedbackDialog").hidden = false;
    } catch (error) { status(`详情加载失败：${error.message}`); }
  }
  async function update(event) {
    event.preventDefault();
    try {
      await write("update", { id: String(currentId), status: el("editStatus").value, urgency: el("editUrgency").value, rating: el("editRating").value });
      await load();
      status("咨询状态已保存。");
    } catch (error) { status(`保存失败：${error.message}`); }
  }
  async function reply(event) {
    event.preventDefault();
    try {
      await write("reply", { id: String(currentId), body: el("replyBody").value.trim(), attachment_url: el("replyAttachment").value.trim() });
      el("replyBody").value = "";
      el("replyAttachment").value = "";
      await open(currentId);
      await load();
      status("回复已保存。");
    } catch (error) { status(`回复失败：${error.message}`); }
  }
  async function exportCsv() {
    status("正在生成 CSV…");
    try {
      const response = await security.read(query("export"));
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = "webwindows-feedback.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      status("CSV 已导出。");
    } catch (error) { status(`导出失败：${error.message}`); }
  }
  el("filterStatus").addEventListener("change", load);
  el("filterUrgency").addEventListener("change", load);
  el("exportFeedback").addEventListener("click", exportCsv);
  el("feedbackMetaForm").addEventListener("submit", update);
  el("feedbackReplyForm").addEventListener("submit", reply);
  el("closeFeedback").addEventListener("click", () => { el("feedbackDialog").hidden = true; });
  load();
})();
