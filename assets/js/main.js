// main.js —— 仅负责把预编译的 IIFE/UMD 小部件挂载到页面
// 依赖：index.html 里已引入
//  1) vue.global.prod.js
//  2) dist-desktop/desktop-menus.global.js  或  desktop-menus.umd.js（二选一）
//  3) dist-weather/weather-widget.global.js 或  weather-widget.umd.js（二选一）
const WEBWINDOWS_REGIONS = window.WebWindowsLocale?.REGIONS || {
    CN: { code: 'CN', locale: 'zh-CN', timeZone: 'Asia/Shanghai' },
    JP: { code: 'JP', locale: 'ja-JP', timeZone: 'Asia/Tokyo' },
    TW: { code: 'TW', locale: 'zh-TW', timeZone: 'Asia/Taipei' },
    US: { code: 'US', locale: 'en-US', timeZone: 'America/New_York' }
};

function getWebWindowsRegion() {
    if (window.WebWindowsLocale) return window.WebWindowsLocale.getRegion();
    const code = localStorage.getItem('webwindows.region') || 'CN';
    const fallback = WEBWINDOWS_REGIONS[code] || WEBWINDOWS_REGIONS.CN;
    return {
        ...fallback,
        timeZone: localStorage.getItem('webwindows.timeZone') || fallback.timeZone
    };
}

function dateInTimeZone(date = new Date(), region = getWebWindowsRegion()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: region.timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    }).formatToParts(date);
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return new Date(Number(value.year), Number(value.month) - 1, Number(value.day));
}

document.addEventListener("DOMContentLoaded", () => {
    // Weather is mounted once by mountWeather() below.  Keeping a single
    // mount point prevents two independent widgets from updating in parallel.

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
(function () {
  function ensureEl(id) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      document.body.appendChild(el);
    }
    return el;
  }

  function mountDesktopMenus() {
    if (!window.DesktopMenusWidget || !window.Vue) {
      console.warn('[DesktopMenusWidget] 未加载到全局，跳过挂载');
      return;
    }
    // 避免二次挂载
    if (document.getElementById('ww-desktop-menus-root')?.__mounted) return;

    var root = ensureEl('ww-desktop-menus-root');

    try {
      // 可按需把旧逻辑里的动作桥接过来
      window.DesktopMenusWidget.mount(root, {
        ignoreSelectors: ['.window .buttons', '.taskbar', '#start-menu'],
        // 右键菜单点选回调（示例）
        onCommand(cmd) {
          switch (cmd) {
            case 'refresh':
              if (window.refreshDesktop) window.refreshDesktop();
              break;
            case 'settings':
              if (window.openWindow)
                window.openWindow('settings', '设置', 'settings.html', 'assets/icons/settings.png', true);
              break;
            // 其它命令根据你菜单项继续补
          }
        },
      });
      root.__mounted = true;
    } catch (e) {
      console.error('[DesktopMenusWidget] 挂载失败：', e);
    }
  }

  function mountWeather() {
    const Vue = window.Vue;
    const mod = window.WeatherTimeWidget; // 来自 weather-widget.umd.js 或 .global.js
    if (!Vue || !mod) {
        console.warn('[WeatherTimeWidget] 未加载到全局，或 Vue 未就绪，跳过挂载');
        return;
    }
    // 兼容 UMD/IIFE 两种导出：可能是组件，也可能是 {default: 组件}
    const Comp = mod.default || mod;
    if (!Comp) {
        console.error('[WeatherTimeWidget] 未找到组件导出：', mod);
        return;
    }

    const root = ensureEl('ww-weather-root');
    if (root.__app) return; // 避免重复挂载

    try {
        const app = Vue.createApp(Comp, /* props 可传这里 */ {});
        app.mount(root);
        root.__app = app;
        root.__mounted = true;
    } catch (e) {
        console.error('[WeatherTimeWidget] 挂载失败：', e);
    }
}

  document.addEventListener('DOMContentLoaded', function () {
    mountDesktopMenus();         // 再挂桌面/窗口右键菜单（Vue 版）
    mountWeather();              // 再挂天气部件（Vue 版）
  });
})();

