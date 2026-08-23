/* ===================================================================
 * legacyWindow.js  —  稳定版（不改旧逻辑，不注入外部样式）
 * - 旧类名：.window / .window-header / .title / .buttons / .button.{minimize|maximize|close} / .window-content
 * - 任务栏 & 右键：仅转发到页面里“已有的旧实现”
 * - 全局导出：仅在缺失时挂到 window，避免覆盖与递归
 * =================================================================== */

/* ---------- 0) 一次性快照旧全局（防递归，且不重定义） ---------- */
(function initBridge() {
  const g = typeof window !== 'undefined' ? window : globalThis;
  if (g.__WW_BRIDGE_INIT__) return;     // 已初始化就跳过
  g.__WW_BRIDGE_INIT__ = true;

  g.__WW_BRIDGE_EXTERNALS__ = {
    createTaskbarIcon     : g.createTaskbarIcon,
    updateTaskbarActive   : g.updateTaskbarActive,
    showWindowContextMenu : g.showWindowContextMenu,
    hideWindowContextMenu : g.hideWindowContextMenu,
  };
})();
const __EXT__ = (typeof window !== 'undefined' ? window : globalThis).__WW_BRIDGE_EXTERNALS__;

/* ---------- 1) 小工具 ---------- */
const WZ = { z: 1000 };

function _byId(id)      { return document.getElementById(id); }
function _winEl(winId)  { return _byId('win-' + winId); }
function _ensurePx(v,d) { if (v == null) return d; return /px$/.test(String(v)) ? v : `${v}`; }
function _activeIdFromEl(el){
  const t = el?.closest?.('.window');
  if (t?.id) return t.id.replace(/^win-/,'');
  const a = document.querySelector('.window.active') || document.querySelector('.window');
  return a?.id ? a.id.replace(/^win-/,'') : null;
}
function _layout(winEl){
  // 让内容自动铺满（不依赖外部 CSS）
  const header = winEl.querySelector('.window-header');
  const content = winEl.querySelector('.window-content');
  if (!content) return;
  const headerH = header?.offsetHeight || 34;
  winEl.style.position = 'absolute';
  content.style.position = 'absolute';
  content.style.left = '0';
  content.style.right = '0';
  content.style.top = headerH + 'px';
  content.style.bottom = '0';
  // iframe 100% 占满
  const ifr = content.querySelector('iframe');
  if (ifr) { ifr.style.width = '100%'; ifr.style.height = '100%'; ifr.style.border = '0'; }
}

/* ---------- 2) 触控优化（接口保留即可） ---------- */
function padTitleBarTouch(winEl, headerEl){ /* 若你有实现可填入 */ }

