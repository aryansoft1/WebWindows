
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.createElement("div");
  menu.id = "custom-context-menu";
  menu.style.cssText = "position: fixed; display: none; background: #1f1f1f; color: white; padding: 8px; border-radius: 8px; z-index: 9999; font-size: 13px; box-shadow: 0 2px 6px rgba(0,0,0,0.4);";
  ["刷新", "设置"].forEach(text => {
    const item = document.createElement("div");
    item.textContent = text;
    item.style.padding = "6px 12px";
    item.style.cursor = "pointer";
    item.addEventListener("mouseover", () => item.style.background = "#333");
    item.addEventListener("mouseout", () => item.style.background = "transparent");
    item.addEventListener("click", () => {
      menu.style.display = "none";
      if (text === "刷新") location.reload();
      // 设置功能预留
    });
    menu.appendChild(item);
  });
  document.body.appendChild(menu);

  document.addEventListener("contextmenu", e => {
    e.preventDefault();
    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";
    menu.style.display = "block";
  });

  document.addEventListener("click", () => {
    menu.style.display = "none";
  });
});
