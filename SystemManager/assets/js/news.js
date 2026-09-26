(function () {
  "use strict";
  const security = window.WebWindowsAdminSecurity;
  const el = id => document.getElementById(id);
  let items = [];
  let categories = [];
  let editId = null;
  const endpoint = action => `/admin_api/news.asp?action=${encodeURIComponent(action)}`;
  function report(message) { el("newsStatus").textContent = message; }
  async function read(action) { return security.read(endpoint(action)).then(r => r.json()); }
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
      cell.textContent = "暂无符合条件的新闻";
    }
    visible.forEach(item => {
      const row = rows.insertRow();
      for (const value of [item.title, item.category, item.publish_at]) row.insertCell().textContent = value || "";
      const actions = row.insertCell();
      actions.className = "actions";
      actions.append(button("编辑", () => openNews(item)), button("删除", () => removeNews(item), true));
    });
    report(`显示 ${visible.length} 条新闻`);
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
      categoryInput.add(new Option(category.name, category.name));
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = category.name;
      li.append(name, button("删除", () => removeCategory(category), true));
      list.appendChild(li);
    });
    filter.value = selected;
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
  function openNews(item = null) {
    editId = item?.id || null;
    el("newsModalTitle").textContent = item ? "编辑新闻" : "发布新闻";
    el("newsTitle").value = item?.title || "";
    el("newsCategory").value = item?.category || categories[0]?.name || "";
    el("newsPublishAt").value = item?.publish_at?.replace(" ", "T") || "";
    el("newsContent").value = item?.content || "";
    el("newsModal").hidden = false;
  }
  async function saveNews(event) {
    event.preventDefault();
    try {
      await write("save", {
        id: editId || "", title: el("newsTitle").value.trim(),
        category: el("newsCategory").value, content: el("newsContent").value.trim(),
        publish_at: el("newsPublishAt").value
      });
      el("newsModal").hidden = true;
      await reload();
      report("新闻已保存。");
    } catch (error) { report(`保存失败：${error.message}`); }
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
  async function removeCategory(category) {
    if (!confirm(`确定删除分类「${category.name}」？`)) return;
    try { await write("delete-category", { id: String(category.id) }); await reload(); }
    catch (error) { report(`删除分类失败：${error.message}`); }
  }
  el("newNews").addEventListener("click", () => openNews());
  el("manageCategories").addEventListener("click", () => { el("categoryModal").hidden = false; });
  el("closeNews").addEventListener("click", () => { el("newsModal").hidden = true; });
  el("closeCategories").addEventListener("click", () => { el("categoryModal").hidden = true; });
  el("newsForm").addEventListener("submit", saveNews);
  el("categoryForm").addEventListener("submit", addCategory);
  el("newsFilter").addEventListener("change", render);
  reload();
})();