/* ---------- 3) 绑定行为（拖拽 / 三键 / 激活 / 右键 / 8向缩放） ---------- */
function bindWindowBehavior(winEl){
  if (!winEl || winEl.dataset.wwWindowBehaviorBound === '1') return;
  winEl.dataset.wwWindowBehaviorBound = '1';
  const header = winEl.querySelector('.window-header');
  const isCompactWindowLayout = () => window.matchMedia(
    '(max-width: 820px), (max-width: 1000px) and (max-height: 500px)'
  ).matches;

  // iframe 会覆盖窗口内容区的鼠标命中，必须提供位于最上层的独立缩放手柄。
  // 使用现有 .resizer 样式，同时为事件处理保存明确的缩放方向。
  if (winEl.dataset.wwResizeHandles !== '1') {
    ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach((resizeDir) => {
      const handle = document.createElement('div');
      handle.className = `resizer ${resizeDir}`;
      handle.dataset.resizeDir = resizeDir;
      handle.setAttribute('aria-hidden', 'true');
      winEl.appendChild(handle);
    });
    winEl.dataset.wwResizeHandles = '1';
  }

  const renderedScale = (element = winEl, rect = element?.getBoundingClientRect?.()) => {
    const scaleX = rect?.width && element?.offsetWidth ? rect.width / element.offsetWidth : 1;
    const scaleY = rect?.height && element?.offsetHeight ? rect.height / element.offsetHeight : 1;
    return {
      x: Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1,
      y: Number.isFinite(scaleY) && scaleY > 0 ? scaleY : 1,
    };
  };

  const availableBounds = (scale = { x: 1, y: 1 }) => {
    const viewport = window.visualViewport;
    const taskbarHeight = document.querySelector('.taskbar')?.offsetHeight || 43;
    return {
      width: Math.max(0, (viewport?.width || window.innerWidth) / scale.x),
      height: Math.max(0, (viewport?.height || window.innerHeight) / scale.y - taskbarHeight),
    };
  };

  // ------- 拖拽：Pointer Events 同时覆盖鼠标、触控笔与触摸设备 -------
  // 手机/窄屏由 CSS 固定为工作区全屏，避免手指拖动把窗口甩出可视区域。
  let moving = false, movePointerId = null;
  let moveStart = { pointerX: 0, pointerY: 0, left: 0, top: 0, scaleX: 1, scaleY: 1 };
  let moveHandler = null, stopMove = null;
  header?.addEventListener('pointerdown', (e) => {
    if (isCompactWindowLayout() || e.button !== 0 || e.target.closest('.buttons') || winEl.classList.contains('maximized')) return;
    e.preventDefault();
    moving = true;
    movePointerId = e.pointerId;
    winEl.classList.add('is-dragging');
    const rect = winEl.getBoundingClientRect();
    const scale = renderedScale(winEl, rect);
    moveStart = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      left: rect.left / scale.x,
      top: rect.top / scale.y,
      scaleX: scale.x,
      scaleY: scale.y,
    };
    winEl.style.left = moveStart.left + 'px';
    winEl.style.top = moveStart.top + 'px';
    focusTargetWindow(winEl);
    try { header.setPointerCapture(movePointerId); } catch (_) {}

    moveHandler = (ev) => {
      if (!moving || ev.pointerId !== movePointerId) return;
      if (ev.pointerType === 'mouse' && (ev.buttons & 1) === 0) {
        stopMove(ev);
        return;
      }
      ev.preventDefault();
      const scale = { x: moveStart.scaleX, y: moveStart.scaleY };
      const bounds = availableBounds(scale);
      const maxLeft = Math.max(0, bounds.width - winEl.offsetWidth);
      const maxTop = Math.max(0, bounds.height - (header.offsetHeight || 40));
      const nextLeft = moveStart.left + (ev.clientX - moveStart.pointerX) / scale.x;
      const nextTop = moveStart.top + (ev.clientY - moveStart.pointerY) / scale.y;
      winEl.style.left = Math.max(0, Math.min(maxLeft, nextLeft)) + 'px';
      winEl.style.top = Math.max(0, Math.min(maxTop, nextTop)) + 'px';
    };
    stopMove = (ev) => {
      if (!moving || (ev?.pointerId != null && ev.pointerId !== movePointerId)) return;
      const pointerId = movePointerId;
      moving = false;
      movePointerId = null;
      winEl.classList.remove('is-dragging');
      window.removeEventListener('pointermove', moveHandler, true);
      window.removeEventListener('pointerup', stopMove, true);
      window.removeEventListener('pointercancel', stopMove, true);
      header.removeEventListener('lostpointercapture', stopMove);
      window.removeEventListener('blur', stopMove);
      try { if (header.hasPointerCapture(pointerId)) header.releasePointerCapture(pointerId); } catch (_) {}
    };
    window.addEventListener('pointermove', moveHandler, true);
    window.addEventListener('pointerup', stopMove, true);
    window.addEventListener('pointercancel', stopMove, true);
    header.addEventListener('lostpointercapture', stopMove);
    window.addEventListener('blur', stopMove);
  });

  // ------- 8向缩放（边缘命中；最大化时禁用） -------
  const MARGIN = 6;
  const MIN_W = 320;
  const MIN_H = 180;
  let resizing = false;
  let dir = '';                // 'n'|'s'|'e'|'w'|'ne'|'nw'|'se'|'sw'
  let startX = 0, startY = 0;
  let startL = 0, startT = 0, startW = 0, startH = 0;

  function hitTest(e){
    const r = winEl.getBoundingClientRect();
    const x = e.clientX, y = e.clientY;
    let d = '';
    if (Math.abs(y - r.top)    <= MARGIN) d += 'n';
    if (Math.abs(y - r.bottom) <= MARGIN) d += 's';
    if (Math.abs(x - r.left)   <= MARGIN) d += 'w';
    if (Math.abs(x - r.right)  <= MARGIN) d += 'e';
    return d;
  }
  function updateCursor(d){
    const map = { n:'n-resize', s:'s-resize', e:'e-resize', w:'w-resize',
                  ne:'ne-resize', nw:'nw-resize', se:'se-resize', sw:'sw-resize' };
    winEl.style.cursor = map[d] || '';
  }

  winEl.addEventListener('pointermove', (e)=>{
    if (resizing || moving || winEl.classList.contains('maximized')) return;
    updateCursor(hitTest(e));
  });

  let resizePointerId = null;
  let resizeMove = null;
  let stopResize = null;
  let resizeIframeStates = [];

  winEl.addEventListener('pointerdown', (e)=>{
    if (isCompactWindowLayout() || e.button !== 0 || winEl.classList.contains('maximized')) return;
    const resizeHandle = e.target.closest?.('.resizer[data-resize-dir]');
    const d = resizeHandle?.dataset.resizeDir || hitTest(e);
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    focusTargetWindow(winEl);

    resizing = true;
    winEl.classList.add('is-resizing');
    dir = d;
    startX = e.clientX; startY = e.clientY;
    startL = winEl.offsetLeft; startT = winEl.offsetTop;
    startW = winEl.offsetWidth; startH = winEl.offsetHeight;
    const resizeScale = renderedScale(winEl);
    resizePointerId = e.pointerId;
    resizeIframeStates = Array.from(winEl.querySelectorAll('iframe')).map((iframe) => {
      const previousPointerEvents = iframe.style.pointerEvents;
      iframe.style.pointerEvents = 'none';
      return [iframe, previousPointerEvents];
    });
    try { winEl.setPointerCapture(resizePointerId); } catch {}

    resizeMove = (ev)=>{
      if (!resizing || ev.pointerId !== resizePointerId) return;
      if (ev.pointerType === 'mouse' && (ev.buttons & 1) === 0) {
        stopResize(ev);
        return;
      }
      let newL = startL, newT = startT, newW = startW, newH = startH;
      const dx = (ev.clientX - startX) / resizeScale.x;
      const dy = (ev.clientY - startY) / resizeScale.y;
      const bounds = availableBounds(resizeScale);
      const minW = Math.min(MIN_W, bounds.width);
      const minH = Math.min(MIN_H, bounds.height);

      if (dir.includes('e')) newW = Math.max(minW, Math.min(bounds.width - startL, startW + dx));
      if (dir.includes('s')) newH = Math.max(minH, Math.min(bounds.height - startT, startH + dy));
      if (dir.includes('w')) { newW = Math.max(minW, Math.min(bounds.width, startW - dx)); newL = Math.max(0, startL + startW - newW); }
      if (dir.includes('n')) { newH = Math.max(minH, Math.min(bounds.height, startH - dy)); newT = Math.max(0, startT + startH - newH); }

      winEl.style.left = newL + 'px';
      winEl.style.top  = newT + 'px';
      winEl.style.width  = newW + 'px';
      winEl.style.height = newH + 'px';
      _layout(winEl); // 内容自适应
    };

    stopResize = (ev)=>{
      if (!resizing) return;
      if (ev?.pointerId != null && ev.pointerId !== resizePointerId) return;
      resizing = false; dir = '';
      winEl.classList.remove('is-resizing');
      updateCursor('');
      const pointerId = resizePointerId;
      resizePointerId = null;
      window.removeEventListener('pointermove', resizeMove, true);
      window.removeEventListener('pointerup', stopResize, true);
      window.removeEventListener('pointercancel', stopResize, true);
      winEl.removeEventListener('lostpointercapture', stopResize);
      window.removeEventListener('blur', stopResize);
      resizeIframeStates.forEach(([iframe, previousPointerEvents]) => {
        iframe.style.pointerEvents = previousPointerEvents;
      });
      resizeIframeStates = [];
      try {
        if (pointerId != null && winEl.hasPointerCapture(pointerId)) {
          winEl.releasePointerCapture(pointerId);
        }
      } catch {}
    };

    window.addEventListener('pointermove', resizeMove, true);
    window.addEventListener('pointerup', stopResize, true);
    window.addEventListener('pointercancel', stopResize, true);
    winEl.addEventListener('lostpointercapture', stopResize);
    window.addEventListener('blur', stopResize);
  });

  // ------- 三个按钮（旧类名） -------
  const btnMin   = winEl.querySelector('.button.minimize');
  const btnMax   = winEl.querySelector('.button.maximize');
  const btnClose = winEl.querySelector('.button.close');
  btnMin  ?.addEventListener('click', () => minimizeTargetWindow(winEl.id.replace(/^win-/, '')));
  btnMax  ?.addEventListener('click', () => maximizeTargetWindow(winEl.id.replace(/^win-/, '')));
  btnClose?.addEventListener('click', () => closeTargetWindow   (winEl.id.replace(/^win-/, '')));

  // ------- 激活 -------
  winEl.addEventListener('pointerdown', () => focusTargetWindow(winEl));

  // ------- 右键：仅转发到你的旧实现 -------
  winEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const id = winEl.id.replace(/^win-/, '');
    showWindowContextMenu(e, id);
  });
  // 标题栏右键也单独绑定一份，避免事件被中途拦截
  header?.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const id = winEl.id.replace(/^win-/, '');
    showWindowContextMenu(e, id);
  });
  padTitleBarTouch(winEl, header);
}

