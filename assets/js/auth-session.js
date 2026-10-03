(function () {
  "use strict";

  var STORAGE_USER = "webwindows_user";
  var STORAGE_NICKNAME = "webwindows_user_nickname";
  var state = "checking";
  var currentUser = null;
  var refreshPromise = null;
  var lastCheckedAt = 0;

  function elements() {
    return {
      name: document.getElementById("login-username"),
      popupName: document.getElementById("user-popup-name"),
      avatar: document.getElementById("login-avatar"),
      status: document.getElementById("login-status") || document.getElementById("status-dot"),
      logout: document.querySelector('#user-popup button[onclick*="logout"]')
    };
  }

  function clearBrowserIdentity() {
    sessionStorage.removeItem(STORAGE_USER);
    sessionStorage.removeItem(STORAGE_NICKNAME);
  }

  function saveBrowserIdentity(user) {
    sessionStorage.setItem(STORAGE_USER, JSON.stringify(user));
    sessionStorage.setItem(STORAGE_NICKNAME, user.nickname || user.username || "");
  }

  function render(nextState, user) {
    state = nextState;
    currentUser = user || null;
    var ui = elements();
    var authenticated = nextState === "authenticated";
    var label = authenticated
      ? (user.nickname || user.username)
      : nextState === "checking" ? "正在确认登录状态…"
      : nextState === "unavailable" ? "登录状态无法确认"
      : "未登录";

    if (ui.name) ui.name.textContent = label;
    if (ui.popupName) ui.popupName.textContent = authenticated ? user.username : label;
    if (ui.status) {
      ui.status.style.backgroundColor = authenticated ? "#22c55e" :
        nextState === "unauthenticated" ? "#cc8800" : "#eab308";
      ui.status.title = label;
    }
    if (ui.avatar) {
      ui.avatar.src = authenticated
        ? "https://cdn-icons-png.flaticon.com/512/747/747376.png"
        : "assets/icons/149071.png";
    }
    if (ui.logout) ui.logout.hidden = !authenticated;
    document.documentElement.setAttribute("data-auth-state", nextState);
  }

  function applyServerState(data) {
    if (data && data.authenticated === true && data.user && data.user.username) {
      saveBrowserIdentity(data.user);
      render("authenticated", data.user);
      return data.user;
    }
    clearBrowserIdentity();
    render("unauthenticated", null);
    return null;
  }

  function refresh(options) {
    options = options || {};
    var now = Date.now();
    if (!options.force && refreshPromise) return refreshPromise;
    if (!options.force && now - lastCheckedAt < 15000) return Promise.resolve(currentUser);
    if (!currentUser) render("checking", null);

    refreshPromise = fetch("/api/session.asp?_=" + now, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Accept": "application/json" }
    }).then(function (response) {
      if (!response.ok) throw new Error("session_status_" + response.status);
      return response.json();
    }).then(function (data) {
      lastCheckedAt = Date.now();
      return applyServerState(data);
    }).catch(function () {
      // A local sessionStorage value is not proof of an authenticated server session.
      clearBrowserIdentity();
      render("unavailable", null);
      return null;
    }).finally(function () {
      refreshPromise = null;
    });
    return refreshPromise;
  }

  function markLoggedOut() {
    clearBrowserIdentity();
    lastCheckedAt = Date.now();
    render("unauthenticated", null);
  }

  function logout() {
    return fetch("/api/logout.asp", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Accept": "application/json" }
    }).catch(function () {
      // Clear the visible identity even if the expired server session cannot answer.
    }).then(function () {
      markLoggedOut();
      var popup = document.getElementById("user-popup");
      if (popup) popup.style.display = "none";
      window.dispatchEvent(new CustomEvent("webwindows:logout"));
    });
  }

  window.WebWindowsAuth = Object.freeze({
    refresh: refresh,
    logout: logout,
    markLoggedOut: markLoggedOut,
    getState: function () { return state; },
    getUser: function () { return currentUser; }
  });
  window.logout = logout;

  window.addEventListener("webwindows:login", function () { refresh({ force: true }); });
  window.addEventListener("focus", function () { refresh(); });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") refresh();
  });

  clearBrowserIdentity();
  render("checking", null);
  refresh({ force: true });
  window.setInterval(function () { refresh({ force: true }); }, 60000);
})();
