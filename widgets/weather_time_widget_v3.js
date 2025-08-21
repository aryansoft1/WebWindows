
document.addEventListener("DOMContentLoaded", () => {
    const widget = document.getElementById("weatherTimeWidget");
    const closeBtn = document.getElementById("closeWeatherBtn");

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
    widget.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        const offsetX = touch.clientX - widget.offsetLeft;
        const offsetY = touch.clientY - widget.offsetTop;

        function onTouchMove(e) {
            const touch = e.touches[0];
            widget.style.left = `${touch.clientX - offsetX}px`;
            widget.style.top = `${touch.clientY - offsetY}px`;
            e.preventDefault(); // ✅ 禁用浏览器默认滚动行为
        }

        function onTouchEnd() {
            document.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("touchend", onTouchEnd);
        }

        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", onTouchEnd);
    });
    // 关闭按钮
    closeBtn.addEventListener("click", () => {
        widget.style.display = "none";
    });
 
    // 获取天气函数
    function fetchWeather(lat, lon) {
        const url = `https://wttr.in/${lat},${lon}?format=j1`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const cond = data.current_condition[0];
                const lang = (navigator.language || 'en').slice(0, 2);
                const desc = lang === 'zh' ? cond.lang_zh?.[0]?.value :
                             lang === 'ja' ? cond.lang_ja?.[0]?.value :
                             cond.weatherDesc?.[0]?.value || "Clear";

                // 根据天气描述选择 CDN 图标
                let iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg"; // 默认云朵
                const descLower = desc.toLowerCase();
                if (descLower.includes("sun") || descLower.includes("clear")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2600.svg"; // 太阳
                else if (descLower.includes("cloud")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg"; // 云
                else if (descLower.includes("rain")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F327.svg"; // 雨
                else if (descLower.includes("snow")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F328.svg"; // 雪
                else if (descLower.includes("thunder") || descLower.includes("storm")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/26C8.svg"; // 雷阵雨

                document.getElementById("weather-location").textContent =
                    data.nearest_area?.[0]?.areaName?.[0]?.value || "当前位置";
                document.getElementById("weather-temp").textContent = cond.temp_C + "°C";
                document.getElementById("weather-desc").textContent = desc;
                document.getElementById("weather-icon").src = iconUrl;
            })
            .catch(() => {
                document.getElementById("weather-desc").textContent = "Unavailable";
                document.getElementById("weather-icon").src = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg";
             });
    }

     // IP 定位函数
   

    // 三层 fallback：浏览器 → IP → 默认
    const defaultLat = 39.9042; // 北京
    const defaultLon = 116.4074;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => { // 拒绝或失败
                getIPLocation((lat, lon) => {
                    fetchWeather(lat || defaultLat, lon || defaultLon);
                });
            }
        );
    } else {
        getIPLocation((lat, lon) => {
            fetchWeather(lat || defaultLat, lon || defaultLon);
        });
    }

    // 尝试获取浏览器定位
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => fetchWeather() // 如果拒绝定位，走 fallback
        );
    } else {
        fetchWeather();
    }
 function convertCoordinate(lng, lat, callback) {
    // 百度坐标转换 API
    fetch(`https://api.map.baidu.com/geoconv/v1/?coords=${lng},${lat}&from=1&to=5&ak=GhSmBy5gl5o2QgctEf2LHcyc55sizfdq`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 0) {
                const [convertedLng, convertedLat] = data.result[0];
                callback(convertedLng, convertedLat);
            } else {
                console.warn("坐标转换失败:", data.message);
                callback(null, null);
            }
        })
        .catch(error => {
            console.warn("坐标转换请求失败:", error);
            callback(null, null);
        });
}

function getCityName(lng, lat, callback) {
    // 百度逆地理编码 API
    fetch(`https://api.map.baidu.com/reverse_geocoding/v3/?ak=GhSmBy5gl5o2QgctEf2LHcyc55sizfdq&output=json&coordtype=bd09ll&location=${lat},${lng}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 0) {
                const city = data.result.addressComponent.city;
                callback(city);
            } else {
                console.warn("逆地理编码失败:", data.message);
                callback(null);
            }
        })
        .catch(error => {
            console.warn("逆地理编码请求失败:", error);
            callback(null);
        });
}

function getIPLocation(callback) {
    // 通过 IP 定位服务获取坐标（WGS84）
    fetch("https://ipapi.co/json/")
        .then(res => res.json())
        .then(data => {
            const lat = data.latitude;
            const lon = data.longitude;
            // 转换为百度坐标系
            convertCoordinate(lon, lat, (convertedLng, convertedLat) => {
                if (convertedLng && convertedLat) {
                    // 获取城市名称
                    getCityName(convertedLng, convertedLat, city => {
                        callback(convertedLat, convertedLng, city);
                    });
                } else {
                    callback(lat, lon, null);
                }
            });
        })
        .catch((error) => {
            console.warn("IP 定位失败:", error);
            callback(null, null, null);
        });
}
});
