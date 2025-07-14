const weatherLabels = {
  "en": {
    "0": "Clear sky",
    "1": "Mainly clear",
    "2": "Partly cloudy",
    "3": "Overcast",
    "45": "Fog",
    "48": "Depositing rime fog",
    "51": "Light drizzle",
    "53": "Moderate drizzle",
    "55": "Dense drizzle",
    "56": "Light freezing drizzle",
    "57": "Dense freezing drizzle",
    "61": "Slight rain",
    "63": "Moderate rain",
    "65": "Heavy rain",
    "66": "Light freezing rain",
    "67": "Heavy freezing rain",
    "71": "Slight snow fall",
    "73": "Moderate snow fall",
    "75": "Heavy snow fall",
    "77": "Snow grains",
    "80": "Slight rain showers",
    "81": "Moderate rain showers",
    "82": "Violent rain showers",
    "85": "Slight snow showers",
    "86": "Heavy snow showers",
    "95": "Thunderstorm",
    "96": "Thunderstorm with slight hail",
    "99": "Thunderstorm with heavy hail"
  },
  "zh": {
    "0": "\u6674",
    "1": "\u591a\u4e91",
    "2": "\u5c40\u90e8\u591a\u4e91",
    "3": "\u9634\u5929",
    "45": "\u96fe",
    "48": "\u7ed3\u51b0\u96fe",
    "51": "\u5c0f\u6bdb\u6bdb\u96e8",
    "53": "\u4e2d\u7b49\u6bdb\u6bdb\u96e8",
    "55": "\u5927\u6bdb\u6bdb\u96e8",
    "56": "\u5c0f\u51bb\u96e8",
    "57": "\u5927\u51bb\u96e8",
    "61": "\u5c0f\u96e8",
    "63": "\u4e2d\u96e8",
    "65": "\u5927\u96e8",
    "66": "\u5c0f\u51bb\u96e8",
    "67": "\u5927\u51bb\u96e8",
    "71": "\u5c0f\u96ea",
    "73": "\u4e2d\u96ea",
    "75": "\u5927\u96ea",
    "77": "\u9730",
    "80": "\u5c0f\u9635\u96e8",
    "81": "\u4e2d\u9635\u96e8",
    "82": "\u5f3a\u9635\u96e8",
    "85": "\u5c0f\u9635\u96ea",
    "86": "\u5927\u9635\u96ea",
    "95": "\u96f7\u96e8",
    "96": "\u96f7\u96e8\u4f34\u5c0f\u51b0\u96f9",
    "99": "\u96f7\u96e8\u4f34\u5927\u51b0\u96f9"
  },
  "ja": {
    "0": "\u5feb\u6674",
    "1": "\u6674\u308c",
    "2": "\u4e00\u90e8\u66c7\u308a",
    "3": "\u66c7\u308a",
    "45": "\u9727",
    "48": "\u9727\u6c37",
    "51": "\u5f31\u3044\u9727\u96e8",
    "53": "\u9069\u5ea6\u306a\u9727\u96e8",
    "55": "\u5f37\u3044\u9727\u96e8",
    "56": "\u5f31\u3044\u6c37\u96e8",
    "57": "\u5f37\u3044\u6c37\u96e8",
    "61": "\u5f31\u3044\u96e8",
    "63": "\u9069\u5ea6\u306a\u96e8",
    "65": "\u5f37\u3044\u96e8",
    "66": "\u5f31\u3044\u6c37\u96e8",
    "67": "\u5f37\u3044\u6c37\u96e8",
    "71": "\u5f31\u3044\u96ea",
    "73": "\u9069\u5ea6\u306a\u96ea",
    "75": "\u5f37\u3044\u96ea",
    "77": "\u9730",
    "80": "\u5f31\u3044\u306b\u308f\u304b\u96e8",
    "81": "\u9069\u5ea6\u306a\u306b\u308f\u304b\u96e8",
    "82": "\u6fc0\u3057\u3044\u306b\u308f\u304b\u96e8",
    "85": "\u5f31\u3044\u306b\u308f\u304b\u96ea",
    "86": "\u5f37\u3044\u306b\u308f\u304b\u96ea",
    "95": "\u96f7\u96e8",
    "96": "\u96f7\u96e8\u3068\u5c0f\u3055\u306a\u96f9",
    "99": "\u96f7\u96e8\u3068\u5927\u304d\u306a\u96f9"
  }
};


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

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&language=auto`);
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
