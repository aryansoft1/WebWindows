(function () {
  "use strict";

  const AUTH_URL = "/admin_api/adminAuth.asp?action=status";
  const ADMIN_HEADER = "X-WebWindows-Admin-Request";
  const CSRF_HEADER = "X-WebWindows-CSRF";
  let csrfToken = "";

  const ready = fetch(AUTH_URL, {
    credentials: "same-origin",
    cache: "no-store",
    headers: { [ADMIN_HEADER]: "admin-auth" }
  })
    .then(async (response) => {
      const payload = await response.json();
      if (!response.ok || !payload?.authenticated ||
          !/^[a-f0-9]{64}$/.test(payload.csrfToken || "")) {
        const error = new Error("ADMIN_LOGIN_REQUIRED");
        error.code = payload?.code || "ADMIN_LOGIN_REQUIRED";
        throw error;
      }
      csrfToken = payload.csrfToken;
      return Object.freeze({ authenticated: true, username: payload.username || "admin" });
    });

  async function authorize(options = {}) {
    await ready;
    if (!csrfToken) throw new Error("ADMIN_CSRF_UNAVAILABLE");
    return {
      ...options,
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        ...(options.headers || {}),
        [CSRF_HEADER]: csrfToken
      }
    };
  }

  async function read(url, requestScope = "system-manager") {
    await ready;
    const response = await fetch(url, {
      method: "GET", credentials: "same-origin", cache: "no-store",
      headers: { [ADMIN_HEADER]: requestScope }
    });
    if (response.status === 401) {
      invalidate();
      window.top.location.replace("/SystemManager/login.html");
      throw new Error("ADMIN_LOGIN_REQUIRED");
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  }

  function invalidate() {
    csrfToken = "";
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function adminAwareFetch(input, init) {
    const response = await nativeFetch(input, init);
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url, location.href);
    if (url.origin === location.origin && url.pathname.startsWith("/admin_api/") && response.status === 401) {
      invalidate();
      window.top.location.replace("/SystemManager/login.html");
    }
    return response;
  };

  Object.defineProperty(window, "WebWindowsAdminSecurity", {
    value: Object.freeze({ ready, authorize, read, invalidate }),
    configurable: false,
    enumerable: false,
    writable: false
  });
})();
