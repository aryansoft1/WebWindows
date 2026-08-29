# WebWindows SDK Sandbox Facade v1

状态：Phase 2A shape freeze；尚未注入当前 Preview 或 Production package sandbox

## 1. Facade 目标

未来沙箱内的 `window.WebWindows` 是 SDK 创建的冻结数据/函数 facade，不是 `parent.WebWindows`，也不是宿主对象代理。Facade 只实现 `webwindows-public-api-v1.d.ts` 中获准进入 sandbox 的稳定 namespace。

长期 Public API namespace 仍为：

```text
window.WebWindows
├─ device
│  ├─ system
│  ├─ runtime
│  ├─ network
│  ├─ battery
│  ├─ display
│  ├─ audio
│  ├─ storage
│  └─ power
└─ fileDialog
```

不包含 `apps`、安装/目录接口、Shell window manager、管理员接口、Developer API 凭证、内部 adapter 或 Native 私有对象。

Phase 2 Pilot 不生成完整 namespace，只生成机器 allowlist 明确登记的 `device.battery.getState` 和 `device.battery.refresh`。新增 Public API 不会自动进入 facade；Storage 与 fileDialog 本阶段完全不生成。

## 2. 同步 API 兼容

现有 Public Device API 含同步 getter，跨 frame Broker 本身是异步的。Facade 采用 handshake snapshot 保持当前形状：

- `device.getCapabilities()`、各组 `getCapabilities()`、`getState()`、`getInfo()` 从经过 Broker 清洗的本地只读 cache 同步返回副本；
- `device.ready()` 在 MessagePort handshake、effective permissions 和首个 snapshot 完成后 resolve；
- `refresh()` 和 setter 按现有公开返回形状工作；异步 refresh 完成后更新 cache 并发出 SDK event；
- `network.refresh()` 保留当前“同步返回 cache、必要时后台刷新”的行为；
- file dialog 与 storage I/O 保持 Promise API。

Phase 2 Pilot 只实际设计 `battery.getState()` cache 和 `battery.refresh()` request。其他同步 getter 继续保留为未来 handshake snapshot 规则，不在 Pilot 中承诺可用。

Facade 不用 SharedArrayBuffer、同步 XHR、阻塞 loop 或 parent property access 模拟同步调用。

## 3. 权限与 capability 表现

- 方法存在不表示已授权；未授权调用返回稳定 `permission-denied`；
- `getCapabilities()` 返回当前 sandbox 的 effective capability，不直接复制 host 全局能力；
- 未声明/未授权能力报告 `supported:false`，并使用公共、安全的 source/reason；
- Runtime capability 支持但 permission denied 时仍不得调用；permission granted 但 capability unavailable 时返回 `capability-unavailable`；
- Facade 不允许枚举未公开 Host namespace。

## 4. 对象安全

- 顶层、分组对象和固定方法表 `Object.freeze`；
- getter 返回 structured-clone 副本，不返回 Host object identity；
- callback 只保存在 sandbox 内，由 SDK 根据 broker event 调用；
- 参数先在 SDK 做快速校验，Host Broker 再做权威校验；
- Console、错误和事件 detail 做深度/大小限制；
- 不把 resource URL、volume ID 或宿主 handle 原样暴露，使用 app-scoped opaque handles。

## 5. Bootstrap 失败

协议不兼容、session 失效或 policy hash 不匹配时，SDK 不创建半可用 facade；`ready()` reject 一个公共 `sdk-unavailable` 错误，Preview Host 显示诊断。禁止回退到 `parent.WebWindows` 或探测其他全局对象。

## 6. 构建与类型

Sandbox runtime bundle 与 `.d.ts` 从同一 Public API contract 生成/核对。Language service 不注册 Shell 的全局类型文件。任何新 namespace 必须先成为稳定 Public API，再经权限/Broker 评审加入 facade。