/* ---------- 4) 任务栏（仅转发到旧实现） ---------- */
function createTaskbarIcon(id, title, iconUrl) {
    const existing = document.querySelector('.taskbar-app[data-id="win-' + id + '"]');
    if (existing) return;
    const taskbar = document.querySelector('.taskbar');
    if (!taskbar) return;
    let appStrip = taskbar.querySelector('.taskbar-app-strip');
    if (!appStrip) {
        appStrip = document.createElement('div');
        appStrip.className = 'taskbar-app-strip';
        appStrip.setAttribute('role', 'list');
        appStrip.setAttribute('aria-label', '已打开的窗口');
        taskbar.appendChild(appStrip);
    }
    const icon = document.createElement('div');
    icon.className = 'taskbar-app';
    icon.setAttribute('role', 'listitem');
    icon.tabIndex = 0;
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
        showWindowContextMenu(e, id);
    });
    document.addEventListener("click", () => {
        hideWindowContextMenu();
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
    appStrip.appendChild(icon);
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
    icon.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        icon.click();
    });
}
function updateTaskbarActive(id, isActive) {
    const icon = document.querySelector('.taskbar-app[data-id="win-' + id + '"]');
    if (icon) {
        icon.style.backgroundColor = isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)';
        icon.style.border = isActive ? '1px solid rgba(255,255,255,0.6)' : 'none';
    }
}
/* ---------- 5) 窗口右键（仅转发到旧实现） ---------- */
const MENU_ID_WIN = 'window-context-menu';

