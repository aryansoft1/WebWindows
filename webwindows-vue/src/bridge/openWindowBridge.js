// src/bridge/openWindowBridge.js (v2 patched)
(function () {
function getApi() { return window.WindowManagerWidget || null }


function ensureMounted(target) {
var api = getApi()
if (!api) return
try { api.mount(target || '#desktop-vue-root') } catch (e) {}
}


function install() {
var api = getApi()
if (!api) {
console.error('[Bridge] WindowManagerWidget 未加载；请确认 window-manager-widget.js 的引入顺序')
return
}
ensureMounted()


// 旧签名：openWindow(id, title, url, iconUrl, useIframe=false, type='', width='700px', height='420px')
window.openWindow = function (id, title, url, iconUrl, useIframe, type, width, height) {
if (useIframe === void 0) useIframe = false
if (type === void 0) type = ''
if (width === void 0) width = '700px'
if (height === void 0) height = '420px'
ensureMounted()
var w = api.openWindow({ id: id, title: title, url: url, iconUrl: iconUrl, useIframe: useIframe, type: type, width: width, height: height })


// ✅ 云秘书等空 URL 的窗口：注入一个占位容器以供旧脚本渲染
if ((!url || url === '') && /^yunmishu/.test(String(id))) {
try {
var item = api._store && api._store.wins ? api._store.wins.find(function (x) { return x.id === id }) : null
if (item) item.html = '<div id="yunmishu-root" style="width:100%;height:100%"></div>'
} catch (e) {}
}
return w
}


// 任务栏回调兜底（旧系统可能有自定义实现）
if (typeof window.createTaskbarIcon !== 'function') window.createTaskbarIcon = function () {}
if (typeof window.updateTaskbarActive !== 'function') window.updateTaskbarActive = function () {}


// —— 右键菜单逻辑：记录当前窗口并显示 DOM 菜单
var _ctxWinId = null
function showCtxMenu(id, x, y) {
_ctxWinId = id
var menu = document.getElementById('window-context-menu')
if (!menu) return
menu.style.display = 'block'
menu.style.left = String(x) + 'px'
menu.style.top = String(y) + 'px'
function hide() { menu.style.display = 'none'; document.removeEventListener('click', hide, true) }
setTimeout(function () { document.addEventListener('click', hide, true) }, 0)
}
window.showWindowMenu = showCtxMenu
window.showTitlebarMenu = window.showTitlebarMenu || showCtxMenu


window.minimizeTargetWindow = function () {
if (!_ctxWinId) return
var api = getApi(); if (!api) return
var w = api._store && api._store.wins ? api._store.wins.find(function (x) { return x.id === _ctxWinId }) : null
if (w) w.visible = false
}
window.maximizeTargetWindow = function () {
if (!_ctxWinId) return
var api = getApi(); if (!api) return
var w = api._store && api._store.wins ? api._store.wins.find(function (x) { return x.id === _ctxWinId }) : null
if (w) api.toggleSize(w)
}
window.closeTargetWindow = function () {
if (!_ctxWinId) return
var api = getApi(); if (!api) return
api.closeWindow(_ctxWinId)
}


// 便捷 API（给旧脚本）
window.closeWindowById = function (id) {
var api = getApi(); if (!api) return
api.closeWindow(id)
}
window.bringWindowToFront = function (id) {
var api = getApi(); if (!api) return
var w = api._store && api._store.wins ? api._store.wins.find(function (x) { return x.id === id }) : null
if (w) api.bringToFront(w)
}
}


// 在所有 defer 脚本完成后再装配（含 main.js）
if (document.readyState === 'complete') install()
else window.addEventListener('load', install)
})()