# 此设备与本地存储

“此设备”表示 Device Storage Provider 当前已经允许 WebWindows 读取的本地位置，不会自动扫描整台设备。

云资料页面不会主动弹出浏览器或操作系统的默认目录选择框。当前环境没有已授权且可读取的位置时，不显示“此设备”，也不能从该页面新增或重新授权位置。

已经由 WebWindows Mobile / Android Host 或 Device Storage Provider 授权的位置可以显示。用户在系统层撤销权限后，WebWindows 不会伪装成仍可访问。

如果没有“此设备”，表示当前 Provider 没有可读取位置；可以继续使用公共资料或登录后的私人云资料。这不是云资料故障。
