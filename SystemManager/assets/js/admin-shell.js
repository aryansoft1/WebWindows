(function () {
  "use strict";
  document.documentElement.style.visibility = "hidden";
  window.WebWindowsAdminSecurity.ready
    .then((payload) => {
      document.documentElement.style.visibility = "";
      const name = document.getElementById("adminSessionName");
      if (name) name.textContent = payload.username || "admin";
    })
    .catch(() => window.location.replace("login.html"));

  window.adminLogout = async function () {
    const body = new URLSearchParams();
    body.set("intent", "logout");
    const options = await window.WebWindowsAdminSecurity.authorize({
      body,
      headers: { "X-WebWindows-Admin-Request": "admin-auth" }
    });
    await fetch("/admin_api/adminAuth.asp?action=logout", options);
    window.WebWindowsAdminSecurity.invalidate();
    window.location.replace("login.html");
  };
})();
