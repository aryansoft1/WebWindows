(function () {
  "use strict";
  let centers = [];
  let currentEditId = null;
  const security = window.WebWindowsAdminSecurity;
  const status = () => document.getElementById("dataCenterStatus");
  const field = id => document.getElementById(id);

  async function parse(response) {
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || data.message || `HTTP ${response.status}`);
    return data;
  }
  async function mutation(url, fields) {
    const options = await security.authorize({
      body: new URLSearchParams(fields),
      headers: { "X-WebWindows-Admin-Request": "system-manager" }
    });
    return parse(await fetch(url, options));
  }
  async function load() {
    status().textContent = "正在加载数据中心…";
    try {
      centers = await security.read("/admin_api/getDatacenters.asp").then(r => r.json());
      render();
      status().textContent = centers.length ? `共 ${centers.length} 个数据中心` : "暂无数据中心";
    } catch (error) {
      status().textContent = `加载失败：${error.message}`;
    }
  }
  function addCell(row, value) {
    const cell = document.createElement("td");
    cell.className = "p-2 border";
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }
  function button(label, action) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "text-blue-600 hover:underline mr-2";
    item.textContent = label;
    item.addEventListener("click", action);
    return item;
  }
  function render() {
    const tbody = field("dataCenterTableBody");
    tbody.replaceChildren();
    centers.forEach(center => {
      const row = document.createElement("tr");
      addCell(row, center.name || "");
      addCell(row, center.api_url || "");
      addCell(row, `${center.enabled ? "已启用" : "已停用"} · ${center.user_quota_mb} MB${center.api_key_configured ? " · Key 已配置" : ""}`);
      addCell(row, `${center.status || "未检测"}${center.last_check_time ? ` · ${center.last_check_time}` : ""}${center.last_check_detail ? ` · ${center.last_check_detail}` : ""}`);
      const actions = addCell(row, "");
      actions.append(
        button("编辑", () => edit(center)),
        button("检测", () => check(center)),
        button("删除", () => remove(center))
      );
      tbody.appendChild(row);
    });
  }
  function open(center = null) {
    currentEditId = center?.id || null;
    field("centerName").value = center?.name || "";
    field("centerURL").value = center?.api_url || "";
    field("centerApiKey").value = "";
    field("centerApiKey").placeholder = center?.api_key_configured ? "已配置；留空保持原值" : "尚未配置";
    field("centerDescription").value = center?.description || "";
    field("centerQuota").value = center?.user_quota_mb || 1024;
    field("centerEnabled").value = center?.enabled === false ? "0" : "1";
    field("dataCenterModal").classList.remove("hidden");
  }
  function edit(center) { open(center); }
  function close() { field("dataCenterModal").classList.add("hidden"); }
  async function save(event) {
    event.preventDefault();
    try {
      await mutation("/admin_api/saveDatacenter.asp", {
        id: currentEditId || "",
        name: field("centerName").value.trim(),
        api_url: field("centerURL").value.trim(),
        api_key: field("centerApiKey").value,
        description: field("centerDescription").value.trim(),
        user_quota_mb: field("centerQuota").value,
        enabled: field("centerEnabled").value
      });
      close();
      await load();
      status().textContent = "数据中心已保存。";
    } catch (error) {
      status().textContent = `保存失败：${error.message}`;
    }
  }
  async function check(center) {
    status().textContent = `正在检测 ${center.name}…`;
    try {
      const result = await mutation("/admin_api/checkDatacenter.asp", { id: String(center.id) });
      await load();
      status().textContent = `${center.name}：${result.detail}`;
    } catch (error) {
      status().textContent = `检测失败：${error.message}`;
    }
  }
  async function remove(center) {
    if (!confirm(`确定删除 ${center.name}？`)) return;
    try {
      await mutation("/admin_api/deleteDatacenter.asp", { id: String(center.id) });
      await load();
      status().textContent = "数据中心已删除。";
    } catch (error) {
      status().textContent = `删除失败：${error.message}`;
    }
  }
  window.openDataCenterForm = () => open();
  window.closeDataCenterForm = close;
  document.addEventListener("DOMContentLoaded", () => {
    field("dataCenterForm").addEventListener("submit", save);
    load();
  });
})();
