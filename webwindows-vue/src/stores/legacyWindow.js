// src/stores/legacyWindow.js
// === 直接把 main.js 里的这些函数原封不动粘过来 ===
export function openWindow(id, title, url, iconUrl, useIframe = false, type = '', width = '700px', height = '400px') {
    //云秘书逻辑
    if (id == "yunmishu_root") {
        if (document.getElementById("win-yunmishu_root")) {
            return;
        }
        const win = document.createElement("div");
        const content = document.createElement("div");
        const titleBar = document.createElement("div");
        win.className = type ? `window ${type}` : 'window';
        win.id = "win-yunmishu_root";
        win.style.position = "absolute";
        win.style.top = "120px";
        win.style.left = "120px";
        win.style.width = width;
        win.style.height = height;
        win.style.zIndex = "1001";
        if (!useIframe) {
            titleBar.className = "window-header";
            titleBar.innerHTML = `
                                                                                  <img class="window-icon" src="${iconUrl}" />
                                                                                  <div class="title">${title}</div>
                                                                                  <div class="buttons">
                                                                                    <div class="button minimize" title="最小化">_</div>
                                                                                    <div class="button maximize" title="缩放">⬜</div>
                                                                                    <div class="button close" title="关闭" onclick="closeWindow('${id}');">✕</div>
                                                                                  </div>
`;
            content.style.background = "#FFF";
            content.style.height = "calc(100% - 36px)";
            content.style.overflow = "auto";
            content.innerHTML = `
                                                                                  <div class="folder-view" style="padding:1rem">
                                                                                    <div class="icon-tile" onclick="
                                                                          openCloudWindow();setTimeout(() => {
                                                                        const win = document.getElementById('win-yunmishu_cloud');
                                                                        if (win) win.style.zIndex = 2000;  // ✅ 强制前置
                                                                      }, 80);">
                                                                                      <img src='assets/icons/cloud_secretary.png' />
                                                                                      <span>云秘书对日外贸评测中心</span>
                                                                                    </div>
                                                                                  </div>

                                                                                  `;
            padTitleBarTouch(win, titleBar);
            win.appendChild(titleBar);
        }
        win.appendChild(content);
        document.body.appendChild(win);
        bindWindowBehavior(win);
        createTaskbarIcon(id, title, iconUrl);

        return;
    }
    if (document.getElementById('win-' + id)) return;
    const win = document.createElement('div');
    win.className = type ? `window ${type}` : 'window';
    win.id = 'win-' + id;
    win.style.position = 'absolute';
    win.style.top = '120px';
    win.style.left = '180px';
    win.style.width = width;
    win.style.height = height;
    win.style.zIndex = '1001';
    const titleBar = document.createElement('div');
    titleBar.className = 'window-header';
    titleBar.innerHTML = `
                                                                                            <div class="title"><img class="window-icon" src="${iconUrl}"> ${title}</div>
                                                                                            <div class="buttons">
                                                                                              <div class="button minimize" title="最小化">_</div>
                                                                                              <div class="button maximize" title="缩放">⬜</div>
                                                                                              <div class="button close" title="关闭" onclick="closeWindow('${id}');">✕</div>
                                                                                            </div>`;
    //平板适配
    padTitleBarTouch(win, titleBar);

    const content = document.createElement('div');
    content.style.height = 'calc(100% - 30px)';
    content.style.overflow = 'auto';
    content.style.background = "#FFF";
    if (useIframe) {
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        content.style.overflow = '';
        content.innerHTML = "";
        content.appendChild(iframe);

        // ✅ 屏蔽 iframe 自身右键菜单
        content.onload = () => {
            try {
                iframe.addEventListener("contextmenu", e => e.preventDefault());
            } catch (e) {
                // 跨域则忽略
                console.log(e);

            }
        }
    } else {
        fetch(url)
            .then(resp => resp.text())
            .then(html => content.innerHTML = html)
            .catch(() => content.innerHTML = '<p style="padding:1rem">加载失败：' + url + '</p>');
    }

    win.appendChild(titleBar);
    win.appendChild(content);
    document.body.appendChild(win);
    updateTaskbarActive(id, true);
    bindWindowBehavior(win);
    createTaskbarIcon(id, title, iconUrl);
}

export function closeWindow(id) {
    const win = document.getElementById('win-' + id);
    if (!win) return;

    // 检查是否有 iframe 且加载 asp 页面
    const iframe = win.querySelector('iframe');
    if (iframe && iframe.src && iframe.src.toLowerCase().endsWith('.asp')) {
        clearAspSessionCookies(); // ✅ 仅此处清除
    }

    win.remove();
}
export function closeTargetWindow() {
    if (!currentContextTarget) return;

    currentContextTarget.remove();

    // ✅ 同步删除任务栏图标
    const winId = currentContextTarget.id;
    const taskIcon = document.querySelector(`.taskbar-app[data-id='${winId}']`);
    if (taskIcon) taskIcon.remove();

    currentContextTarget = null;

    hideWindowContextMenu();
}
export function minimizeTargetWindow() {
    if (!currentContextTarget) return;

    currentContextTarget.style.display = "none";

    // ✅ 设置 taskbar 图标为非激活状态
    const winId = currentContextTarget.id;
    const taskIcon = document.querySelector(`.taskbar-app[data-id='${winId}']`);
    if (taskIcon) taskIcon.classList.remove("active");
    hideWindowContextMenu();
    updateTaskbarActive(winId.replace("win-", ""), false);
}
export function maximizeTargetWindow() {
    if (!currentContextTarget) return;
    const winId = currentContextTarget.id;
    // ✅ 切换最大化状态
    currentContextTarget.classList.toggle("maximized");

    // 可选：让窗口靠顶居中
    if (currentContextTarget.classList.contains("maximized")) {
        currentContextTarget.style.top = "0";
        currentContextTarget.style.left = "0";
        currentContextTarget.style.width = "100%";
        currentContextTarget.style.height = "calc(100vh - 46px)";
    } else {
        // 恢复默认大小
        currentContextTarget.style.width = "800px";
        currentContextTarget.style.height = "600px";
        currentContextTarget.style.left = "calc(50% - 400px)";
        currentContextTarget.style.top = "80px";
    }
    currentContextTarget.style.display = "block";
    hideWindowContextMenu();
    updateTaskbarActive(winId.replace("win-", ""), true);
}

export function toggleMaximizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    const maximizeBtn = win.querySelector(".btn-maximize");

    if (win.dataset.maximized === "true") {
        // restore
        win.style.top = win.dataset.prevTop;
        win.style.left = win.dataset.prevLeft;
        win.style.width = win.dataset.prevWidth;
        win.style.height = win.style.prevHeight;
        win.dataset.maximized = "false";
        if (maximizeBtn) maximizeBtn.innerHTML = "🗖";
    } else {
        // maximize
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.style.top = "0";
        win.style.left = "0";
        win.style.width = "100%";
        win.style.height = "calc(100vh - 46px)";
        win.style.zIndex = "1000";
        win.dataset.maximized = "true";
        if (maximizeBtn) maximizeBtn.innerHTML = "🗗";
    }
}