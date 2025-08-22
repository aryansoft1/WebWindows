/* ===== 工具 ===== */
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.from((r||document).querySelectorAll(s))};
function statusDot(s){ return s==='online' ? '#22c55e' : '#f59e0b' }
function tint(hex,a){ a=(typeof a==='number')?a:.12; var h=String(hex||'').replace('#',''); if(h.length===3) h=h.split('').map(function(x){return x+x}).join(''); var r=parseInt(h.slice(0,2),16)||0,g=parseInt(h.slice(2,4),16)||0,b=parseInt(h.slice(4,6),16)||0; return 'rgba('+r+','+g+','+b+','+a+')' }
function randColor(){ return '#'+(Math.random()*0xffffff|0).toString(16).padStart(6,'0') }

/* ===== HUD + Alerter ===== */
var Overlay=(function(){var el=$('#hud'),txt=$('#hud-text'),undo=$('#hud-undo'),x=$('#hud-close');var t=null,fn=null;x&&(x.onclick=function(){h()});function s(m,k,u){if(!el)return;el.dataset.kind=k||'info';txt.textContent=m||'';fn=typeof u==='function'?u:null;undo.hidden=!fn;undo.onclick=function(){try{fn&&fn()}finally{h()}};el.classList.add('show');clearTimeout(t);t=setTimeout(h,3000)}function h(){el&&el.classList.remove('show');clearTimeout(t)}var ins=false,o=window.alert;function i(){if(ins)return;window.alert=function(m,k){s(String(m),k)};ins=true;s('Alerter 已接管 alert()','ok',function(){u();s('已撤销接管 alert()','info')})}function u(){if(ins){window.alert=o;ins=false}}return{HUD:{show:s,hide:h},Alerter:{install:i,uninstall:u}}})();window.Overlay=Overlay;

/* ===== 本地档案（“我”） ===== */
var PROFILE_KEY='ww_profile';
/* ===== DeskTalk: 聊天窗 居中 & 拖动（复用 openwindow 的思路） ===== */
(function(){
  function $(s, r){ return (r||document).querySelector(s); }

  // 默认居中（把 inline 的 inset/left/right 清掉）
  window.DT_centerChat = function(){
    var chat = document.getElementById('chat');
    if (!chat) return;

    // 1) 清除所有会干扰居中的 inline 定位（尤其是 inset）
    chat.style.inset = '';
    chat.style.right = 'auto';
    chat.style.bottom = 'auto';
    chat.style.transform = '';
    chat.classList.remove('center'); // 若之前加过

    // 2) 确保能量到尺寸（若当前没显示，临时显示但不闪）
    var wasHidden = getComputedStyle(chat).display === 'none' || !chat.classList.contains('show');
    var prevVis = chat.style.visibility;
    if (wasHidden) {
        chat.classList.add('show');
        chat.style.visibility = 'hidden'; // 不闪屏
    }

    // 3) 量尺寸，计算像素居中
    var w = chat.offsetWidth  || Math.min(520, Math.max(360, window.innerWidth * 0.42));
    var h = chat.offsetHeight || 360;
    var L = Math.max(8, Math.round((window.innerWidth  - w) / 2));
    var T = Math.max(8, Math.round((window.innerHeight - h) / 2));

    // 4) 用 left/top 像素定位到正中
    chat.style.left = L + 'px';
    chat.style.top  = T + 'px';
    chat.style.right = 'auto';
    chat.style.bottom = 'auto';

    if (wasHidden) {
        chat.style.visibility = prevVis || '';
    }
  };

  // 绑定标题栏拖动（逻辑等价于 openwindow 对 .window 的拖动）
  window.DT_bindChatDrag = function(){
    var win = $('#chat'); if(!win) return;
    var header = win.querySelector('header'); if(!header) return;
    if (header.dataset.dtDragBound === '1') return; // 只绑定一次
    header.dataset.dtDragBound = '1';

    let isDragging = false, offsetX = 0, offsetY = 0;

    header.addEventListener('mousedown', e => {
      // 点击到按钮/图标不触发拖动
      if (e.target.closest('.actions,button,.icon-btn')) return;

      const rect = win.getBoundingClientRect();
      // 清除 inset，改用 left/top
      win.style.inset = '';
      win.style.right = 'auto';
      win.style.bottom = 'auto';
      if (!win.style.left) win.style.left = rect.left + 'px';
      if (!win.style.top ) win.style.top  = rect.top  + 'px';

      isDragging = true;
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
    });
    // 绑定拖动时，加一条标题栏点击拦截
    header.addEventListener('click', function(e){
        const isBtn = e.target.closest('button');
        const inActions = e.target.closest('.actions');
        if (!isBtn && !inActions && e.currentTarget === header) {
            e.stopPropagation();
        }
e.stopPropagation(); }, true); // 注意第三个参数 true：在捕获阶段就拦住
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;

      // 约束在视口内（留 8px 边距）
      const pad = 8;
      const maxX = window.innerWidth  - win.offsetWidth  - pad;
      const maxY = window.innerHeight - win.offsetHeight - pad;
      x = Math.min(Math.max(pad, x), Math.max(pad, maxX));
      y = Math.min(Math.max(pad, y), Math.max(pad, maxY));

      win.style.left = x + 'px';
      win.style.top  = y + 'px';
      win.style.right = 'auto';
      win.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      // 持久化位置（下次打开继续用）
      localStorage.setItem('dt.chat.left',  win.style.left  || '');
      localStorage.setItem('dt.chat.top',   win.style.top   || '');
    });

    // 窗口尺寸变化时，保证仍在可视范围
    window.addEventListener('resize', () => {
      const rect = win.getBoundingClientRect();
      let L = Math.min(rect.left, window.innerWidth  - win.offsetWidth  - 8);
      let T = Math.min(rect.top , window.innerHeight - win.offsetHeight - 8);
      L = Math.max(8, L); T = Math.max(8, T);
      win.style.left = L + 'px';
      win.style.top  = T + 'px';
      win.style.right = 'auto';
      win.style.bottom = 'auto';
    });
  };
})();
// 对外暴露，方便你在“打开聊天窗”后调用一次
// 兼容旧调用名 → 映射到实际实现
window.DT_chatCenter   = window.DT_centerChat;
window.DT_makeChatDrag = window.DT_bindChatDrag;