// 在文档就绪后，等一帧再调用（保证前面的 defer 脚本已执行）
document.addEventListener('DOMContentLoaded', () => {
   updateTaskbarClock(true);
  requestAnimationFrame(() => {
    // 1) 用户状态初始化：优先用 Vue 暴露的，再退回到全局同名
    (function initUser() {
      const call = window.WW?.ui?.initUserStatus || window.initUserStatus;
      if (typeof call === 'function') call();
    })();

    // 2) 桌面图标拖拽：如果旧函数存在就调用一次
    if (typeof window.makeDesktopIconsDraggable === 'function') {
      window.makeDesktopIconsDraggable();
    }

    // 3) 全屏：只触发你已有的实现（如果存在）
    // if (typeof window.enterFullscreen === 'function') {
    //   window.enterFullscreen();
    // }

    // -------------------------------------
    // 4) 动态绑定 电源按钮
    // -------------------------------------
    const powerBtn = document.getElementById('power-button'); // 假设 ID
    if (powerBtn && window.togglePowerMenu) {
        powerBtn.addEventListener('click', window.togglePowerMenu);
    }
    // -------------------------------------
    // 6) 桌面壁纸
    // 从 localStorage 读取保存的路径
    const savedPath = localStorage.getItem("selectedWallpaper");

    // 检查路径是否存在，并且全局函数 setWallpaperByPath 已经可用
    if (savedPath && window.setWallpaperByPath) {
        console.log("[Wallpaper] 发现已保存的壁纸，正在加载:", savedPath);

        // 关键步骤：调用全局函数来设置壁纸
        window.setWallpaperByPath(savedPath);
    }
    // -------------------------------------
  });

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

let calendarDate = dateInTimeZone();
async function buildCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const region = getWebWindowsRegion();
    const today = dateInTimeZone(new Date(), region);
    const daysEl = document.getElementById('calendar-days');

    const holidayMap = await getCombinedHolidayMap(year, region.code);
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
        const weekday = currentDate.toLocaleDateString(region.locale, { weekday: 'short' });

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
    const calendar = document.getElementById('calendar-popup');
    const time = document.getElementById('taskbar-datetime');
    if (calendar && !calendar.contains(e.target) && !time.contains(e.target)) {
        calendar.style.display = 'none';
    }
});

  /**
 * 任务栏时钟功能
 * @param {boolean} initialRun - 是否是首次运行（用于启动定时器）
 */
function updateTaskbarClock(initialRun = false) {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');

    if (!timeEl || !dateEl) {
        // 元素不存在，停止运行
        console.warn('任务栏时钟元素未找到，跳过更新。');
        return;
    }

    const now = new Date();
    const region = getWebWindowsRegion();
    
    // 格式化时间 (例如：12:45)
    const timeString = now.toLocaleTimeString(region.locale, {
        timeZone: region.timeZone,
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false
    });
    
    // 格式化日期 (例如：2025/11/23)
    const dateString = now.toLocaleDateString(region.locale, {
        timeZone: region.timeZone,
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });

    timeEl.textContent = timeString;
    dateEl.textContent = dateString;

    // 首次运行时，设置定时器每秒更新
    if (initialRun) {
        // 使用 setTimeout + 递归，保证时间在秒数变化时准确同步
        const delay = 1000 - (now.getMilliseconds() % 1000);
        setTimeout(() => {
            updateTaskbarClock(false); // 第一次调用后，不再设置为 initialRun
            setInterval(updateTaskbarClock, 1000); // 启动每秒更新
        }, delay);
    }
}
});
function bindStartMenuAutoHide(attempt = 0) {
    const startMenu = document.getElementById("start-menu");
    const startButton = document.querySelector(".start-button");
    const powerMenu = document.getElementById("power-menu");
    const userPopup = document.getElementById("user-popup");
    const loginArea = document.getElementById("login-area");
    if (startMenu && startButton) {
        document.addEventListener("click", function (e) {
            if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
                startMenu.style.display = "none";
                if (typeof window.hideUserPopup === "function") window.hideUserPopup();
            }
            if (!powerMenu.contains(e.target) && !e.target.closest(".power-btn")) {
                powerMenu.style.display = "none";
            }
            if (
                userPopup &&
                !userPopup.contains(e.target) &&
                !loginArea?.contains(e.target) &&
                typeof window.hideUserPopup === "function"
            ) {
                window.hideUserPopup();
            }
        });
    } else if (attempt < 60) { // 最多尝试约 1 秒（60 帧）
        requestAnimationFrame(() => bindStartMenuAutoHide(attempt + 1));
    } else {
        console.warn("start-menu 或 start-button 元素未找到，未绑定点击关闭逻辑");
    }

}
/**
 * 设置桌面壁纸背景
 * @param {string} path - 壁纸图片的路径
 */
function setWallpaperByPath(path) {
    // 假设您的桌面根元素是 body
    const desktopEl = document.body;

    if (desktopEl) {
        desktopEl.style.backgroundImage = `url(${path})`;
        desktopEl.style.backgroundSize = 'cover';
        desktopEl.style.backgroundRepeat = 'no-repeat';
        desktopEl.style.backgroundPosition = 'center center';
    }
}

