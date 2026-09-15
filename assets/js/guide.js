(function () {
  "use strict";

  const state = { release: null, articles: [], current: null };
  const sidebar = document.getElementById("guideSidebar");
  const main = document.getElementById("guideMain");
  const search = document.getElementById("guideSearch");
  const results = document.getElementById("guideSearchResults");
  const menuButton = document.getElementById("guideMenuButton");

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function safeLocalUrl(value) {
    return /^[a-z0-9][a-z0-9./?&=_#%-]*$/i.test(value || "") && !String(value).includes("..") ? value : "";
  }

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
    const openUrl = safeLocalUrl(article.openUrl);
    const mediaUrl = safeLocalUrl(article.media);
    state.current = article.id;
    sidebar.querySelectorAll(".guide-nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.topic === article.id);
    });
    main.innerHTML = `
      <article class="guide-article">
        <div class="guide-breadcrumb">${escapeHtml(article.category)} / ${escapeHtml(article.title)}</div>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="guide-summary">${escapeHtml(article.summary)}</p>
        <div class="guide-meta">
          <span class="guide-chip">${escapeHtml(statusLabel(article.status))}</span>
          <span class="guide-chip">适用版本 ${escapeHtml(article.productVersion)}</span>
          <span class="guide-chip">最后核对 ${escapeHtml(article.lastVerified)}</span>
        </div>
        <figure class="guide-figure">
          <img src="${escapeHtml(mediaUrl)}" alt="${escapeHtml(article.mediaAlt)}" loading="lazy" decoding="async">
          <figcaption>${escapeHtml(article.mediaCaption)}</figcaption>
        </figure>
        ${openUrl ? `<button class="guide-open-action" type="button" data-open-url="${escapeHtml(openUrl)}" data-app-id="${escapeHtml(article.openApp || article.covers[0] || "")}">打开该功能</button>` : ""}
        <div class="guide-body">${article.html}</div>
        <footer class="guide-evidence"><b>核对依据</b><span>${article.testedBy.map(escapeHtml).join(" · ")}</span></footer>
      </article>`;
    main.querySelector("[data-open-url]")?.addEventListener("click", (event) =>
      openFeature(event.currentTarget.dataset.openUrl, event.currentTarget.dataset.appId)
    );
    if (!options?.skipHistory) {
      const url = new URL(location.href);
      url.searchParams.set("topic", article.id);
      history.replaceState({ topic: article.id }, "", url);
    }
    main.focus({ preventScroll: true });
    main.scrollTop = 0;
    sidebar.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    closeResults();
  }

  async function openFeature(url, appId) {
    const host = window.parent && window.parent !== window ? window.parent : window;
    try {
      if (host.WebWindows?.apps?.launch && appId) {
        await host.WebWindows.apps.launch(appId, { url });
      } else if (host.openWindow) {
        host.openWindow(`guide-${Date.now()}`, "WebWindows", url, "assets/icons/guide.svg", true);
      } else {
        window.location.href = url;
      }
    } catch (_error) {
      window.location.href = url;
    }
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
      button.setAttribute("role", "option");
      button.innerHTML = `<b>${escapeHtml(article.title)}</b><small>${escapeHtml(article.category)} · ${escapeHtml(article.summary)}</small>`;
      button.addEventListener("click", () => openArticle(article.id));
      results.appendChild(button);
    });
    results.hidden = false;
  }

  async function initialize() {
    try {
      const response = await fetch("assets/data/guide-content.json?v=20260915-1", { cache: "no-cache" });
      if (!response.ok) throw new Error(`内容请求失败（${response.status}）`);
      const payload = await response.json();
      state.release = payload.release;
      state.articles = payload.articles;
      document.getElementById("guideVersion").textContent =
        `更新 ${payload.release.updatedAt} · ${payload.release.coverage.coveredApps}/${payload.release.coverage.registeredApps} 个功能`;
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
  menuButton.addEventListener("click", () => {
    const open = sidebar.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  window.addEventListener("popstate", () => openArticle(requestedTopic(), { skipHistory: true }));

  initialize();
})();