function ensureProfile(){
  var me = JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');
  var first = !me;
  if(!me){
    var hasCrypto = typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function';
    var uuid = (hasCrypto && typeof window.crypto.randomUUID === 'function')
      ? window.crypto.randomUUID()
      : (Date.now().toString(36) + Math.random().toString(36).slice(2,8));
    me = { id:'guest_'+uuid, name:'访客-'+Math.random().toString(16).slice(2,6).toUpperCase(), color:randColor() };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(me));
  }
  return { me: me, first: false };
}
function getProfile(){ return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null') }
// 在 setProfile(p) 的末尾补这一句
function setProfile(p){
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  updateMeUI();
  try{ refreshMeId(); }catch(_){}
}
function updateMeUI(){
  var me=getProfile(); if(!me) return;
  var pillName=$('#me-pill-name'), pillAv=$('#me-pill-av');
  if(pillName) pillName.textContent = me.name || '我';
  if(pillAv) pillAv.style.background = me.color || '#999';

  var prefName=$('#pref-name'); 
  if(prefName){ 
    prefName.value = me.name || ''; 
    prefName.disabled = !DT_canEditName();     // ← 登录用户禁用输入
  }
  var prefSaveBtn = $('#pref-name-save');
  if (prefSaveBtn) prefSaveBtn.disabled = !DT_canEditName(); // ← 登录用户禁用保存
}
/* ===== WebWindows 登录状态检测（按你工程实际存储） ===== */
function wwGetLogin(){
  var ss = window.sessionStorage;
  var user = null, nick = (ss && ss.getItem('webwindows_user_nickname')) || '';
  // 1) sessionStorage: webwindows_user (优先)
  try { user = JSON.parse((ss && ss.getItem('webwindows_user')) || 'null'); } catch(e){ user = null; }

  if (user && (user.id || user.uid || user.username)) {
    var id = String(user.id || user.uid || user.username);
    var name = (nick && nick.trim()) || user.name || user.nickname || user.username || '';
    return { loggedIn: true, id: id, name: name.trim() };
  }

  // 2) Cookie 兜底：webwindows_user
  var m = document.cookie.match(/(?:^|;\s*)webwindows_user=([^;]*)/);
  if (m) {
    var raw = decodeURIComponent(m[1]);  // 可能是 JSON 或纯用户名
    var cu = null;
    try { cu = JSON.parse(raw); } catch(e) { cu = { username: raw }; }
    var cid = String(cu.id || cu.uid || cu.username || '');
    var cname = (nick && nick.trim()) || cu.name || cu.nickname || cu.username || '';
    if (cid) return { loggedIn: true, id: cid, name: cname.trim() };
  }

  // 3) 未登录
  return { loggedIn: false };
}

/* ===== 首次启动/登录切换的档案引导 =====
   规则：
   - 已登录：强制用 WebWindows 账户昵称与 ID（覆盖本地之前填的名字）
   - 未登录：静默分配游客，不弹改名
   - 仅游客可改名；登录用户昵称不可在此修改
   - 额外：备份游客名字/颜色，登出时可恢复
*/
function bootstrapProfile(){
  var me = getProfile();
  var ww = wwGetLogin(); // {loggedIn, id, name}

  if (ww.loggedIn){
    // 备份游客信息（仅首次从游客切换到登录时）
    if (me && String(me.id||'').indexOf('guest_')===0){
      localStorage.setItem('DT_GUEST_NAME_BACKUP',  me.name  || '');
      localStorage.setItem('DT_GUEST_COLOR_BACKUP', me.color || '');
    }

    // 构建登录档案：ID 必用登录 ID；名字优先用登录昵称（覆盖任何本地名字）
    var next = {
      id   : String(ww.id),
      name : (ww.name && ww.name.trim()) ? ww.name.trim()
                                         : ((me && me.name) ? me.name : '我'),
      color: (me && me.color) || hashColor(ww.id)
    };

    setProfile(next);          // 会触发 updateMeUI()
    localStorage.setItem('DT_NO_FIRST_PROMPT','1'); // 不弹首次改名
  } else {
    // 未登录：保持/生成游客，不弹改名
    if (!me){ ensureProfile(); me = getProfile(); }

    // 如有备份游客名/色且当前确为游客，恢复之（可选）
    if (String(me.id||'').indexOf('guest_')===0){
      var bname  = localStorage.getItem('DT_GUEST_NAME_BACKUP');
      var bcolor = localStorage.getItem('DT_GUEST_COLOR_BACKUP');
      if (bname){  me.name  = bname;  }
      if (bcolor){ me.color = bcolor; }
      setProfile(me);
    }

    localStorage.setItem('DT_NO_FIRST_PROMPT','1');
  }
}


/* ===== 用户池（虚拟） ===== */
var people = [];
// 顶部增加
let PRESENCE = [];                 // 仅保存服务器 presence 的权威列表
const NAME_CACHE = new Map();      // id -> name，供显示名复用


/* ===== 偏好 & 好友 ===== */
var PREF_KEY='ww_prefs'; var prefs=Object.assign({hide_reco:false,undiscoverable:false}, JSON.parse(localStorage.getItem(PREF_KEY)||'{}'));
function savePrefs(){ localStorage.setItem(PREF_KEY,JSON.stringify(prefs)) }
var FS_KEY='ww_friends'; var friendSet=new Set(JSON.parse(localStorage.getItem(FS_KEY)||'[]'));
function saveFriends(){ localStorage.setItem(FS_KEY, JSON.stringify(Array.from(friendSet))) }
function isFriend(id){ return friendSet.has(id) }

/* ===== 悬停信息卡 ===== */
var pop=$('#profile-pop'); var popTimer=null;
function showProfile(p,rect){
  if(!pop) return;
  pop.innerHTML='<div class="title">'+p.name+'</div>'
  + '<div class="muted" style="margin-top:2px">'+(p.status==='online'?'在线':p.last)+'</div>'
  + '<div class="caps">'
  + '  <span class="cap" title="文字">🗨️</span>'
  + '  <span class="cap '+(isFriend(p.id)?'':'lock')+'" title="语音">🎤</span>'
  + '  <span class="cap '+(isFriend(p.id)?'':'lock')+'" title="视频">🎥</span>'
  + '  <span class="cap '+(isFriend(p.id)?'':'lock')+'" title="文件">📎</span>'
  + '</div>'
  + '<div class="ops">'
  + '  <button class="btn primary" id="pop-chat">立即聊天</button>'
  + (isFriend(p.id)?'':'<button class="btn" id="pop-add">加好友</button>')
  + '</div>';
  var w=pop.offsetWidth||260,h=pop.offsetHeight||140; var x=Math.max(12,rect.right-w); var y=rect.bottom+8; if(y+h>window.innerHeight-12) y=rect.top-h-8;
  pop.style.left=x+'px'; pop.style.top=y+'px'; pop.style.display='block';
  $('#pop-chat').onclick=function(){ openChat(p,rect)};
  var add=$('#pop-add'); if(add){ add.onclick=function(){ friendSet.add(p.id); seedInboxOne(p.id); saveFriends(); renderAll(); Overlay.HUD.show('已添加「'+p.name+'」为好友','ok'); showProfile(p,rect) } }
}
function hideProfile(){ if(pop) pop.style.display='none' }

/* ===== 列表行 ===== */
function personRow(p){
  var row=document.createElement('div');
  row.className='row';
  row.dataset.pid = p.id;  // ★ 用于快速找到该用户的DOM
  row.style.background=tint(p.color,.10);
  row.style.borderColor=tint(p.color,.25);

  var av=document.createElement('div');
  av.className='av';
  av.style.background=p.color;
  av.style.boxShadow='0 0 0 3px '+tint(p.color,.25);

  // ★ 如果当前这个人有未读，初次渲染就让头像进入闪烁态
  try{
    var cid = makeConvId(API_ME || slugId(meName()), p.id);
    if (UNREAD && UNREAD[cid] > 0) { av.classList.add('blink'); }
  }catch(_){}

  var dot=document.createElement('span'); dot.className='dot'; dot.style.background=statusDot(p.status); av.appendChild(dot);

  var main=document.createElement('div');
  main.innerHTML='<div class="name">'+p.name+'</div><div class="last">'+p.last+'</div>';

  var cta=document.createElement('div');
  var btn=document.createElement('button'); btn.className='btn'; btn.textContent=isFriend(p.id)?'已是好友':'加好友';
  btn.onclick=function(e){ e.stopPropagation(); if(isFriend(p.id)) return Overlay.HUD.show('已在你的好友列表','info'); friendSet.add(p.id);seedInboxOne(p.id); saveFriends(); Overlay.HUD.show('已添加「'+p.name+'」为好友','ok'); renderAll() };
  cta.appendChild(btn);

  row.appendChild(av); row.appendChild(main); row.appendChild(cta);

  row.onclick=function(){ openChat(p, av.getBoundingClientRect()) };
  row.addEventListener('mouseenter',function(){ clearTimeout(popTimer); showProfile(p,av.getBoundingClientRect()) });
  row.addEventListener('mouseleave',function(){ popTimer=setTimeout(hideProfile,150) });
  if(pop){ pop.addEventListener('mouseenter',function(){ clearTimeout(popTimer) }); pop.addEventListener('mouseleave',function(){ popTimer=setTimeout(hideProfile,120) }) }

  return row;
}


/* ===== 虚拟列表 ===== */
function VList(container, scrollEl, rowHeight, overscan, renderer){
  this.el=container; this.scrollEl=scrollEl; this.rowH=rowHeight||62; this.overscan=overscan||8; this.renderer=renderer||function(x){return x};
  this.data=[]; this.start=0; this.end=0;
  this.viewport=document.createElement('div'); this.viewport.className='vlist-viewport';
  this.phantom=document.createElement('div'); this.phantom.className='vlist-phantom';
  if(this.el){ this.el.innerHTML=''; this.el.appendChild(this.viewport); this.el.appendChild(this.phantom) }
  this.onScroll=this.onScroll.bind(this);
  if(this.scrollEl) this.scrollEl.addEventListener('scroll', this.onScroll, {passive:true});
  window.addEventListener('resize', this.onScroll);
}
VList.prototype.setData=function(arr){
  this.data=arr||[];
  if(!this.phantom) return;
  this.phantom.style.height=(this.data.length*this.rowH)+'px';
  this.onScroll(true);
}
VList.prototype.onScroll=function(force){
  if(!this.el || !this.scrollEl) return;
  var topOffset = this.el.offsetTop - this.scrollEl.offsetTop;
  var y = this.scrollEl.scrollTop - topOffset;
  var viewH=this.scrollEl.clientHeight;
  var start=Math.max(0, Math.floor(Math.max(0,y)/this.rowH)-this.overscan);
  var end=Math.min(this.data.length, start + Math.ceil(viewH/this.rowH) + this.overscan*2);
  if(!force && start===this.start && end===this.end) return;
  this.start=start; this.end=end;
  this.viewport.style.transform='translateY('+(start*this.rowH)+'px)';
  this.viewport.innerHTML='';
  for(var i=start;i<end;i++){ var node=this.renderer(this.data[i], i); this.viewport.appendChild(node) }
}

/* ===== 实例化 ===== */
var scroller=$('#sheet-inner');
var vReco = new VList($('#reco-list'), scroller, 62, 10, personRow);
var vFriends = new VList($('#friends-list'), scroller, 62, 10, personRow);

/* ===== 过滤/渲染 ===== */
function renderReco(){
  var q=(($('#reco-q')||{}).value||'').toLowerCase();
  var only=(($('#reco-online')||{}).checked)||false;
  var me = (typeof getProfile === 'function' ? (getProfile()||{}) : {});

  var arr = people
    .filter(function(p){ return !(only && p.status!=='online') })
    .filter(function(p){ return p.name.toLowerCase().includes(q) })
    // ← 新增这一段：排除自己
    .filter(function(p){
      // 优先按 id 排除；若服务器没回 id（id 等于 name 的回退），再按 name 排除
      if (me && me.id && String(p.id||'') === String(me.id)) return false;
      if ((!p.id || p.id === p.name) && me && me.name && p.name === me.name) return false;
      return true;
    });

  vReco.setData(arr);
}
// 只有访客（id 以 guest_ 开头）才允许改名
function DT_canEditName(){
  var me = getProfile() || {};
  var id = String(me.id || '');
  return id.indexOf('guest_') === 0;
}
function renderFriends(){
  var q=(($('#friends-q')||{}).value||'').toLowerCase(); var only=(($('#friends-online')||{}).checked)||false;
  var arr = people.filter(function(p){ return isFriend(p.id) })
                  .filter(function(p){ return !(only && p.status!=='online') })
                  .filter(function(p){ return p.name.toLowerCase().includes(q) });
  vFriends.setData(arr);
}


function renderAll(){ renderReco(); renderFriends(); reapplyUnreadFlash(); }
/* ===== 面板/Tab/不打扰 ===== */
var fab=$('#fab'), sheet=$('#presence-sheet'), xBtn=$('#presence-close'), mask=$('#overlay-mask');
var tabBtnReco=$('#tab-btn-reco'), tabBtnFriends=$('#tab-btn-friends'), tabBtnAI=$('#tab-btn-ai'), tabBtnSettings=$('#tab-btn-settings');tabBtnMailbox=$('#tab-btn-mailbox');

var activeTab='reco';
function switchTab(t){
  activeTab = t;
  var a=$('#tab-reco'), b=$('#tab-friends'), c=$('#tab-ai'), d=$('#tab-mailbox');
  if(a) a.style.display = (t==='reco') ? 'block' : 'none';
  if(b) b.style.display = (t==='friends') ? 'block' : 'none';
  if(c) c.style.display = (t==='ai') ? 'block' : 'none';
  if(d) d.style.display = (t==='mailbox') ? 'block' : 'none';

  var btns=[tabBtnReco,tabBtnFriends,tabBtnAI,tabBtnMailbox];
  for(var i=0;i<btns.length;i++){ if(btns[i]) btns[i].classList.remove('primary') }
  var map={reco:tabBtnReco,friends:tabBtnFriends,ai:tabBtnAI,mailbox:tabBtnMailbox};
  var act=map[t]; if(act) act.classList.add('primary');

  vReco.onScroll(true); vFriends.onScroll(true);
}
if(tabBtnReco)    tabBtnReco.onclick    = function(){ switchTab('reco') };
if(tabBtnFriends) tabBtnFriends.onclick = function(){ switchTab('friends') };
if(tabBtnAI)      tabBtnAI.onclick      = function(){ switchTab('ai') };
if(tabBtnMailbox)tabBtnMailbox.onclick= function(){ switchTab('mailbox') };

function openPanel(tab){
  tab = tab || 'reco';
  sheet.classList.add('show'); applyPrefs(true);
  if(tabBtnReco && tabBtnReco.style.display==='none' && tab==='reco') tab='friends';
  switchTab(tab);
  mask.style.display='block';
  vReco.onScroll(true); vFriends.onScroll(true);
}
function closePanel(){
  sheet.classList.remove('show'); hideProfile();
  if(!(chat && chat.classList.contains('show'))) mask.style.display='none';
}
if(fab)  fab.onclick  = function(){ openPanel(prefs.hide_reco?'friends':'reco') };
if(xBtn) xBtn.onclick = function(){ closePanel() };

// 统一点击行为：
// - 点击聊天窗口：不隐藏右侧面板，不关闭聊天窗
// - 点击其它区域：若右侧面板打开 → 隐藏面板；聊天窗不受影响
document.addEventListener('click', function(e){
  const target   = e.target;
  const path     = (typeof e.composedPath === 'function') ? e.composedPath() : null;

  // 任务栏按钮（白名单）
  const btn      = document.querySelector('#btn-desktalk');
  const isTaskbar = !!(btn && (target === btn || (target.closest && target.closest('#btn-desktalk'))));

  // 是否在右侧面板内
  const inSheet  = !!(sheet && (sheet.contains(target) || (target.closest && target.closest('#presence-sheet'))));
  // 是否在聊天窗内
  const inChat   = !!(chat  && ((path ? path.indexOf(chat) >= 0 : chat.contains(target)) ||
                                 (target.closest && target.closest('#chat'))));

  // —— 只要点击在“非面板区域”，且不是任务栏按钮、且不在聊天窗里 → 关闭面板
  if (sheet && sheet.classList.contains('show') && !inSheet && !isTaskbar && !inChat) {
    closePanel();
  }

  // —— 不再因为“点空白区域”关闭聊天窗（聊天窗只靠自身按钮关闭）
  //     如需“点遮罩关闭聊天窗”，可改为：
  // const maskEl = document.getElementById('overlay-mask');
  // const onMask = !!(maskEl && (target === maskEl));
  // if (chat && chat.classList.contains('show') && onMask) closeChat(true);
}, true);

if(scroller) scroller.addEventListener('scroll', function(){ hideProfile() }, {passive:true});

var dndToggle=$('#dnd-toggle'); var DND=true;
if(dndToggle) dndToggle.addEventListener('change',function(){
  DND=dndToggle.checked;
  Overlay.HUD.show(DND?'已开启不打扰（仅徽标）':'已关闭不打扰','info');
});

/* ===== 设置 ===== */
var chkHideReco=$('#pref-hide-reco'); var chkUndisc=$('#pref-undiscoverable'); var privacyHint=$('#privacy-hint');
function applyPrefs(toast){
  toast = !!toast;
  if(tabBtnReco) tabBtnReco.style.display = prefs.hide_reco ? 'none' : '';
  if(prefs.hide_reco && activeTab==='reco') switchTab('friends');
  document.body.classList.toggle('undiscoverable', !!prefs.undiscoverable);
  if(privacyHint) privacyHint.textContent = prefs.undiscoverable ? '你已选择“不被推荐”。不会出现在附近/推荐/搜索中（演示标记，需后端配合）。' : '你目前允许被发现。';
  if(toast) Overlay.HUD.show('隐私设置已更新','ok');
}
if(chkHideReco){ chkHideReco.checked=!!prefs.hide_reco; chkHideReco.addEventListener('change',function(){ prefs.hide_reco=chkHideReco.checked; savePrefs(); applyPrefs(true) }) }
if(chkUndisc){ chkUndisc.checked=!!prefs.undiscoverable; chkUndisc.addEventListener('change',function(){ prefs.undiscoverable=chkUndisc.checked; savePrefs(); applyPrefs(true) }) }

/* ===== 昵称弹窗 ===== */
var modal=$('#profile-modal'), modalName=$('#modal-name'), modalColor=$('#modal-color');
var btnRand=$('#modal-rand'), btnSave=$('#modal-save'), btnCancel=$('#modal-cancel'), mePill=$('#me-pill'), prefSave=$('#pref-name-save');
if(btnRand) btnRand.onclick=function(){ modalColor.style.background = randColor() };
// 弹窗保存：登录用户不能改“名”，但可以改“颜色”
if(btnSave) btnSave.onclick=function(){
  var me=getProfile(); if(!me) return;
  var allowName = DT_canEditName();
  if (allowName){
    var nv = (modalName.value || '').trim();
    if (nv) me.name = nv;
  }
  // 颜色任何人都可改（如你想登录用户也锁颜色，把下一行放进 allowName 的 if 内）
  me.color = modalColor && modalColor.style ? (modalColor.style.background || me.color) : me.color;

  setProfile(me);
  Overlay.HUD.show(allowName ? '昵称/颜色已保存' : '颜色已保存（登录账户昵称不可在此修改）', 'ok');
  modal.style.display='none';
};

// 打开弹窗：根据身份禁用名称输入框
if(mePill) mePill.onclick=function(){
  var me=getProfile(); 
  if (modalName){ 
    modalName.value = (me && me.name) ? me.name : ''; 
    modalName.disabled = !DT_canEditName();      // ← 登录用户禁用编辑名字
  }
  if (modalColor) modalColor.style.background = me.color || '#999';
  modal.style.display='flex';
  if (DT_canEditName() && modalName) modalName.focus();
};

// 设置页保存：登录用户禁止改名（保留你原有 HUD）
if(prefSave) prefSave.onclick=function(){
  if (!DT_canEditName()){ 
    Overlay.HUD.show('已登录：昵称由系统账户管理，不能在此修改','warn'); 
    return; 
  }
  var me=getProfile(); var v=($('#pref-name').value||'').trim();
  if(v){ me.name=v; setProfile(me); Overlay.HUD.show('昵称已更新','ok') }
  // 立刻上报一次，避免等 30 秒
  if (typeof __hb === 'function') { setTimeout(__hb, 150); }
};


/* ===== 聊天（接入 /api/dt_get_conv.asp & /api/dt_send_link.asp & /api/dt_presence_mem.asp） ===== */
var chat=$('#chat'), chatName=$('#chat-name'), chatStatus=$('#chat-status'), chatBody=$('#chat-body'), chatInput=$('#chat-input');
var chatAdd=$('#chat-add'), btnVoice=$('#btn-voice'), btnVideo=$('#btn-video'), btnFile=$('#btn-file');
var sendBtn=$('#chat-send'), closeBtn=$('#chat-close'), minBtn=$('#chat-min');
if(sendBtn) sendBtn.onclick=sendCurrent;
if(closeBtn) closeBtn.onclick=function(){ closeChat(true) };
if(minBtn)  minBtn.onclick=function(){ closeChat(true) };

var currentPeer=null, lastAnchor=null;
/* —— 时间分组状态 —— */
var lastTimeHeaderKey = null;      // 记录上一次渲染的分钟key

// —— 保底：再次绑定聊天窗口的按钮（打开时再绑一遍）——
function wireChatControls(){
  var sendBtn = $('#chat-send');
  var closeBtn = $('#chat-close');
  var minBtn = $('#chat-min');

  if (sendBtn && !sendBtn._dtBound){
    sendBtn._dtBound = 1;
    sendBtn.addEventListener('click', sendCurrent);
  }
  if (closeBtn && !closeBtn._dtBound){
    closeBtn._dtBound = 1;
    closeBtn.addEventListener('click', function(e){
      e.stopPropagation();   // 防止被“点窗外关闭”的全局监听误判
      closeChat(true);
    });
  }
  if (minBtn && !minBtn._dtBound){
    minBtn._dtBound = 1;
    minBtn.addEventListener('click', function(e){
      e.stopPropagation();
      closeChat(true);
    });
  }
}
// 先尝试绑一次（如果当下就能取到 DOM 就直接生效）
wireChatControls();

// —— 兜底：代理型监听（即使以后结构变化也能关）——
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('#chat-close, #chat-min');
  if (b){
    e.stopPropagation();
    closeChat(true);
  }
}, true); // 捕获阶段，优先执行


