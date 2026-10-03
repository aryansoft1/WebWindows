# Dreama Runtime 内核设计

状态：**Storage v1 Phase 3（选择器与卷生命周期契约）设计中**。

本文件是 Dreama Runtime 内核设计的入口和索引。此前设计分别保存在
Native Bridge、公共 Device API 与 Storage Capability 文档中；它们并未被
删除。本文件避免“内核设计”因按能力拆分而难以发现。

## 内核边界

Dreama Runtime 是受信任的原生宿主；WebWindows 页面是使用公开能力的
顶层文档。页面和应用只能调用 `window.WebWindows.device`。私有
`window.WebWindowsNative` 仅用于 Runtime 与 Device API 之间的传输，不能
成为应用依赖。

```text
WebWindows 功能 / 第三方应用
  -> window.WebWindows.device       （稳定公开 API）
  -> Device API / Storage Provider  （校验、适配、降级）
  -> WebWindowsNative               （私有 Native Bridge v1）
  -> Dreama Runtime Host            （信任、生命周期、平台能力）
```

内核必须维护的不可变边界是：精确来源、顶层页面、导航世代、请求 ID、
能力最小授权、平台私有标识不出桥，以及公共 API 的跨平台兼容性。

## 已冻结的设计

- [Native Bridge v1](NATIVE_BRIDGE_V1.md)：信任模型、封包、请求/响应、
  生命周期，以及 Runtime、网络、电池、显示、音量、存储能力的 ABI。
- [Device API](DEVICE_API.md)：应用可使用的稳定 `window.WebWindows.device`
  接口和浏览器降级语义。
- [Storage/SAF v1 设计审计](STORAGE_CAPABILITY_V1_DESIGN.md)：只读目录能力的
  安全模型、数据契约、迁移阶段和验证矩阵。

Storage v1 是内核当前唯一尚未完成冻结的能力：它只包含授权目录、列举、
元数据和最多 8 MiB 的整文件读取；写入、删除、重命名、释放卷和流式读取
必须作为独立的后续设计，不得悄然加入 v1。

## 当前继续点

Phase 1（来源/生命周期边界）与 Phase 2（数据契约校验）已经进入冻结候选。
当前应完成 Phase 3：将目录选择器的成功、取消、繁忙、超时、导航和卷 ID
替换规则落实到原生 Runtime，并加入迁移/隔离测试。具体规范与验收项见
[Storage 设计的 Phase 3 决策记录](STORAGE_CAPABILITY_V1_DESIGN.md#18-phase-3-选择器与卷生命周期冻结决策记录)。

完成标准：Android 真机 SAF 实现和浏览器 provider 均遵循该状态机；旧页面
的选择结果不能持久化、不能回复给新页面，也不能跨精确来源复用；所有相关
smoke/migration 测试通过后，Storage v1 才能标记为 Frozen。
