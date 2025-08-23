function goBack() {
  window.history.back();
}

function goForward() {
  window.history.forward();
}

function goUp() {
  const url = new URL(window.location.href);
  let path = url.searchParams.get("path") || "";

  // 将反斜杠全部统一为正斜杠（浏览器安全）
  path = path.replace(/\\/g, "/");

  // 移除开头和结尾的斜杠
  path = path.replace(/^\/+|\/+$/g, "");

  const parts = path.split("/").filter(p => p.trim() !== "");

  if (parts.length > 0) parts.pop();

  const upPath = parts.join("/");

  if (upPath) {
    url.searchParams.set("path", upPath);
  } else {
    url.searchParams.delete("path");
  }

  window.location.href = url.toString();
}




function setView(viewType) {
  const url = new URL(window.location.href);
  // 修正：small => large, large => small
  if (viewType === "small") {
    url.searchParams.set("view", "large");  // 小图标按钮 实际切换到大图标视图
  } else if (viewType === "large") {
    url.searchParams.set("view", "small");  // 大图标按钮 实际切换到小图标视图
  } else {
    url.searchParams.set("view", viewType); // detail 原样处理
  }
  window.location.href = url.toString();
}

function sortFiles(sortBy) {
  const url = new URL(window.location.href);
  url.searchParams.set("sort", sortBy);
  window.location.href = url.toString();
}
window.addEventListener('DOMContentLoaded', function () {

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  } else {
    console.warn("Lucide is not ready.");
  }
   const currentPath = new URL(window.location.href).searchParams.get("path") || "";
  loadFolders("", document.getElementById("folder-tree"), () => {
    expandToCurrentPath(currentPath);
  });
});
const loadedPaths = new Set();

function loadFolders(path = "", parentUL = document.getElementById("folder-tree"), callback = null) {
  if (loadedPaths.has(path)) {
    if (callback) callback();
    return;
  }
  loadedPaths.add(path);

  fetch(`getFolders.asp?path=${encodeURIComponent(path)}&recursive=true`)
    .then(res => res.json())
    .then(folders => {
      if (!Array.isArray(folders)) {
        console.error("目录接口返回异常：", folders);
        showLoginOverlayAndClose(folders?.error || "目录加载失败");
        return;
      }

      folders.forEach(folder => {
        renderFolderRecursive(folder, parentUL);
      });

      if (callback) callback();
    });

}

function renderFolderRecursive(folder, parentUL) {
  const li = document.createElement("li");
  li.className = "folder-node expanded"; // 默认展开
  li.dataset.path = folder.path;
  li.dataset.loaded = "true"; // 标记已加载，避免重复加载

  // 使用 Lucide 图标
  const label = document.createElement("div");
  label.className = "folder-label";
  const icon = document.createElement("img");
  icon.className = "toggle-icon";
  icon.src = "https://cdn-icons-png.flaticon.com/128/716/716784.png"; // 默认是展开图标
  icon.width = 16; // 可调
  icon.height = 16;

  const text = document.createElement("span");
  text.textContent = " " + folder.name;

  label.appendChild(icon);
  label.appendChild(text);

  const subUL = document.createElement("ul");
  subUL.className = "subfolders";

  // 递归子文件夹
  if (folder.children && Array.isArray(folder.children)) {
    folder.children.forEach(child => {
      renderFolderRecursive(child, subUL);
    });
  }

  // 绑定点击事件：切换展开状态 + 加载文件
  label.addEventListener("click", e => {
    e.stopPropagation();
    const expanded = li.classList.toggle("expanded");
    const icon = label.querySelector(".toggle-icon");
    icon.setAttribute("data-lucide", expanded ? "chevron-down" : "chevron-right");
    lucide.createIcons(); // 重新渲染图标

    // 高亮当前选中项
    document.querySelectorAll(".folder-node").forEach(el => el.classList.remove("selected"));
    li.classList.add("selected");

    // 加载文件内容
    loadFiles(folder.path.replace(/\\/g, "/"));
  });

  li.appendChild(label);
  li.appendChild(subUL);
  parentUL.appendChild(li);

  // 初次插入后立即刷新图标
  lucide.createIcons();
}



