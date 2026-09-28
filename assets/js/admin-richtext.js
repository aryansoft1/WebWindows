(function () {
  "use strict";
  function create(root, body) {
    const rich = window.WebWindowsNewsContent;
    root.classList.add("ww-rich-editor"); body.classList.add("ww-news-content");
    const toolbar = document.createElement("div"); toolbar.className = "ww-rich-toolbar"; toolbar.setAttribute("role", "toolbar"); toolbar.setAttribute("aria-label", "正文排版工具");
    root.insertBefore(toolbar, body);
    const source = document.createElement("textarea"); source.className = "ww-rich-source"; source.hidden = true; source.setAttribute("aria-label", "HTML 源码，返回可视化时自动清洗"); body.after(source);
    const status = document.createElement("div"); status.className = "ww-rich-status"; status.setAttribute("role", "status"); source.after(status);
    let enabled = false, range = null, sourceMode = false, history = [], position = 0, dialog = null;
    const controls = [];
    const toggles = new Set(["bold", "italic", "underline", "strikeThrough", "insertUnorderedList", "insertOrderedList"]);
    function button(label, command, value) {
      const control = document.createElement("button"); control.type = "button"; control.textContent = label; control.title = label;
      control.dataset.command = command; if (value) control.dataset.value = value;
      if (toggles.has(command)) control.setAttribute("aria-pressed", "false");
      toolbar.append(control); controls.push(control); return control;
    }
    function select(label, command, options) {
      const wrap = document.createElement("label"); wrap.textContent = label;
      const control = document.createElement("select"); control.setAttribute("aria-label", label); control.dataset.command = command;
      for (const [value, text] of options) control.add(new Option(text, value));
      wrap.append(control); toolbar.append(wrap); controls.push(control); return control;
    }
    select("段落", "formatBlock", [["p", "正文"], ...[1,2,3,4,5,6].map(n => [`h${n}`, `标题 ${n}`]), ["blockquote", "引用"], ["pre", "代码块"]]);
    select("字体", "fontName", rich.fonts.map(font => [font, font]));
    select("字号", "fontSize", [[1,"10"],[2,"13"],[3,"16"],[4,"18"],[5,"24"],[6,"32"],[7,"48"]]).value = "3";
    for (const [label, command] of [["粗体", "bold"], ["斜体", "italic"], ["下划线", "underline"], ["删除线", "strikeThrough"]]) button(label, command);
    for (const [label, command, value] of [["文字色", "foreColor", "#111827"], ["背景色", "hiliteColor", "#fff2a8"]]) {
      const wrap = document.createElement("label"); wrap.textContent = label;
      const color = document.createElement("input"); color.type = "color"; color.value = value; color.dataset.command = command; color.setAttribute("aria-label", label); wrap.append(color); toolbar.append(wrap); controls.push(color);
    }
    for (const [label, command] of [["左对齐","justifyLeft"],["居中","justifyCenter"],["右对齐","justifyRight"],["两端对齐","justifyFull"],["项目列表","insertUnorderedList"],["编号列表","insertOrderedList"],["减少缩进","outdent"],["增加缩进","indent"],["链接…","link"],["移除链接","unlink"],["图片…","image"],["表格…","table"],["分隔线","insertHorizontalRule"],["清除格式","removeFormat"],["撤销","undo"],["重做","redo"],["源码","source"],["全屏","fullscreen"]]) button(label, command);
    const tableSelect = select("表格操作", "tableAction", [["","请选择"],["rowBefore","上方插行"],["rowAfter","下方插行"],["rowDelete","删除行"],["colBefore","左侧插列"],["colAfter","右侧插列"],["colDelete","删除列"],["tableDelete","删除表格"]]);
    function remember() {
      const selection = window.getSelection();
      if (selection.rangeCount && body.contains(selection.anchorNode) && body.contains(selection.focusNode)) range = selection.getRangeAt(0).cloneRange();
    }
    function restore() {
      body.focus();
      const selection = window.getSelection(); selection.removeAllRanges();
      if (range && body.contains(range.commonAncestorContainer)) selection.addRange(range);
      else { range = document.createRange(); range.selectNodeContents(body); range.collapse(false); selection.addRange(range); }
    }
    function update(message = "") {
      const text = sourceMode ? source.value : body.textContent;
      status.textContent = `${Array.from(text).length} 字符 · ${rich.serialize(body).length}/20000 HTML 字符 · ${sourceMode ? "源码" : "可视化"}${message ? " · " + message : ""}`;
      for (const control of controls) {
        const command = control.dataset.command;
        control.disabled = !enabled || sourceMode && !["source","fullscreen"].includes(command) || command === "undo" && position === 0 || command === "redo" && position === history.length - 1;
        if (toggles.has(command)) control.setAttribute("aria-pressed", String(body.contains(window.getSelection().anchorNode) && document.queryCommandState(command)));
      }
      body.setAttribute("aria-disabled", String(!enabled)); source.disabled = !enabled;
    }
    function snapshot() {
      if (history[position] !== body.innerHTML) {
        history = history.slice(0, position + 1); history.push(body.innerHTML);
        if (history.length > 100) history.shift(); position = history.length - 1;
      }
      remember(); update();
    }
    function insert(node) {
      restore(); const selection = window.getSelection(), active = selection.getRangeAt(0);
      active.deleteContents(); active.insertNode(node); active.setStartAfter(node); active.collapse(true); selection.removeAllRanges(); selection.addRange(active); remember(); snapshot();
    }
    function closeDialog() { if (dialog) { dialog.remove(); dialog = null; } restore(); }
    function ask(title, fields, apply) {
      const selected = range?.startContainer.parentElement?.closest("a");
      dialog = document.createElement("dialog"); dialog.className = "ww-rich-dialog";
      const form = document.createElement("form"), heading = document.createElement("h3"); heading.textContent = title; form.append(heading);
      const inputs = {};
      for (const [key, label, type, value] of fields) {
        const wrap = document.createElement("label"); wrap.textContent = label;
        const input = document.createElement("input"); input.type = type; input.value = value || ""; input.required = key !== "alt";
        if (type === "number") { input.min = "1"; input.max = "10"; }
        inputs[key] = input; wrap.append(input); form.append(wrap);
      }
      const error = document.createElement("p"); error.setAttribute("role", "alert"); form.append(error);
      const cancel = document.createElement("button"); cancel.type = "button"; cancel.textContent = "取消"; cancel.onclick = closeDialog;
      const ok = document.createElement("button"); ok.type = "submit"; ok.textContent = "应用"; form.append(cancel, ok); dialog.append(form); root.append(dialog);
      dialog.addEventListener("cancel", event => { event.preventDefault(); closeDialog(); });
      form.addEventListener("submit", event => { event.preventDefault(); try { const values = Object.fromEntries(Object.entries(inputs).map(([key,input]) => [key,input.value])); apply(values, selected); closeDialog(); snapshot(); } catch (failure) { error.textContent = failure.message; } });
      dialog.showModal(); Object.values(inputs)[0].focus();
    }
    function tableAction(action) {
      restore(); const node = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
      const cell = node.closest("td,th"), table = cell?.closest("table");
      if (!table || !body.contains(table)) { update("请将光标放在表格单元格中"); return; }
      if (table.querySelector("[colspan],[rowspan]")) { update("合并单元格表格请在源码中调整"); return; }
      const row = cell.parentElement, index = cell.cellIndex;
      if (action === "tableDelete") table.remove();
      if (action === "rowDelete") { row.remove(); if (!table.rows.length) table.remove(); }
      if (action === "colDelete") { Array.from(table.rows).forEach(r => r.cells[index]?.remove()); if (!table.rows[0]?.cells.length) table.remove(); }
      if (action === "rowBefore" || action === "rowAfter") {
        if (table.rows.length >= 50) { update("最多 50 行"); return; }
        const added = document.createElement("tr"); for (let n = 0; n < row.cells.length; n++) { const td = document.createElement("td"); td.append(document.createElement("br")); added.append(td); }
        row[action === "rowBefore" ? "before" : "after"](added);
      }
      if (action === "colBefore" || action === "colAfter") {
        if (row.cells.length >= 20) { update("最多 20 列"); return; }
        Array.from(table.rows).forEach(r => { const td = document.createElement("td"); td.append(document.createElement("br")); const anchor = r.cells[index]; if (anchor) anchor[action === "colBefore" ? "before" : "after"](td); });
      }
      range = null; snapshot();
    }
    function command(name, value) {
      if (!enabled) return;
      if (name === "fullscreen") { root.classList.toggle("ww-rich-fullscreen"); update(); return; }
      if (name === "source") {
        if (sourceMode) { rich.load(body, source.value); sourceMode = false; snapshot(); }
        else { snapshot(); source.value = rich.serialize(body); sourceMode = true; }
        body.hidden = sourceMode; source.hidden = !sourceMode; toolbar.querySelector('[data-command="source"]').textContent = sourceMode ? "可视化" : "源码"; (sourceMode ? source : body).focus(); update(); return;
      }
      if (sourceMode) return;
      snapshot();
      if (name === "undo" || name === "redo") { position = Math.max(0, Math.min(history.length - 1, position + (name === "undo" ? -1 : 1))); body.innerHTML = history[position]; range = null; restore(); update(); return; }
      if (name === "tableAction") { tableAction(value); tableSelect.value = ""; return; }
      restore();
      if (name === "link") {
        const node = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
        const existing = node.closest("a");
        ask("插入或编辑链接", [["href","网页或邮件地址","text",existing?.getAttribute("href") || "https://"]], (values, selected) => {
          const href = rich.safeLink(values.href); if (!href) throw new Error("请输入 http、https 或 mailto 地址。");
          if (selected && body.contains(selected)) { selected.href = href; selected.rel = "noopener noreferrer"; }
          else { restore(); if (range.collapsed || !range.toString().trim()) { const a = document.createElement("a"); a.href = href; a.textContent = href; a.rel = "noopener noreferrer"; insert(a); } else document.execCommand("createLink", false, href); }
        }); return;
      }
      if (name === "image") { ask("插入图片", [["src","HTTPS 图片地址（不支持本地上传或 data URL）","text","https://"],["alt","图片说明","text",""]], values => {
        const src = rich.safeLink(values.src, true); if (!src) throw new Error("图片必须使用 HTTPS 地址。"); const image = document.createElement("img"); image.src = src; image.alt = values.alt; insert(image);
      }); return; }
      if (name === "table") { ask("插入表格", [["rows","行数（1–10）","number","2"],["cols","列数（1–10）","number","2"]], values => {
        const rows = Number(values.rows), cols = Number(values.cols); if (![rows,cols].every(n => Number.isInteger(n) && n >= 1 && n <= 10)) throw new Error("行列须在 1–10 之间。");
        const table = document.createElement("table"), tbody = document.createElement("tbody"); table.append(tbody);
        for (let r = 0; r < rows; r++) { const row = document.createElement("tr"); for (let c = 0; c < cols; c++) { const cell = document.createElement("td"); cell.append(document.createElement("br")); row.append(cell); } tbody.append(row); } insert(table);
      }); return; }
      document.execCommand(name, false, value || null); snapshot();
    }
    toolbar.addEventListener("mousedown", event => { remember(); if (event.target.closest("button")) event.preventDefault(); });
    toolbar.addEventListener("click", event => { const control = event.target.closest("button[data-command]"); if (control && !control.disabled) command(control.dataset.command, control.dataset.value); });
    toolbar.addEventListener("change", event => { const control = event.target; if (control.dataset.command) command(control.dataset.command, control.value); });
    body.addEventListener("input", snapshot); source.addEventListener("input", () => update("返回可视化或保存时自动清洗"));
    body.addEventListener("keyup", () => { remember(); update(); }); body.addEventListener("mouseup", () => { remember(); update(); }); body.addEventListener("focusout", remember);
    body.addEventListener("paste", event => { event.preventDefault(); if (!enabled) return; snapshot(); restore(); const holder = document.createElement("div"); rich.load(holder, event.clipboardData.getData("text/html") || event.clipboardData.getData("text/plain")); document.execCommand("insertHTML", false, holder.innerHTML); snapshot(); });
    body.addEventListener("drop", event => event.preventDefault());
    root.addEventListener("keydown", event => {
      if (event.key === "Escape" && root.classList.contains("ww-rich-fullscreen")) { event.preventDefault(); root.classList.remove("ww-rich-fullscreen"); }
      if ((event.ctrlKey || event.metaKey) && !sourceMode && ["b","i","u","z","y","k"].includes(event.key.toLowerCase())) {
        event.preventDefault(); command(({b:"bold",i:"italic",u:"underline",z:event.shiftKey ? "redo" : "undo",y:"redo",k:"link"})[event.key.toLowerCase()]);
      }
    });
    // Arrow navigation keeps every toolbar control reachable by keyboard.
    toolbar.addEventListener("keydown", event => { if (["ArrowLeft","ArrowRight"].includes(event.key) && event.target.tagName === "BUTTON") { const available = controls.filter(c => !c.disabled); const next = available[(available.indexOf(event.target) + (event.key === "ArrowRight" ? 1 : available.length - 1)) % available.length]; event.preventDefault(); next?.focus(); } });
    return Object.freeze({
      setContent(value) { sourceMode = false; body.hidden = false; source.hidden = true; toolbar.querySelector('[data-command="source"]').textContent = "源码"; rich.load(body, value); history = [body.innerHTML]; position = 0; range = null; update(); },
      getContent() { if (sourceMode) { const holder = document.createElement("div"); rich.load(holder, source.value); return rich.serialize(holder); } return rich.serialize(body); },
      setEnabled(value) { enabled = !!value; body.contentEditable = String(enabled); update(); },
      close() { root.classList.remove("ww-rich-fullscreen"); if (dialog) { dialog.remove(); dialog = null; } },
      command
    });
  }
  window.WebWindowsAdminRichText = Object.freeze({ create });
})();
