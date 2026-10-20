# WebWindows Storage Media Streaming Design v1（Phase 0B 草案 / audit 模式）

- 状态：**draft-not-enforced**。本文档与配套 JSON 草案（`capability-broker-media-methods-draft-v0.json`、`permissions-declarable-batch-draft-v0.json`）均为提案，不改变任何生产 Schema/Registry/Runtime 行为；登记前 Broker 逐 method 默认拒绝（现状不变）。
- 前置事实来源：`docs/WEBWINDOWS_MEDIA_EDITING_APP_SUPPORT_V1.md` §G1 缺口、`docs/STORAGE_CAPABILITY_V1_DESIGN.md`（v1 整文件只读 ≤8 MiB、无流式）、`data/sdk/permissions-v1.json`（`device.storage-file.read` / `cloud.files.*` 既有词汇）、`api/dt_file_transfer.asp` 核对结论（AI Assist 契约 §11）。
- 消费方：«桌影»（`com.aryansoft.deskshadow`，免费，Manifest v2）；任何其他媒体类应用可复用同一词汇。

## 1. 问题（G1）

Storage v1 只提供 `device.storage.openFile` 整文件读取（≤8 MiB 上限）与 `fileDialog.saveBlob` 整文件写入。视频剪辑场景的素材文件为数百 MiB～数 GB，导入预览与导出写盘都需要**分片读写**，否则：
1. 导入即 OOM 或被 8 MiB 上限直接拒绝；
2. 导出只能整包写入内存一次性 Blob（1080p 数分钟即 >1 GiB）。

沙箱无 Worker（G5 实测）、`network:none`，所以全部分片 must-on-main-thread，分片尺寸必须与主帧预算协同（见 §6）。

## 2. 设计原则

1. **不新增授权面**：读分片严格限定在**已被用户通过 openFile 选择的文件句柄**内——复用既有 `device.storage-file.read`（resource-grant），不新增读权限。写分片严格限定在**已被用户通过 fileDialog.save/saveBlob 授权的目标文件**内——复用既有 `cloud.files.save`（host-owned 起始）+ `cloud.files.write-selected`（resource-grant 分片）。词汇表唯一新增的是会话语义，不是新的文件访问权。
2. **会话绑定**：写会话 `sessionId` 绑定 (app published identity, 授权目标文件 token, 开启窗口)；不携带任何路径输入；越权 offset 直接 fail-closed。
3. **默认拒绝**：8 个新 broker method（含续传查询 status、G3 能力快照）全部列入 registry 才可用；`previewAvailability` 与 `productionAvailability` 分列，先 preview 试点。
4. **量小可审计**：每次分片调用记录 requestId/method/decision/字节数/latency，不记录内容（沿用"不记录 params/result payload"纪律）。

## 3. 公共 API 形状（`.d.ts` 增补延后，单一事实来源规则 4）

> **来源模型澄清（用户确认，2026-10-21）**：云资料就是 WebWindows 文件系统本身；«桌影»是生态内的普通应用，不存在独立的"本地文件"通道（A5：本地 fileHandlers 平台保留）。素材 = 用户文件系统里的文件（经 `fileDialog.open` 读句柄）；产物 = 写回同一文件系统（经 `fileDialog.save` 句柄 + 本批写会话）。素材先行进入文件系统是用户自己的云盘行为，与应用的评审面无关。

```ts
/** 仅草案：stable 实现落地后并入 webwindows-public-api-v1.d.ts */
interface WebWindowsMediaStorage {
  /** 已授权句柄的元信息（大小/类型/mtime）；不触碰内容 */
  stat(fileToken: string): Promise<{ size: number; mimeType: string | null; lastModifiedMs: number | null } | null>;
  /** 已授权句柄分片读；length > chunkLimit 被夹紧 */
  readChunk(fileToken: string, offset: number, length: number): Promise<{ offset: number; length: number; bytes: ArrayBuffer; eof: boolean } | null>;
  /** 写会话：开启由宿主可信动作承载（fileDialog.save/saveBlob 之后的目标） */
  writeSession: {
    begin(target: { fileToken?: string; suggestedName: string; mimeType: string; sizeHint?: number }): Promise<WriteSessionHandle | null>;
    writeChunk(sessionId: string, offset: number, bytes: ArrayBuffer): Promise<{ acceptedOffset: number } | null>;
    commit(sessionId: string): Promise<{ fileToken: string; size: number } | null>;
    abort(sessionId: string): Promise(boolean);
  };
}
```

宿主实现注记：`readChunk` 在沙箱侧通过 Broker 转发到 Storage 通道；`bytes` 走转运层二进制通道（若 Broker v1 仅支持 JSON，则 base64 且 `maximumResponseBytes` 上限相应降低——见 §5 注释位，试点期实测定案）。

## 4. 会话语义（写路径）——2026-10-21 第二次修订：上限放开 + 会话内续传