/* === 时间工具 === */
// 把秒级时间戳转成 "YYYY-MM-DD HH:mm"
function fmtDateTime(ts){
  const d = msgDate({ ts: Number(ts) }); // ts: 服务器返回的 UTC 秒
  return showLocal(d);                   // 本地时区显示
}
// 以“分钟”为单位的分组 key（同一分钟只显示一次时间条）
function minuteKey(ts){
  const d = msgDate({ ts: Number(ts) });
  return Math.floor(d.getTime() / 60000); // 本地分钟
}
// 需要时在消息列表中插入时间分割条
function ensureTimeHeader(ts){
  if(!chatBody) return;
  var key = minuteKey(ts);
  if(key !== lastTimeHeaderKey){
    var bar = document.createElement('div');
    bar.className = 'time-sep';
    bar.textContent = fmtDateTime(ts);
    chatBody.appendChild(bar);
    lastTimeHeaderKey = key;
  }
}
function meSlug(){
  const me = (typeof getProfile === 'function' ? getProfile() : null) || {};
  // 优先用稳定 ID，退回昵称/展示名
  return slugId(me.id || me.name || meName());
}

/* === 与后端保持一致的 ID 清洗 === */
function safeId(s){
  s = String(s||'').toLowerCase();
  var out=''; for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if((c>='a'&&c<='z')||(c>='0'&&c<='9')||c==='_'||c==='-') out+=c;
  }
  return out || 'guest';
}
function makeConvId(a,b){ a=slugId(a); b=slugId(b); return [a,b].sort().join('__') }
function meName(){
  var me=getProfile && getProfile(); var v=(me&&me.name)||'guest';
  var q=new URLSearchParams(location.search); if(q.get('u')) v=q.get('u');
  return v;
}
function peerNameFrom(p){
  var q=new URLSearchParams(location.search); if(q.get('to')) return q.get('to');
  return (p&&p.name)? p.name : 'peer';
}

