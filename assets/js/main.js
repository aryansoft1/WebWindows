// main.js —— 仅负责把预编译的 IIFE/UMD 小部件挂载到页面
// 依赖：index.html 里已引入
//  1) vue.global.prod.js
//  2) dist-desktop/desktop-menus.global.js  或  desktop-menus.umd.js（二选一）
//  3) dist-weather/weather-widget.global.js 或  weather-widget.umd.js（二选一）

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
    // 4) 动态绑定 用户菜单
    // -------------------------------------
    const userArea = document.getElementById('login-area');
    // 注意：使用 window.toggleUserPopup 引用被 Vue 导出的函数
    if (userArea && window.toggleUserPopup) { 
        userArea.addEventListener('click', window.toggleUserPopup);
    }

    // -------------------------------------
    // 5) 动态绑定 电源按钮
    // -------------------------------------
    const powerBtn = document.getElementById('power-button'); // 假设 ID
    if (powerBtn && window.togglePowerMenu) {
        powerBtn.addEventListener('click', window.togglePowerMenu);
    }
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
    
    // 格式化时间 (例如：12:45)
    const timeString = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false // 使用 24 小时制
    });
    
    // 格式化日期 (例如：2025/11/23)
    const dateString = now.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    }).replace(/\//g, '/'); // 确保格式化输出为 YYYY/MM/DD

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
