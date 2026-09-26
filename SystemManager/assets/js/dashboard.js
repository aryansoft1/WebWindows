(function () {
  "use strict";
  const el = id => document.getElementById(id);
  function renderList(id, items, emptyMessage) {
    const list = el(id);
    list.replaceChildren();
    if (!items.length) items = [emptyMessage];
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }
  async function load() {
    try {
      const stats = await window.WebWindowsAdminSecurity.read("/admin_api/dashboardStats.asp").then(r => r.json());
      el("kpi-users").textContent = stats.usersTotal;
      el("kpi-files").textContent = stats.filesTotal === null ? "不可用" : stats.filesTotal;
      el("kpi-feedback").textContent = stats.feedbackPending;
      el("dc-running").textContent = stats.datacenters.enabled;
      el("dc-disabled").textContent = stats.datacenters.disabled;
      el("dc-unhealthy").textContent = stats.datacenters.unhealthy;
      renderList("recentActivities", stats.recentActivities.map(item => `${item.time} · ${item.action}`), "暂无管理活动记录");
      renderList("systemTips", stats.systemTips, "目前没有需要处理的系统提示");
      el("dashboardStatus").textContent = stats.filesTotal === null ? "主节点资料目录不可用，其余统计已更新。" : "统计已更新。";
    } catch (error) {
      el("dashboardStatus").textContent = `统计加载失败：${error.message}`;
      renderList("recentActivities", [], "活动暂不可用");
      renderList("systemTips", [], "系统提示暂不可用");
    }
  }
  load();
})();
