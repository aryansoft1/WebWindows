
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

  // 实时更新时间
  const updateTime = () => {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  updateTime();
  setInterval(updateTime, 60000);
});


  // 获取天气数据
  async function loadWeather() {
    try {
      const locRes = await fetch('https://ipapi.co/json/');
      const locData = await locRes.json();
      const city = locData.city;
      const lat = locData.latitude;
      const lon = locData.longitude;
      document.getElementById("weather-location").textContent = city;

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const weatherData = await weatherRes.json();
      const current = weatherData.current_weather;

      document.getElementById("weather-temp").textContent = current.temperature + "°C";
      document.getElementById("weather-desc").textContent = current.weathercode === 3 ? "Cloudy" : "Clear";
      document.getElementById("weather-icon").src = current.weathercode === 3 ?
        "https://img.icons8.com/fluency/48/cloud.png" :
        "https://img.icons8.com/fluency/48/sun.png";
    } catch (e) {
      document.getElementById("weather-desc").textContent = "Unavailable";
    }
  }

  loadWeather();