/* === API === */
var API_ROOT='/api/';
function urlGet(convId, since, limit){
  return API_ROOT+'dt_get_conv.asp?convId='+encodeURIComponent(convId)
    +(since?('&since='+since):'')+'&limit='+(limit||50);
}
function urlSend(meId, convId, toId, body){
  return API_ROOT+'dt_send_link.asp?u='+encodeURIComponent(meId)
    +'&convId='+encodeURIComponent(convId)
    +'&to='+encodeURIComponent(toId)
    +'&content='+encodeURIComponent(body);
}

/* === Markdown 渲染 === */
function mdHTML(txt){
  var s = String(txt==null?'':txt);
  if(window.marked && window.DOMPurify){
    try{
      var html = marked.parse(s);
      return DOMPurify.sanitize(html, {USE_PROFILES:{html:true}});
    }catch(e){}
  }
  // 兜底：纯文本
  return s.replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"})[c]});
}
function appendMsg(o){
  if(!chatBody) return;
  // 先插入时间分割条（按分钟合并）
  ensureTimeHeader(o && o.ts);
  var role = (o.from==='me'||o.role==='me') ? 'me' : 'peer';
  var div=document.createElement('div'); div.className='msg '+role;
  var html = mdHTML(o.body||o.raw||'');
  div.innerHTML = html;
  // 代码高亮
  if(window.hljs){ div.querySelectorAll('pre code').forEach(function(el){ try{ hljs.highlightElement(el) }catch(_){}}) }
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* === 能力开关（加好友后开启语音/视频/文件） === */
function setCaps(){
  var f = currentPeer ? (typeof isFriend==='function' && isFriend(currentPeer.id)) : false;
  var caps=[btnVoice,btnVideo,btnFile];
  for (var i=0;i<caps.length;i++){ if(caps[i]) caps[i].classList.toggle('lock', !f) }
  if(chatAdd) chatAdd.hidden = f;
}
function attempt(label,fn){ if(!currentPeer) return; if(!(typeof isFriend==='function' && isFriend(currentPeer.id))) return Overlay && Overlay.HUD && Overlay.HUD.show && Overlay.HUD.show('请先加「'+currentPeer.name+'」为好友以使用'+label,'warn'); fn() }
async function resolveConvIdFor(peer){
  const meId   = meSlug();                          // 稳定ID
  const meNameSlug = slugId(meName());              // 旧昵称slug
  const peerId = slugId(peer.id || peer.name || '');
  const peerNameSlug = slugId(peer.name || '');

  const convNew = makeConvId(meId, peerId);         // 新：id-id
  const convOld1 = makeConvId(meNameSlug, peerId);  // 旧：name-id
  const convOld2 = makeConvId(meNameSlug, peerNameSlug); // 旧：name-name

  const mapKey = `conv.map.${meId}.${peerId}`;
  const cached = localStorage.getItem(mapKey);
  if (cached) return cached;

  // 逐个探测旧桶是否有消息（limit=1）
  for (const cid of [convOld1, convOld2]){
    if (await hasMessages(cid)) {
      localStorage.setItem(mapKey, cid);
      return cid;  // 旧桶有历史 ⇒ 继续沿用旧桶
    }
  }
  // 都没有 ⇒ 用新桶
  localStorage.setItem(mapKey, convNew);
  return convNew;
}

async function hasMessages(cid){
  const r = await fetch(urlGet(cid, 0, 1), {credentials:'omit', cache:'no-store'});
  if (!r.ok) return false;
  let j=null; try{ j = await r.json(); }catch(e){}
  return j && Array.isArray(j.messages) && j.messages.length>0;
}
// 刷新“我方标识”（用于判断 me/peer）
function refreshMeId(){
  API_ME = meSlug();   // meSlug() 你已有：优先 me.id，回退昵称
}

if(btnVoice) btnVoice.onclick=function(){ attempt('语音通话',function(){ Overlay && Overlay.HUD && Overlay.HUD.show && Overlay.HUD.show('（占位）开始语音','info') }) };
if(btnVideo) btnVideo.onclick=function(){ attempt('视频通话',function(){ Overlay && Overlay.HUD && Overlay.HUD.show && Overlay.HUD.show('（占位）开始视频','info') }) };
if(btnFile)  btnFile.onclick=function(){ attempt('发送文件',function(){ Overlay && Overlay.HUD && Overlay.HUD.show && Overlay.HUD.show('（占位）发送文件','info') }) };
if(chatAdd) chatAdd.onclick=function(){ if(currentPeer && typeof friendSet!=='undefined'){ friendSet.add(currentPeer.id); saveFriends && saveFriends(); Overlay && Overlay.HUD && Overlay.HUD.show && Overlay.HUD.show('已添加「'+currentPeer.name+'」为好友','ok'); setCaps(); renderAll && renderAll() } };

/* === 会话状态 === */
var API_ME='', API_PEER='', CONV_ID='', lastTs=0, pollTimer=null;

async function openChat(p, rect){
  try{
    // 1) 记录当前会话对象 & 清未读
    currentPeer = p || currentPeer || {};
    if (p && p.id && typeof clearPeerUnread === 'function') clearPeerUnread(p.id);
    if (rect) lastAnchor = rect;

    // 2) 刷新“我方标识”（仅用于 me/peer 判定）
    if (typeof refreshMeId === 'function') refreshMeId();

    // 3) 统一“旧规则”的会话ID（保证历史立刻可见）
    API_PEER   = slugId(peerNameFrom(currentPeer));
    const MY_LEGACY = slugId(meName());              // 我方昵称 slug（旧规则）
    CONV_ID    = makeConvId(MY_LEGACY, API_PEER);    // 只保留这一种，不再混用 resolveConvIdFor 的结果

    // 4) 头部 UI
    const peerText = currentPeer?.name || peerNameFrom(currentPeer) || '';
    if (chatName){
      if (chatName.firstChild && chatName.firstChild.nodeType === Node.TEXT_NODE) {
        chatName.firstChild.nodeValue = peerText + ' ';
      } else {
        chatName.textContent = peerText;
      }
    }
    if (chatStatus){
      const st = (currentPeer && currentPeer.status) || 'idle';
      chatStatus.textContent = (st === 'online') ? '在线' : '离开';
    }
    if (chat){
      const av  = chat.querySelector('.av');
      const dot = chat.querySelector('.dot');
      if (av)  av.style.background  = (currentPeer && currentPeer.color) || '#93c5fd';
      if (dot) dot.style.background = (typeof statusDot === 'function' ? statusDot((currentPeer && currentPeer.status) || 'idle') : '#9ca3af');
    }

    // 5) 定位：优先锚点；否则用历史位置；都没有则居中
    if (rect && chat){
      var tail=6, est=chat.offsetHeight||360, width=Math.min(420,Math.max(300,window.innerWidth*0.32));
      var x=Math.max(12,rect.right-width); var y=rect.top-est-tail; if(y<12) y=rect.bottom+tail;
      chat.style.left=x+'px'; chat.style.top=y+'px';
      chat.style.bottom='auto'; chat.style.right='auto'; chat.style.inset='';
    } else if (chat){
      var savedL = localStorage.getItem('dt.chat.left');
      var savedT = localStorage.getItem('dt.chat.top');
      if (savedL && savedT){
        chat.style.inset=''; chat.style.left=savedL; chat.style.top=savedT;
        chat.style.right='auto'; chat.style.bottom='auto';
      } else {
        setTimeout(()=>{ if (window.DT_centerChat) DT_centerChat(); }, 0);
      }
    }

    // 6) 展示/聚焦/遮罩 + 重新绑定按钮与拖拽
    if (chat){
      chat.classList.add('show');
      if (chatInput) chatInput.focus();
      var mask = document.getElementById('overlay-mask');
      if (mask) mask.style.display = 'block';
    }
    if (typeof wireChatControls === 'function') wireChatControls();
    if (window.DT_bindChatDrag) DT_bindChatDrag();
    setTimeout(()=>{ if (window.DT_forceCenter) DT_forceCenter(); }, 0);
    if (typeof setCaps === 'function') setCaps();

    // 7) 复位本地指针与去重缓存（关键：解决“再打开无消息”）
    if (typeof setConvPtr === 'function') setConvPtr(CONV_ID, 0);
    if (chatBody) chatBody.innerHTML = '';
    if (renderedIds && renderedIds.clear) renderedIds.clear();
    if (seenKeys    && seenKeys.clear)    seenKeys.clear();
    if (Array.isArray(recentlySent))      recentlySent.length = 0;
    lastTs = 0;
    lastTimeHeaderKey = null;

    // 8) 清该会话未读（角标/标题）
    (function resetUnreadForPeer(){
      if (typeof UNREAD !== 'undefined' && UNREAD && UNREAD[CONV_ID]) {
        TOTAL_UNREAD = Math.max(0, TOTAL_UNREAD - UNREAD[CONV_ID]);
        UNREAD[CONV_ID] = 0;
      }
      if (typeof setBadge === 'function') setBadge(TOTAL_UNREAD);
      if (TOTAL_UNREAD === 0 && typeof stopTitleFlash === 'function') stopTitleFlash();
    })();

    // 9) 拉历史并开始轮询
    await fetchHistory();
    startPolling();

  }catch(err){
    console.error('openChat error:', err);
  }
}

/* === 关闭会话 === */
function closeChat(toTray){
  toTray = !!toTray;
  stopPolling();
  if(chat) chat.classList.remove('show');
  if(toTray && currentPeer && typeof createTrayChip==='function'){ createTrayChip(currentPeer); if(typeof DND==='undefined'||!DND){ Overlay && Overlay.HUD && Overlay.HUD.show && Overlay.HUD.show('来自「'+currentPeer.name+'」的对话已最小化','info') } }
  if(!(('#presence-sheet' && $('#presence-sheet').classList.contains('show')))) { $('#overlay-mask') && ($('#overlay-mask').style.display='none') }
}
function stopPolling(){
  if (pollTimer){ clearTimeout(pollTimer); pollTimer = null; }
}

function startPolling(){
  stopPolling();
  let baseDelay = document.hidden ? 3000 : 1000;

  async function tick(){
    try{
      await fetchNew();  // 串行取，完成后再排下一次
    }catch(e){}
    baseDelay = document.hidden ? 3000 : 1000;
    pollTimer = setTimeout(tick, baseDelay);
  }
  tick();
}

/* === 拉取 & 追加 === */
function fromServerToRole(fromId, m){
  var f = slugId(fromId||'');
  if (f === API_ME) return 'me';

  // 兜底：如果后端把 from 写错了，但 to 指向当前会话对方
  // 且 from 不是对方，则把它视为我方，避免我方气泡变灰
  try{
    if (m && slugId(m.to||'') === API_PEER && f !== API_PEER) return 'me';
  }catch(_){}

  return 'peer';
}

function parseTsSec(m){
  // 优先 ISO，退回数字；同时兼容毫秒/秒
  if (m && m.ts_iso){
    const ms = Date.parse(m.ts_iso);           // ISO -> 毫秒
    if (!isNaN(ms)) return Math.floor(ms/1000);
  }
  const n = Number(m && m.ts);
  if (!isNaN(n)) return (n > 1e12) ? Math.floor(n/1000) : Math.floor(n);
  // 兼容旧 id 形如 "1688888888-xxxx.json"
  const m1 = (m && m.id || '').match(/^(\d{10})-/);
  return m1 ? Number(m1[1]) : 0;
}

function appendServerMsgs(arr){
  if(!Array.isArray(arr) || !arr.length) return;

  // 统一升序
  arr = arr.slice().sort(function(a,b){
    var ta = Number(a && a.ts) || 0;
    var tb = Number(b && b.ts) || 0;
    return ta - tb;
  });

  for (var i=0;i<arr.length;i++){
    var m = arr[i];
    var body = m.body || m.raw || '';
    var fromId = String(m.from || '');
    var tsSec = (typeof m.ts === 'number' || typeof m.ts === 'string')
      ? ((Number(m.ts) > 1e12) ? Math.floor(Number(m.ts)/1000) : Number(m.ts))
      : (m.ts_iso ? Math.floor(new Date(m.ts_iso).getTime()/1000) : 0);

    // ① 计算去重 key（优先用 id；无 id 用 ts+from+body 兜底）
    var key = m.id ? ('id:'+m.id) : ('f:'+fromId+'|t:'+tsSec+'|b:'+body);
    if (m.id && renderedIds.has(m.id)) continue;
    if (seenKeys.has(key)) continue;

    // ② 过滤“自己刚刚发过”的回声（本地乐观回显）
    if (fromId === String(API_ME)) {
      var ECHO_WINDOW = 8; // 秒
      var echo = recentlySent.some(function(x){
        return x.body === body && Math.abs(tsSec - x.ts) <= ECHO_WINDOW;
      });
      if (echo) {
        if (m.id) renderedIds.add(m.id);
        seenKeys.add(key);
        lastTs = Math.max(lastTs, tsSec || 0);
        continue;
      }
    }

    // ③ 真正渲染
 appendMsg({ from: fromServerToRole(m.from), body: m.body||m.raw||'', ts: tsSec }); 
    try{
      var fromRole = fromServerToRole(m.from);     // 'me' | 'peer'
      if (fromRole === 'peer') {
        var senderId = slugId(m.from);             // 统一成 slug
        var isOpenSamePeer = (
          chat && chat.classList.contains('show') &&
          currentPeer && slugId(currentPeer.id) === senderId
        );
        if (isOpenSamePeer) {
          // 只在“消息已经渲染到当前会话里”时清未读 & 停闪
          clearUnreadFor(currentPeer.id);          // 你已有的函数
          if (UNREAD && UNREAD[CONV_ID]){          // 更新总未读徽标（若你在用它）
            TOTAL_UNREAD = Math.max(0, TOTAL_UNREAD - UNREAD[CONV_ID]);
            UNREAD[CONV_ID] = 0;
            setBadge(TOTAL_UNREAD);
            if (TOTAL_UNREAD === 0) stopTitleFlash && stopTitleFlash();
          }
        } else {
          // 没在这个会话界面里 → 标记未读（让头像继续闪）
          markPeerUnread && markPeerUnread(senderId);
        }
      }
    }catch(e){}


    // ④ 记录已见 & 推进 lastTs
    if (m.id) renderedIds.add(m.id);
    seenKeys.add(key);
    lastTs = Math.max(lastTs, tsSec || 0);

    // ⑤ 未读 & 闪烁（不是我、且不在当前打开的会话）
    var peerId = slugId(fromId);
    var isActiveOpen = currentPeer
      && slugId(currentPeer.id) === peerId
      && chat && chat.classList.contains('show');

    if (peerId !== API_ME && !isActiveOpen) {
      markPeerUnread(peerId);           // 列表头像闪
      // 灵动岛提示（不打扰时不弹）
      if (!DND) {
        var p = people.find(function(x){ return x.id === peerId; }) || { id: peerId, name: fromId, color:'#93c5fd' };
        showIsland(p, body);
      }
    }
  }
}

// —— 统一把任意时间 -> “秒级 Unix 时间戳”（优先 ts，兜底 ts_iso）
function toSec(x){
  if (x == null) return 0;

  // 传进来可能是整条消息对象
  if (typeof x === 'object'){
    if (x.ts != null) return toSec(x.ts);
    if (x.ts_iso){
      var d = new Date(x.ts_iso);
      return isNaN(d) ? 0 : Math.floor(d.getTime()/1000);
    }
    return 0;
  }

  // 数字字符串
  if (typeof x === 'string'){
    if (/^\d+$/.test(x)) x = Number(x);
    else {
      var d = new Date(x); // 允许直接传 ISO 字符串
      return isNaN(d) ? 0 : Math.floor(d.getTime()/1000);
    }
  }

  // 数字：毫秒 -> 秒
  if (typeof x === 'number'){
    return (x > 1e12) ? Math.floor(x/1000) : Math.floor(x);
  }
  return 0;
}

function bump(ts){
  const s = toSec(ts);
  if (s) lastTs = Math.max(lastTs, s);
}
async function fetchHistory(){
  try{
    var r = await fetch(urlGet(CONV_ID, 0, 50), { credentials:'omit', cache:'no-store' });
    var j = await r.json();
    if(j && j.ok && Array.isArray(j.messages)){ appendServerMsgs(j.messages) }
  }catch(e){}
}
/* === 拉取新消息（带防缓存 + 边界回退） === */
async function fetchNew(){
  // 防“边界等于 lastTs 时被过滤”：回退 1 秒（不小于 0）
  const sinceParam = Math.max(0, (lastTs || 0) - 1);
  const bust = Date.now() + '-' + Math.random().toString(36).slice(2,7);
  const url = urlGet(CONV_ID, sinceParam, 100) + '&_t=' + bust;

  try{
    const r = await fetch(url, {
      credentials:'omit',
      cache:'no-store'        // 禁缓存
    });
    const j = await r.json();
    if(j && j.ok && Array.isArray(j.messages) && j.messages.length){
      // 这里标记“这批是新消息”（与 init 历史区别开）
      appendServerMsgs(j.messages, { asNew:true });
    }
  }catch(e){}
}
// 将任意昵称 -> 稳定 ASCII ID（大小写不敏感，中文会被编码成 _<base36 codepoint>）
function slugId(s){
  s = String(s||'').trim();
  if(!s) return 'u'+Date.now().toString(36);
  var out = '';
  for (var i=0;i<s.length;i++){
    var code = s.codePointAt(i), ch = s[i];
    if (code>0xffff) i++;                    // 兼容高位码点
    if (/[a-z0-9_-]/i.test(ch)) out += ch.toLowerCase();
    else out += '_'+code.toString(36);       // 把中文等非 ASCII 编成 _k4z… 这样的片段
  }
  return out || 'u'+Date.now().toString(36);
}
// 已渲染的服务器消息 id，避免重复渲染
var renderedIds = new Set();
var seenKeys = new Set(); // 兜底去重（无 id 时也能去重）
// 最近发送的消息（去重用，秒级时间戳窗口）
var recentlySent = [];
/* === 发送 === */
async function sendCurrent(){
  var v=(chatInput&&chatInput.value||'').trim();
  if(!currentPeer || !v) return;
  if(chatInput) chatInput.value='';

   // ① 本地乐观回显
   var nowSec = Math.floor(Date.now()/1000);
  appendMsg({from:'me', body:v, ts:nowSec});

  // ② 记入最近发送，供去重判断使用
  recentlySent.push({ body: v, ts: nowSec });
  if (recentlySent.length > 10) recentlySent.shift();
  try{
    const res = await fetch(urlSend(API_ME, CONV_ID, API_PEER, v), { credentials:'omit' });
    // 若服务端返回了 key，把文件名加入已渲染集合，避免稍后再次渲染
    res && res.json && res.json().then(function(j){
      if (j && j.key) {
        var id = String(j.key).split('/').pop(); // 1755xxxx-abcdef.json
        if (id) renderedIds.add(id);
      }
    }).catch(function(){}); // 不是 JSON 也无妨
  }catch(e){}
  setTimeout(fetchNew, 400);
}
if(chatInput) chatInput.addEventListener('keydown',function(e){ if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){ e.preventDefault(); sendCurrent() }});

