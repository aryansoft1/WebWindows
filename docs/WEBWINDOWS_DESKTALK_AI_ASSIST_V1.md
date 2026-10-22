# WebWindows DeskTalk AI Assist v1（桌讯·第三方应用 AI 协助契约）

状态：Phase 0B 设计草案（未接入 production，未修改任何 Schema/Registry 生产行为）
日期：2026-10-21
关联：`WEBWINDOWS_CAPABILITY_BROKER_PROTOCOL_V1.md`、`WEBWINDOWS_FUNCTION_LIFECYCLE_V1.md`、`WEBWINDOWS_MANIFEST_V2.md`、`cloud/desktalk/chatproxy.asp`
产品背景：«桌影»（视频剪辑）等第三方应用需要调用桌讯 AI；现有先例是内置应用“问道”通过同源 `window.WebWindowsDeskTalk.askTravelAdvice()` 集成，该集成面不是第三方可用契约（第三方运行在 `sameOrigin:false` 沙箱 iframe 中，无法访问 Shell 内的全局对象）。

## 1. 目的

为第三方 Function（Manifest v2 沙箱应用）提供一条**主动触发、只传摘要、Host 裁决、回复可回流**的桌讯 AI 协助通道。沿用问道确立的隐私纪律：

- 用户主动点击后才发起；应用不得静默、不得循环、不得在后台自动触发；
- 只传递**结构化摘要**，不传媒体内容、坐标轨迹或任意自由文本陷阱外的数据；
- 桌讯端依据 `chatproxy.asp` 的既有纪律："依据 Knowledge 回答；不知道时明确说明，不得编造"。

## 2. 新增 Public API（设计目标形状）

未来扩展 `window.WebWindows`：

```ts
interface DeskTalkAssistScenePayload {
  scene: string;            // "video-edit" 等逐项登记的场景 ID
  summary: object;          // scene 对应的结构化摘要，逐场景 schema 化
}

interface AiAPI {
  isSupported(): boolean;
  requestAssist(payload: DeskTalkAssistScenePayload): Promise<AiAssistTicket | null>;
  on(type: "assist.received", cb: (detail: AiAssistReply) => void): Unsubscribe;
}
// WebWindowsNamespace 增: readonly ai: AiAPI;
```

`.d.ts` 增补必须遵守单一事实来源规则：**只能在稳定实现落地后增补，不得先于实现声明成员**（`WEBWINDOWS_DEVELOPER_PLATFORM_SINGLE_SOURCE.md` 规则 4）。

## 3. Broker methods（Phase 0B 提案，接入前先 audit 模式）

新增 method registry 条目（`capability-broker-methods-v1.json` 未来版本增补，登记前默认拒绝）：

| 项 | 值 |
| --- | --- |
| method id | `ai.desktalk.requestAssist` |
| invocation | request-response |
| required permission | `ai.desktalk-assist` |
| required runtime capability | `desktalk.assist`（Host 侧稳定事实：桌讯面板可用） |
| user gesture | **host-owned**（见 §5） |
| consent | session-grant（首次询问后可"本会话不再询问"） |
| timeoutMs | 120000（chatproxy 服务端 ScriptTimeout 180s，留余量） |
| maximumResponseBytes | 65536（回流分析文本上限） |
| envelope 上限 | 16 KiB（与 broker 全局一致） |
| 并发 | 每 session 至多 1 个 in-flight，速率上限 6 次/分钟 |

event：`ai.assist.received`（type:"event"，绑定 session/snapshot/channel/request/method；Phase 0B 只保留该一个事件形状）。

## 4. Permission registry 增补（提案）

`permissions-v1.json` 未来增补（此期 chunk 不改生产文件）：

```json
{
  "id": "ai.desktalk-assist",
  "displayName": "DeskTalk AI assist",
  "description": "Send a sanitized, app-declared structured summary to the DeskTalk AI panel; receive a text reply through the broker event.",
  "sourceDeclarable": true,
  "risk": "medium",
  "prompt": "host-owned-user-action",
  "userGesture": true,
  "publicApiTargets": ["ai.isSupported", "ai.requestAssist", "ai.on"]
}
```

审核报告应展示：应用声明的 scene 列表、每个 scene 的摘要 schema 链接、无媒体传输的事实。管理端审核策略可只允许部分 scene。

## 5. Host-owned 请求确认（关键安全设计）

