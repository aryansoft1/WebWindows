document.addEventListener("DOMContentLoaded", function () {
    const fileMenu = document.getElementById("fileContextMenu");
    const blankMenu = document.getElementById("blankContextMenu");

    document.addEventListener("contextmenu", function (e) {
        const isFileItem = e.target.closest(".file-item");
        fileMenu.style.display = "none";
        blankMenu.style.display = "none";

        // 清除所有选中状态
        document.querySelectorAll('.file-item').forEach(el => el.classList.remove("selected"));

        if (isFileItem) {
            e.preventDefault();
            // ✅ 设置为当前右键选中的文件项
            isFileItem.classList.add("selected");

            fileMenu.style.top = e.pageY + "px";
            fileMenu.style.left = e.pageX + "px";
            fileMenu.style.display = "block";
        } else if (e.target.closest(".file-list")) {
            e.preventDefault();
            blankMenu.style.top = e.pageY + "px";
            blankMenu.style.left = e.pageX + "px";
            blankMenu.style.display = "block";
        }
    });

    document.addEventListener("click", function () {
        fileMenu.style.display = "none";
        blankMenu.style.display = "none";
    });

    if (window.lucide && typeof lucide.createIcons === "function") {
        lucide.createIcons();
    }
});
