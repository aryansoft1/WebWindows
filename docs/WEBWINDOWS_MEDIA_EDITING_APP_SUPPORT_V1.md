# WebWindows Media Editing App Support v1（第三方媒体剪辑应用支撑契约）

状态：Phase 0B 设计草案（G1/G3/G4 设计；G5 为验证任务；G6 引用既有 Lifecycle；未修改任何生产 Schema/Registry/Runtime）
日期：2026-10-21
关联：`WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md`、`STORAGE_CAPABILITY_V1_DESIGN.md`、`DREAMA_RUNTIME_KERNEL_DESIGN.md`、`WEBWINDOWS_FUNCTION_LIFECYCLE_V1.md`、`WEBWINDOWS_MANIFEST_V1.md`
产品背景：«桌影»（英文工作名 DeskShadow）——WebWindows 应用生态内的三轨视频剪辑应用。本文件是它的"缺口先补齐"契约清单。

## 1. 现状硬约束（读取结论文档化）

| # | 事实 | 出处 |
| --- | --- | --- |
| A1 | 第三方包 ZIP：≤500 文件、解压后 ≤30 MiB，扩展名白名单不含 `.wasm` | `assets/js/package-runtime.js` |
| A2 | 发布 Runtime `browser-zip-sandbox-v1`：`network:none`、`sameOrigin:false`；脚本/样式必须包内解析，外链被 CSP 阻止 | `WEBWINDOWS_MANIFEST_V1.md` §2.4/§3 |
| A3 | Storage v1：整文件只读、8 MiB 上限；无 offset/range/chunk/流式；无写入 | `STORAGE_CAPABILITY_V1_DESIGN.md` |
| A4 | Broker method 逐项登记、默认拒绝；source-declarable 权限目前仅 `device.battery-status.read` | `capability-broker-methods-v1.json`、`permissions-v1.json` |
| A5 | `fileHandlers[].adapter` 为平台保留，第三方无合法授权路径（drift #7） | `WEBWINDOWS_MANIFEST_V1.md` §4/§6 |
| A6 | Function Lifecycle v1 为设计态：无后台常驻；`beforeclose` 不能 veto | `WEBWINDOWS_FUNCTION_LIFECYCLE_V1.md` |

## 2. G1 —— Storage v2 媒体流式读写（设计）

### 2.1 问题

视频素材普遍 100 MB～数 GB，A3 的整文件 8 MiB 读取完全不可用。剪辑应用需要：读取大视频不解入内存、把导出成品写出、项目文件增量保存。

### 2.2 设计目标（Public API 形状，未实现）

```ts
interface DeviceMediaStorageAPI {
  getCapabilities(): { readChunk?: Capability; writeSession?: Capability };
  readChunk(volumeId: string, path: string | string[], offset: number,
            length: number): Promise<{ data: ArrayBuffer; totalSize: number; eof: boolean }>;
  createWriteSession(volumeId: string, path: string | string[],
                     options?: { overwrite?: false }): Promise<MediaWriteSession>;
}
interface MediaWriteSession {
  write(chunk: ArrayBuffer, offset: number): Promise<{ bytesWritten: number }>;
  commit(): Promise<{ sessionId?: undefined }>;   // 原子落盘
  abort(): Promise<void>;
}
```

### 2.3 Broker methods（提案，audit 先行）

| method | consent | 要点 |
| --- | --- | --- |
| `device.storage.media.readChunk` | resource-grant（延续 `device.storage-file.read` 的卷授权模型） | 单 chunk 8 MiB 上限；offset/length/totalSize 严格 schema；路径在授权卷内解析，不得越卷；不支持 range 语义时返回 `capability-unsupported`，不降级到整文件读 |
| `device.storage.media.write.begin/Chunk/commit/abort` | host-owned-user-action（首次建立写会话时）；subsequent chunk 调用沿用该 session | 写会话绑定 session/snapshot/channel，导航世代轮换即失效；commit 原子（临时名+改名），abort 只撤销 session 不删既有文件 |

