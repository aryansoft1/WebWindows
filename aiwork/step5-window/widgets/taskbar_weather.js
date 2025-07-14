
document.addEventListener("DOMContentLoaded", () => {
  const weatherBar = document.createElement("div");
  weatherBar.id = "taskbar-weather";
  weatherBar.style.cssText = "position: fixed; left: 12px; bottom: 6px; color: white; font-size: 12px; display: flex; align-items: center; gap: 6px; z-index: 9999;";
  const icon = document.createElement("img");
  icon.src = "https://img.icons8.com/fluency/24/cloud.png";
  icon.style.width = "18px";
  const temp = document.createElement("span");
  temp.textContent = "--°C";
  weatherBar.appendChild(icon);
  weatherBar.appendChild(temp);
  document.body.appendChild(weatherBar);

  // 天气数据使用 wttr.in 接口
  fetch("https://wttr.in/?format=j1")
    .then(res => res.json())
    .then(data => {
      const current = data.current_condition?.[0];
      if (current) temp.textContent = current.temp_C + "°C";
    });
});
