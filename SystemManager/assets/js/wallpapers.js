(function () {
  "use strict";
  const security = window.WebWindowsAdminSecurity;
  const el = id => document.getElementById(id);
  const api = action => `/admin_api/wallpapers.asp?action=${encodeURIComponent(action)}`;
  const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
  let catalogue = { wallpapers: [], defaultWallpaper: "" };

  function status(message) { el("wallpaperStatus").textContent = message; }

  function imageUrl(path) {
    return `/${String(path || "").replace(/^\/+/, "")}`;
  }

  async function read(action) { return security.read(api(action)).then(r => r.json()); }

  async function write(action, values) {
    const options = await security.authorize({
      body: new URLSearchParams(values),
      headers: { "X-WebWindows-Admin-Request": "system-manager" }
    });
    const response = await fetch(api(action), options);
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || result.message || `HTTP ${response.status}`);
    return result;
  }

  function formatBytes(bytes) {
    const value = Number(bytes) || 0;
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`;
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
  }

  function renderDefault() {
    const target = el("defaultWallpaper");
    target.replaceChildren();
    if (!catalogue.defaultWallpaper) {
      target.textContent = "未设置默认壁纸。";
      return;
    }
    const image = document.createElement("img");
    image.src = imageUrl(catalogue.defaultWallpaper);
    image.alt = "系统默认壁纸";
    image.style.maxWidth = "240px";
    image.style.borderRadius = "8px";
    target.appendChild(image);
    target.appendChild(document.createTextNode(` ${catalogue.defaultWallpaper}`));
  }

  function render() {
    const grid = el("wallpaperGrid");
    grid.replaceChildren();
    if (!catalogue.wallpapers.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "当前没有壁纸，请先上传。";
      grid.appendChild(empty);
      return;
    }
    catalogue.wallpapers.forEach(item => {
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      image.src = imageUrl(item.url);
      image.alt = item.name || "壁纸";
      image.loading = "lazy";
      const caption = document.createElement("figcaption");
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = item.name || item.url;
      const meta = document.createElement("span");
      meta.className = "meta";
      meta.textContent = ` ${formatBytes(item.bytes)}`;
      caption.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "actions";
      const isDefault = catalogue.defaultWallpaper === item.url;

      const setDefault = document.createElement("button");
      setDefault.type = "button";
      setDefault.textContent = isDefault ? "系统默认" : "设为默认";
      setDefault.disabled = isDefault;
      setDefault.addEventListener("click", async () => {
        try {
          await write("default", { url: item.url });
          status(`已将 ${item.name} 设为系统默认壁纸。`);
          await load();
        } catch (error) { status(`设置默认壁纸失败：${error.message}`); }
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "danger";
      remove.textContent = "删除";
      remove.addEventListener("click", async () => {
        if (!window.confirm(`确定要删除壁纸「${item.name}」吗？删除后用户将无法再选择它。`)) return;
        try {
          await write("delete", { url: item.url });
          status(`已删除 ${item.name}。`);
          await load();
        } catch (error) { status(`删除失败：${error.message}`); }
      });

      actions.append(setDefault, remove);
      figure.append(image, caption, actions);
      grid.appendChild(figure);
    });
  }

  async function load() {
    try {
      const result = await read("list");
      catalogue = {
        wallpapers: Array.isArray(result.wallpapers) ? result.wallpapers : [],
        defaultWallpaper: result.defaultWallpaper || ""
      };
      renderDefault();
      render();
      status(`已加载 ${catalogue.wallpapers.length} 张壁纸。`);
    } catch (error) {
      status(`壁纸列表加载失败：${error.message}`);
    }
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.onload = () => {
        const result = String(reader.result || "");
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.readAsDataURL(file);
    });
  }

  el("uploadForm").addEventListener("submit", async event => {
    event.preventDefault();
    const file = el("wallpaperFile").files[0];
    if (!file) { status("请先选择一张壁纸图片。"); return; }
    if (file.size > MAX_UPLOAD_BYTES) { status("壁纸图片过大，请上传小于 4MB 的图片。"); return; }
    const button = event.target.querySelector("button[type=submit]");
    button.disabled = true;
    status("正在上传壁纸…");
    try {
      const data = await toBase64(file);
      const result = await write("upload", { filename: file.name, data });
      // The endpoint reports the stored size, so a truncated write is visible here
      // instead of leaving a broken wallpaper on the server.
      if (result.bytes !== file.size) {
        throw new Error(`服务器保存的字节数(${result.bytes})与上传文件(${file.size})不一致`);
      }
      el("uploadForm").reset();
      status(`已上传 ${result.name}（${formatBytes(result.bytes)}）。`);
      await load();
    } catch (error) {
      status(`上传失败：${error.message}`);
    } finally {
      button.disabled = false;
    }
  });

  el("clearDefault").addEventListener("click", async () => {
    try {
      await write("default", { url: "" });
      status("已清除系统默认壁纸。");
      await load();
    } catch (error) { status(`清除默认壁纸失败：${error.message}`); }
  });

  load();
})();
