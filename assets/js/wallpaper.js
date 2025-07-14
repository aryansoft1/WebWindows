document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("wallpaperThumbnails");
    if (!container) return;

    // 尝试从主页面读取 wallpaperList，如果失败则使用默认值
    const list = window.wallpaperList || [
        "assets/wallpapers/wall1.jpg",
        "assets/wallpapers/wall2.jpg",
        "assets/wallpapers/wall3.jpg",
        "assets/wallpapers/wall4.jpg",
        "assets/wallpapers/wall5.jpg",
        "assets/wallpapers/wall6.jpg"

    ];

    if (!list || !Array.isArray(list)) return;

    const current = localStorage.getItem("selectedWallpaper");

    list.forEach(path => {
        const img = document.createElement("img");
        img.src = path;
        img.className = "wallpaper-thumb";
        if (current === path) img.classList.add("active");

        img.onclick = () => {
            localStorage.setItem("selectedWallpaper", path);
            if (window.parent?.setWallpaperByPath) {
                window.parent.setWallpaperByPath(path);
            }

            // 更新激活样式
            container.querySelectorAll("img").forEach(i => i.classList.remove("active"));
            img.classList.add("active");
        };

        container.appendChild(img);
    });
});