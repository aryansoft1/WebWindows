function goBack() {
  window.history.back();
}

function goForward() {
  window.history.forward();
}

function goUp() {
  // 假设路径格式为 ?path=/Users/admin/docs/
  const url = new URL(window.location.href);
  const path = url.searchParams.get("path") || "";
  const upPath = path.replace(/\/[^/]+\/?$/, "/");
  url.searchParams.set("path", upPath);
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
  
});