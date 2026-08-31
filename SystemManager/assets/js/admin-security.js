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

  function invalidate() {
    csrfToken = "";
  }

  Object.defineProperty(window, "WebWindowsAdminSecurity", {
    value: Object.freeze({ ready, authorize, invalidate }),
    configurable: false,
    enumerable: false,
    writable: false
  });
})();