/* === 在线心跳 === */
try{
  var __hb = function(){
    var me = (typeof getProfile === 'function') ? getProfile() : null;
    if(!me) return;
    // 仅用稳定 ID 识别用户；昵称仅作展示（可选）
    fetch('/api/dt_presence_mem.asp?u=' + encodeURIComponent(me.name), 
         { credentials: 'omit', cache: 'no-store', headers: { 'Accept': 'application/json' }});
  };
  __hb(); setInterval(__hb, 30000);
}catch(e){}

/* ===== 任务栏 ===== */
// 未读集合（按 peerId）
var unreadPeers = new Set();

// 打开/关闭某个 peer 的闪烁
function flashPeerUI(peerId, on){
  // 任务栏图标：只要有任何未读就闪
  var btn = $('#btn-desktalk');
  if (btn) btn.classList.toggle('blink-tray', on || unreadPeers.size > 0);

  // 列表里的头像：只点亮该 peer 所在的行
  $$('#reco-list .row, #friends-list .row').forEach(function(row){
    if (row.dataset && row.dataset.pid === peerId) {
      var av = row.querySelector('.av');
      if (av) av.classList.toggle('blink', on);
    }
  });
}
// —— 稳定拿名字：优先登录昵称；否则使用持久的游客名 —— 
function DT_getStableName(){
  // 1) 优先用你已有的 me.name / WebWindows 昵称
  let n = (window.me && me.name) || sessionStorage.getItem('webwindows_user_nickname') || '';

  // 2) 没有的话，用本地持久“游客名”（只生成一次，之后一直复用）
  if (!n) {
    let gid = localStorage.getItem('dt.gid');
    if (!gid){ gid = Math.random().toString(16).slice(2,6).toUpperCase(); localStorage.setItem('dt.gid', gid); }

    n = localStorage.getItem('dt.guest_name');
    if (!n){ n = '游客-' + gid; localStorage.setItem('dt.guest_name', n); }
  }
  return n;
}

