(function () {
  "use strict";

  const state = { release: null, articles: [], current: null };
  const sidebar = document.getElementById("guideSidebar");
  const main = document.getElementById("guideMain");
  const search = document.getElementById("guideSearch");
  const results = document.getElementById("guideSearchResults");

  function requestedTopic() {
    return new URL(location.href).searchParams.get("topic");
  }

  function articleById(id) {
    return state.articles.find((article) => article.id === id);
  }

  function statusLabel(status) {
    return { verified: "已验证", testing: "测试中", planned: "规划中" }[status] || status;
  }

  function renderNavigation() {
    const groups = new Map();
    state.articles.forEach((article) => {
      if (!groups.has(article.category)) groups.set(article.category, []);
      groups.get(article.category).push(article);
    });
    sidebar.replaceChildren();
    groups.forEach((articles, category) => {
      const section = document.createElement("section");
      section.className = "guide-nav-group";
      const heading = document.createElement("h2");
      heading.textContent = category;
      section.appendChild(heading);
      articles.forEach((article) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "guide-nav-link";
        button.dataset.topic = article.id;
        button.textContent = article.navTitle || article.title;
        button.addEventListener("click", () => openArticle(article.id));
        section.appendChild(button);
      });
      sidebar.appendChild(section);
    });
  }

  function openArticle(id, options) {
    const article = articleById(id) || state.articles[0];
    if (!article) return;
    state.current = article.id;
    sidebar.querySelectorAll(".guide-nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.topic === article.id);
    });
    main.innerHTML = `
      <article class="guide-article">
        <div class="guide-breadcrumb">${article.category} / ${article.title}</div>
        <h1>${article.title}</h1>
        <p class="guide-summary">${article.summary}</p>
        <div class="guide-meta">
          <span class="guide-chip">${statusLabel(article.status)}</span>
          <span class="guide-chip">适用版本 ${article.productVersion}</span>
          <span class="guide-chip">最后核对 ${article.lastVerified}</span>
        </div>
        <div class="guide-body">${article.html}</div>
      </article>`;
    if (!options?.skipHistory) {
      const url = new URL(location.href);
      url.searchParams.set("topic", article.id);
      history.replaceState({ topic: article.id }, "", url);
    }
    main.focus({ preventScroll: true });
    main.scrollTop = 0;
    closeResults();
  }

  function closeResults() {
    results.hidden = true;
    results.replaceChildren();
  }

  function runSearch(query) {
    const needle = query.trim().toLocaleLowerCase("zh-CN");
    if (!needle) {
      closeResults();
      return;
    }
    const matches = state.articles.filter((article) =>
      article.searchText.toLocaleLowerCase("zh-CN").includes(needle)
    ).slice(0, 12);
    results.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "guide-empty";
      empty.textContent = "没有找到相关说明。";
      results.appendChild(empty);
    }
    matches.forEach((article) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "guide-result";
      button.innerHTML = `<b>${article.title}</b><small>${article.category} · ${article.summary}</small>`;
      button.addEventListener("click", () => openArticle(article.id));
      results.appendChild(button);
    });
    results.hidden = false;
  }

  async function initialize() {
    try {
      const response = await fetch("assets/data/guide-content.json?v=20260729-1", { cache: "no-cache" });
      if (!response.ok) throw new Error(`内容请求失败（${response.status}）`);
      const payload = await response.json();
      state.release = payload.release;
      state.articles = payload.articles;
      document.getElementById("guideVersion").textContent =
        `内容版本 ${payload.release.version}`;
      renderNavigation();
      openArticle(requestedTopic() || payload.release.homeTopic, { skipHistory: true });
    } catch (error) {
      main.innerHTML = `<div class="guide-empty">使用向导暂时无法载入。<br>${error.message}</div>`;
    }
  }

  search.addEventListener("input", () => runSearch(search.value));
  search.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeResults();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      search.focus();
      search.select();
    }
  });
  document.addEventListener("click", (event) => {
    if (!results.contains(event.target) && !search.contains(event.target)) closeResults();
  });
  window.addEventListener("popstate", () => openArticle(requestedTopic(), { skipHistory: true }));

  initialize();
})();
