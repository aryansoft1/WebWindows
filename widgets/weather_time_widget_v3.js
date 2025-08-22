
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
    async function fetchWeather(lat, lon) {
        let url = lat=== 0 || lon === 0 ? `https://wttr.in/?format=j1`: `https://wttr.in/${lat},${lon}?format=j1`;
        url = url + "&lang=" + (navigator.language || 'zh').slice(0, 2);
        await fetch(url)
            .then(res => res.json())
            .then(data => {
                const cond = data.current_condition[0];
                const lang = (navigator.language || 'zh').slice(0, 2);
                const desc = lang === 'zh' ? cond.lang_zh?.[0]?.value :
                             lang === 'ja' ? cond.lang_ja?.[0]?.value :
                             cond.weatherDesc?.[0]?.value || "Clear";
                console.log("test");
                console.log(data);
                // 优先使用本地语言的地名
                let areaName;
                if (data.nearest_area[0][`lang_${lang}`]?.[0]?.value) {
                    areaName = data.nearest_area[0][`lang_${lang}`][0].value;
                } else {
                    areaName = data.nearest_area[0].areaName[0].value;
                }
                // 根据天气描述选择 CDN 图标
                let iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg"; // 默认云朵
                const descLower = cond.weatherDesc?.[0]?.value.toLowerCase() || "";
               if (descLower.includes("sun")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2600.svg"; // 太阳
                else if (descLower.includes("drizzle") || descLower.includes("rain")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F327.svg"; // 雨
                else if (descLower.includes("snow")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F328.svg"; // 雪
                else if (descLower.includes("thunder") || descLower.includes("storm")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/26C8.svg"; // 雷阵雨
                else if (descLower.includes("tornado")) iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/1f32a.svg"; // 🌪
                else if (descLower.includes("hurricane") || descLower.includes("cyclone")) iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/1f300.svg"; // 🌀
                else if (descLower.includes("partly cloudy") || descLower.includes("mostly sunny")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/26C5.svg"; // 🌥 局部多云
                else if (descLower.includes("cloud") || descLower.includes("overcast")) iconUrl = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg"; // ☁️ 多云
                else if (descLower.includes("mist") || descLower.includes("fog") || descLower.includes("haze") || descLower.includes("smoke")) iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/1f32b.svg"; // 🌫
                // 默认 ☀️
                else { iconUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/2600.svg"; }

                document.getElementById("weather-temp").textContent = cond.temp_C + "°C";
                document.getElementById("weather-desc").textContent = desc;
                document.getElementById("weather-icon").src = iconUrl;

                try {
                    //http://你的服务器地址/geonames_test.asp?city=Hung%20Hom&lang=en

                   fetch(`/api/geonames.asp?city=${encodeURIComponent(areaName)}&lang=${lang}`)
                    .then(response => {
                        console.log('HTTP Status:', response.status);
                        return response.text(); // 先作为文本获取
                    })
                    .then(text => {
                        console.log('Raw response:', text);
                        try {
                            const data = JSON.parse(text);
                            console.log('Parsed data:', data);
                            console.log('geonames type:', typeof data.geonames);
                            return data;
                        } catch (e) {
                            console.error('JSON解析错误:', e);
                            throw e;
                        }
                    })
                    .then(data => {
                        const city = data.geonames[0];
                        document.getElementById("weather-location").textContent = city.name;
                    })

                } catch (err) {
                    console.log("Error: " + err.message);
                    document.getElementById("weather-location").textContent = areaName;
                }
            })
            .catch((e) => {
                console.error(e)
                document.getElementById("weather-desc").textContent = "无服务";
                document.getElementById("weather-icon").src = "https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/2601.svg";
             });
    }

     // IP 定位函数
   

    // 三层 fallback：浏览器 → IP → 默认

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => { // 拒绝或失败
                    fetchWeather(0,0);
            }
        );
    } else {
       fetchWeather(0,0);
    }
});