- 必须防止：跨卷路径逃逸、offset 负值/溢出、chunk 越权补齐请求、写会话跨 reload 复活；
- 审计：只记 volume(opaque)/offset/bytes/decision，不记路径明文与内容；
- Android SAF / Browser provider 各自实现矩阵进入 Storage v2 验证矩阵，不得悄然并入 Storage v1。

## 3. G3 —— `media.codecs` Runtime capability（设计）

宿主 capability map 增 `media` 组：

```json
{ "media": { "codecs": Capability } }
```

`supported` 的判定是**真实事实检测**（WebCodecs `VideoDecoder.isConfigSupported`/`VideoEncoder.isConfigSupported` 与 `MediaRecorder.isTypeSupported` 的结果摘要），不是声明式自报。沙箱内结果按 Broker 清洗模型只回 `{supported, codecs: string[], degraded: boolean}` 归一化数组（如 `["mp4.h264","webm.vp9","webm.av1"]`），不含引擎版本等指纹。应用据此启用/降级/否则如实提示。

## 4. G4 —— 第三方 fileHandlers 最小授权（设计）

现 drift #7 收紧为显式授权（涉及 Manifest Schema 增补，独立版本评审）：

- `fileHandlers[]` 增加第三方合法字段集：`action:"open"` + `extensions[]` + `priority`；`adapter` 不得由开发者伪造，发布端生成统一的 `handler-broker` 第三方适配器；
- 触发时 Host 判定：用户在 Host UI 中选中该文件（user gesture 权威在 Host）→ 启动应用并携带 sanitized launch context（opaque 文件 ref，不含真实路径）；
- 应用再以 `cloud.files.read-selected` / G1 readChunk 的授权链读取内容（文件本身不从 launch context 直接携带）。

## 5. G5 —— Package Runtime CSP 媒体行为（已实测，2026-10-21 Chrome 桌面版）

复现方式：`tmp/package-csp-probe/index.html`（零依赖，`node tools/static-server.mjs 4599` 后访问 `/tmp/package-csp-probe/index.html`；未入库的开发工具页面）。被测 iframe 与 `assets/js/package-runtime.js` 的生产形态逐字节同源：`sandbox="allow-scripts allow-forms allow-modals allow-downloads"` + 注入的 meta CSP `media-src data:; img-src data:; connect-src 'none'; …`。

| # | 判定问题 | 结论 | 详情 |
| --- | --- | --- | --- |
| 1 | 包内媒体（打包为 `data:` URL 的资产）直接 `<video>` | **PASS** | 1.1 KB 录制样本 `loadedmetadata` 通过；`media-src data:` 覆盖 |
| 2 | 运行时 Blob URL（`blob:`）直接 `<video>` | **FAIL** | 同一段非空 MP4 字节（1068 B），`MediaError.code=4`，元素级被 CSP 拒，`media-src data:` 不含 `blob:` |
| 3 | 云资料 `readUrl`（用户所选文件的站点 URL）`<video>` | **FAIL** | `MediaError.code=4` 且**零网络请求**（网络面板交叉验证，commondatastorage 采样 URL 请求数 0）——请求在 CSP 处被拒，连 URL 都没离开元素层 |
| 4 | Blob Worker（解码管线放 worker） | **FAIL** | `new Worker(blob:)` 触发 onerror；`worker-src` 回退到 `script-src 'unsafe-inline'`，无 `blob:`/`data:` 来源 |
| 5 | `canvas.captureStream` + `MediaRecorder` | **PASS（能力存在）** | 录制可运行且 `isTypeSupported('video/mp4')===true` |

**衍生事实（超出原五问，实测顺带证实）**：

- WebCodecs（VideoDecoder/VideoEncoder）在该沙箱上下文中**可用**——不经历 CSP 的媒体元素管线；
- **沙箱无持久存储**：`localStorage` 与 `IndexedDB` 在 sandbox 无 `allow-same-origin` 的 opaque origin 下均抛 SecurityError → 见新增 G8；
- 无任何 worker 可用（G9）。

**对应用的直接影响（写进«桌影»设计规则）**：

