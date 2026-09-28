(function () {
  "use strict";
  document.documentElement.style.visibility = "hidden";
  if (!window.WebWindowsAdminSecurity) {
    window.top.location.replace("/SystemManager/login.html");
    return;
  }
  window.WebWindowsAdminSecurity.ready.then(() => {
    document.documentElement.style.visibility = "";
  }).catch(() => {
    window.top.location.replace("/SystemManager/login.html");
  });
})();
