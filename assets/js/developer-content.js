(function () {
  "use strict";
  const target = {
    document: document.getElementById("publishedDocuments"),
    sample: document.getElementById("publishedSamples"),
    announcement: document.getElementById("publishedAnnouncements")
  };
  const status = document.getElementById("publishedContentStatus");
  fetch("/developer_content.asp", { cache: "no-store", credentials: "same-origin" })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(items => {
      Object.values(target).forEach(host => host.replaceChildren());
      if (!items.length) {
        status.textContent = "暂无新增的正式发布内容；上方基础文档和样例仍可使用。";
        return;
      }
      items.forEach(item => {
        const host = target[item.type];
        if (!host) return;
        const article = document.createElement("article");
        article.className = "published-content-card";
        const title = document.createElement("h3");
        title.textContent = item.title;
        const meta = document.createElement("small");
        meta.textContent = `版本 ${item.version} · ${item.publishedAt}`;
        const body = document.createElement("p");
        body.textContent = item.body;
        article.append(title, meta, body);
        if (item.type === "sample" && /^developer-samples\/[a-z0-9/_-]+\.zip$/.test(item.sampleUrl || "")) {
          const link = document.createElement("a");
          link.href = item.sampleUrl;
          link.textContent = "查看样例 ZIP";
          article.appendChild(link);
        }
        host.appendChild(article);
      });
      status.textContent = `已加载 ${items.length} 项正式发布内容。`;
    })
    .catch(error => { status.textContent = `新增内容暂不可用：${error.message}`; });
})();