function markPeerUnread(peerId){
  if (!peerId) return;
  unreadPeers.add(peerId);
  flashPeerUI(peerId, true);
  bumpBadge && bumpBadge();   // 你原来的角标+1
}

function clearPeerUnread(peerId){
  if (!peerId) return;
  unreadPeers.delete(peerId);
  flashPeerUI(peerId, false);
}

// 渲染后把闪烁状态补回（renderAll() 会重建列表 DOM）
function reapplyUnreadFlash(){
  unreadPeers.forEach(function(id){ flashPeerUI(id, true); });
}
var btnDT = $('#btn-desktalk'),
    badge = $('#dt-badge'),
    tbCenter = $('#tb-center');

if (btnDT) {
  btnDT.onclick = function () {
    // 仅弹出右侧面板，固定打开通知列表（reco）
    openPanel('reco');
  };
}

function bumpBadge(){
  //  var n=Number((badge&&badge.textContent)||'0')+1; if(badge){ badge.textContent=n; badge.hidden=false }
  var badge = document.querySelector('#dt-badge');
  if (badge) badge.remove();
}
function createTrayChip(p){
  if(!tbCenter) return;
  var exist=Array.from(tbCenter.querySelectorAll('.tb-chip')).find(function(x){return x.dataset.pid===p.id});
  if(exist) exist.remove();
  var chip=document.createElement('div'); chip.className='tb-chip'; chip.dataset.pid=p.id;
  chip.innerHTML='<span class="mini" style="background:'+p.color+'"></span><span>'+p.name+'</span>';
  chip.onclick=function(){ openChat(p,lastAnchor); chip.remove() };
  tbCenter.appendChild(chip);
}

/* === 本地已读指针（每个会话一个） === */
const READPTR_KEY = 'ww_read_ptr';
let READ_PTR = {};
try{ READ_PTR = JSON.parse(localStorage.getItem(READPTR_KEY) || '{}') }catch(_){}
function saveReadPtr(){ localStorage.setItem(READPTR_KEY, JSON.stringify(READ_PTR)) }
function getConvPtr(convId){ return Number(READ_PTR[convId] || 0) || 0; }
function setConvPtr(convId, sec){ READ_PTR[convId] = Math.max(getConvPtr(convId), Number(sec)||0); saveReadPtr(); }

/* ===== AI（示例） ===== */
var aiBody=$('#ai-body'), aiInput=$('#ai-input'), aiSend=$('#ai-send');
  // === AI 接入配置（chatproxy.asp / OpenAI兼容） ===
  var AI_API_URL = '/cloud/desktalk/chatproxy.asp'; // 若不在同级目录，请改成实际路径，如 '/api/chatproxy.asp'
  var AI_MODEL   = 'hunyuan-lite'; // 请替换为你的可用模型名
  var aiHistory  = [{ role:'user', content:'你是“WebWindows·小讯”，回答简洁清晰，可用中文，支持少量 Markdown。公司名是成都亚原软件有限公司。小讯是桌讯的插件，桌讯是WebWindows插件，WebWindows是中国的Web操作系统'}];

  function extractAIText(data){
    try{
      if(data==null) return '(空响应)';
      if(typeof data==='string') return data;
      if(Array.isArray(data)) return data.map(extractAIText).join('\n');
      if(data.choices && data.choices.length){
        var c=data.choices[0];
        if(c.message && typeof c.message.content==='string') return c.message.content;
        if(typeof c.text==='string') return c.text;
        if(c.delta && c.delta.content) return c.delta.content;
      }
      if(typeof data.content==='string') return data.content;
      if(typeof data.reply==='string') return data.reply;
      if(typeof data.output==='string') return data.output;
      if(data.data && typeof data.data.text==='string') return data.data.text;
      return JSON.stringify(data);
    }catch(e){ return '解析失败：'+e.message; }
  }
function aiAppend(role, text){
  if(!aiBody) return;
  var row = document.createElement('div');
  row.style.display='flex'; row.style.gap='8px'; row.style.alignItems='flex-start';

  var tag = document.createElement('div');
  tag.textContent = (role==='me' ? '我' : '小讯');
  tag.style.fontWeight='700'; tag.style.minWidth='4ch';

  var bubble = document.createElement('div');
  bubble.className = 'bubble';

  // AI 消息：Markdown -> HTML（净化后插入），并给代码块高亮
  if (role !== 'me' && window.marked && window.DOMPurify) {
    try {
      var html = marked.parse(String(text ?? ''));
      html = DOMPurify.sanitize(html, {USE_PROFILES: {html: true}});
      bubble.innerHTML = html;
      if (window.hljs) {
        bubble.querySelectorAll('pre code').forEach(function(el){ hljs.highlightElement(el) });
      }
    } catch (e) {
      bubble.textContent = String(text ?? '');
    }
  } else {
    // 用户消息：保持纯文本
    bubble.textContent = String(text ?? '');
  }

  // 气泡样式
  bubble.style.padding='8px 10px';
  bubble.style.border='1px solid var(--border)';
  bubble.style.borderRadius='10px';
  if (role==='me') bubble.style.background='rgba(59,130,246,.12)';

  row.appendChild(tag); row.appendChild(bubble);
  aiBody.appendChild(row); aiBody.scrollTop=aiBody.scrollHeight;
}if(aiSend) aiSend.onclick=sendAI;
if(aiInput) aiInput.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); sendAI() }});
function sendAI(){

  var v=(aiInput&&aiInput.value||'').trim();
  if(!v) return;
  if(aiInput) aiInput.value='';
  aiAppend('me', v);

  // 入队历史
  aiHistory.push({ role:'user', content:v });

  // 发送请求
  var oldTxt = aiSend && aiSend.textContent;
  if(aiSend){ aiSend.disabled=true; aiSend.textContent='思考中…'; }
  fetch(AI_API_URL, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ model: AI_MODEL, messages: aiHistory, temperature: 0.7, stream: false })
  }).then(function(res){
    return res.text().then(function(t){ try{ return {ok:res.ok, data:JSON.parse(t)} }catch(_){ return {ok:res.ok, data:t} }});
  }).then(function(res){
    if(!res.ok){
      var errTxt = (typeof res.data==='string') ? res.data : JSON.stringify(res.data);
      aiAppend('ai', '错误：' + errTxt.substring(0,300));
      return;
    }
    var text = extractAIText(res.data);
    aiAppend('ai', text);
    aiHistory.push({ role:'assistant', content:text });
  }).catch(function(err){
    aiAppend('ai', '网络或接口异常：' + (err && err.message ? err.message : err));
  }).finally(function(){
    if(aiSend){ aiSend.disabled=false; aiSend.textContent = oldTxt || '发送'; }
  });
}

