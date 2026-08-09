# WebWindows Mobile / Android

WebWindows Web 运行在普通浏览器中；WebWindows Mobile / Android Host 是承载同一 Web 界面的 Android 宿主。

Android Host 可通过受控桥接提供浏览器没有或受限的能力，例如 Storage Access Framework 本地目录、原生媒体音量、亮度、电池及系统会话操作。是否可用必须读取当前 Device API capabilities，不能仅凭手机型号推断。

普通浏览器仍可使用云资料和大多数 Web 功能，但本地目录、持久权限、硬件音量或背光等入口可能不可用或仅提供页面级替代。

