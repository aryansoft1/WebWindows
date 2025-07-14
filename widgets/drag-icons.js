document.addEventListener("DOMContentLoaded", () => {
  const icons = document.querySelectorAll(".icon");
  const grid = 80;

  icons.forEach(icon => {
    const id = icon.id;
    icon.style.position = "absolute";
    icon.style.cursor = "default";

    // 恢复位置
    const saved = localStorage.getItem("icon-pos-" + id);
    if (saved) {
      const { left, top } = JSON.parse(saved);
      icon.style.left = left + "px";
      icon.style.top = top + "px";
    }

    let isDragging = false;
    let offsetX = 0, offsetY = 0, startX = 0, startY = 0;

    icon.addEventListener("mousedown", e => {
      if (e.button !== 0) return;
      isDragging = false;
      offsetX = e.clientX - icon.offsetLeft;
      offsetY = e.clientY - icon.offsetTop;
      startX = e.clientX;
      startY = e.clientY;
      icon.style.zIndex = 9999;

      function move(ev) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          isDragging = true;
          icon.style.left = (ev.clientX - offsetX) + "px";
          icon.style.top = (ev.clientY - offsetY) + "px";
        }
      }

      function stop() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", stop);
        if (isDragging) {
          const snappedLeft = Math.round(icon.offsetLeft / grid) * grid;
          const snappedTop = Math.round(icon.offsetTop / grid) * grid;
          icon.style.left = snappedLeft + "px";
          icon.style.top = snappedTop + "px";
          localStorage.setItem("icon-pos-" + id, JSON.stringify({ left: snappedLeft, top: snappedTop }));
        }
        icon.style.zIndex = "";
      }

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", stop);
    });

    icon.addEventListener("click", e => {
      if (isDragging) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    });
  });
});