(function () {
  "use strict";
  const API_URL = "/admin_api/adminAuth.asp";
  const HEADERS = { "X-WebWindows-Admin-Request": "admin-auth" };
  let csrfToken = "";

  function setStatus(message, kind) {
    const status = document.getElementById("adminLoginStatus");
    status.textContent = message || "";
    status.className = `login-status${kind ? ` ${kind}` : ""}`;
  }

  async function readJsonPayload(response) {
    const raw = await response.text();
    try {
      return JSON.parse(raw);
    } catch {
      const error = new Error(response.ok
        ? "服务器返回了非预期的响应，请稍后重试。"
        : `服务器返回了 HTTP ${response.status} 的非 JSON 响应，后台接口暂不可用，请稍后重试。`);
      error.code = "ADMIN_RESPONSE_NOT_JSON";
      throw error;
    }
  }

  async function request(action, options) {
    const mutationHeaders = options?.method === "POST"
      ? { "X-WebWindows-CSRF": csrfToken }
      : {};
    const response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`, {
      credentials: "same-origin", cache: "no-store", ...options,
      headers: { ...HEADERS, ...mutationHeaders, ...(options?.headers || {}) }
    });
    const payload = await readJsonPayload(response);
    if (!response.ok || payload?.ok === false) {
      const error = new Error(payload?.message || `请求失败（${response.status}）。`);
      error.code = payload?.code || "";
      throw error;
    }
    return payload;
  }

  async function refreshCaptcha() {
    const button = document.getElementById("captchaQuestion");
    button.disabled = true;
    button.textContent = "正在刷新……";
    try {
      const payload = await request("captcha");
      if (!/^[a-f0-9]{64}$/.test(payload.csrfToken || "")) {
        throw new Error("后台安全令牌不可用。");
      }
      csrfToken = payload.csrfToken;
      button.textContent = payload.question;
      document.getElementById("adminCaptcha").value = "";
    } catch (error) {
      button.textContent = "刷新验证码";
      setStatus(error.message || "验证码加载失败。", "error");
    } finally {
      button.disabled = false;
    }
  }

  async function login(event) {
    event.preventDefault();
    const username = document.getElementById("adminUsername").value.trim();
    const passwordRaw = document.getElementById("adminPassword").value;
    const captcha = document.getElementById("adminCaptcha").value.trim();
    if (!username || !passwordRaw || !captcha) {
      setStatus("请填写账号、密码和验证码。", "error");
      return;
    }
    if (typeof window.md5 !== "function") {
      setStatus("密码加密组件未加载，请刷新页面重试。", "error");
      return;
    }
    const button = document.getElementById("adminLoginButton");
    button.disabled = true;
    setStatus("正在验证管理员身份……");
    try {
      if (!csrfToken) throw new Error("后台安全令牌不可用，请刷新验证码。");
      const body = new URLSearchParams();
      body.set("username", username);
      body.set("password", window.md5(passwordRaw));
      body.set("captcha", captcha);
      await request("login", { method: "POST", body });
      setStatus("登录成功，正在进入后台……", "success");
      window.location.replace("index.html");
    } catch (error) {
      setStatus(error.message || "后台登录失败。", "error");
      await refreshCaptcha();
    } finally {
      button.disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("captchaQuestion").addEventListener("click", refreshCaptcha);
    document.getElementById("adminLoginForm").addEventListener("submit", login);
    refreshCaptcha();
  });
})();
