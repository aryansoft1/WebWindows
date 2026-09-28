(function () {
  "use strict";
  const select = document.getElementById("fileCenter");
  const frame = document.getElementById("fileManagerFrame");
  const status = document.getElementById("fileCenterStatus");
  const mainUrl = new URL("../cloud/browser/manage.html", location.href).href;
  function selectedUrl() {
    const base = select.value;
    return base ? `${base.replace(/\/+$/, "")}/manage.html` : mainUrl;
  }
  select.addEventListener("change", () => {
    frame.src = selectedUrl();
    status.textContent = select.value ? "已切换到所选节点；跨域节点若禁止嵌入，可在新标签打开。" : "已切换到主节点。";
  });
  document.getElementById("openNodeTab").addEventListener("click", () => {
    window.open(selectedUrl(), "_blank", "noopener,noreferrer");
  });
  window.WebWindowsAdminSecurity.read("/admin_api/getDatacenters.asp")
    .then(response => response.json())
    .then(data => {
      data.filter(center => center.enabled).forEach(center => {
        try {
          const url = new URL(center.api_url);
          if (url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash) {
            select.add(new Option(center.name, url.href.replace(/\/+$/, "")));
          }
        } catch (_) { /* Ignore invalid legacy node addresses. */ }
      });
      status.textContent = data.length ? "数据中心列表已加载。" : "当前只有主节点。";
    })
    .catch(error => { status.textContent = `数据中心加载失败：${error.message}`; });
})();