/* ===== 模拟来消息 ===== */if(false){

function pushIncoming(){
  var p=people[Math.floor(Math.random()*people.length)];
  if(!currentPeer||currentPeer.id!==p.id){ bumpBadge(); if(!DND){ Overlay.HUD.show('来自「'+p.name+'」的新消息','info') } }
  if(currentPeer&&currentPeer.id===p.id){ appendMsg({from:'peer', body:'（模拟）给你发一条消息'}) }
}
setTimeout(pushIncoming,1800); setInterval(pushIncoming,22000);
setInterval(function(){
  var idx=Math.floor(Math.random()*people.length); var p=people[idx];
  p.status=(Math.random()>.35)?'online':'idle';
  p.last=p.status==='online'?'在线':(Math.floor(Math.random()*15)+1)+' 分钟前';
  renderAll();
  if(currentPeer&&currentPeer.id===p.id){
    if(chatStatus) chatStatus.textContent=p.status==='online'?'在线':'离开';
    if(chat) chat.querySelector('.dot').style.background=statusDot(p.status);
  }
},9000);


}
/* ===== 启动 ===== */
['reco-q','reco-online'].forEach(function(id){ var el=$('#'+id); if(el) el.addEventListener('input',renderReco) });
['friends-q','friends-online'].forEach(function(id){ var el=$('#'+id); if(el) el.addEventListener('input',renderFriends) });
function tickClock(){ var d=new Date(); var clk=$('#clock'); if(clk) clk.textContent=d.toTimeString().slice(0,5) } tickClock(); setInterval(tickClock,1000);

var prof = ensureProfile();
var firstProfile = (prof && prof.me) ? prof.me : null;
var isFirst = !!(prof && prof.first);

bootstrapProfile();   // ← 先与登录状态对齐（会覆盖本地名为登录昵称）
updateMeUI();
renderAll(); 
applyPrefs();
refreshMeId();  // 档案就绪后立即刷新

// 档案准备好再触发一次心跳，避免首包是 guest
if (typeof __hb === 'function') { __hb(); }

if(isFirst){
  var m=$('#profile-modal'); var name=$('#modal-name'); var color=$('#modal-color');
  if(name) name.value = (firstProfile && firstProfile.name) ? firstProfile.name : '';
  if(color) color.style.background = (firstProfile && firstProfile.color) ? firstProfile.color : '#999';
  if(m){ m.style.display='flex'; setTimeout(function(){ if(name) name.focus() }, 50) }
}

// === presence 列表：从 /api/dt_presence_mem.asp?list=1 拉真实在线 ===
function upsertPresence(id, name, ts){
  id = String(id||'').trim(); if(!id) return;
  var nowSec  = Math.floor(Date.now()/1000);
  const tsSec  = (typeof ts === 'number' || typeof ts === 'string')
    ? ((Number(ts) > 1e12) ? Math.floor(Number(ts)/1000) : Number(ts))
    : nowSec;
  const online = (nowSec - tsSec < 60); // 1 分钟内视为在线
  const last   = online ? '在线' : Math.max(1, Math.round((nowSec - tsSec)/60)) + ' 分钟前';

  // 是否已有
  var p = people.find(function(x){ return x.id===id });
  if(!p){
    // 新用户加入列表顶端
    p = { id:id, name:(name||id), color:'#7dd3fc', status: online?'online':'idle', last:last, _ts: tsSec };
    people.unshift(p);
  }else{
    p.name = name || p.name;
    p.status = online ? 'online' : 'idle';
    p.last = last;
  }
}
// 替换 desktalk.js 的 fetchPresenceList
async function fetchPresenceList(){
  try{
    // 1) 防缓存：cache:no-store + 时间戳参数
    var me  = (typeof getProfile === 'function' ? (getProfile()||{}) : {});
    var url = '/api/dt_presence_mem.asp?list=1&_=' + Date.now();
    var r = await fetch(url, {
      credentials: 'omit',     // 你现在的服务端允许 omit 也行，但 include 更不易被代理公用缓存复用
      cache: 'no-store'
    });

    var t = await r.text(); var j = null;
    try{ j = JSON.parse(t) }catch(_){ /* 不是 JSON 直接忽略 */ }
    if(!j) return;

    var arr = j.users || j.list || j.online || [];
    var now = Math.floor(Date.now()/1000);

    // 2) 先更新本次返回的用户
    if(Array.isArray(arr)){
       // 只记录权威 presence 列表
        PRESENCE = [];
        // 关键：每次基于服务端 presence 全量重建 people
        people = [];

        arr.forEach(function(it){
            if(typeof it==='string'){ upsertPresence(it, it, now) }
            else{
            // 优先 ts，没有则按 secs 推回去
            var ts = (typeof it.ts==='number' && it.ts>0) ? it.ts
                    : (typeof it.secs==='number' ? (now - it.secs) : now);
            upsertPresence(it.u||it.id||it.name, it.name||(it.u||it.id), ts);
            }
        });
        renderAll();          // 用 presence 渲染“推荐好友”
    }
    // 3) 对 people 做一次“衰减”同步（即便这次没返回，也根据时间把在线 -> 闲置）
    //   online 定义：60 秒内视为在线（与你原逻辑一致）
    var nowSec = now;
    for (var i=0; i<people.length; i++){
      var p = people[i];
      var tsSec = (typeof p._ts === 'number' ? p._ts : nowSec); // upsertPresence 里你可以顺手把 ts 存到 p._ts
      var online = (nowSec - tsSec < 60);
      p.status = online ? 'online' : 'idle';
      p.last   = online ? '在线'  : Math.max(1, Math.round((nowSec - tsSec)/60)) + ' 分钟前';
    }

    renderAll();  // 刷 UI
    if (typeof seedInboxTs === 'function') seedInboxTs();
  }catch(e){}
}


// 统一把消息里的 UTC -> Date（按浏览器能理解的 ISO）
function msgDate(m){
  if (m && m.ts_iso) {
    const d = new Date(m.ts_iso);       // ISO 含 Z，按 UTC 解析
    if (!isNaN(d)) return d;
  }
  const n = Number(m && m.ts);
  if (!isNaN(n) && n > 0) {
    return new Date(n > 1e12 ? n : n*1000);  // 兼容毫秒/秒
  }
  const m1 = String(m && m.id || "").match(/^(\d{10,13})-/);
  if (m1) {
    const k = Number(m1[1]);
    return new Date(k > 1e12 ? k : k*1000);
  }
  return new Date(0);
}



const fmtLocal = new Intl.DateTimeFormat(navigator.language || 'zh-CN', {
  year:'numeric', month:'2-digit', day:'2-digit',
  hour:'2-digit', minute:'2-digit', hour12:false
});
const showLocal = d => fmtLocal.format(d).replace(/\//g,'-');

// 渲染（发送回填 & 刷新历史都走同一套）
function renderBubble(msg){
  const d = msgDate(msg);
  bubbleEl.querySelector('.time').textContent = showLocal(d);
}
// 首次拉一次，然后每 15 秒刷新
fetchPresenceList();
setInterval(fetchPresenceList, 15000);

// === 新消息提示：全局状态 ===
var UNREAD = {};           // convId -> 未读数
var TOTAL_UNREAD = 0;
var windowFocused = true;
// 页面焦点与可见性
window.addEventListener('focus',  function(){ windowFocused = true;  stopTitleFlash(); });
window.addEventListener('blur',   function(){ windowFocused = false; });
document.addEventListener('visibilitychange', function(){
  windowFocused = !document.hidden;
  if (windowFocused) stopTitleFlash();
});

// 声音提示（WebAudio，首次需有用户交互）
function playDing(){
  try{
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if(!Ctor) return;
    var ctx = playDing.ctx || (playDing.ctx = new Ctor());
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.value = 0.0001;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.stop(ctx.currentTime + 0.26);
  }catch(e){}
}

// 桌面通知
function maybeAskNotify(){
  try{
    if ('Notification' in window && Notification.permission === 'default'){
      Notification.requestPermission().catch(function(){});
    }
  }catch(e){}
}
function notifyDesktop(title, body){
  try{
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted'){
      var n = new Notification(title, { body: body, tag: 'desktalk', renotify: true });
      setTimeout(function(){ try{ n.close(); }catch(e){} }, 5000);
    }
  }catch(e){}
}

// 标题闪烁
var __titleTimer = null, __titleOrig = document.title;
function startTitleFlash(hint){
  if (__titleTimer) return;
  var flag = false, txt = '【新消息】';
  __titleTimer = setInterval(function(){
    document.title = flag ? (hint || txt) : (__titleOrig || document.title);
    flag = !flag;
  }, 900);
}
function stopTitleFlash(){
  if (__titleTimer){ clearInterval(__titleTimer); __titleTimer = null; document.title = __titleOrig; }
}

// 根据 slug 找显示名（找不到就回退 slug）
function nameBySlug(slug){
  try{
    var p = (people||[]).find(function(x){ return x.id===slug || (typeof slugId==='function' && slugId(x.name)===slug); });
    return p ? p.name : slug;
  }catch(e){ return slug; }
}


// === 未读计数 & 闪烁 ===
var UNREAD = {};        // key: 会话ID（makeConvId），value: 未读条数
var TOTAL_UNREAD = 0;

function setBadge(n){
  // if (!badge) return;
  // if (n > 0) { badge.hidden = false; badge.textContent = String(n); }
  // else { badge.hidden = true; }
}

// 根据 id 找到人（取颜色/名字）
function peerById(id){
  return (people && people.find(function(p){return p.id===id})) || { name: id, color: '#f97316' };
}

// 任务栏闪烁 + 显示来信头像点
function flashTaskbarFor(id, on){
  if (!btnDT) return;
  var p = peerById(id);
  btnDT.classList.toggle('flash', !!on);
  var dot = btnDT.querySelector('.new-icon');
  if (on) {
    if (!dot) { dot = document.createElement('span'); dot.className = 'new-icon'; btnDT.appendChild(dot); }
    dot.style.background = p.color || '#f97316';
  } else {
    if (dot) dot.remove();
  }
}

