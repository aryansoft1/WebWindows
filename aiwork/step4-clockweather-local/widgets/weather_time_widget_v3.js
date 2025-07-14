
document.addEventListener("DOMContentLoaded", () => {
  const widget = document.getElementById("weatherTimeWidget");
  const closeBtn = document.getElementById("closeWeatherBtn");
  const timeEl = document.getElementById("local-time");

  // 拖拽功能
  let isDragging = false, offsetX = 0, offsetY = 0;
  widget.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    widget.style.cursor = "move";
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      widget.style.left = e.pageX - offsetX + "px";
      widget.style.top = e.pageY - offsetY + "px";
    }
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
    widget.style.cursor = "default";
  });

  // 关闭按钮
  closeBtn.addEventListener("click", () => {
    widget.style.display = "none";
  });

  // 更新时间
  const updateTime = () => {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  updateTime();
  setInterval(updateTime, 60000);

  // 获取天气数据（无需 key）
  fetch("https://wttr.in/?format=j1")
    .then(res => res.json())
    .then(data => {
      const cond = data.current_condition[0];
      const lang = (navigator.language || 'en').slice(0, 2);
      const desc = lang === 'zh' ? cond.lang_zh?.[0]?.value :
                   lang === 'ja' ? cond.lang_ja?.[0]?.value :
                   cond.weatherDesc?.[0]?.value;
      document.getElementById("weather-location").textContent = data.nearest_area[0].areaName[0].value;
      document.getElementById("weather-temp").textContent = cond.temp_C + "°C";
      document.getElementById("weather-desc").textContent = desc || "Clear";
      document.getElementById("weather-icon").src = "https://img.icons8.com/fluency/48/cloud.png";
    })
    .catch(() => {
      document.getElementById("weather-desc").textContent = "Unavailable";
    });
});