// ✅ 递归渲染单个目录及其子目录
function renderFolder(folder, parentUL) {
  const li = document.createElement("li");
  li.className = "folder-node";
  li.dataset.path = folder.path;

  const label = document.createElement("div");
  label.className = "folder-label";
  label.innerHTML = `<i data-lucide="chevron-down" class="toggle-icon"></i> ${folder.name}`;

  const subUL = document.createElement("ul");
  subUL.className = "subfolders";
  li.appendChild(subUL);

  // 🌟立即展开子文件夹（递归渲染 children）
  if (folder.children && folder.children.length > 0) {
    folder.children.forEach(child => {
      renderFolder(child, subUL);
    });
  }

  // 🌟点击展开逻辑
  label.addEventListener("click", e => {
    e.stopPropagation();
    li.classList.toggle("expanded");

    // 切换选中状态
    document.querySelectorAll(".folder-node").forEach(el => el.classList.remove("selected"));
    li.classList.add("selected");

    // 右侧刷新文件列表
    loadFiles(folder.path);
  });

  li.appendChild(label);
  parentUL.appendChild(li);
}

function loadFiles(path) {
  if (!path) return;
  path = path.replace(/\\/g, "/"); // 统一正斜杠
  const url = new URL(window.location.href);
  url.searchParams.set("path", path); // ✅ 编码路径参数
  window.location.href = url.toString();
}

function createNewFolder() {
  document.getElementById("newFolderName").value = "";
  document.getElementById("newFolderModal").style.display = "block";
}

function closeNewFolderModal() {
  document.getElementById("newFolderModal").style.display = "none";
}

function submitNewFolder() {
  const folderName = document.getElementById("newFolderName").value.trim();
  if (!folderName) {
    showMessageBox("请输入文件夹名称！");
    return;
  }

  const url = new URL("createFolder.asp", window.location.href);
  const currentPath = new URL(window.location.href).searchParams.get("path") || "";
  url.searchParams.set("path", currentPath);
  url.searchParams.set("name", folderName);

  fetch(url.toString(), { method: "POST" })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        closeNewFolderModal();
        // ✅ 重新加载整个左侧目录树
        document.getElementById("folder-tree").innerHTML = "";
        loadedPaths.clear(); // 清除已加载缓存
        loadFolders("", document.getElementById("folder-tree"), () => {
          expandToCurrentPath(currentPath);
        });

        // ✅ 重新加载右侧文件区域
        loadFiles(currentPath);
      }
      else {
              showMessageBox("创建失败：" + result.message);
            }
    })
    .catch(err => {
      showMessageBox("网络错误：" + err.message);
    });
}

function expandToCurrentPath(currentPath) {
  const parts = currentPath.split("/").filter(p => p.trim() !== "");
  let cumulative = "";

  const expandRecursive = (index, parentUL) => {
    if (index >= parts.length) return;

    cumulative += (index === 0 ? "" : "/") + parts[index];
    const li = parentUL.querySelector(`.folder-node[data-path="${cumulative}"]`);
    if (!li) return;

    li.classList.add("expanded");
    li.classList.add("selected");

    const subUL = li.querySelector("ul.subfolders");

    if (!li.dataset.loaded) {
      loadFolders(cumulative, subUL, () => {
        li.dataset.loaded = "true";
        expandRecursive(index + 1, subUL); // 继续展开下一层
      });
    } else {
      expandRecursive(index + 1, subUL);
    }
  };

  const rootUL = document.getElementById("folder-tree");
  expandRecursive(0, rootUL);
}

function openSelected() {
  const selected = document.querySelector('.file-item.selected');
  if (!selected) {
    showMessageBox("未选中文件或文件夹！");
    return;
  }

  const isFolder = selected.dataset.isFolder === "true";
  const path = selected.dataset.path;
  if (!path) {
    showMessageBox("路径无效！");
    return;
  }

  if (isFolder) {
    // 是文件夹，跳转到该目录
    const url = new URL(window.location.href);
    url.searchParams.set("path", path.replace(/\\/g, "/"));
    window.location.href = url.toString();
  } else {
    // 是文件，可选择弹出或预览
    alert("这是文件，尚未实现打开方式。");
  }
}

