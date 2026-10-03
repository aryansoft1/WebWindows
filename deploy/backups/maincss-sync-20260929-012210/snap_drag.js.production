
function enableWindowSnap(win) {
    const margin = 20;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const rect = win.getBoundingClientRect();

    let snapLeft = rect.left;
    let snapTop = rect.top;

    if (rect.left < margin) snapLeft = 0;
    if (screenW - rect.right < margin) snapLeft = screenW - rect.width;
    if (rect.top < margin) snapTop = 0;
    if (screenH - rect.bottom < margin) snapTop = screenH - rect.height;

    win.style.left = snapLeft + "px";
    win.style.top = snapTop + "px";
}

// 监听所有窗口的拖拽事件（鼠标和平板通用）
document.querySelectorAll(".window-header").forEach(header => {
    const win = header.closest(".window");
    let isDragging = false, offsetX = 0, offsetY = 0;

    // 鼠标
    header.addEventListener("mousedown", e => {
        isDragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
    });
    document.addEventListener("mousemove", e => {
        if (isDragging) {
            win.style.left = (e.clientX - offsetX) + "px";
            win.style.top = (e.clientY - offsetY) + "px";
        }
    });
    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            enableWindowSnap(win);
        }
    });

    // 触屏
    header.addEventListener("touchstart", e => {
        const touch = e.touches[0];
        offsetX = touch.clientX - win.offsetLeft;
        offsetY = touch.clientY - win.offsetTop;
        isDragging = true;

        function onTouchMove(e) {
            if (!isDragging) return;
            const touch = e.touches[0];
            win.style.left = (touch.clientX - offsetX) + "px";
            win.style.top = (touch.clientY - offsetY) + "px";
            e.preventDefault();
        }
        function onTouchEnd() {
            isDragging = false;
            enableWindowSnap(win);
            document.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("touchend", onTouchEnd);
        }

        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", onTouchEnd);
    });
});