function _placeMenu(el, x, y) {
  if (!el) return;
  const pv = el.style.visibility, pd = el.style.display;
  el.style.visibility = 'hidden'; el.style.display = 'none';
  const mw = el.offsetWidth || 160, mh = el.offsetHeight || 120;
  const vw = innerWidth, vh = innerHeight;
  let nx = x, ny = y;
  if (nx + mw > vw) nx = Math.max(0, vw - mw - 4);
  if (ny + mh > vh) ny = Math.max(0, vh - mh - 4);
  el.style.visibility = pv || ''; el.style.display = pd || '';
  el.style.left = nx + 'px'; el.style.top = ny + 'px';
  el.style.position = 'absolute';
  el.style.zIndex = '2147483648';
}

function showWindowContextMenu(ev, id) {
  ev?.preventDefault?.();
  const menu = document.getElementById(MENU_ID_WIN);
  if (!menu) { console.warn('[ctx] #window-context-menu not found'); return; }

  // 把当前窗口 id 存到菜单上，菜单项里用 dataset.winId 取
  menu.dataset.winId = id ?? (document.querySelector('.window.active')?.id?.replace(/^win-/, '') || '');

  _placeMenu(menu, ev?.pageX ?? 0, ev?.pageY ?? 0);
  menu.style.display = 'block';
}

