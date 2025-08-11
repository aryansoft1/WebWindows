 // 页面加载完成时执行
  window.addEventListener("DOMContentLoaded", () => {
    loadDatacenterStats(); // 动态渲染数据中心状态面板
  });

  function loadDatacenterStats() {
    fetch('/admin_api/getDatacenters.asp')
      .then(res => res.json())
      .then(data => {
        // 更新数量...
        document.getElementById("dc-running").textContent = data.filter(d => d.status === "已启用").length;
        document.getElementById("dc-maintenance").textContent = data.filter(d => d.status === "维护中").length;
        document.getElementById("dc-unknown").textContent = data.filter(d => d.status === "未知").length;

        // 确保图标被渲染
        lucide.createIcons();
      });
  }
  async function loadUserTotal() {
  const el = document.getElementById('kpi-users');
  try {
    const url = new URL('/admin_api/getUsers.asp', location.origin);
    url.searchParams.set('page', 1);
    url.searchParams.set('pageSize', 1); // 只取一条
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const total = json.length;
    el.textContent = total;
  } catch (err) {
    console.error('加载用户总数失败:', err);
    el.textContent = '--';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserTotal();
});
