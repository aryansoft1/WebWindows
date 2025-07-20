
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.createElement("div");
    menu.id = "custom-context-menu";
    menu.className = "context-menu";
    menu.style.display = "none";
    ["刷新", "设置", "个性化"].forEach((text) => {
        let icon = "";
        if (text === "刷新") icon = "🔄";
        if (text === "设置") icon = "⚙️";
        if (text === "个性化") icon = "🖼️";
        const item = document.createElement("div");
        item.innerHTML = `<span class="menu-icon">${icon}</span><span style="padding-left:10px">${text}</span>`;
        //item.textContent = text;
        item.className = "context-menu-item";
        item.addEventListener("click", () => {
            menu.style.display = "none";
            if (text === "刷新") refreshDesktop();
            if (text === "设置") openWindow('settings', '设置', 'settings.html', 'assets/icons/settings.png', true);
        });
        menu.appendChild(item);
    });

    document.body.appendChild(menu);

    document.addEventListener("contextmenu", (e) => {
        // 如果目标元素在 .window 或其子元素内，则不弹出菜单
        e.preventDefault();
        if (e.target.closest(".window")) return;
        if (e.target.closest(".taskbar")) return;
        if (e.target.closest("#start-menu")) return;
        menu.style.left = e.pageX + "px";
        menu.style.top = e.pageY + "px";
        menu.style.display = "block";
        setTimeout(() => menu.classList.add("show"), 10);
    });

    document.addEventListener("click", () => {
        menu.classList.remove("show");
        setTimeout(() => {
            menu.style.display = "none";
        }, 150);
    });
});
// ✅ JS：为每个窗口添加右键菜单，不影响最小化/最大化/关闭按钮
function enableWindowContextMenu(win) {
    const header = win.querySelector('.window-header');
    const buttons = header.querySelector('.buttons');

    // 屏蔽右键菜单区域内的系统按钮触发
    header.addEventListener('contextmenu', (e) => {
        if (buttons && buttons.contains(e.target)) return;
        e.preventDefault();
        currentContextTarget = win;
        const menu = document.getElementById("window-context-menu");
        tempZIndex = window.zIndex;
        let posX = e.pageX;
        let posY = e.pageY;
        const menuWidth = 140;
        const menuHeight = 100;

        if (posX + menuWidth > window.innerWidth) posX = window.innerWidth - menuWidth - 10;
        if (posY + menuHeight > window.innerHeight) posY = window.innerHeight - menuHeight - 10;
        window.zIndex ='2147483646'
        menu.style.transition = 'none';
        menu.style.transform = 'none';
        menu.style.left = `${posX}px`;
        menu.style.top = `${posY}px`;
        menu.style.zIndex = parseInt(win.style.zIndex || 1000) + 1;
        menu.style.display = "block";
        menu.classList.add("show");
    });
}
// ✅ 初次加载时绑定所有窗口
window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".window").forEach(win => enableWindowContextMenu(win));
});

// ✅ 监听新窗口添加（MutationObserver）
const winObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
        m.addedNodes.forEach(node => {
            if (node.classList && node.classList.contains("window")) {
                enableWindowContextMenu(node);
            }
        });
    });
});
winObserver.observe(document.body, { childList: true });