1. 用户导入的视频**不能用 `<video>` 预览**（blob:/https 均被拦）——预览必须走 **WebCodecs 解码 → canvas 绘制** 管线（无 CSP 依赖）；
2. 导出成品（Blob）不能塞回 `<video>` 回放，同样走 canvas/WebCodecs 校验预览，最终交付用 `fileDialog.saveBlob`/云资料写出；
3. 打包资产（示例片头、示例滤镜演示）可用 `data:` URL 直接播放（PASS 项），但受 30 MiB 包预算与 33% data URL 开销双重限制，仅限小样；
4. 解码/编码/滤镜计算都在主线程，UI 必须分帧调度（`requestAnimationFrame`/`setTimeout` 切片），避免长任务卡住宿主桌面。

**新增缺口**：

### G8 —— 应用级持久存储（**已定案**，2026-10-21）

沙箱内无 localStorage/IndexedDB（实测 SecurityError）。**用户已定案：走云端工程文件**——工程 JSON 保存到云资料私有区（`cloud.files.save/write-selected` 权限），媒体二进制不入工程文件（重开工程时"重新导入素材"模式并如实提示）；浏览器降级模式的 localStorage 草稿仅作开发便利、如实标注。不做：Broker `storage.kv.*`（搁置）、任何自动后台同步（无后台常驻边界）。前置依赖：`cloud.files.*` 进入 `sourceDeclaration.declarablePermissionIds`（与 G1/G2 同批登记）。

### G9 —— Worker 来源白名单（新增，仅设计不实现）

`script-src 'unsafe-inline'` 不允许 `blob:`/`data:` worker。提案：Package Runtime policy 未来按完整性哈希白名单允许包内脚本构造 Worker（`worker-src blob:` + 哈希绑定）。在此之前解码/分析必须在主线程；这是导出性能的现实上限之一。

## 6. G6 —— 导出任务生命周期（约定，无新增 API）

- 不新增后台常驻（A6 是事实边界）：导出必须前台进行、进度可取消；
- 应用必须增量保存工程 JSON（`fileDialog.saveBlob` / G1 项目文件），不能依赖 `beforeclose`；
- 长任务 UI 必须显示剩余估算与取消；`media.job.*` 后台任务模型**只设计不实现**（后续独立契约）。

## 7. «桌影»产品规格（对齐 `WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md` §6 的 `video-edit` scene）

### 7.1 Manifest v2 要求（作者输入）

```json
{
  "id": "com.aryansoft.deskshadow",
  "manifestVersion": 2,
  "sdk": { "apiVersion": "1" },
  "permissions": ["cloud.files.open", "cloud.files.read-selected", "cloud.files.save", "cloud.files.write-selected", "ai.desktalk-assist"]
}
```

**已定案（用户确认，2026-10-21）**：ID `com.aryansoft.deskshadow`（发布后绑定安装/授权/审计，不更换）；收费模式**免费**；注意 registry 现状的 `sourceDeclaration.declarablePermissionIds` 仅 battery——上述 permissions 全部依赖本次 G1+G2+cloud.* 申报化批次的登记（声明词汇表扩容与 broker method 登记同批走 audit 模式）。骨架包（`developer-samples/zhuoying-deskshadow/`，12 文件 ≈87.5 KiB）manifest 顶层 `permissions` 保持 `[]`，plannedPermissions 放在 `"com.aryansoft.deskshadow"` 反向域名命名空间，未登记 ID 不占位。

- `install.defaultState:"available"`、`source:"repository"`、`uninstallable:true`——**置于功能仓库、不默认安装**；
- `placement:{desktop:false, startMenu:true, startMenuGroup:"user", allFunctions:true}`；
- `window:{mode:"iframe", singleton:true, width:"1280px", height:"800px"}`；
- 包预算：纯 JS 引擎（目标 ≤4 MiB 代码+图标），不携带模型文件超过 30 MiB 总额；轻量 L1 模型 ≤6 MiB。

### 7.2 功能范围（一期）

三轨时间线（视频/音频/字幕，各可多条）；分割、掐头去尾、拼接重排、变速（保音调）、逐段音量曲线；过渡（叠化/黑场/白闪）与滤镜预设（CSS filter → WebGL）；字幕卡 + L3 生成字幕（样式：字号/描边/位置）；画幅预设 16:9/9:16/1:1/4:5；导出 MP4（WebCodecs + JS muxer）与降级 WebM（MediaRecorder）。