沙箱内应用的按钮点击不是授权证明（Broker 协议 §8）。因此每次 `ai.desktalk.requestAssist` 在 Host 侧先渲染**可信确认卡**：

```text
「桌影」请求桌讯协助。将发送以下摘要（16 KiB 以内）：
  · 场景：视频剪辑
  · 素材 3 段，含场景数 12、静音 2 段（不含任何画面或音频内容）
  [发送到桌讯] [仅在本次会话允许] [拒绝]
```

- 确认卡必须展示 payload 的**机器摘要**（字段名+数值清单），不得只展示宽容描述；
- 拒绝 → `assist-rejected-by-user`；选择"仅本会话" → session-grant，本 session 后续同 scene 请求不再弹卡（仍走全部其他裁决层）；
- persistent grant 留待 Production persistent-user-grant 评审。

## 6. Payload 清洗与场景 schema

scene 逐项登记（不允许自由 scene 字符串绕过 schema）。首期只登记一个场景：

`video-edit`（摘要由 L1 本地确定性分析 + 工程元数据组成，字段级 schema 见 `WEBWINDOWS_MEDIA_EDITING_APP_SUPPORT_V1.md` §7）：

- 允许：素材段数/时长/分辨率/帧率、场景切换表（时间戳+得分）、静音段、运动强度分布、字幕轨统计等**数值型摘要**；
- 禁止：任何帧图像、音频样本、用户文案外的自由文本、坐标轨迹、文件真实路径（用 opaque 名称）；
- 清洗失败 → 稳定错误 `payload-schema-invalid`，不透传。

## 7. DeskTalk 端扩展（平台侧）

`assets/js/desktalk.js` 增补对称内部接口（问道 `askTravelAdvice` 同款，冻结只读）：

```js
window.WebWindowsDeskTalk = Object.freeze({
  askTravelAdvice: function(context){...},        // 既有
  askAppAssist: function(attribution, context){...} // 新增：携带应用归属 ID
});
```

- 桌讯对话区显示归属徽标（"来自桌影"），回复照常出现在 AI 区；
- 回流：Host 把桌讯最新回复文本经 broker event 送回请求 session（大小/深度限制后 structured-clone）；应用 UI 必须标注"来自桌讯"；
- 桌讯未打开时：Host 不代开面板，返回稳定错误 `desktalk-unavailable`

## 8. 知识库

`ai/knowledge/` 新增《桌影》条目（keywords：桌影|视频剪辑|剪视频|字幕|导出）。**注意 `index.inc.asp` 注册表上限 32 条（`KnowledgeIds(31)`），接入前必须先盘点当前占用数**；上限不足时先扩容数组，属独立评审变更。

> **盘点（2026-10-22，T-072 第十六轮）**：`ai/knowledge/index.inc.asp` 现登记 **16 条**（overview/desktop/windows/functions/function-center/cloud-files/file-open/local-device-storage/settings/sound/display/power-battery/account/developer-center/mobile-android/troubleshooting），占用 16/32、**剩余空位 16**。加《桌影》1 条后 17/32，**无需扩容**；占位后再次达 50%。

## 9. 错误模型

复用 `capability-broker-errors-v1.json` 全部稳定错误，另增（禁止携带 provider/stack/原始异常）：

- `assist-rejected-by-user` / `assist-confirmation-required`
- `desktalk-unavailable`
- `ai-provider-unavailable`（chatproxy 503/504 归一化）
- `ai-rate-limited`、`assist-session-limit`（并发 1）
- `payload-schema-invalid`、`scene-not-registered`

## 10. Audit

跟随 Broker audit 规则：记录 timestamp、session/app identity、requestId、method、scene、decision、result category、latency、payload 字节数；**不记录 payload 内容**（同"不记录 params/result payload"纪律）。

## 11. 与现状的兼容

