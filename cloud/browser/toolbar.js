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
  loadFolders(); // 初始加载根路径
});
const loadedPaths = new Set();

function loadFolders(path = "", parentUL = document.getElementById("folder-tree")) {
  if (loadedPaths.has(path)) return; // 防止递归重复
  loadedPaths.add(path);

  fetch(`getFolders.asp?path=${encodeURIComponent(path)}`)
    .then(res => res.json())
    .then(folders => {
      folders.forEach(folder => {
        const li = document.createElement("li");
        li.className = "folder-node";
        li.dataset.path = folder.path;

        const label = document.createElement("div");
        label.className = "folder-label";
        label.innerHTML = `<span class="toggle-icon">▶</span> ${folder.name}`;

        const subUL = document.createElement("ul");
        subUL.className = "subfolders";
        li.appendChild(subUL);

        label.addEventListener("click", e => {
          e.stopPropagation();
          const isExpanded = li.classList.toggle("expanded");

          if (isExpanded && !li.dataset.loaded) {
            loadFolders(folder.path, subUL);  // 子文件夹加载
            li.dataset.loaded = "true";       // 防止 UI 多次加载
          }

          // 高亮当前目录
          document.querySelectorAll(".folder-node").forEach(el => el.classList.remove("selected"));
          li.classList.add("selected");
          loadFiles(folder.path);
        });

        li.appendChild(label);
        parentUL.appendChild(li);
      });
    });
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
    alert("请输入文件夹名称！");
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
        loadFolders(currentPath, subUL); // 重新加载子目录
        loadFiles(currentPath); // 重新加载
      } else {
        alert("创建失败：" + result.message);
      }
    })
    .catch(err => {
      alert("网络错误：" + err.message);
    });
}