// assets/js/files-init.js

function initFileManager() {
  const userJson = sessionStorage.getItem("webwindows_user");
  if (!userJson) {
    showLoginOverlayAndClose("请先登录");
    setTimeout(() => {
      // 取当前窗口 id（优先从包裹它的 .window 元素上拿）
      const winEl = window.frameElement?.closest('.window');
      const rawId = winEl?.id?.replace(/^win-/, '') || 'explorer';
      console.log(window.top.document.querySelector(`.taskbar-app[data-id="win-explorer"]`))
      
      // ✅ 正确的函数类型判断
      if (typeof window.parent?.closeWindow === 'function') {
        window.parent.closeWindow(rawId);                // 让顶层负责关闭：会同步移除任务栏图标
        return;
      }
      parent.document.top.RemoveExplorer();
      // 兜底：如果还没挂上全局 API（极端时序），至少先把 DOM 移除，避免留空窗
      if (winEl) winEl.remove();
    }, 1000);
    return;
  }

  try {
    const user = JSON.parse(userJson);
    const username = user.username || "unknown";
    updateDiskInfo();
    window.rootPath = `/cloud/file/${username}/`;
  } catch (e) {
    console.error("用户信息解析失败", e);
    showLoginOverlayAndClose("用户信息异常，请重新登录");
    setTimeout(() => {
      const win = window.frameElement?.closest('.window');
       // ✅ 在移除之前，通知父页面先删除任务栏图标
      if (window.parent && typeof window.parent.removeTaskbarIcon === 'function') {
          window.parent.removeTaskbarIcon("win-explorer");
      }
      if (win) win.remove();
    }, 1000);
    return;
  }

  document.body.style.display = "block"; // 显示页面内容
}
function formatSize(size) {
  if (size >= 1024) {
     return (size / 1024).toFixed(2) + ' GB';
  } else {
    return size.toFixed(2) + ' MB';
  }
} 

function updateDiskInfo() {
  fetch("/inc/sysinfo.asp")
    .then(response => response.json())
    .then(data => {
      const used = parseFloat(data.diskUsed);
      const total = parseFloat(data.diskTotal);
      const percent = ((used / total) * 100).toFixed(1);

      const info = `已用 ${formatSize(used)} / 总共 ${formatSize(total)} (${percent}%)`;
      document.getElementById("disk-text").textContent = info;
      document.getElementById("disk-bar").style.width = percent + "%";

    })
}
function showLoginOverlayAndClose(text) {
  document.body.innerHTML = "";
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0, 0, 0, 0.6)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  const messageBox = document.createElement("div");
  messageBox.style.background = "#fff";
  messageBox.style.padding = "24px 36px";
  messageBox.style.borderRadius = "12px";
  messageBox.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
  messageBox.style.fontSize = "16px";
  messageBox.style.fontWeight = "bold";
  messageBox.textContent = text;

  overlay.appendChild(messageBox);
  document.body.appendChild(overlay);

  setTimeout(() => {
    const win = window.frameElement?.closest('.window');
    console.log(win)
    if (win) {
      const winId = 'win-explorer';
            // ✅ 在移除之前，通知父页面先删除任务栏图标
          if (window.parent && typeof window.parent.removeTaskbarIcon === 'function') {
            window.parent.removeTaskbarIcon(winId);
          }
      win.remove();
    }
  }, 1200);
}
function showMessageBox(text) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  const box = document.createElement("div");
  box.style.background = "#fff";
  box.style.padding = "24px 36px";
  box.style.borderRadius = "12px";
  box.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
  box.style.fontSize = "16px";
  box.style.fontWeight = "bold";
  box.style.textAlign = "center";

  const msg = document.createElement("div");
  msg.textContent = text || "提示";
  msg.style.marginBottom = "20px";

  const button = document.createElement("button");
  button.textContent = "确定";
  button.style.background = "#2563eb";
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.padding = "8px 20px";
  button.style.borderRadius = "6px";
  button.style.cursor = "pointer";
  button.addEventListener("click", () => {
    overlay.remove(); // 只关闭，无回调
  });

  box.appendChild(msg);
  box.appendChild(button);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