- 本期不改 chatproxy、不改 Manifest v2 Schema、不动 permissions-v1.json 生产语义；
- 未声明 `ai.desktalk-assist` 的 v2 包：facade 不生成 `ai` 命名空间，调用面不出现；
- Preview 先行（Studio Preview 模式），Production `currentStatus` 置 `disabled`，另行评审后启用。
- ~~分发联动（发讯筒）依赖独立验证~~ **已核对（2026-10-21，`api/dt_file_transfer.asp` 全文）**：传输模型干净——`op=share` 把**发送者云资料私有区已存在的文件**复制入 `data/chat/files` 并登记 7 天有效记录（好友校验、可撤回、`op=download` 按 sender/recipient 授权下载）；但按现状«桌影»导出成果**无法直接进入该通道**：
  1. `MimeForExtension` 白名单仅 png/jpg/webp/pdf/txt/csv/docx/xlsx/pptx，**不含 mp4/webm/音频**；
  2. `MAX_FILE_BYTES = 15,728,640`（15 MiB），正常导出的视频远超；
  3. share 需要登录态 + `X-WebWindows-Request: desktalk-file` 头 + `recipientId` 好友校验，而第三方沙箱为 `connect-src 'none'`、无登录态上下文——**该端点永远不会由应用直接调用**，share 动作只能由 Host-owned UI 代发。

**结论（用户已确认，2026-10-21）**：一期降级 = «桌影»导出只到云资料，界面明确提示"请到桌讯手动发送"；同时新增独立契约草案 `WEBWINDOWS_DESKTALK_HOST_SHARE_V1.md`（提案）：Host-owned 分享动作（沙箱先经 `fileDialog.saveBlob` 写云资料、Host 校验该 blob 的会话归属后代发 share）+ 分享类型白名单扩展 mp4/webm（大小上限分档：视频建议按 250 MiB/段另评）+ 好友可见性沿用既有校验。二期实现，与 G1/G2 同批评审。

## 12. Preview-audit 试点现状（2026-10-22，第十八轮）

本文 §1-§11 的 L2 全链已在 **Developer Studio Preview 侧试点落地**（`webwindows-vue/src/developer-studio/`，production broker、registry、schema、d.ts、`assets/js/desktalk.js` 零触碰）：

- **流路**：sandbox `WebWindows.ai.requestAssist` → broker 信封（协议 v1，共享 battery 同一 MessageChannel/channelId）→ `PreviewAiBroker`（audit 模式）→ 经过三步裁决（declaration → platform policy → host-confirmation-card grant → capability，method-policy 步经 `auditAllowance` 试点放行）→ 深层 payload 校验（本 §6 视频 schema + 试点 cap 表，`ratifiedByEnablementReview:false`）→ Host 确认卡（三选：发送到桌讯=one-shot / 仅本次会话=session-grant / 拒绝）→ ticket 响应 → 仿真提案源（`PreviewDeskTalkSimulator`，正文带【预览仿真】标记）→ `ai.assist.received` 事件帧回流 sandbox listener。
- **§7 提案接线未做**：提案源是仿真器；`assets/js/desktalk.js askAppAssist` 真实接线与 `previewAvailability` 翻 `enabled` 属后续独立轮次。本轮不含 chatproxy 改动，L2 发送按钮保持 disabled。
- **wire 事件 gap（留待下轮 schema 修订评审）**：broker v1 wire `$defs.event` 枚举仍只有 `snapshot.update`/`capability.change`，`ai.assist.received` 不能过 `validateEnvelope`；事件走 pilot 专用帧协议 `webwindows-studio-preview-assist-event-v1`（host runtime `validBrokerEvent` 与 sandbox `handleAssistEvent` 双侧校验），请求/响应仍走真实 broker 信封。
- **错误码落点**：§9 新码（assist-rejected-by-user / assist-confirmation-required / desktalk-unavailable / ai-provider-unavailable / ai-rate-limited / assist-session-limit / payload-schema-invalid / scene-not-registered）进 studio 试点错误表（`ai-assist-errors.js`），**不进** `capability-broker-errors-v1.json`（冻结层不动）；正式化需逐码评审。
- **timeout 姿态偏差**：audit broker 用 `min(方法 timeoutMs 120000, 剩余 session)`，**不被** policy `maximumRequestTimeoutMs`(10s) 钳制；每行审计记 `timeoutBudgetSource: "method-registry-pilot"`，偏差作为启用评审 finding（生产可维持钳制）。
- **审计**：行字段=scene/payloadBytes/payloadChars/ticketId/proposalCount/attribution/outcome，机器摘要（`ai-confirmation-summary.js`，字段名+数值）上卡、不回显 payload 文本；jsdom+Ajv 双层验收 `tmp/studio-audit-smoke.cjs` 58/58（drift 对账/launch 形状/ladder/卡流/one-shot+reject/lifecycle 门限/cpp 组合引导行为/facade 路径/production 零 diff）。
