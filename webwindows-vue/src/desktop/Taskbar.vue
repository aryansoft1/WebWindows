<template>
  <div class="ww-taskbar">
    <div
      v-for="w in windowsStore.windows"
      :key="w.id"
      class="ww-task"
      @click="toggle(w)"
      :title="w.title"
    >🪟 {{ w.title }}</div>
  </div>
</template>

<script setup>
import windowsStore from '../stores/windows'  // 复数、默认导入
import { onMounted, onBeforeUnmount } from 'vue'

function toggle(w) {
  if (w.minimized) windowsStore.toggleMin(w.id)
  else windowsStore.focus(w.id)
}

function toggleStartMenu() {
  const menu = document.getElementById("start-menu");
  if (!menu) return;
  const willOpen = menu.style.display === "none" || menu.style.display === "";
  menu.style.display = willOpen ? "block" : "none";
  hideUserPopup();
  const powerMenu = document.getElementById("power-menu");
  if (powerMenu) powerMenu.style.display = "none";
}
function togglePowerMenu() {
    const menu = document.getElementById("power-menu");
    const powerBtn = document.querySelector(".power-btn");

    if (!powerBtn || !menu) return;
    hideUserPopup();
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
function showUserMenu() {
  const popup = document.getElementById("user-popup");
  if (!popup) return;
  popup.style.display = 'block';
  popup.classList.add('show');
}

function toggleUserPopup(e) {
  e?.stopPropagation();
  const popup = document.getElementById('user-popup');
  if (!popup) return;
  if (popup.style.display === 'block' && popup.classList.contains('show')) {
    hideUserPopup();
  } else {
    const powerMenu = document.getElementById("power-menu");
    if (powerMenu) powerMenu.style.display = "none";
    showUserMenu();
  }
}

function hideUserPopup() {
  const popup = document.getElementById('user-popup');
  if (!popup) return;
  popup.classList.remove('show');
  popup.style.display = 'none';
}

function readCurrentUser() {
  try {
    const value = JSON.parse(sessionStorage.getItem('webwindows_user') || 'null');
    return value && typeof value === 'object' ? value : null;
  } catch (_) {
    return null;
  }
}

function initUserStatus() {
  const nameEl   = document.getElementById('login-username');
  const avatarEl = document.getElementById('login-avatar');
  const statusEl = document.getElementById('login-status');
  const popupNameEl = document.getElementById('user-popup-name');

  const user = readCurrentUser();
  const savedNickname = sessionStorage.getItem('webwindows_user_nickname') || '';
  const nickname = savedNickname.trim() || user?.nickname || user?.username || '';

  if (user?.username) {
    if (nameEl)   nameEl.textContent = nickname;
    if (popupNameEl) popupNameEl.textContent = user.username;
    if (avatarEl) avatarEl.src = 'https://cdn-icons-png.flaticon.com/512/747/747376.png';
    if (statusEl) statusEl.style.backgroundColor = '#4ACC44';
  } else {
    if (nameEl)   nameEl.textContent = '使用者';
    if (popupNameEl) popupNameEl.textContent = '未登录';
    if (avatarEl) avatarEl.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    if (statusEl) statusEl.style.backgroundColor = '#CC8800';
  }
  hideUserPopup();
}

function handleLoginAreaClick(event) {
  event.stopPropagation();
  if (readCurrentUser()?.username) {
    toggleUserPopup(event);
    return;
  }
  window.openWindow?.(
    'login',
    '登录',
    'login.html',
    'https://cdn-icons-png.flaticon.com/512/747/747376.png',
    true,
    'login-type'
  );
  const startMenu = document.getElementById('start-menu');
  if (startMenu) startMenu.style.display = 'none';
}

async function logout() {
  try {
    await fetch('api/logout.asp', { method: 'POST', credentials: 'same-origin' });
  } catch (_) {
    // 即使网络暂时失败，也清理当前桌面的本地登录显示。
  }
  sessionStorage.removeItem('webwindows_user');
  sessionStorage.removeItem('webwindows_user_nickname');
  initUserStatus();
  const startMenu = document.getElementById('start-menu');
  if (startMenu) startMenu.style.display = 'none';
  window.dispatchEvent(new Event('webwindows:logout'));
}
onMounted(() => {
  window.toggleStartMenu = toggleStartMenu;
  window.togglePowerMenu = togglePowerMenu;
  window.toggleUserPopup = toggleUserPopup;
  window.hideUserPopup = hideUserPopup;
  window.initUserStatus = initUserStatus;
  window.logout = logout;

  document.getElementById('login-area')?.addEventListener('click', handleLoginAreaClick);
  window.addEventListener('webwindows:login', initUserStatus);
  initUserStatus();
  console.log('TASKBAR_BUILD_TAG::2026-07-28-login-state-fix');
});
onBeforeUnmount(() => {
  document.getElementById('login-area')?.removeEventListener('click', handleLoginAreaClick);
  window.removeEventListener('webwindows:login', initUserStatus);
});
</script>


<style>
.vw-taskbar{
  position:absolute; left:0; right:0; bottom:0;
  height:40px; background:#222; color:#fff;
  display:flex; align-items:center; padding:0 6px; gap:6px;
}
.vw-task{ background:#444; padding:6px 10px; border-radius:6px; cursor:pointer; }
.vw-task:hover{ background:#555; }

</style>