- 单应用**同时至多 1 个**写会话；`begin` 于活跃会话存在时拒绝（`WRITE_SESSION_ACTIVE`）。
- 顺序推进：`offset` 必须**等于**会话当前游标（不接受任意寻址写，杜绝会话内错位/回写）；不匹配报 `OFFSET_SEQUENCE_ERROR` 且游标不动。
- **会话内续传（已定案）**：传输失败/网络波动后，沙箱以 `writeSession.status` 重查**服务端权威游标**（`cursorOffset`/`bytesWritten`），从游标处继续 `writeChunk`——不重传、不产生重复内容。服务端会话状态 = 目标句柄 + 游标整数 + 少量元数据，内存代价可忽略；会话 TTL 内未活动 30 分钟自动失效（`SESSION_EXPIRED`）。**关窗仍是丢弃**（沙箱无持久化，sessionId 在应用内存里）——界面在导出前明示"请保持窗口打开"。
- 显式 `commit` 才完结——commit 前 Host 不把任何部分内容暴露为"目标文件已更新"；`abort` 幂等；TTL 过期后的 commit/abort/status 返回 `active:false`/null 而非抛错（沙箱侧按降级处理）。
- **上限（已定案）**：单会话 ≤2 GiB（`sizeHint` 仅预检参考）；云资料即 WebWindows 文件系统，**用户自身云盘配额是天然约束**，应用不做二次配额体系，`begin`/`chunk` 的配额失败路径（`QUOTA_EXCEEDED`）如实上报给任务面板。
- 分片 4 MiB/片；客户端写入节流 ≤4 片/秒，ASP/转发侧代价由试点实测（必要时降 2 MiB 片）。

## 5. Broker method 草案（8 条，详见 media methods 草案 JSON）

| method id | permission | 同意模型 | 用途 |
|---|---|---|---|
| `device.storage.stat` | `device.storage-file.read` | resource-grant（沿用） | 已授权句柄元信息 |
| `device.storage.readChunk` | `device.storage-file.read` | resource-grant（沿用） | 已授权句柄分片读（≤4 MiB/片） |
| `device.storage.writeSession.begin` | `cloud.files.save` | host-owned-user-action | 写会话开启（可信 UI 起点，≤2 GiB 上限） |
| `device.storage.writeSession.writeChunk` | `cloud.files.write-selected` | resource-grant（会话内） | 顺序分片写（回报权威游标） |
| `device.storage.writeSession.status` | `cloud.files.write-selected` | resource-grant | 续传查询（权威游标/活跃态/TTL 余量） |
| `device.storage.writeSession.commit` | `cloud.files.write-selected` | resource-grant | 完结并落盘 |
| `device.storage.writeSession.abort` | `cloud.files.write-selected` | resource-grant | 放弃会话 |
| `device.media.getCapabilities` | 无（快照型，同 `device.getCapabilities` 基线） | no-consent | G3：宿主编解码能力矩阵（WebCodecs/MediaRecorder/各 codec 布尔）— 因宿主引擎而异，能力检测为必需（**勘误后复核**：审核引擎在可信上下文具备完整 H.264+AAC WebCodecs 路径，但宿主差异降级要求不变） |

当前 `capability-broker-methods-v1.json` 的 `explicitlyExcluded` 含 `device.storage` 整命名空间——本文档提案的是**句柄作用域的粒度方法**，与整目录/卷枚举面（`pickDirectory` / `listDirectory` / `listVolumes` 维持排除）不同；评审时应在 registry 中显式拆分为 `device.storage.directory.*`（继续排除）与本批 `device.storage.{stat,readChunk,writeSession.*}`（新增可用）。

## 6. 与主线程预算协同（沙箱事实约束）

- 读片 4 MiB：主线程 base64/ArrayBuffer 转换 + demux 喂解码 ≈ 每片 <30ms（1080p 实测待 V2），分帧调度每帧 ≤1 片。
- 写片 4 MiB：`commit` 由一次导出全程调用一次；`writeChunk` 每片一次 Broker 往返，导出阶段以后台任务节流（≤4 片/秒）避免 UI 冻结。
- G5 前提：所有解码走 WebCodecs（blob:/https `<video>` 被 CSP 拦），无 Worker，无 IndexedDB——工程文件 JSON 存云资料（G8 定案），媒体二进制永远只走会话句柄，不落地沙箱持久层。

## 7. 评审检查清单（audit 模式通过标准）

1. registry delta 全部字段与 `capability-broker-methods-v1.json` 现行结构同构（本文配套 JSON 已按此写）；
2. 新 method 的 `requiredPermission` 全部指向登记中的既有 permission 或本批新增的 `ai.desktalk-assist`（AI 批）——**不引入未登记权限**；
3. `cloud.files.*` + `device.storage-file.read` 进入 `sourceDeclaration.declarablePermissionIds`（delta 文件表达，生产文件仍只含 battery直至评审通过后由平台正式改名 md5 迁移）；
4. preview 与 production 分列启用，先 Battery-Pilot 式试点（«桌影»包 skeleton 已留接钩 `ZY.fileDialogOpenProject` / `ZY.fileDialogSaveProject`）；
5. `.d.ts` 增补不得先于稳定实现（仓库规则 4）。
