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
import { onMounted } from 'vue'

function toggle(w) {
  if (w.minimized) windowsStore.toggleMin(w.id)
  else windowsStore.focus(w.id)
}

function toggleStartMenu() {
    const menu = document.getElementById("start-menu");
    if (menu) {
        menu.style.display = (menu.style.display === "none" || menu.style.display === "") ? "block" : "none";
    }
}
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

function initUserStatus() {
  console.log('initUserStatus()');
  const nameEl   = document.getElementById('login-username');
  const avatarEl = document.getElementById('login-avatar');
  const statusEl = document.getElementById('status-dot');

  const username = sessionStorage.getItem('webwindows_user');
  const nickname = sessionStorage.getItem('webwindows_user_nickname');

  if (username && nickname) {
    if (nameEl)   nameEl.textContent = nickname;
    if (avatarEl) avatarEl.src = 'https://cdn-icons-png.flaticon.com/512/747/747376.png';
    if (statusEl) statusEl.style.backgroundColor = '#4ACC44';
  } else {
    if (nameEl)   nameEl.textContent = '使用者';
    if (avatarEl) avatarEl.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    if (statusEl) statusEl.style.backgroundColor = '#CC8800';
  }
  const popup = document.getElementById('user-popup');
  if (popup) popup.style.display = 'none';

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
}
onMounted(() => {
  window.toggleStartMenu = toggleStartMenu; // 全局函数
  initUserStatus();
  window.togglePowerMenu  = togglePowerMenu;  // <-- 关键修复：挂载 PowerMenu
  window.toggleUserPopup  = toggleUserPopup;  // <-- 关键修复：挂载 UserPopup
  console.log('TASKBAR_BUILD_TAG::2025-09-21-13:45'); // 编译验证标记
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
