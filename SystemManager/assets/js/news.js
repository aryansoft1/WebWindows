(function () {
  "use strict";
  const security = window.WebWindowsAdminSecurity;
  const el = id => document.getElementById(id);
  let items = [];
  let categories = [];
  let editId = null;
  const endpoint = action => `/admin_api/news.asp?action=${encodeURIComponent(action)}`;
  function report(message) { el("newsStatus").textContent = message; }
  async function read(action) {
    const response = await security.read(endpoint(action));
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
      categoryInput.add(new Option(category.name, category.name));
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
  // 分类名和新闻的 category 是两份数据，对不上时只有把真实行摆出来才能判断该改什么。
  // 这个接口带读门禁要求的头，所以必须由已登录的后台客户端发起 ——
  // 在地址栏直接打开 /admin_api/news.asp?action=diagnose 会被 403 挡下。
  async function diagnoseCategories() {
    const panel = el("diagnosePanel");
    const output = el("diagnoseOutput");
    panel.hidden = false;
    output.textContent = "正在读取分类与新闻的逐行对照…";
    try {
      const response = await security.read(endpoint("diagnose"));
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch (error) {
        // 服务端拼的 JSON 坏了时不要只丢一句 "Unexpected token"：把原文按
        // 控制字符可视化后打出来，才看得出坏在哪个字段。
        const visible = raw.replace(/[\u0000-\u001f]/g, (character) =>
          `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`);
        output.textContent = `诊断响应不是合法 JSON（HTTP ${response.status}）。\n原文：\n${visible.slice(0, 4000)}`;
        return;
      }
      if (!response.ok || data?.ok === false) {
        throw new Error(data?.message || data?.error || `HTTP ${response.status}`);
      }
      const lines = [];
      // 连接字符集和原始字节一起显示；单凭响应头不能判断 ADO 的解码结果。
      const connection = data.connection || {};
      lines.push("连接字符集（results 决定驱动怎么解释结果集字节）");
      lines.push(`  SET NAMES utf8mb4 = ${connection.applied ? "成功" : "失败"}` +
        (connection.error ? `  原因：${connection.error}` : ""));
      if (connection.results) {
        lines.push(`  client=${connection.client}  connection=${connection.connection}` +
          `  results=${connection.results}  database=${connection.database || "—"}`);
      }
      if (connection.serverVersion) {
        lines.push(`  服务器版本=${connection.serverVersion}` +
          (connection.serverDefaultCharset ? `  默认字符集=${connection.serverDefaultCharset}` : ""));
      }
      if (connection.readError) lines.push(`  读取失败：${connection.readError}`);
      const connectionOk = connection.applied && connection.results === "utf8mb4";
      lines.push(connectionOk
        ? "  连接会话已设置为 utf8mb4；仍需对照页面文字和原始字节判断驱动解码。"
        : "  连接会话未确认使用 utf8mb4；请结合原始字节排查，暂勿改写数据。");
      lines.push("");

      // 列字符集可能影响旧 ADO 驱动的结果解码，但不同本身并不表示数据损坏。
      const columns = data.columns || [];
      if (columns.length) {
        lines.push("列字符集（连接正确但仍乱码时，问题通常在这里）");
        for (const column of columns) {
          lines.push(`  ${column.table}.${column.column}  字符集=${column.charset || "—"}` +
            ` 排序规则=${column.collation || "—"} 类型=${column.type || "—"}`);
        }
        const charsets = new Set(columns.map(column => column.charset).filter(Boolean));
        lines.push(charsets.size > 1
          ? "  两列字符集不同；目前数据库原始字节正确。若只有分类名显示乱码，请检查驱动对 utf8mb4 列的解码，勿直接改表或改名。"
          : "  两列字符集一致；仍需对照原始字节与实际显示排查解码。");
        lines.push("");
      }
      lines.push("分类（nameChars = 字符数，nameHex = 存储的原始字节，可据此判断编码）");
      for (const category of data.categories || []) {
        lines.push(`  #${category.categoryId} [${category.name}] 字符数=${category.nameChars}` +
          ` 十六进制=${category.nameHex || "—"}` +
          ` 新闻=${category.newsTotal} 已发布=${category.newsPublished} 最早=${category.earliest || "—"}`);
      }
      lines.push("");
      lines.push("新闻行（published=0 表示发布时间未到，公开新闻页看不到）");
      for (const item of data.news || []) {
        lines.push(`  #${item.id} [${item.category}] ${item.title || "(无标题)"}` +
          ` 发布=${item.publishAt || "—"} 已发布=${item.published} 正文字符=${item.contentChars}`);
      }
      output.textContent = lines.join("\n");
    } catch (error) {
      output.textContent = `诊断失败：${error.message}`;
    }
  }
  async function reconcileCategories() {
    if (!confirm("按现有新闻的分类补齐分类表？只会新增缺少的分类，不会改写或删除已有分类。")) return;
    try {
      const result = await write("reconcile-categories", {});
      await reload();
      report(result.addedCount
        ? `已补齐 ${result.addedCount} 个分类。`
        : "分类表已经与新闻一致，没有需要补齐的分类。");
    } catch (error) { report(`补齐分类失败：${error.message}`); }
  }
  el("newNews").addEventListener("click", () => openNews());
  el("manageCategories").addEventListener("click", () => { el("categoryModal").hidden = false; });
  el("reconcileCategories").addEventListener("click", reconcileCategories);
  el("diagnoseCategories").addEventListener("click", diagnoseCategories);
  el("closeNews").addEventListener("click", () => { el("newsModal").hidden = true; });
  el("closeCategories").addEventListener("click", () => { el("categoryModal").hidden = true; });
  el("newsForm").addEventListener("submit", saveNews);
  el("categoryForm").addEventListener("submit", addCategory);
  el("newsFilter").addEventListener("change", render);
  reload();
})();
