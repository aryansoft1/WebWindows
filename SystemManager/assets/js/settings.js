(function () {
  "use strict";
  const security = window.WebWindowsAdminSecurity;
  const el = id => document.getElementById(id);
  const api = action => `/admin_api/settings.asp?action=${encodeURIComponent(action)}`;
  function status(message) { el("settingsStatus").textContent = message; }
  async function read(action) { return security.read(api(action)).then(r => r.json()); }
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
    try {
      const [settings, logs] = await Promise.all([read("get"), read("logs")]);
      el("adminUsername").textContent = settings.username;
      el("adminNickname").value = settings.nickname || "";
      el("systemName").value = settings.system_name || "WebWindows 管理后台";
      el("idleMinutes").value = settings.admin_idle_minutes || 30;
      const tbody = el("auditRows");
      tbody.replaceChildren();
      if (!logs.length) {
        const row = tbody.insertRow();
        row.insertCell().colSpan = 4;
        row.cells[0].textContent = "暂无管理日志";
      }
      logs.forEach(item => {
        const row = tbody.insertRow();
        for (const value of [item.time, item.action, item.result, item.actor_id ?? "—"]) row.insertCell().textContent = String(value);
      });
      status("设置已加载。");
    } catch (error) { status(`设置加载失败：${error.message}`); }
  }
  el("settingsForm").addEventListener("submit", async event => {
    event.preventDefault();
    try {
      await write("save", {
        nickname: el("adminNickname").value.trim(),
        system_name: el("systemName").value.trim(),
        admin_idle_minutes: el("idleMinutes").value
      });
      status("系统设置已保存。");
      await load();
    } catch (error) { status(`保存失败：${error.message}`); }
  });
  el("passwordForm").addEventListener("submit", async event => {
    event.preventDefault();
    try {
      const result = await write("password", { old_password: el("oldPassword").value, new_password: el("newPassword").value });
      el("passwordForm").reset();
      status("管理员密码已更新，请重新登录。");
      if (result.relogin) window.top.location.replace("/SystemManager/login.html");
    } catch (error) { status(`密码更新失败：${error.message}`); }
  });
  load();
})();