function hideWindowContextMenu() {
    const menu = document.getElementById(MENU_ID_WIN);
    if (!menu) return;

    // 1. 移除 'show' 类（如果使用 classList.add('show')）
    menu.classList.remove('show');
    
    // 2. 将 display 属性设为 'none'（以覆盖内联样式）
    menu.style.display = 'none'; 
}
/* ---------- 6) 聚焦（置顶 + active 类 + 任务栏同步） ---------- */
function focusTargetWindow(winElOrId){
  const el = typeof winElOrId === 'string' ? _winEl(winElOrId) : winElOrId;
  if (!el) return;
  document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
  el.classList.add('active');
  el.style.zIndex = ++WZ.z;
  updateTaskbarActive(el.id.replace(/^win-/, ''));
}

/* ---------- 7) 关闭 / 最小化 / 最大化 ---------- */
function closeTargetWindow(id){
  const el = _winEl(id) || _activeIdFromEl(document.activeElement);
  if (!el) return;
  el.remove();
  hideWindowContextMenu()
  removeTaskbarIcon(el.id);
}
function minimizeTargetWindow(id){
  const el = _winEl(id) || _activeIdFromEl(document.activeElement);
  if (!el) return;
  hideWindowContextMenu()
  el.style.display = (el.style.display === 'none' ? '' : 'none');
}
function maximizeTargetWindow(id){
  const el = _winEl(id) || _activeIdFromEl(document.activeElement);
  if (!el) return;

  if (!el.classList.contains('maximized')) {
    // 记住原始位置尺寸
    el.dataset.prevLeft   = el.style.left;
    el.dataset.prevTop    = el.style.top;
    el.dataset.prevWidth  = el.style.width;
    el.dataset.prevHeight = el.style.height;

    // 最大化
    el.classList.add('maximized');
    el.style.left = '0px';
    el.style.top  = '0px';
    const taskbarHeight = document.querySelector('.taskbar')?.offsetHeight || 0;
    el.style.width  = '100vw';
    el.style.height = `calc(100dvh - ${taskbarHeight}px)`;
  } else {
    // 还原
    el.classList.remove('maximized');
    if (el.dataset.prevLeft)   el.style.left   = el.dataset.prevLeft;
    if (el.dataset.prevTop)    el.style.top    = el.dataset.prevTop;
    if (el.dataset.prevWidth)  el.style.width  = el.dataset.prevWidth;
    if (el.dataset.prevHeight) el.style.height = el.dataset.prevHeight;
  }
  hideWindowContextMenu()
  _layout(el); // 内容自适应
}

