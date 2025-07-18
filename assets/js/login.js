let captchaCode = '';
const canvas = document.getElementById('captchaCanvas');
const ctx = canvas.getContext('2d');

function drawCaptcha() {
  captchaCode = '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f1f1f1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < 4; i++) {
    const char = chars.charAt(Math.floor(Math.random() * chars.length));
    captchaCode += char;
    ctx.font = '20px Arial';
    ctx.fillStyle = '#' + Math.floor(Math.random() * 0xffffff).toString(16);
    ctx.fillText(char, 20 + i * 22, 26 + Math.random() * 5);
  }
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = '#' + Math.floor(Math.random() * 0xffffff).toString(16);
    ctx.beginPath();
    ctx.moveTo(Math.random() * 120, Math.random() * 36);
    ctx.lineTo(Math.random() * 120, Math.random() * 36);
    ctx.stroke();
  }
}

drawCaptcha();
canvas.addEventListener('click', drawCaptcha);
function login() {
  const username = document.getElementById('username').value.trim();
  const captcha = document.getElementById('captchaInput').value.trim().toUpperCase();
  const errorMsg = document.getElementById('errorMsg');

  if (username !== 'admin' || captcha !== captchaCode) {
    errorMsg.textContent = '登录失败，请检查输入';
    errorMsg.classList.remove('hidden');
    drawCaptcha();
    return;
  }

  sessionStorage.setItem('username', username);

  if (window.parent && typeof window.parent.initUserStatus === 'function') {
    window.parent.initUserStatus();
  }

  if (window.parent && typeof window.parent.closeWindow === 'function') {
    window.parent.closeWindow();
  } else {
    // 关闭登录窗口
    const loginWin = window.parent.document.getElementById('win-login');
    const icon = window.parent.document.querySelector('.taskbar-app[data-id="win-login"]');
        icon?.remove();
    if (loginWin) loginWin.remove();
  }
}
 try {
        document.addEventListener("contextmenu", e => e.preventDefault());
} catch (e) {
            console.warn("[跨域 iframe 无法注入右键屏蔽]", e);
}

