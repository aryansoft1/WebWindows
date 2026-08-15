(function () {
  "use strict";
  const list = document.getElementById("news-list");
  const search = document.getElementById("news-search");
  const categories = document.getElementById("news-categories");
  const summary = document.getElementById("news-result-summary");
  const title = document.getElementById("news-section-title");
  const sort = document.getElementById("news-sort");
  let records = [];
  let category = "全部";
  const initialQuery = new URL(location.href).searchParams;
  search.value = initialQuery.get("q") || "";
  const requestedCategory = initialQuery.get("category");
  if (requestedCategory && categories.querySelector(`button[data-category="${CSS.escape(requestedCategory)}"]`)) {
    category = requestedCategory;
    categories.querySelectorAll("button").forEach(item => item.classList.toggle("active", item.dataset.category === category));
  }

  function normalized(value) { return String(value || "").trim().toLocaleLowerCase("zh-CN"); }
  function dateValue(value) { const time = Date.parse(String(value || "").replace(" ", "T")); return Number.isNaN(time) ? 0 : time; }
  function displayDate(value) { const time = dateValue(value); return time ? new Date(time).toLocaleDateString() : String(value || "").split(" ")[0]; }

  function render() {
    const needle = normalized(search.value);
    const visible = records.filter(item => {
      const categoryMatches = category === "全部" || String(item.category || "") === category;
      const textMatches = !needle || normalized(`${item.title} ${item.category}`).includes(needle);
      return categoryMatches && textMatches;
    }).sort((a, b) => (sort.value === "oldest" ? 1 : -1) * (dateValue(a.created_at) - dateValue(b.created_at)));
    list.replaceChildren();
    title.textContent = category === "全部" ? "全部新闻" : category;
    summary.textContent = needle ? `找到 ${visible.length} 条相关内容` : `共 ${visible.length} 条内容`;
    if (!visible.length) {
      const empty = document.createElement("div"); empty.className = "news-empty";
      empty.textContent = "没有找到符合条件的新闻，请尝试其他关键词或分类。"; list.appendChild(empty); return;
    }
    visible.forEach(item => {
      const link = document.createElement("a"); link.className = "news-article"; link.href = `news_view.html?id=${encodeURIComponent(item.id)}&v=20260815-help-detail-2`;
      const main = document.createElement("div"); main.className = "news-article-main";
      const icon = document.createElement("span"); icon.className = "news-article-icon"; icon.setAttribute("aria-hidden", "true"); icon.textContent = "▤";
      const copy = document.createElement("div"); copy.className = "news-article-copy";
      const heading = document.createElement("h3"); heading.textContent = item.title || "未命名新闻";
      const description = document.createElement("p"); description.textContent = "查看这篇 WebWindows 新闻或公告的完整内容。";
      copy.append(heading, description); main.append(icon, copy);
      const meta = document.createElement("div"); meta.className = "news-article-meta";
      const badge = document.createElement("span"); badge.className = "news-category-badge"; badge.textContent = item.category || "新闻";
      const date = document.createElement("time"); date.textContent = displayDate(item.created_at);
      const arrow = document.createElement("span"); arrow.className = "news-arrow"; arrow.setAttribute("aria-hidden", "true"); arrow.textContent = "›";
      meta.append(badge, date, arrow); link.append(main, meta); list.appendChild(link);
    });
  }

  categories.addEventListener("click", event => {
    const button = event.target.closest("button[data-category]"); if (!button) return;
    category = button.dataset.category; categories.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button)); render();
  });
  search.addEventListener("input", render); sort.addEventListener("change", render);
  fetch("getNews.asp", { credentials: "same-origin" }).then(response => {
    if (!response.ok) throw new Error(`news-${response.status}`); return response.json();
  }).then(data => { records = Array.isArray(data) ? data : []; render(); }).catch(error => {
    console.error("加载新闻失败:", error); list.replaceChildren(); const message = document.createElement("div"); message.className = "news-error"; message.textContent = "新闻暂时无法加载，请稍后重试。"; list.appendChild(message); summary.textContent = "加载失败";
  });
})();
