(function () {
  "use strict";
  document.documentElement.style.visibility = "hidden";
  fetch("/admin_api/adminAuth.asp?action=status", {
    credentials: "same-origin", cache: "no-store",
    headers: { "X-WebWindows-Admin-Request": "admin-auth" }
  })
    .then((response) => response.json().then((payload) => ({ response, payload })))
    .then(({ response, payload }) => {
      if (!response.ok || !payload.authenticated) {
        window.location.replace("login.html");
        return;
      }
      document.documentElement.style.visibility = "";
      const name = document.getElementById("adminSessionName");
      if (name) name.textContent = payload.username || "admin";
    })
    .catch(() => window.location.replace("login.html"));

  window.adminLogout = async function () {
    await fetch("/admin_api/adminAuth.asp?action=logout", {
      method: "POST", credentials: "same-origin",
      headers: { "X-WebWindows-Admin-Request": "admin-auth" }
    });
    window.location.replace("login.html");
  };
})();