/* ---------- 8) 打开窗口（按旧类名创建 DOM；内联布局保证内容铺满） ---------- */
function openWindow(id, title, url, iconUrl, useIframe = true, type = '', width = '900px', height = '640px'){
  // 云秘书特殊处理
  // --- 放在 openWindow(...) 的开头：专门处理云秘书根窗口 ---
    if (id === 'yunmishu_root') {
        // 已存在就前置 & 退出
        const existed = document.getElementById('win-yunmishu_root');
        if (existed) { existed.style.display=''; focusTargetWindow(existed); _layout(existed); return id; }

        const win      = document.createElement('div');
        const header   = document.createElement('div');
        const content  = document.createElement('div');

        // 根节点
        win.className = type ? `window ${type}` : 'window';
        win.id = 'win-yunmishu_root';
        win.style.position = 'absolute';
        win.style.left   = '120px';
        win.style.top    = '120px';
        win.style.width  = _ensurePx(width  ?? '700px',  '700px');
        win.style.height = _ensurePx(height ?? '400px',  '400px');
        win.style.zIndex = ++WZ.z;

        // 标题栏（旧类名）
        header.className = 'window-header';
        header.innerHTML = `
            <img class="window-icon" src="${iconUrl || 'assets/icons/cloud_secretary.png'}"/>
            <div class="title">${title || '云秘书'}</div>
            <div class="buttons">
            <div class="button minimize"  title="最小化">_</div>
            <div class="button maximize"  title="缩放">⬜</div>
            <div class="button close"     title="关闭">✕</div>
            </div>`;

        // 内容区（旧类名，铺满窗口）
        content.className = 'window-content';
        content.style.overflow = 'auto';
        content.style.background = 'rgb(255, 255, 255)';
        content.innerHTML = `
            <div class="folder-view" style="padding:1rem">
            <div class="icon-tile" onclick="
                openCloudWindow();
                setTimeout(()=>{ const w=document.getElementById('win-yunmishu_cloud'); if (w) w.style.zIndex = 2000; }, 80);
            ">
                <img src="assets/icons/cloud_secretary.png" />
                <span>云秘书对日外贸评测中心</span>
            </div>
            </div>`;

        // 组装
        win.appendChild(header);
        win.appendChild(content);
        document.body.appendChild(win);

        // 行为 & 布局 & 任务栏
        _layout(win);                 // 让内容区顶满
        bindWindowBehavior(win);      // 拖拽/缩放/三键/右键
        createTaskbarIcon(id, title || '云秘书', iconUrl || 'assets/icons/cloud_secretary.png');
        focusTargetWindow(win);
        return id;
    }

    // 已存在 → 聚焦
    const existing = _winEl(id);
    if (existing){ existing.style.display=''; focusTargetWindow(existing); _layout(existing); return id; }

    // 根节点（旧类名）
    const win = document.createElement('div');
    win.className = type ? `window ${type}` : 'window';
    win.id = 'win-' + id;
    win.style.left   = '120px';
    win.style.top    = '100px';
    win.style.width  = _ensurePx(width,  '900px');
    win.style.height = _ensurePx(height, '640px');
    win.style.zIndex = ++WZ.z;
    win.style.position = 'absolute'; // 关键

    // 标题栏（旧类名）
    const header = document.createElement('div');
    header.className = 'window-header';

    // 图标 + 标题（旧类名）
    const icon = document.createElement('img');
    if (iconUrl) icon.src = iconUrl;
    icon.className = 'window-icon';

    const tspan = document.createElement('div');
    tspan.className = 'title';
    tspan.textContent = title || id;

    // 控件（旧类名）
    const ctrls = document.createElement('div');
    ctrls.className = 'buttons';
    ctrls.innerHTML = `
        <div class="button minimize"  data-act="min">_</div>
        <div class="button maximize"  data-act="max">⬜</div>
        <div class="button close"     data-act="close">✕</div>
    `;

    header.appendChild(icon);
    header.appendChild(tspan);
    header.appendChild(ctrls);

    // 内容区（旧类名）
    const content = document.createElement('div');
    content.className = 'window-content';

    if (useIframe && url){
        const ifr = document.createElement('iframe');
        ifr.className = 'window-iframe';
        ifr.src = url;
        ifr.style.width = '100%';
        ifr.style.height = '100%';
        ifr.style.border = '0';
        content.appendChild(ifr);
    } else if (url) {
        content.textContent = url;
    }

    win.appendChild(header);
    win.appendChild(content);
    document.body.appendChild(win);

    // 布局 & 行为
    _layout(win);
    bindWindowBehavior(win);
    createTaskbarIcon(id, title, iconUrl);
    focusTargetWindow(win);
    return id;
}
/** 云秘书窗口 */
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
                                                                 <div class="button minimize"  data-act="min">_</div>
                                                                 <div class="button maximize"  data-act="max">⬜</div>
                                                                 <div class="button close"     data-act="close">✕</div>
                                                               </div>`

    padTitleBarTouch(win, titleBar);

    content.src = 'https://y0.hk/jpshop/';
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
        maximizeTargetWindow(win.id.replace(/^win-/, ''));
    }, 50);
    win.style.zIndex = "1001";
    createTaskbarIcon("yunmishu_cloud", "云秘书对日外贸评测中心", 'assets/icons/cloud_secretary.png')
    updateTaskbarActive(win.id, true);
}
function closeWindow(id){ closeTargetWindow(id); }

/* ---------- 9) 其它工具（保留接口，可按需实现） ---------- */
function clearAspSessionCookies(){ /* 如需可实现，这里留空 */ }
/* ---------- 9.1) 移除任务栏图标 ---------- */
function removeTaskbarIcon(winId) {
  const icon = document.querySelector(`.taskbar-app[data-id="${winId}"]`);
  if (icon) {
    icon.remove();
    console.log("已移除任务栏图标：", winId);
  } else {
    console.warn("未找到图标：", winId);
  }
}

/* ---------- 10) 导出（供模块引用） + 仅在缺失时挂到 window ---------- */
export {
  openWindow, closeWindow,
  closeTargetWindow, minimizeTargetWindow, maximizeTargetWindow,
  bindWindowBehavior, padTitleBarTouch,
  showWindowContextMenu, hideWindowContextMenu,
  createTaskbarIcon, updateTaskbarActive, removeTaskbarIcon,
  clearAspSessionCookies, focusTargetWindow, openCloudWindow
};

{
  const g = typeof window !== 'undefined' ? window : globalThis;
  // 只在缺失时挂到全局 —— 绝不覆盖你页面里已有的同名实现
  if (g.openWindow            == null) g.openWindow            = openWindow;
  if (g.closeWindow           == null) g.closeWindow           = closeWindow;
  if (g.closeTargetWindow     == null) g.closeTargetWindow     = closeTargetWindow;
  if (g.minimizeTargetWindow  == null) g.minimizeTargetWindow  = minimizeTargetWindow;
  if (g.maximizeTargetWindow  == null) g.maximizeTargetWindow  = maximizeTargetWindow;
  if (g.bindWindowBehavior    == null) g.bindWindowBehavior    = bindWindowBehavior;
  g.showWindowContextMenu = showWindowContextMenu;
  g.hideWindowContextMenu = hideWindowContextMenu;
  if (g.openCloudWindow == null) g.openCloudWindow = openCloudWindow;
  if (g.removeTaskbarIcon == null) g.removeTaskbarIcon = removeTaskbarIcon;
  // 任务栏通常由旧脚本提供，不在此覆盖：
  // if (g.createTaskbarIcon   == null) g.createTaskbarIcon   = createTaskbarIcon;
  // if (g.updateTaskbarActive == null) g.updateTaskbarActive = updateTaskbarActive;
}
