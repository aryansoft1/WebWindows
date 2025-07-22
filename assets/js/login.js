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
  let passwordRaw = document.getElementById('password').value.trim();
  let password = md5(passwordRaw);  // 
  const captcha = document.getElementById('captchaInput').value.trim().toUpperCase();
  const errorMsg = document.getElementById('errorMsg');

  if (!username || !password || !captcha) {
    errorMsg.textContent = '请填写所有字段';
    errorMsg.classList.remove('hidden');
    drawCaptcha();
    return;
  }

  if (captcha !== captchaCode) {
    errorMsg.textContent = '验证码错误';
    errorMsg.classList.remove('hidden');
    drawCaptcha();
    return;
  }

  fetch("api/login.asp", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.top.sessionStorage.setItem('webwindows_user', JSON.stringify(data.user));
        window.top.sessionStorage.setItem('webwindows_user_nickname', data.user.nickname); // ✅ 新增

        if (window.parent && typeof window.parent.initUserStatus === 'function') {
          window.parent.initUserStatus();  
        }

        const win = window.frameElement?.closest('.window');
        console.log(win);
        if (win) {
          const winId = win.id; // 比如 "win-login"
            // ✅ 在移除之前，通知父页面先删除任务栏图标
          if (window.parent && typeof window.parent.removeTaskbarIcon === 'function') {
            window.parent.removeTaskbarIcon(winId);
          }
          win.remove();
        }
      } else {
        errorMsg.textContent = data.message || '用户名或密码错误';
        errorMsg.classList.remove('hidden');
        drawCaptcha();
      }
    })
    .catch((e) => {
      errorMsg.textContent = '无法连接服务器';
      errorMsg.classList.remove('hidden');
      drawCaptcha();
      console.log(e)
    });
}

// 可选：屏蔽右键
try {
  document.addEventListener("contextmenu", e => e.preventDefault());
} catch (e) {
  console.warn("[跨域 iframe 无法注入右键屏蔽]", e);
}