// 列表头像闪烁（虚拟列表在屏外的不影响；渲染时会自动对齐）
function flashListAvatar(id, on){
  $$('.row[data-pid="'+id+'"] .av').forEach(function(el){
    el.classList.toggle('blink', !!on);
  });
}


// 清除某人的未读 + 如有需要关闭闪烁
function clearUnreadFor(id){
  var cid = makeConvId(API_ME || slugId(meName()), id);
    if (UNREAD[cid]) { delete UNREAD[cid]; }
    flashListAvatar(id, false);
}
// === 我自己的 slug（用于拼会话ID） ===
var ME_SLUG = meSlug();

// === 每个会话的“已看到的最后时间戳” ===
var CONV_TS = {};      // key: convId -> last seen ts (秒)
var inboxTimer = null;

// —— 单个好友：初始化“已看到”的基线（不触发未读）——
async function seedInboxOne(pid){
  try{
    var convId = makeConvId(ME_SLUG, slugId(pid));
    const r = await fetch(urlGet(convId, 0, 1), { credentials:'include' });
    const j = await r.json();
    var last = 0;
    if (j && j.ok && Array.isArray(j.messages) && j.messages.length){
      var m = j.messages[j.messages.length-1];
      last = Number(m.ts || 0) || (m.id && parseInt(String(m.id).split('-')[0],10)) || 0;
    }
    CONV_TS[convId] = last;
  }catch(e){}
}

// —— 首次：为所有现有好友打基线 —— 
async function seedInboxTs(){
  var ids = Array.from(new Set([...(friendSet||[]), ...((people||[]).map(p=>p.id))]));
  await Promise.all(ids.map(seedInboxOne));
}

// —— 后台轮询一个好友：检查新消息（> CONV_TS）——
async function pollOne(pid){
  // 正在聊天的这位，不在后台轮询，避免重复
  if (currentPeer && currentPeer.id === pid) return;

  var convId = makeConvId(ME_SLUG, slugId(pid));
  var since  = CONV_TS[convId] || 0;

  try{
    const r = await fetch(urlGet(convId, since, 5), { credentials:'include' });
    const j = await r.json();
    if (j && j.ok && Array.isArray(j.messages) && j.messages.length){
      for (var i=0;i<j.messages.length;i++){
        var m = j.messages[i];
        var ts = Number(m.ts || 0) || 0;
        if (ts > (CONV_TS[convId] || 0)) CONV_TS[convId] = ts;
        // 来自“对方”的消息才算未读
        if (slugId(m.from) !== ME_SLUG){
          // 这里传原始 pid（中文也可），内部会归一化
          markPeerUnread(pid);
        }
      }
    }
  }catch(e){}
}

// —— 每次 tick 轮询所有好友（可按需节流/分批）——
function inboxTick(){
  var ids = [...new Set([...(friendSet||[]), ...((people||[]).map(p => p.id))])];
  // 例：最多并发轮询前 10 个，避免过多并发
  ids.slice(0, 10).forEach(pollOne);
}

// —— 启动后台收件箱轮询 —— 
function startInboxWatch(){
  if (inboxTimer) { clearInterval(inboxTimer); inboxTimer = null; }
  ME_SLUG = slugId(meName());
  ME_SLUG = meSlug();
  seedInboxTs().then(function(){
    scheduleInbox(); // 每 4 秒扫描一次
  });
}

startInboxWatch();
var __islandTimer = null;
function showIsland(peer, text){
  try{
    var box = document.getElementById('ww-island');
    if(!box){ return; }
    var mini = box.querySelector('.mini');
    var txt  = box.querySelector('.txt');
    if(mini) mini.style.background = (peer && peer.color) || '#93c5fd';
    if(txt)  txt.textContent = (peer ? (peer.name + '：') : '') + String(text || '').slice(0, 80);
    box.classList.add('show');
    box.style.display = 'flex';
    clearTimeout(__islandTimer);
    __islandTimer = setTimeout(function(){
      box.classList.remove('show');
      box.style.display = 'none';
    }, 2600);

    // 点击灵动岛跳到会话
    box.onclick = function(){
      clearTimeout(__islandTimer);
      box.classList.remove('show');
      box.style.display = 'none';
      if(peer){
        // 如果当前 people 里有这个人，打开聊天
        var p = people.find(function(x){ return x.id === peer.id }) || peer;
        openChat(p);
      }
    };
  }catch(_){}
}
// === Emoji 选择器（系统原生 Emoji） ===
(function addEmojiPicker(){
  if (!chat) return;
  const inputRow = chat.querySelector('.input');
  if (!inputRow || document.getElementById('chat-emoji-btn')) return;

  // 1) 按钮
  const emojiBtn = document.createElement('button');
  emojiBtn.id = 'chat-emoji-btn';
  emojiBtn.type = 'button';
  emojiBtn.className = 'icon-btn';
  emojiBtn.title = '表情';
  emojiBtn.textContent = '😊';         // 用系统表情
  inputRow.insertBefore(emojiBtn, inputRow.firstChild);

  // 2) 面板
  const panel = document.createElement('div');
  panel.id = 'emoji-panel';
  panel.className = 'emoji-panel';
  panel.setAttribute('role','menu');
  panel.setAttribute('aria-label','选择表情');
  inputRow.appendChild(panel);

  // 常用表情（可随时扩充）
  const EMOJIS = "😀 😃 😄 😁 😆 😅 😂 🙂 😉 😊 😇 🥰 😍 🤩 😘 😋 😛 😜 🤪 🤗 🤔 🙃 😌 😴 😒 😔 😕 😟 😢 😭 😤 😮 😯 😲 😳 🤯 😬 😱 😇 😎 👍 👎 ✌ ✋ 👏 🙏 ❤️ 🧡 💛 💚 💙 💜 🤍 🤎 🖤".split(/\s+/);

  // 渲染格子
  EMOJIS.forEach(ch => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'emoji-item';
    b.textContent = ch;
    b.addEventListener('click', () => {
      insertAtCursor(chatInput, ch);
      panel.classList.remove('show');
      chatInput.focus();
    });
    panel.appendChild(b);
  });

  // 定位 & 开关
  function togglePanel(e){
    e.stopPropagation();
    panel.classList.toggle('show');
    if (panel.classList.contains('show')){
      const r = emojiBtn.getBoundingClientRect();
      panel.style.left = Math.max(8, r.left - inputRow.getBoundingClientRect().left) + 'px';
      panel.style.bottom = (inputRow.offsetHeight + 12) + 'px';
    }
  }
  emojiBtn.addEventListener('click', togglePanel);

  // 关闭逻辑：点外面 / Esc
  document.addEventListener('click', (e)=>{
    if (!panel.classList.contains('show')) return;
    if (!panel.contains(e.target) && e.target !== emojiBtn){
      panel.classList.remove('show');
    }
  }, true);
  chatInput.addEventListener('keydown', (e)=>{ if(e.key==='Escape') panel.classList.remove('show') });

  // 光标插入
  function insertAtCursor(el, text){
    if (!el) return;
    const start = el.selectionStart || 0;
    const end   = el.selectionEnd   || 0;
    const before = el.value.slice(0, start);
    const after  = el.value.slice(end);
    el.value = before + text + after;
    const pos = start + text.length;
    el.setSelectionRange(pos, pos);
    // 触发 input 事件，让你的发送/字数等逻辑能感知变更
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
})();
// === 统一调度（追加在文件末尾即可） ===
pollTimer = null;         // 会话轮询（fetchNew）
inboxTimer = null;        // 收件箱轻轮询（inboxTick）
const INBOX_FAST = 8000;      // 打开聊天窗时
const INBOX_SLOW = 15000;     // 关闭聊天窗/页面后台时
let inboxDelay = INBOX_SLOW;

function scheduleInbox(next){
  if (inboxTimer) clearTimeout(inboxTimer);
  inboxTimer = setTimeout(inboxTick, next ?? inboxDelay);
}

function setInboxActive(active){
  inboxDelay = active ? INBOX_FAST : INBOX_SLOW;
  scheduleInbox();
}

// 覆盖原有 start/stop（重定义：放在末尾会覆盖前面的同名函数）
function startPolling(){
  stopPolling();
  pollTimer = setInterval(fetchNew, 2500);  // 打开聊天窗时才轮询会话
  setInboxActive(true);                     // 收件箱加速
}
function stopPolling(){
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
  setInboxActive(false);                    // 收件箱降速
}

// 页面可见性自适应（省电）
document.addEventListener('visibilitychange', ()=>{
  const active = !document.hidden && !!document.querySelector('#chat.show');
  setInboxActive(active);
});


document.addEventListener('DOMContentLoaded', function(){
  if (document.getElementById('chat')) {
    DT_makeChatDrag();   // 恢复历史位置或居中，并绑定拖动
  }
});
function openSettingsSheet(){
  const sheet = document.getElementById("settings-sheet");
  sheet.style.display = "block";
  requestAnimationFrame(() => {
    sheet.style.transform = "translateY(0)";
  });
}

function closeSettingsSheet(){
  const sheet = document.getElementById("settings-sheet");
  sheet.style.transform = "translateY(100%)";
  setTimeout(() => sheet.style.display = "none", 300);
}
 const buttons = document.querySelectorAll('#tab-mailbox .tab-btn');
  const contents = document.querySelectorAll('#tab-mailbox .tab-content');

  function clearActive() {
    buttons.forEach(btn => btn.style.background = '#f0f8ff');
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      // 切换内容
      contents.forEach(c => {
        c.style.display = c.getAttribute('data-content') === target ? 'block' : 'none';
      });
      // 高亮当前按钮
      clearActive();
      btn.style.background = '#d0ebff';
    });
  });