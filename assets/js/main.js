
document.addEventListener("DOMContentLoaded", () => {
    // ✅ 判断是否已经加载过，若已加载过则不再显示启动动画
    if (sessionStorage.getItem("booted") === "yes") {
        const root = document.getElementById("desktop-root");
        if (root) root.style.opacity = "1";
        // 不执行动画加载逻辑
        return;
    }
    sessionStorage.setItem("booted", "yes"); // 标记已加载
    const loader = document.createElement('div');
    loader.id = 'boot-loader';
    loader.style.cssText = `
                    position: fixed;
                    inset: 0;
                    background: linear-gradient(to bottom right, #004BA0, #042A57);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 999999;
                    font-family: 'Segoe UI', sans-serif;
                    color: white;
                `;
    loader.innerHTML = `
                    <img src="assets/icons/ARYANSOFT-logo1-01.gif" style="width: 120px; height: 120px; margin-bottom: 20px;">
                    <div style="font-size: 15px; opacity: 0.85;">正在启动WebWindows...</div>
                    <div style="
                      width: 44px;
                      height: 44px;
                      border: 4px solid rgba(255, 255, 255, 0.2);
                      border-top: 4px solid white;
                      border-radius: 50%;
                      animation: spin 1s linear infinite;
                      margin-top: 14px;
                    "></div>
                    <style>
                      @keyframes spin { to { transform: rotate(360deg); } }
                    </style>
                `;
    document.body.appendChild(loader);

    // 动画延迟后淡出 boot-loader，桌面淡入
    setTimeout(() => {
        loader.style.transition = "opacity 0.5s ease";
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.remove();
            const root = document.getElementById("desktop-root");
            if (root) {
                root.style.opacity = "1"; // 淡入桌面
            }
        }, 500);
    }, 1800);
});


document.querySelectorAll('.taskbar-app').forEach(el => {
    el.style.backgroundColor = 'rgba(255,255,255,0.1)';
});


function updateClock() {
    const elTime = document.getElementById('clock-time');
    const elDate = document.getElementById('clock-date');
    const now = new Date();

    if (elTime) {
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        elTime.textContent = `${hh}:${mm}`;
    }

    if (elDate) {
        const yyyy = now.getFullYear();
        const mo = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        elDate.textContent = `${yyyy}/${mo}/${dd}`;
    }
}
setInterval(updateClock, 1000);
updateClock();
async function getCombinedHolidayMap(year, userCountryCode = 'JP') {
    const cnHolidayMap = await getChinaHolidayMap(year); // 来自 timor.tech API
    const localHolidayMap = await getLocalHolidayMap(year, userCountryCode); // Nager.Date

    const result = {};

    // ✅ 遍历中国节假日，保留完整日期作为 key
    for (const date in cnHolidayMap) {
        const cn = cnHolidayMap[date];
        result[date] = result[date] || {};
        result[date].cnHoliday = true;
        result[date].cnName = cn.name;
    }

    // ✅ 遍历本地节假日，同样保留 YYYY-MM-DD 作为 key
    for (const date in localHolidayMap) {
        const local = localHolidayMap[date];
        result[date] = result[date] || {};
        result[date].holiday = true;
        result[date].name = local.name;
    }

    // ✅ 设置颜色与 title
    for (const date in result) {
        const item = result[date];
        const cn = item.cnHoliday;
        const local = item.holiday;

        if (cn && local) {
            item.color = 'green';
            item.title = `${item.name}  中国节：${item.cnName}`;
        } else if (cn && !local) {
            item.color = 'blue';
            item.title = item.cnName;
        } else if (local && !cn) {
            item.color = 'red';
            item.title = item.name;
        }
    }

    return result;
}
async function getChinaHolidayMap(year) {
    try {
        const res = await fetch(`https://timor.tech/api/holiday/year/${year}`);
        const json = await res.json();
        const raw = json.holiday || {};

        const result = {};
        for (const k in raw) {
            const item = raw[k];
            result[item.date] = {   // ✅ 使用完整 date 作为 key
                name: item.name,
                holiday: item.holiday
            };
        }
        return result;
    } catch (e) {
        console.warn("获取中国节假日失败", e);
        return {};
    }
}
async function getLocalHolidayMap(year, countryCode) {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    const list = await res.json();
    const map = {};
    list.forEach(item => {
        map[item.date] = {
            name: item.localName,
            holiday: true
        };
    });
    return map;
}

