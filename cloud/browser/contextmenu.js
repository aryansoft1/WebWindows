document.addEventListener("DOMContentLoaded", function () {
    const fileMenu = document.getElementById("fileContextMenu");
    const blankMenu = document.getElementById("blankContextMenu");

    document.addEventListener("contextmenu", function (e) {
        const isFileItem = e.target.closest(".file-item");
        fileMenu.style.display = "none";
        blankMenu.style.display = "none";

        if (isFileItem) {
            e.preventDefault();
            fileMenu.style.top = e.pageY + "px";
            fileMenu.style.left = e.pageX + "px";
            fileMenu.style.display = "block";
            // 你可以这里记录选中的文件，例如 isFileItem.dataset.filename
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
