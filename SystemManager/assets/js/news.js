(function () {
  "use strict";
  const security = window.WebWindowsAdminSecurity;
  const el = id => document.getElementById(id);
  let items = [];
  let categories = [];
  let editId = null;
  let contentLoaded = false;
  let editorRequest = 0;
  const richContent = window.WebWindowsNewsContent;
  const endpoint = (action, params = {}) => `/admin_api/news.asp?${new URLSearchParams({ action, ...params })}`;
  function report(message) { el("newsStatus").textContent = message; }
  async function read(action, params) {
    const response = await security.read(endpoint(action, params));
    const body = await response.json();
    // 接口失败时把服务端给的原因带出来。旧版只有 "HTTP 500"，
    // 管理员既不知道是列名错了还是连接断了，也无从判断该不该重试。
    if (!response.ok || body?.ok === false) {
      throw new Error(body?.message || body?.error || `HTTP ${response.status}`);
    }
    return body;
  }
  async function write(action, data) {
    const options = await security.authorize({
      body: new URLSearchParams(data),
      headers: { "X-WebWindows-Admin-Request": "system-manager" }
    });
    const response = await fetch(endpoint(action), options);
    const body = await response.json();
    if (!response.ok || !body.success) throw new Error(body.error || body.message || `HTTP ${response.status}`);
    return body;
  }
  function button(label, onClick, danger = false) {
    const element = document.createElement("button");
    element.type = "button";
    element.textContent = label;
    if (danger) element.className = "danger";
    element.addEventListener("click", onClick);
    return element;
  }
  function render() {
    const rows = el("newsRows");
    rows.replaceChildren();
    const selected = el("newsFilter").value;
    const visible = items.filter(item => !selected || item.category === selected);
    if (!visible.length) {
      const row = rows.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 4;
      // 库里明明有新闻却一条都读不出来时，必须把话说清楚，
      // 不能只留一句「暂无符合条件的新闻」让人以为是真的没有。
      cell.textContent = selected
        ? `分类「${selected}」下没有新闻。`
        : (items.length
          ? "新闻筛选后为空。"
          : "没有读到任何新闻。若分类显示「有条数」但这里为空，说明列表接口没有返回数据，请刷新后查看状态行的原因。");
    }
    visible.forEach(item => {
      const row = rows.insertRow();
      for (const value of [item.title, item.category, item.publish_at]) row.insertCell().textContent = value || "";
      const actions = row.insertCell();
      actions.className = "actions";
      actions.append(button("编辑", () => openNews(item)), button("删除", () => removeNews(item), true));
    });
    report(`显示 ${visible.length} 条新闻（库中共 ${items.length} 条）`);
  }
  function renderCategories() {
    const filter = el("newsFilter");
    const selected = filter.value;
    filter.replaceChildren(new Option("全部", ""));
    const categoryInput = el("newsCategory");
    categoryInput.replaceChildren();
    const list = el("categoryList");
    list.replaceChildren();
    categories.forEach(category => {
      filter.add(new Option(category.name, category.name));
      categoryInput.add(new Option(category.name, String(category.id)));
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = category.name;
      const usage = document.createElement("span");
      usage.className = "usage";
      // 分类名与新闻的 category 是两份数据，对不上时筛选项会让人误以为
      // “没有新闻”。这里直接把每个分类的新闻条数摆出来。
      usage.textContent = category.newsCount
        ? `（${category.newsCount} 条新闻）`
        : "（暂无新闻使用）";
      name.append(usage);
      li.append(name, button("重命名", () => renameCategory(category)),
        button("删除", () => removeCategory(category), true));
      list.appendChild(li);
    });
    filter.value = selected;
    renderHint();
  }
  function renderHint() {
    const hint = el("newsHint");
    const unused = categories.filter(category => !category.newsCount).map(category => category.name);
    const usedInNews = [...new Set(items.map(item => item.category))].filter(name => name && !categories.some(category => category.name === name));
    if (!unused.length && !usedInNews.length) { hint.hidden = true; return; }
    const parts = [];
    if (usedInNews.length) parts.push(`新闻使用了分类表中没有的分类：${usedInNews.join("、")}。`);
    if (unused.length) parts.push(`以下分类没有任何新闻使用，确认后可删除：${unused.join("、")}。`);
    hint.textContent = parts.join(" ");
    hint.hidden = false;
  }
  async function reload() {
    report("正在加载新闻…");
    try {
      [items, categories] = await Promise.all([read("list"), read("categories")]);
      renderCategories();
      render();
    } catch (error) {
      report(`新闻加载失败：${error.message}`);
    }
  }
  async function openNews(item = null) {
    const request = ++editorRequest;
    contentLoaded = false;
    el("newsSave").disabled = true;
    el("newsContent").contentEditable = "false";
    richContent.load(el("newsContent"), "");
    el("newsEditorStatus").textContent = item ? "正在读取已保存的正文…" : "";
    el("newsModal").hidden = false;
    editId = item?.id || null;
    el("newsModalTitle").textContent = item ? "编辑新闻" : "发布新闻";
    try {
      const record = item ? await read("get", { id: String(item.id) }) : null;
      if (request !== editorRequest) return;
      if (item && (typeof record?.content !== "string" || !record.content.trim())) {
        throw new Error("已保存的正文未完整读取，已停止编辑，请稍后重试。");
      }
      el("newsTitle").value = record?.title || "";
      const selectedCategory = record
        ? categories.find(category => category.name === record.category)
        : categories[0];
      el("newsCategory").value = selectedCategory ? String(selectedCategory.id) : "";
      el("newsPublishAt").value = record?.publish_at?.replace(" ", "T") || "";
      richContent.load(el("newsContent"), record?.content || "");
      contentLoaded = true;
      el("newsContent").contentEditable = "true";
      el("newsSave").disabled = false;
      el("newsEditorStatus").textContent = record ? "正文已加载。" : "支持标题、列表、强调和链接。";
    } catch (error) {
      if (request === editorRequest) el("newsEditorStatus").textContent = `加载失败：${error.message}`;
    }
  }
  async function saveNews(event) {
    event.preventDefault();
    if (!contentLoaded) return;
    try {
      const content = richContent.serialize(el("newsContent"));
      if (!content) throw new Error("请填写正文。");
      if (content.length > 20000) throw new Error("正文含格式不能超过 20000 字符。");
      el("newsSave").disabled = true;
      await write("save", {
        id: editId || "", title: el("newsTitle").value.trim(),
        category_id: el("newsCategory").value, content,
        publish_at: el("newsPublishAt").value
      });
      el("newsModal").hidden = true;
      await reload();
      report("新闻已保存。");
    } catch (error) {
      el("newsEditorStatus").textContent = `保存失败：${error.message}`;
      report(`保存失败：${error.message}`);
    } finally { el("newsSave").disabled = !contentLoaded; }
  }
  async function removeNews(item) {
    if (!confirm(`确定删除「${item.title}」？`)) return;
    try { await write("delete", { id: String(item.id) }); await reload(); }
    catch (error) { report(`删除失败：${error.message}`); }
  }
  async function addCategory(event) {
    event.preventDefault();
    try {
      await write("add-category", { name: el("newCategory").value.trim() });
      el("newCategory").value = "";
      await reload();
    } catch (error) { report(`添加分类失败：${error.message}`); }
  }
  async function renameCategory(category) {
    const name = prompt(`重命名分类「${category.name}」`, category.name)?.trim();
    if (!name || name === category.name) return;
    try {
      await write("rename-category", { id: String(category.id), name });
      await reload();
      report("分类已重命名，关联新闻已同步更新。");
    } catch (error) { report(`重命名失败：${error.message}`); }
  }
  async function removeCategory(category) {
    if (!confirm(`确定删除分类「${category.name}」？`)) return;
    try { await write("delete-category", { id: String(category.id) }); await reload(); }
    catch (error) { report(`删除分类失败：${error.message}`); }
  }
  el("newNews").addEventListener("click", () => openNews());
  el("manageCategories").addEventListener("click", () => { el("categoryModal").hidden = false; });
  el("closeNews").addEventListener("click", () => { ++editorRequest; contentLoaded = false; el("newsModal").hidden = true; });
  el("newsEditorToolbar").addEventListener("mousedown", event => {
    if (event.target.closest("button")) event.preventDefault();
  });
  el("newsEditorToolbar").addEventListener("click", event => {
    const control = event.target.closest("button[data-command]");
    if (!control || !contentLoaded) return;
    let value = control.dataset.value || null;
    if (control.dataset.command === "createLink") {
      const input = prompt("链接地址（https://…）");
      if (!input) return;
      value = richContent.safeLink(input);
      if (!value) { el("newsEditorStatus").textContent = "请输入有效的网页或邮件链接。"; return; }
    }
    el("newsContent").focus();
    document.execCommand(control.dataset.command, false, value);
  });
  el("newsContent").addEventListener("paste", event => {
    event.preventDefault();
    if (!contentLoaded) return;
    const holder = document.createElement("div");
    richContent.load(holder, event.clipboardData.getData("text/html") || event.clipboardData.getData("text/plain"));
    document.execCommand("insertHTML", false, holder.innerHTML);
  });
  el("closeCategories").addEventListener("click", () => { el("categoryModal").hidden = true; });
  el("newsForm").addEventListener("submit", saveNews);
  el("categoryForm").addEventListener("submit", addCategory);
  el("newsFilter").addEventListener("change", render);
  reload();
})();