let calendarDate = new Date();
async function buildCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const daysEl = document.getElementById('calendar-days');
    const locale = Intl.DateTimeFormat().resolvedOptions().locale == "ja" ? "jp-jp" : Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';
    const userCountry = locale.split('-')[1]?.toUpperCase() || 'US';

    const holidayMap = await getCombinedHolidayMap(year, userCountry);
    const headerEl = document.getElementById('calendar-header');
    daysEl.innerHTML = '';
    headerEl.textContent = year + '/' + String(month + 1).padStart(2, '0');

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        blank.className = 'day';
        blank.textContent = '';
        daysEl.appendChild(blank);
    }
    for (let d = 1; d <= totalDays; d++) {
        const el = document.createElement('div');
        el.className = 'day';

        const currentDate = new Date(year, month, d);
        const weekday = currentDate.toLocaleDateString(undefined, { weekday: 'short' });

        el.innerHTML = `
        <div style="font-weight:bold;">${d}</div>
        <div class="weekday-label">${weekday}</div>
    `;
        //节假日调休标注
        const dateStr = `${String(year)}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const info = holidayMap[dateStr];
        if (info) {
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            const localHoliday = info.holiday;
            const cnHoliday = info.cnHoliday;
            // 🟢 中外都放假 红色
            if (localHoliday && cnHoliday) {
                el.style.color = '#ff4d4f';
                el.title = `${info.name}  中国节：${info.cnName}`;
            }
            // 🟢 周末同时中国休假 非当地节日 蓝色
            else if (isWeekend && cnHoliday & !localHoliday) {
                el.style.color = '#69c0ff';
                el.title = `中国节：${info.cnName}`;
            }
            // 🟢 周末同时国内休假，国外周末特殊假期为 红色
            else if (isWeekend && cnHoliday && localHoliday) {
                el.style.color = '#ff4d4f';
                el.title = `${info.name}  中国节：${info.cnName}`;
            }
            // 🔵 仅中国节假日（本地不是节假日）蓝色
            else if (!localHoliday && cnHoliday) {
                el.style.color = '#69c0ff';
                el.title = `中国节：${info.cnName}`;
            }

            // 🔴 仅本地节假日 红色
            else if (localHoliday && !cnHoliday) {
                el.style.color = '#ff4d4f';
                el.title = info.name;
            }

            // 🟡 本地不是节日但为周末调休（且中国是工作日或补班）
            else if (!localHoliday && isWeekend) {
                el.style.color = '#ffc107';  // 黄色字体
                el.title = info.cnName || '';
            }
        }
        if (
            d === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) el.classList.add('today');
        daysEl.appendChild(el);
    }
}
document.getElementById('taskbar-datetime')?.addEventListener('click', () => {
    const popup = document.getElementById('calendar-popup');
    const isVisible = popup.style.display === 'block';
    popup.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) buildCalendar(calendarDate);
});
document.getElementById('prev-month')?.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    buildCalendar(calendarDate);
});
document.getElementById('next-month')?.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    buildCalendar(calendarDate);
});


document.addEventListener('click', function (e) {
    const calendar = document.getElementById('calendar');
    const time = document.getElementById('taskbar-datetime');
    if (calendar && !calendar.contains(e.target) && !time.contains(e.target)) {
        calendar.style.display = 'none';
    }
});


function toggleCalendar() {
    const calendar = document.getElementById('calendar');
    if (calendar) {
        calendar.style.display = (calendar.style.display === 'block') ? 'none' : 'block';
    }
}


function toggleMaximizeWindow(id) {
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



window.onload = function () {
    const popup = document.getElementById('user-popup');
    if (sessionStorage.getItem('webwindows_user_nickname') != '' && sessionStorage.getItem('webwindows_user_nickname') != null) {
    popup.innerHTML = `
        <div class="text-sm text-center mb-2 text-gray-700">欢迎你：${sessionStorage.getItem('webwindows_user_nickname')}</div>
        <div class="text-sm text-center mb-2 text-gray-700">角色：普通用户</div>
        <button onclick="logout()" class="...">注销</button>
    `;
    } else {
    popup.style.display = 'none'; // 或 hidden
    }
    document.getElementById('login-username').addEventListener('click', () => {
            const username = sessionStorage.getItem('webwindows_user');
            
            const menu = document.getElementById("power-menu");
            menu.style.display = "none"

            if (username != null && username!='') {
                showUserMenu(); // 显示用户菜单
            } else {
                openWindow('login', '登录', 'login.html', 'https://cdn-icons-png.flaticon.com/512/747/747376.png', true, 'login-type');
                document.getElementById('start-menu').style.display = 'none';
            }
    });
    document.querySelectorAll('.window').forEach(win => {
        const header = win.querySelector('.window-header');
        if (!header) return;

        let isDragging = false, offsetX = 0, offsetY = 0;
        let isMaximized = false;
        let prev = {};

        header.addEventListener('mousedown', e => {
            isDragging = true;
            win.addEventListener('click', e => {
                hideWindowContextMenu();
            });
            offsetX = e.clientX - win.offsetLeft;
            offsetY = e.clientY - win.offsetTop;
            win.style.zIndex = 9998; // bring to front
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;
            hideWindowContextMenu();
            const snap = 20;
            const maxW = window.innerWidth - win.offsetWidth;
            const maxH = window.innerHeight - win.offsetHeight;
            if (Math.abs(x) < snap) x = 0;
            if (Math.abs(x - maxW) < snap) x = maxW;
            if (Math.abs(y) < snap) y = 0;
            if (Math.abs(y - maxH) < snap) y = maxH;

            win.style.left = x + 'px';
            win.style.top = y + 'px';
        });

        document.addEventListener('mouseup', () => isDragging = false);

        header.addEventListener('dblclick', () => {
            if (!isMaximized) {
                prev = {
                    top: win.style.top,
                    left: win.style.left,
                    width: win.style.width,
                    height: win.style.height
                };
                win.style.top = '0';
                win.style.left = '0';
                win.style.width = '100vw';
                win.style.height = 'calc(100vh - 46px)';
            } else {
                win.style.top = prev.top;
                win.style.left = prev.left;
                win.style.width = prev.width;
                win.style.height = prev.height;
            }
            isMaximized = !isMaximized;
        });
    });
    initUserStatus();
};


function bindWindowBehavior(win) {
    const header = win.querySelector('.window-header');
    const minimizeBtn = header?.querySelector('.button.minimize');
    const maximizeBtn = header?.querySelector('.button.maximize');
    const closeBtn = header?.querySelector('.button.close');

    let isDragging = false, offsetX = 0, offsetY = 0;
    let isMaximized = false;
    let prev = {};

    header?.addEventListener('mousedown', e => {
        isDragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        win.style.zIndex = 9998;
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        const snap = 20;
        const maxW = window.innerWidth - win.offsetWidth;
        const maxH = window.innerHeight - win.offsetHeight;
        if (Math.abs(x) < snap) x = 0;
        if (Math.abs(x - maxW) < snap) x = maxW;
        if (Math.abs(y) < snap) y = 0;
        if (Math.abs(y - maxH) < snap) y = maxH;
        win.style.left = x + 'px';
        win.style.top = y + 'px';
    });

    document.addEventListener('mouseup', () => isDragging = false);
    header?.addEventListener('dblclick', () => toggleMaximize());
    maximizeBtn?.addEventListener('click', () => toggleMaximize());
    minimizeBtn?.addEventListener('click', () => {
        win.style.display = 'none';
        updateTaskbarActive(win.id.replace('win-', ''), false);
        updateTaskbarActive(win.id, false);
    });
    closeBtn?.addEventListener('click', () => {
        win.remove();
        updateTaskbarActive(win.id.replace('win-', ''), false);
        const icon = document.querySelector('.taskbar-app[data-id="' + win.id + '"]');
        icon?.remove();
    });

    function toggleMaximize() {
        if (!isMaximized) {
            prev = {
                top: win.style.top,
                left: win.style.left,
                width: win.style.width,
                height: win.style.height
            };
            win.style.top = '0';
            win.style.left = '0';
            win.style.width = '100vw';
            win.style.height = 'calc(100vh - 46px)';
        } else {
            win.style.top = prev.top;
            win.style.left = prev.left;
            win.style.width = prev.width;
            win.style.height = prev.height;
        }
        isMaximized = !isMaximized;
    }
}




document.querySelectorAll('.icon-tile').forEach(tile => {
    tile.addEventListener('click', () => {
        const id = tile.dataset.id || tile.id || Math.random().toString(36).substring(2, 8);
        const title = tile.querySelector('label')?.innerText || '窗口';
        const icon = tile.querySelector('img')?.src || '';
        const href = tile.dataset.href || tile.getAttribute('data-href') || '';
        if (href) {
            openWindow(id, title, href, icon);
        }
    });
});


document.querySelectorAll('.icon').forEach(icon => {
    if (icon.classList.contains('no-auto')) return; 
    icon.addEventListener('click', () => {
        const id = icon.id || Math.random().toString(36).slice(2, 8);
        const title = icon.querySelector('label')?.innerText || '窗口';
        const iconUrl = icon.querySelector('img')?.getAttribute('src') || 'assets/icons/default.png';
        const onclickAttr = icon.getAttribute('onclick') || '';
        let href = '';

        // 云秘书特殊处理
        if (id == "yunmishu") {
            return;
        }

        const match = onclickAttr.match(/openWindow\([^,]+,[^,]+,\s*['"]([^'"]+)['"]/);
        if (match) {
            href = match[1];
        }

        openWindow(id, title, href, iconUrl);

    });
});


function createTaskbarIcon(id, title, iconUrl) {
    const existing = document.querySelector('.taskbar-app[data-id="win-' + id + '"]');
    if (existing) return;
    const taskbar = document.querySelector('.taskbar');
    const icon = document.createElement('div');
    icon.className = 'taskbar-app';
    icon.dataset.id = 'win-' + id;
    icon.title = title;
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.gap = '6px';
    icon.style.marginLeft = '6px';
    icon.style.padding = '4px 8px';
    icon.style.borderRadius = '6px';
    icon.style.cursor = 'pointer';
    icon.style.background = 'rgba(255,255,255,0.15)';
    icon.style.color = 'white';
    icon.style.fontSize = '12px';
    icon.addEventListener("contextmenu", function (e) {
        showWindowContextMenu(e, 'win-' + id);
    });
    document.addEventListener("click", () => {
        document.getElementById("window-context-menu").style.display = "none";
    });
    const img = document.createElement('img');
    img.src = iconUrl;
    img.style.width = '18px';
    img.style.height = '18px';
    img.style.borderRadius = '4px';

    const text = document.createElement('span');
    text.textContent = title;

    icon.appendChild(img);
    icon.appendChild(text);
    taskbar.appendChild(icon);
    updateTaskbarActive(id, true);

    icon.addEventListener('click', () => {
        const win = document.getElementById('win-' + id);
        if (win) {
            const isVisible = win.style.display !== 'none';
            win.style.display = isVisible ? 'none' : 'block';
            updateTaskbarActive(id, !isVisible);
            if (!isVisible) win.style.zIndex = 9998;
        }
    });
}

//平板窗体移动支持
function padTitleBarTouch(win, titleBar) {
    titleBar.addEventListener("touchstart", (e) => {
        const win = e.target.closest(".window");
        const touch = e.touches[0];
        const offsetX = touch.clientX - win.offsetLeft;
        const offsetY = touch.clientY - win.offsetTop;

        function onTouchMove(e) {
            const touch = e.touches[0];
            win.style.left = `${touch.clientX - offsetX}px`;
            win.style.top = `${touch.clientY - offsetY}px`;
            e.preventDefault(); // 🔑 关键：阻止滚动，启用拖动
        }

        function onTouchEnd() {
            document.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("touchend", onTouchEnd);
        }

        // ⚠️ 添加 passive: false 以允许 preventDefault 生效
        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", onTouchEnd);
    });

}

function openCloudWindow() {
    if (document.getElementById("win-yunmishu_cloud") || document.getElementById("win-yunmishu_cloud")) {
        return;
    }
    const win = document.createElement("div");
    const content = document.createElement("iframe");
    const titleBar = document.createElement("div");
    win.className = "window";
    win.id = "win-yunmishu_cloud";
    win.style.position = "absolute";
    win.style.top = "120px";
    win.style.left = "120px";
    win.style.width = "600px";
    win.style.height = "400px"
    titleBar.className = "window-header";
    titleBar.innerHTML = `
                                                               <img class="window-icon" src='assets/icons/cloud_secretary.png' />
                                                               <div class="title">云秘书对日外贸评测中心</div>
                                                               <div class="buttons">
                                                                 <div class="button minimize" title="最小化">_</div>
                                                                 <div class="button maximize" title="缩放" onclick="toggleMaximizeWindow('win-yunmishu_cloud')">⬜</div>
                                                                 <div class="button close" title="关闭" onclick="document.getElementById('win-yunmishu_cloud').remove()">✕</div>
                                                               </div>`

    padTitleBarTouch(win, titleBar);

    content.src = 'https://www.aryansoft.cn/jpshop/';
    content.style.width = "100%";
    content.style.height = 'calc(100vh - 46px)';
    content.style.border = "none";

    // ✅ 屏蔽 iframe 自身右键菜单
    content.onload = () => {
        try {
            content.contentWindow.document.addEventListener("contextmenu", e => e.preventDefault());
        } catch (e) {
            // 跨域则忽略
            console.log(e);
        }
    };
    win.appendChild(titleBar);
    win.appendChild(content);
    document.body.appendChild(win);

    setTimeout(() => bindWindowBehavior(win), 0);
    setTimeout(() => {
        toggleMaximizeWindow(win.id);
    }, 50);
    win.style.zIndex = "1001";
    createTaskbarIcon("yunmishu_cloud", "云秘书对日外贸评测中心", 'assets/icons/cloud_secretary.png')
    updateTaskbarActive(win.id, true);
}
function openWindow(id, title, url, iconUrl, useIframe = false, type = '', width = '700px', height = '400px') {
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
                                                                                    <div class="button close" title="关闭" onclick="document.getElementById('win-yunmishu_japan').remove()">✕</div>
                                                                                  </div>
`;

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
                                                                                              <div class="button close" title="关闭" onclick="document.getElementById('win-${id}').remove()">✕</div>
                                                                                            </div>`;
    //平板适配
    padTitleBarTouch(win, titleBar);

    const content = document.createElement('div');
    content.style.height = 'calc(100% - 30px)';
    content.style.overflow = 'auto';
    if (useIframe) {
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.style.borderRadius = "8px";
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


function updateTaskbarActive(id, isActive) {
    const icon = document.querySelector('.taskbar-app[data-id="win-' + id + '"]');
    if (icon) {
        icon.style.backgroundColor = isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)';
        icon.style.border = isActive ? '1px solid rgba(255,255,255,0.6)' : 'none';
    }
}

function disableIframes() {
  document.querySelectorAll("iframe").forEach(iframe => {
    iframe.dataset.prevPointer = iframe.style.pointerEvents;
    iframe.style.pointerEvents = "none";
  });
}

function restoreIframes() {
  document.querySelectorAll("iframe").forEach(iframe => {
    iframe.style.pointerEvents = iframe.dataset.prevPointer || "";
  });
}

(function () {
    const directions = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
    const attachResizers = (win) => {
        if (win.dataset.resizable === "true") return;
        directions.forEach(dir => {
            const el = document.createElement("div");
            el.className = "resizer " + dir;
            win.appendChild(el);
            el.addEventListener("mousedown", e => initResize(e, win, dir));
        });
        win.dataset.resizable = "true";
    };
    // main.js 更新版本：使用专用边角拖动机制进行窗口缩放（避免 iframe 卡顿）

    function initWindowResize(win, cornerEl) {
    let startX, startY, startWidth, startHeight;

    cornerEl.addEventListener("mousedown", function (e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

        document.documentElement.addEventListener("mousemove", doDrag, false);
        document.documentElement.addEventListener("mouseup", stopDrag, false);
    });

    function doDrag(e) {
        const newWidth = Math.max(300, startWidth + e.clientX - startX);
        const newHeight = Math.max(200, startHeight + e.clientY - startY);

        win.style.width = newWidth + "px";
        win.style.height = newHeight + "px";
    }

    function stopDrag() {
        document.documentElement.removeEventListener("mousemove", doDrag, false);
        document.documentElement.removeEventListener("mouseup", stopDrag, false);
    }
    }

    // 示例：为所有含 .window 的元素添加右下角拖动逻辑
    window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".window").forEach(win => {
        let resizer = win.querySelector(".window-resize-corner");
        if (!resizer) {
        resizer = document.createElement("div");
        resizer.className = "window-resize-corner";
        Object.assign(resizer.style, {
            position: "absolute",
            width: "20px",
            height: "20px",
            right: "0",
            bottom: "0",
            cursor: "nwse-resize",
            zIndex: "1000"
        });
        win.appendChild(resizer);
        }
        initWindowResize(win, resizer);
    });
    });

    function initResize(e, win, dir) {
        e.preventDefault();
        disableIframes();
        const startX = e.clientX, startY = e.clientY;
        const startW = parseInt(window.getComputedStyle(win).width, 10);
        const startH = parseInt(window.getComputedStyle(win).height, 10);
        const startL = win.offsetLeft, startT = win.offsetTop;

        function doDrag(e) {
            if (dir.includes("e")) win.style.width = Math.max(300, startW + e.clientX - startX) + "px";
            if (dir.includes("s")) win.style.height = Math.max(200, startH + e.clientY - startY) + "px";
            if (dir.includes("w")) {
                const newW = Math.max(300, startW - (e.clientX - startX));
                win.style.width = newW + "px";
                win.style.left = startL + (startW - newW) + "px";
            }
            if (dir.includes("n")) {
                const newH = Math.max(200, startH - (e.clientY - startY));
                win.style.height = newH + "px";
                win.style.top = startT + (startH - newH) + "px";
            }
        }
        

        function stopDrag() {
            document.removeEventListener("mousemove", doDrag);
            document.removeEventListener("mouseup", stopDrag);
            restoreIframes(); // ✅ 拖动结束，恢复 iframe
        }

        document.addEventListener("mousemove", doDrag);
        document.addEventListener("mouseup", stopDrag);
    }

    // 初始执行
    document.querySelectorAll('.window').forEach(attachResizers);

    // 动态观察后续添加的 .window
    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.classList && node.classList.contains("window")) {
                    attachResizers(node);
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
function togglePowerMenu() {
    const menu = document.getElementById("power-menu");
    const powerBtn = document.querySelector(".power-btn");

    if (!powerBtn || !menu) return;
    document.getElementById('user-popup').style.display = 'none';
    const rect = powerBtn.getBoundingClientRect();

    if (menu.style.display !== "block") {
        menu.style.display = "block";
        requestAnimationFrame(() => {
            const menuHeight = menu.offsetHeight;
            const menuWidth = menu.offsetWidth;
            const centerX = rect.left + rect.width / 2 - menuWidth / 2;
            const maxLeft = window.innerWidth - menuWidth - 10;

            menu.style.left = `${Math.min(centerX, maxLeft)}px`;
            menu.style.top = `${rect.top - menuHeight - 5}px`;
        });
    } else {
        menu.style.display = "none";
    }
}


function toggleStartMenu() {
    const menu = document.getElementById("start-menu");
    if (menu) {
        menu.style.display = (menu.style.display === "none" || menu.style.display === "") ? "block" : "none";
    }
}


function bindStartMenuAutoHide(attempt = 0) {
    const startMenu = document.getElementById("start-menu");
    const startButton = document.querySelector(".start-button");
    const powerMenu = document.getElementById("power-menu");
    if (startMenu && startButton) {
        document.addEventListener("click", function (e) {
            if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
                startMenu.style.display = "none";
            }
            if (!powerMenu.contains(e.target) && !e.target.closest(".power-btn")) {
                powerMenu.style.display = "none";
            }
        });
    } else if (attempt < 60) { // 最多尝试约 1 秒（60 帧）
        requestAnimationFrame(() => bindStartMenuAutoHide(attempt + 1));
    } else {
        console.warn("start-menu 或 start-button 元素未找到，未绑定点击关闭逻辑");
    }

}
bindStartMenuAutoHide();

//任务栏右键菜单
let currentContextTarget = null;

function showWindowContextMenu(e, winId) {
    e.preventDefault();

    const menu = document.getElementById("window-context-menu");
    currentContextTarget = document.getElementById(winId);
    menu.style.display = "block";  // 必须先显示，才能正确获取尺寸

    // 动态获取菜单宽高
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = e.pageX;
    let top = e.pageY;

    // 如果超出右边界
    if (left + menuWidth > viewportWidth) {
        left = viewportWidth - menuWidth - 8;
    }

    // 如果超出底部边界
    if (top + menuHeight > viewportHeight) {
        top = viewportHeight - menuHeight - 8;
    }

    menu.style.left = left + "px";
    menu.style.top = top + "px";
}

function minimizeTargetWindow() {
    if (!currentContextTarget) return;

    currentContextTarget.style.display = "none";

    // ✅ 设置 taskbar 图标为非激活状态
    const winId = currentContextTarget.id;
    const taskIcon = document.querySelector(`.taskbar-app[data-id='${winId}']`);
    if (taskIcon) taskIcon.classList.remove("active");
    hideWindowContextMenu();
    updateTaskbarActive(winId.replace("win-", ""), false);
}

function maximizeTargetWindow() {
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

function closeTargetWindow() {
    if (!currentContextTarget) return;

    currentContextTarget.remove();

    // ✅ 同步删除任务栏图标
    const winId = currentContextTarget.id;
    const taskIcon = document.querySelector(`.taskbar-app[data-id='${winId}']`);
    if (taskIcon) taskIcon.remove();

    currentContextTarget = null;

    hideWindowContextMenu();
}

function hideWindowContextMenu() {
    document.getElementById("window-context-menu").style.display = "none";
}
function refreshDesktop() {
    const desktop = document.querySelector(".desktop");

    // 示例：重载图标内容（可以自定义你的图标加载逻辑）
    // 先保存原始HTML结构
    const iconsHTML = desktop.querySelector(".desktop-icons")?.innerHTML;

    if (iconsHTML) {
        // 模拟重载：清空再重新插入图标HTML
        const iconContainer = desktop.querySelector(".desktop-icons");
        iconContainer.innerHTML = "";
        setTimeout(() => {
            iconContainer.innerHTML = iconsHTML;
        }, 100);  // 轻微延迟模拟刷新
    }

    // 可选：重新加载背景图
    const bg = document.querySelector(".desktop-background");
    if (bg && bg.tagName === "IMG") {
        const src = bg.src;
        bg.src = "";   // 清空
        setTimeout(() => {
            bg.src = src;  // 恢复原图
        }, 50);
    }

    // 可选：播放一个“刷新动效”
    desktop.classList.add("desktop-flash");
    setTimeout(() => desktop.classList.remove("desktop-flash"), 300);
}
// 全局点击关闭右键菜单
document.addEventListener("click", hideWindowContextMenu);



document.addEventListener("DOMContentLoaded", () => {
    setupLanguageControl();  // ⬅️ 自动执行简繁切换（根据 localStorage.lang）
});

//关机
function shutdownSystem() {
    // 1. 移除所有事件监听器（推荐先解绑自定义的）
    sessionStorage.removeItem('booted');
    const clone = document.body.cloneNode(false); // 深度为 false，仅保留结构
    document.body.parentNode.replaceChild(clone, document.body);

    // 2. 清除所有定时器（setInterval / setTimeout）
    let id = window.setTimeout(() => { }, 0);
    while (id--) window.clearTimeout(id);
    id = window.setInterval(() => { }, 0);
    while (id--) window.clearInterval(id);
    document.body.innerHTML = "";
    // 3. 清除本地存储缓存（可选）
    localStorage.clear();  // 若希望下次启动是干净的可以启用

    // 4. 清除页面内容只保留黑屏动画
    const shutdownOverlay = document.createElement("div");
    shutdownOverlay.style.position = "fixed";
    shutdownOverlay.style.top = 0;
    shutdownOverlay.style.left = 0;
    shutdownOverlay.style.width = "100vw";
    shutdownOverlay.style.height = "100vh";
    shutdownOverlay.style.backgroundColor = "black";
    shutdownOverlay.style.color = "white";
    shutdownOverlay.style.display = "flex";
    shutdownOverlay.style.flexDirection = "column";
    shutdownOverlay.style.justifyContent = "center";
    shutdownOverlay.style.alignItems = "center";
    shutdownOverlay.style.fontSize = "24px";
    shutdownOverlay.style.zIndex = "99999";
    shutdownOverlay.innerHTML = `
    <div style="margin-bottom: 20px;">WebWindows 正在关机...</div>
    <div class="loader"></div>
`;

    document.body.appendChild(shutdownOverlay);
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
                registration.unregister(); // 清除 PWA 缓存行为
            }
        });
    }
    // 5. 1.5秒后显示结束语，并“挂起”页面
    setTimeout(() => {
        shutdownOverlay.innerHTML = "<div>您已安全退出 WebWindows</div>";
        // 将 document 内容全部置空，降低内存占用
        document.body.innerHTML = "";
        document.body.appendChild(shutdownOverlay);
    }, 1500);

    // 6. （可选）尝试关闭窗口
    window.open('', '_self', '');
    window.close();

    // Android端末自动关闭
    if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) {
        Capacitor.Plugins.App.exitApp();
    }
}
function makeDesktopIconsDraggable() {
    const icons = document.querySelectorAll('.desktop .icon');
    icons.forEach(icon => {
        icon.draggable = true;

        icon.addEventListener('dragstart', e => {
            e.dataTransfer.setData("text/plain", icon.id);
            icon.classList.add('dragging');
        });

        icon.addEventListener('dragend', () => {
            icon.classList.remove('dragging');
        });
    });

    const desktop = document.querySelector('.desktop');
    desktop.addEventListener('dragover', e => {
        e.preventDefault();
    });

    desktop.addEventListener('drop', e => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        const icon = document.getElementById(id);
        if (icon) {
            // 将图标移动到 drop 位置的“最近网格”
            const gridX = Math.floor(e.offsetX / 116) * 116;
            const gridY = Math.floor(e.offsetY / 116) * 116;
            icon.style.position = 'absolute';
            icon.style.left = gridX + 'px';
            icon.style.top = gridY + 'px';
            icon.style.zIndex = Date.now();
        }
    });
}
function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(); // Safari
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen(); // IE11
    }
}
function setWallpaperByPath(path) {
    document.body.style.backgroundImage = `url('${path}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundAttachment = 'fixed';
}
document.addEventListener("DOMContentLoaded", () => {
    // 其他已有代码...

    // ✅ 加载保存的壁纸路径
    const savedWallpaper = localStorage.getItem("selectedWallpaper");
    if (savedWallpaper) {
        setWallpaperByPath(savedWallpaper);
    }
});
window.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});
function initUserStatus() {
  console.log("initUserStatus")
  const nameEl = document.getElementById('login-username');
  const avatarEl = document.getElementById('login-avatar');
  const statusDot = document.getElementById('login-status');

  const username = sessionStorage.getItem('webwindows_user');
  const nickname = sessionStorage.getItem('webwindows_user_nickname');
  
  if (username != '' && username != null) {
    nameEl.textContent = nickname; 
    avatarEl.src = "https://cdn-icons-png.flaticon.com/512/747/747376.png";
    statusDot.style.backgroundColor = '#44cc44';
    
  } else {
    nameEl.textContent = '线下用户';
    avatarEl.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    statusDot.style.backgroundColor = '#cc8800';
  }
  document.getElementById("user-popup").style.display = "none";
}
function showUserMenu() {
  const menu = document.getElementById("user-popup");
  const btn = document.getElementById("login-username");

  if (!menu || !btn) return;

  menu.classList.add('show');
}

function toggleUserPopup(e) {
  e.stopPropagation(); // 防止冒泡关闭
  const popup = document.getElementById('user-popup');
  popup.style.display = (popup.style.display === 'block') ? 'none' : 'block';
}

// 登录成功后绑定点击事件
const userArea = document.getElementById('login-username');
if (userArea) {
  userArea.addEventListener('click', toggleUserPopup);
}

// 点击其他区域自动关闭
document.addEventListener('click', function (e) {
  const popup = document.getElementById('user-popup');
  if (!popup.contains(e.target) && !document.getElementById('login-username').contains(e.target)) {
    popup.style.display = 'none';
  }
});


function logout() {
  sessionStorage.removeItem('webwindows_user');
  sessionStorage.removeItem('webwindows_user_nickname');
  document.getElementById("user-popup").style.display = "none";
  deleteCookie("webwindows_user");
  deleteCookie("webwindows_user_nickname");
  initUserStatus();
}
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}


function removeTaskbarIcon(winId) {
  const icon = document.querySelector(`.taskbar-app[data-id="${winId}"]`);
  if (icon) {
    icon.remove();
    console.log("已移除任务栏图标：", winId);
  } else {
    console.warn("未找到图标：", winId);
  }
}