### 7.3 AI 三层（一期 L1+L2；L3/L4 只设计）

| 层 | 内容 | 本次状态 |
| --- | --- | --- |
| L1 本地确定性分析 | WebCodecs 抽帧 → 场景切换检测、镜头运动强度、色彩分布、音频响度包络、静音段。输出 `assetReport`（见 §7.4） | 一期实现（应用内，零外发） |
| L2 桌讯编排 | `assetReport` + 工程摘要 → `ai.requestAssist`（Host 确认卡）→ 桌讯输出**可逐项确认的剪辑提案卡片**（开场取舍、卡点、字幕文案、封面文案、"为什么这样剪"）；用户确认才写入时间线。**交互形态已定案（2026-10-21）：逐项确认卡**，不做一键应用 | 一期实现（依赖 AI Assist 契约落地） |
| L3 Whisper 转写 | 平台新增 `ai.transcribe` 契约（用户逐段显式点击才上传该段音频，结果直接回填字幕轨，不进桌讯对话；默认关闭） | 仅设计，二期独立评审 |
| L4 视觉多模态 | 云成本与隐私评审 | 仅概念记录于本节 |

### 7.4 `video-edit` scene 摘要 schema（L1 → L2 输入，16 KiB 内）

```json
{
  "scene": "video-edit",
  "summary": {
    "project": { "duration": 0, "resolution": [0, 0], "fps": 30, "tracks": 0 },
    "clips": [{ "id": "opaque", "duration": 0, "scenes": 0, "motion": 0,
                "silenceRatio": 0, "loudness": 0, "resolution": [0,0] }],
    "analysis": {
      "sceneCuts": [{ "t": 0, "score": 0 }],
      "silenceSpans": [{ "t0": 0, "t1": 0 }],
      "motionHistogram": [0],
      "loudnessDownsample": [0]
    }
  }
}
```

字段与上限在 Broker method schema 中逐项数值化（数组长度上限、数值范围、opaque id 不含路径语义）。应用 UI 上所有 AI 建议必须标注"依据素材元数据估算"，且不反映任何帧画面或音频内容。

### 7.5 诚实边界

- L2 输出不可归因于"看懂视频"，界面禁止使用"AI 已理解素材"类文案；
- capability 不支持显式 `supported:false` + 原因；降级导出必须明示（帧率/分辨率限制）；**WebCodecs 能力矩阵因宿主引擎而异**——G3 capability 检测仍为必需。**实证勘误（2026-10-21晚）**：此前"审核环境（Electron/Chromium 152）无 VideoEncoder/VideoDecoder/AudioEncoder"是在 **about:blank（非 secure context）** 下的假象；在可信上下文（http://localhost）复核，**WebCodecs 四接口全部存在**：VideoEncoder avc1.42001f/avc1.640028/vp9/av1 均 supported（avc1.42001e 不支持）、VideoDecoder avc1/vp9/av1、AudioEncoder/Decoder mp4a.40.2(AAC-LC)/opus 均 supported、MediaRecorder mp4 可用——即该引擎具备**完整客户端编码路径（H.264+AAC）**。结论修正：主导出管线优先纯 WebCodecs（VideoEncoder+AudioEncoder+封装），MediaRecorder mp4 为**宿主差异降级**（旧 WebView/异构引擎仍可能缺失），OfflineAudioContext+MediaRecorder 降级管线要求维持不变；任何"能力缺失"结论必须先排除 secure-context 干扰再定论；
- **持久化已定案（G8）**：Production 走云端工程文件（云资料写权限，工程 JSON 存+"重新导入素材"模式，二进制不入工程文件）；沙箱无 localStorage/IndexedDB（SecurityError 实测），浏览器降级模式的 localStorage 草稿仅为开发便利并如实标注；不做自动后台同步（无后台常驻事实边界）；
- **分发降级已定案**：一期导出只到云资料，界面提示"请到桌讯手动发送"；Host-owned 分享契约 `WEBWINDOWS_DESKTALK_HOST_SHARE_V1.md`（类型白名单扩展 mp4/webm + 大小分档）二层实现——依据 `dt_file_transfer.asp` 核对（类型白名单无视频/15 MiB 上限/登录态+头+好友校验/沙箱 `connect-src 'none'` 不可达）；不内嵌自动发布，发出去永远是谁的问题。

