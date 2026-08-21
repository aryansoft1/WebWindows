# 此设备与本地存储

“此设备”表示用户明确授权给 WebWindows 的本地文件夹，不会自动扫描整台设备。

普通浏览器需要支持 File System Access API。选择本地文件夹时浏览器会弹出授权窗口；授权记录可保存在当前浏览器，但浏览器仍可能再次要求确认。部分浏览器（特别是某些移动浏览器和 Firefox/Safari 版本）不支持目录选择，因此不会显示“此设备”。

WebWindows Mobile / Android Host 使用 Android Storage Access Framework 选择目录，可提供持久目录权限。用户仍可在系统设置中撤销授权。

如果没有“此设备”，先确认使用受支持浏览器或 Android Host、页面为 HTTPS，并查看设置中的设备/存储能力；这不是云资料故障。