window.addEventListener('webwindows:region-changed', () => {
    calendarDate = dateInTimeZone();
    updateTaskbarClock(false);
    const popup = document.getElementById('calendar-popup');
    if (popup?.style.display === 'block') buildCalendar(calendarDate);
});

/**
 * Applies the user-selected zoom level to the complete desktop, including
 * floating windows and the taskbar.  WebWindows targets Chromium browsers,
 * where CSS zoom keeps fixed-position desktop controls aligned.
 */
function setDesktopScale(scale) {
    const normalizedScale = Number(scale);
    if (!Number.isFinite(normalizedScale) || normalizedScale < 0.75 || normalizedScale > 1.5) {
        return;
    }

    document.body.style.zoom = String(normalizedScale);
    localStorage.setItem("ui-scale", String(normalizedScale));
}

window.setDesktopScale = setDesktopScale;

document.addEventListener("DOMContentLoaded", () => {
    setDesktopScale(localStorage.getItem("ui-scale") || "1");
});

window.addEventListener("message", (event) => {
    if (event.data?.type === "set-desktop-scale") {
        setDesktopScale(event.data.scale);
    }
});

function openAbout() {
  document.getElementById('about-overlay').classList.add('show');
}

function closeAbout() {
  document.getElementById('about-overlay').classList.remove('show');
}

async function openGuide(topic) {
  const entry = topic
    ? `guide.html?topic=${encodeURIComponent(topic)}`
    : 'guide.html';
  try {
    if (window.WebWindows?.apps?.launch) {
      return await window.WebWindows.apps.launch('webwindows.system.guide', { url: entry });
    }
    return window.openWindow(
      'guide',
      '使用向导',
      entry,
      'assets/icons/guide.svg',
      true,
      '',
      '1060px',
      '740px'
    );
  } catch (error) {
    console.error('[Guide]', error);
    window.alert(error.message || '使用向导暂时无法打开。');
  }
}

function switchTabAbout(index) {
  const overlay = document.getElementById('about-overlay');
  const tabs = overlay?.querySelectorAll('.tabAbout') || [];
  const pages = overlay?.querySelectorAll('.page') || [];

  if (!tabs[index] || !pages[index]) {
    console.warn("switchTab 越界:", index, tabs.length, pages.length);
    return;
  }

  tabs.forEach(t => t.classList.remove('active'));
  pages.forEach(p => p.classList.remove('active'));

  tabs[index].classList.add('active');
  pages[index].classList.add('active');
}
/* 点击背景关闭 */
document.getElementById('about-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeAbout();
});
// ===== 音量模块 =====

const knob = document.getElementById('knob');
const label = document.getElementById('label');
const ring = document.getElementById('ring');
const panel = document.getElementById('volume-panel');
const volumeRange = document.getElementById('volume-range');
const deviceAudio = window.WebWindows?.device?.audio;

let volume = deviceAudio?.getVolume().value ?? 0.5;

const MIN = -135;
const MAX = 135;

let active = false;

// hover 控制
ring.addEventListener('mouseenter', () => {
  active = true;
  ring.classList.add('active');
});

ring.addEventListener('mouseleave', () => {
  active = false;
  ring.classList.remove('active');
});

// 设置音量
function setVolume(v, applyControl = true) {
  v = Math.max(0, Math.min(1, v));

  const step = 0.02;
  v = Math.round(v / step) * step;

  volume = v;

  const angle = MIN + (MAX - MIN) * volume;
  knob.style.transform = `rotate(${angle}deg)`;

  label.innerText = Math.round(volume * 100) + '%';
  if (volumeRange) volumeRange.value = String(Math.round(volume * 100));
  if (applyControl) {
    deviceAudio?.setVolume(volume).catch((error) => console.warn('[DeviceAPI]', error));
  }
}

// 滚轮控制
ring.addEventListener('wheel', (e) => {
  if (!active) return;

  e.preventDefault();
  e.stopPropagation();

  const direction = Math.sign(e.deltaY);
  setVolume(volume - direction * 0.02);

}, { passive: false });

const btn = document.getElementById('volume-btn');

btn.addEventListener('click', (e) => {
  e.stopPropagation();
  panel.classList.toggle('hidden');
});

volumeRange?.addEventListener('input', () => {
  setVolume(Number(volumeRange.value) / 100);
});

// 点击外部关闭
document.addEventListener('click', (e) => {
  if (!panel.contains(e.target) && e.target !== btn) {
    panel.classList.add('hidden');
  }
});

// 初始化
setVolume(volume, false);
window.addEventListener('webwindows:volume-change', (event) => {
  const next = Number(event.detail?.value);
  if (Number.isFinite(next)) setVolume(next, false);
});
bindStartMenuAutoHide();