## 8. 服务器负担评估（架构性定案：贵计算留在客户端）

**总判断：«桌影»对服务器的负担设计上是"轻"的——所有重计算（解码、滤镜合成、字幕渲染、编码导出、L1 分析）全部发生在沙箱客户端**；服务器只在少数显式用户动作上过账。逐项清单：

| 触达点 | 频率 | 体量 | 性质 |
| --- | --- | --- | --- |
| 工程文件保存（云资料 JSON） | 用户显式点击，无自动同步 | 单文件数 KB～数百 KB（纯编辑数据，不含媒体二进制） | 与"云文档保存"同级 |
| 导出成品写盘 | 用户显式导出，通常每会话 ≤1 次 | ≤256 MiB/会话（分档评审值），走 4 MiB 分片 | **唯一大块**：与云资料既有上传通道同性质，不新建存储后端 |
| L2 AI 编排 | 用户显式触发 | 载荷 ≤16 KiB 文本、1 并发、6 次/分、预估 ≤500 次/日/应用（评审定值） | 走 chatproxy 既有额度体系，与桌讯本体系数 |
| L1 本地分析 | 完全客户端 | 0 字节上行 | 纯本地确定性计算 |
| 素材导入/预览/逐帧播放/抽帧 | 完全客户端 | 0 字节上行、0 字节下载（media 不经网络） | media-src CSP + network:none 双保证 |
| L3 Whisper 转写 | 一期不实现 | （若未来实现：音频上行，是潜在最大 AI 负担项——实现前必设 ≤5 分钟/段+日额度+逐段显式点击门禁） | 已定案"只设计不实现"，服务器成本当前为零 |

**并发与转发实现注意（试点必须实测）**：
- 写会话转发：256 MiB 导出 ≈ 64 次 4 MiB 分片请求，JSON+base64 序列化放大约 1.33×（≈5.6 MiB 文本/请求）。ASP/VBScript 侧处理大字符串代价不低——试点版本若观测到转发 CPU 峰值，降级为 2 MiB 分片或推动 Broker 二进制通道（另行评审）。
- 写会话节流：客户端 ≤4 片/秒（16 MiB/s 上限，实际导出期间有效带宽由用户网络决定）。
- 会话并发上限 = 单应用单会话 + 10 分钟 TTL → 峰值并发会话数 ≤ 活跃用户数，无乘法放大；无后台常驻意味着**关窗即清零**。

**与既有基线的关系**：云资料上传通道本来就要承载用户视频上传；«桌影»没有制造更高频的上传模式（无自动同步是定案前提），只是让"用户剪辑完成后主动保存成品"复用同一通道并受用户配额约束（云资料配额是既有核算维度，不需要新增后端配额体系）。

**缓冲与监控措施（进评审清单）**：
1. 导出目标**默认本地**（`fileDialog.saveBlob`，服务器 0 成本），仅当用户需要远程/发讯筒时推送云资料——把最大块指控变成 opt-in；
2. L2 日额度 500 次/应用进 permission review 定值（cli 一致性：额度核算写入账面审计项）；
3. 试点版本诊断面板加三个只读计数器：本会话导出 MB、writeSession 请求峰值延迟、L2 当日用量——管理员侧复核用数据，不进普通用户 UI；
4. L3 若排期，先单条目小试点（≤5 分钟音频/段，日 ≤20 段/应用）再谈规模。

## 9. 发布与门禁（对齐仓库纪律）
- 每个契约接入前独立评审、audit 模式运行、drift 显式记录；
- 应用包提交走 Developer Studio → `developer_api/v1.asp` → 管理员审核 → published；
- 任务进度记录 `docs/HANDOFF_TASK_QUEUE.md`；部署前 `tools/deployment-preflight.ps1`；
- G5 已实测完成并固化于 §5（复现页 `tmp/package-csp-probe/index.html` 为开发工具页，不入库，判定与结论可按 §5 重建复核）；
