const status = document.getElementById("status");

function render(label, state) {
  status.textContent = `${label}: ${state.supported ? `${Math.round((state.level ?? 0) * 100)}%` : "unsupported"}`;
}

try {
  render("Snapshot", window.WebWindows.device.battery.getState());
  window.WebWindows.device.battery.refresh().then(
    (state) => render("Refreshed", state),
    (error) => { status.textContent = `${error.code || error.name}: ${error.message}`; }
  );
} catch (error) {
  status.textContent = `${error.code || error.name}: ${error.message}`;
}
