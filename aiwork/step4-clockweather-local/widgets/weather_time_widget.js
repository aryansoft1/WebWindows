
async function loadWeather() {
  const weatherWidget = document.getElementById('weather-widget');
  const locationEl = document.getElementById('weather-location');
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-description');
  const iconEl = document.getElementById('weather-icon');
  const timeEl = document.getElementById('weather-time');

  try {
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    const temp = data.current_weather.temperature;
    const weatherCode = data.current_weather.weathercode;
    const iconUrl = getWeatherIcon(weatherCode);
    const time = new Date().toLocaleTimeString();

    locationEl.textContent = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    tempEl.textContent = `${temp}°C`;
    descEl.textContent = getWeatherDescription(weatherCode);
    iconEl.src = iconUrl;
    timeEl.textContent = time;

  } catch (error) {
    locationEl.textContent = "Unavailable";
    tempEl.textContent = "--°C";
    descEl.textContent = "Weather Error";
    iconEl.src = "https://cdn-icons-png.flaticon.com/512/1146/1146869.png";
    timeEl.textContent = new Date().toLocaleTimeString();
    console.error("天气获取失败：", error);
  }
}

function getWeatherDescription(code) {
  const map = {
    0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Cloudy",
    45: "Fog", 48: "Rime fog", 51: "Light drizzle", 61: "Rain", 71: "Snow",
    80: "Showers", 95: "Thunder"
  };
  return map[code] || "Unknown";
}

function getWeatherIcon(code) {
  if ([0, 1].includes(code)) return "https://cdn-icons-png.flaticon.com/512/869/869869.png";
  if ([2, 3, 45, 48].includes(code)) return "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
  if ([51, 61, 80].includes(code)) return "https://cdn-icons-png.flaticon.com/512/3075/3075858.png";
  if ([71].includes(code)) return "https://cdn-icons-png.flaticon.com/512/642/642102.png";
  if ([95].includes(code)) return "https://cdn-icons-png.flaticon.com/512/1146/1146869.png";
  return "https://cdn-icons-png.flaticon.com/512/4064/4064608.png";
}

loadWeather();
