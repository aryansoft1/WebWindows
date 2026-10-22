# ZHUOYING_DESKSHADOW_REVIEW_PACK_V1（桌影评审推进包）

- 任务：T-072《桌影》(com.aryansoft.deskshadow)
- 产出轮次：第十四轮（2026-10-22），前置：第十三轮 `22a6c3f`（L1+i18n）、Phase 0B 机器草案入库 `33df95d`
- 性质：评审决策材料。**2026-10-22 四项拍板已完成并记录在 §A-4/§B-1/§B-2/§C-1**：批次经用户批准 R-A① 后，生产 `data/sdk/permissions-v1.json` 同日按 delta 逐字应用（registry 头部 notes 有决策注记）；WebM 原型档移除、字体定名、fileDialog 语义确认均已落地。"批准≠线上部署≠Runtime 实现"的边界不变。
- 附带机器校验：`tmp/review-crosscheck.cjs`（facade 词汇层级复算 validationChecks）——**5 pass / 0 fail**。

---

## A. 平台契约批次：G1 存储流式 + G2 桌讯 AI 协助 + cloud.* 申报化（同批评审申请）

### A-1 本批机器草案三件套（均已入库，`33df95d`）

| 文件 | 内容 |
| --- | --- |
| `data/sdk/permissions-declarable-batch-draft-v0.json` | 语义化 delta：`upsert-permission ai.desktalk-assist`（targets `ai.isSupported/ai.requestAssist/ai.on`，prompt=runtime-confirmation，userGesture）+ 3 条 `update-permission`（`device.storage-file.read` 追加 stat/readChunk；`cloud.files.save` 追加 writeSession.begin；`cloud.files.write-selected` 追加 writeChunk/commit/abort——**均在既有资源授权句柄内，不新增文件访问权**）+ `append-source-declarable` 8 ids（ai.desktalk-assist + cloud.files.{open,read-selected,save,write-selected} + device.storage-directory.{pick,list} + device.storage-file.read） |
| `data/sdk/capability-broker-ai-methods-draft-v0.json` | `ai.desktalk.requestAssist`（payload JSON ≤16KiB、6/min、120s ticket、单在飞；production `proposed-disabled`/preview `proposed-enabled`；审计不含 payload 内容）+ event `ai.assist.received`（proposals ≤12，每条独立确认卡，沙箱永不自动应用；attribution=`desktalk-assist`）+ `reviewedNotSelected`（findAssistTargets/cancelAssist 拒录理由）+ `explicitlyExcluded`（attachFile/send/readThread/ai.complete 永不进入） |
| `data/sdk/capability-broker-media-methods-draft-v0.json` | `device.storage.stat/readChunk`（读骑既有 openFile 句柄）+ `device.storage.writeSession.{begin,writeChunk,commit,abort,status}`（Host 可信保存对话框先落 target；App 内单在飞会话；顺序 cursor，禁随机写〔seek 拒录〕；2 GiB 会话帽；失败 resume 走 status 续传；会话过期 resolve null 不 throw）+ `device.media.getCapabilities`（布尔能力快照、无引擎版本/无遥测，requiredPermission=null 只挂 runtime capability） |

### A-2 交叉校验结果（本附包复算，脚本 `tmp/review-crosscheck.cjs`）

| Check | 结果 |
| --- | --- |
| check1 upsert 目标全被 facade 词汇覆盖（facade= `publicNamespace + "." + publicMember`，或 facade 合成成员 `ai.isSupported`——以 ai 草案 `publicApiSource` 注记为据；broker 内部 id 无 publicMember 不算 public 目标） | PASS |
| check2 `append-source-declarable` 8 ids 均在 base∪batch 已定义 | PASS |
| check3 三条 update-permission 的 `publicApiTargetsAppend` 全覆盖 | PASS |
| check4 两草案内全部 `requiredPermission` 在 vocabulary 内已定义 | PASS |
| check5 update 目标 id 均存在于 base registry | PASS |

（原草案 `validationChecks` 第 3 条措辞已按上述词汇层级修正——`ai.isSupported` 是 facade 合成成员而非 broker 方法，其余三个 checks 原文不变。）

### A-3 一致性既成事实

- registry `permissions-v1.json` 现状：`cloud.files.*` 全族与 `device.storage-directory.*`、`device.storage-file.read` **定义已在**（prompt 三态：host-owned-user-action / resource-grant / install-review），唯 `sourceDeclaration.declarablePermissionIds` 仅 battery——即应用还不能在 Manifest v2 申报这些权限。本批 delta 就是把这一"定义已有、申报词汇未开"的缺口闭掉，物理动作=一组 id 追加，无语义改写。
- 桌影侧早已备好消费面：manifest v2 `plannedPermissions`（反向域名空间声明）、L1 已落地（assetReport 即未来 L2 载荷）、L2 按钮 disabled（不发假动作）。

### A-4 请求平台的决定（单选）

| 选项 | 含义 |
| --- | --- |
| **R-A①（建议）批准批次进入评审执行** | 用户批准后我方按 delta 落地：`permissions-v1.json` 应用 operations（附同份 diff 与校验复跑证据）；broker registry 登记两草案 methods；平台代码项单列排期（见 A-5） |
| R-A② 批次有异议 | 指出条目（如 device.storage-directory.* 是否收窄至最小集），我方修订草案重跑校验 |
| R-A③ 本批暂缓 | 维持 draft-not-enforced，材料归档待 V3 |

**批准边界**：批准≠线上部署、≠Runtime 能力已实现（registry 注记原文语义）；`productionAvailability: proposed-disabled` → 启用是各方法独立评审，不在本批。

> **拍板记录（2026-10-22）：用户选 R-A①「批准提交」，且应用已执行**——生产 `data/sdk/permissions-v1.json` 当日逐字应用全部 5 operations（upsert ai.desktalk-assist + 3 条 targets 追加 + declarable 8 ids），`$defs.permissionId.enum` 同步扩 9（manifest 校验词汇 ref），notes 记决策注记；`tmp/review-crosscheck.cjs` 重写为已应用验证器 **5 pass / 0 fail**（registry 落点 vs delta 逐项对账）。三件套草案已加 `reviewDecision` 对象。**边界不变**：registry 仍 `draft-not-enforced`、broker 方法仍 `proposed-disabled`，A-5 平台代码项（facade/askAppAssist/确认卡/知识库盘点）逐项独立排期。桌影 manifest permissions 已从 `[]` 填 5 项（§7.1 清单）；`device.storage-directory.*`/`device.storage-file.read` 在 registry 层申报化但**桌影 manifest 不申报**（G8 走 cloud.files.*）。

### A-5 批准后的平台侧执行清单（逐项验收）

1. `data/sdk/permissions-v1.json` 应用 5 operations → 复跑 `manifest-v2.schema.json`（Ajv2020 + registry ref）与 Developer Studio 双校验器 → 桌影 manifest `permissions` 字段从 `[]` 填入 6 项（G8 定案集合）。
2. broker 生产 method registry 登记两草案 methods/events；`previewAvailability=proposed-enabled` 先行（audit 模式）。
3. Facade：按 d.ts 草案增编生成 `ai` 命名空间（isSupported 合成 / requestAssist / on）；`device.storage.*` 六 facade 成员生成。
4. DeskTalk 平台侧：`window.WebWindowsDeskTalk.askAppAssist(attribution, context)`（冻结只读、归属徽标"来自桌影"）。
5. Host 确认卡（机器摘要：字段名+数值清单；拒绝→`assist-rejected-by-user`；仅本会话→session-grant；不弹 persistent grant）。
6. 知识库盘点：desktalk 知识库 index.inc.asp 现占条数 vs 32 条上限（video-edit 摘要接入前必查），结论回写契约。
7. 验收：真实沙箱 e2e 走通一次 requestAssist→确认卡→拒绝/仅本会话→assist.received 回流，全程审计条目含 attribution 无 payload 内容。

> **执行进度（第十六轮，2026-10-22）**：项 1 已随 R-A① 完成（十五轮）。**项 2 被冻结 schema 卡住并已备好修订草案**——`capability-broker-v1.schema.json`（v1 电池试点冻结）与已批准草案冲突共 9 类：`timeoutMs` 上限 10s（begin 120s/commit 30s/requestAssist 120s）、`maximumResponseBytes` 上限 1MiB（readChunk 载 4MiB 分片需要 ~5.6MiB）、`consent` 枚举缺 4 个草案授权语义词（resource-grant-ride/host-owned-user-action/ride-on-session/host-confirmation-card）、`userGesture` 缺 `required`、availability/`currentStatus` 词表缺 proposed-* / draft、`requiredPermission` 不允许 null（getCapabilities）、registry 无 events 段（ai.assist.received 无家可归）、`requiredRuntimeCapability` pattern 拒连字符段（storage.file-handle 等 4 个）、`publicMember` 拒点号 getter 链（writeSession.begin 等 5 个）。**修订草案** `data/sdk/capability-broker-v1-schema-revision-draft-v0.json`（V1-V10 + 登记后 registry 编辑 R1-R4）经机械校验器 `tmp/schema-revision-checker.mjs` **8 pass / 0 fail**：修订方案使登记逐字生效（零字段翻译）、现行 battery registry 在修订后原样通过（向后兼容）、同一模拟登记体被现行 schema 确实拒绝（证明修订是前提而非多余）。钳位备选已评估并否决（见草案 notes：4MiB 分片塞不进 1MiB 上限）。**修订批准后**（独立拍板，R-A① 不含它）执行：schema 应用 + `npm run build:developer-studio:validator` 重生成 + `tests/capability-broker-contract-smoke.mjs` 扩断言 + registry 编辑 + 台账/文档，然后才轮到项 3-7 的逐个实现评审。项 6（知识库盘点）**已完成**：16/32 占用、剩 16 空位，加《桌影》条目无需扩容（结论已回写 design doc §8）。项 3/4/5/7（facade ai 命名空间、askAppAssist、Host 确认卡、验收 e2e）待 schema+registry 落定后逐项排期。**第十七轮（同日全批拍板并执行）**：V1-V10 应用到 schema（盘上门禁：整体编译 + battery-only registry 向后兼容通过）+ registry 登记 R1-R4（九方法逐字 / `ai.assist.received` 事件 / 五条 reviewedNotSelected 并带 / 排除拆分 6→15 / 两条注记；battery 行字节不动、`defaultDecision` 与 `unknownMethods` 仍 deny）；`tests/capability-broker-contract-smoke.mjs` 扩改为长期门禁，其中**跨草案 facade∈targets 对账抓出并补账一个批次缺口**（`device.storage.writeSession.status` 漏列于 `cloud.files.write-selected` targets，已补 + permissions.notes 记档 + 批次草案 application 补注）；studio 生成物重生成（顺带修复十五轮遗留的 manifest-v2 生成物陈旧 `permissionId` 枚举）。剩余平台代码项：facade ai 命名空间生成、askAppAssist、Host 确认卡、验收 e2e。**第十八轮（同日拍板「预览纵深全链」，studio 侧试点落地）**：四项拍板项一次打通——ai audit broker + Host 确认卡（三按钮：发送到桌讯/仅本次会话/拒绝，机器摘要上卡、按 communicate 语义失败静默）+ DeskTalk 预览仿真提案源 + 验收 e2e。**架构裁决留档**：① wire 事件 gap——broker v1 wire `$defs.event` 枚举仅 `snapshot.update`/`capability.change`，`ai.assist.received` 不能过 `validateEnvelope`，事件改走 pilot 专用帧协议 `webwindows-studio-preview-assist-event-v1`（host/sandbox 双侧校验），请求/响应仍走真实 broker 信封；下轮 schema 修订候选（事件 wire 形态评审）先行挂账。② 试点错误码 8 个（assist-rejected-by-user/assist-confirmation-required/desktalk-unavailable/ai-provider-unavailable/ai-rate-limited/assist-session-limit/payload-schema-invalid/scene-not-registered）落 studio 本地表不进冻结 errors registry，promoting 需逐码评审。③ timeout 姿态：audit broker 用 min(方法 timeoutMs 120000, session 剩余)、不被 policy `maximumRequestTimeoutMs`(10s) 钳制——10s 会让确认卡不可用；每行审计记 `timeoutBudgetSource:"method-registry-pilot"`，属启用评审必须批准的偏差（生产可维持钳制）。④ payload 深校验先于确认卡的 fail-closed 变体：永不向 schema 非法 payload 授予卡片；与 policy 的「grant→capability→params」顺序有意不同，启用评审追认。⑤ 组合引导：battery 块逐字镜像 + `WebWindows` 冻结单一 defineProperty 点 + 单 port 双方法路由（ai 事件另走 pilot 帧协议）。⑥ 裁决旁路语义：permission 引擎对 proposed-enabled 方法恒判 `method-disabled`，`#pilotEffective` 仅在 declared/policy/grant/capability 全真实通过时试放行，每 dispatch 记 `auditAllowance:true`。⑦ Grant 语义：session-grant 会话内存（scene 域）、one-shot 按请求 hostGrant 重评、persistent 未实现；拒绝→`resolve(null)` 化名即 registry sanitization（fail-closed/mistake-silent）。⑧ 已知 UX 项：确认卡超时（120s）后卡片 UI 不自动消失（broker 侧已 settle，等用户点击或 stopPreview 清卡）——下轮候选改进项。门禁：新 `tmp/studio-audit-smoke.cjs` **58/58**（联调修出三个真缺陷：无卡直发路径不发 ticket、ai launch 缺 protocol/version、试点错误表键错位）+ 四条既有门禁全绿 + git 零跨域。**第十九轮候选（待用户拍板方向）**：previewAvailability 翻 enabled（预览启用评审，本试点为证据）或 askAppAssist 真实接线（A-5 项 4）/ 事件 wire 形态 schema 修订评审。

---

## B. 产品拍板项（包内即时可固化，与平台批次互不依赖）

### B-1 WebM 原型档转正与否

- **现状**：第十二轮落地、第十三轮延续。技术事实：MediaRecorder 实时 1× 速（导出耗时=时间线时长）、webm 容器时长元数据缺省、帧率贴墙钟；e2e 数据点 2s 双片段→2.57s 墙钟 62.7KB vp9+opus 含音轨。UI 四处如实标注"原型/1× 速/待评审"（export.js 注释+select 项 label+README+spec）。
- **选项**：
  - B-1a **维持原型标注（建议）**：零改动。理由：转正只改文案，不解决时长元数据缺省/帧率偏移两个技术债；"诚实降级路径"定位尚未失效。
  - B-1b 转正（文案"原型/待评审"→"正式档"）：保留时钟性质声明。净收益≈0，反而弱化技术债提示。
  - B-1c 移除：破坏无 VideoEncoder 宿主（审核环境实测无 VD/VE）可用性，违背诚实边界。
- **批准后改动清单（若 b）**：export.js 三处 label、README 两行、spec §6 一行；`tmp/static-check`/回归不受影响。

> **拍板记录（2026-10-22）：用户拍板「从面板移除」（非建议项）**——同日执行完毕：export.js 六处手术（门控回归纯 VideoEncoder 路径、三函数删除、格式 select 单项、`ZY.export.run` 诚实回退），面板保留移除说明（诚实 UI）；无 VideoEncoder 宿主导出按钮置灰+提示。技术债不失忆：实时 1× 速/webm 时长元数据缺省的历史数据点保留在本档 §E 与 spec §5 第十二轮行。jsdom 断言替换为拍板生效三断言（51/51），真机 e2e MP4 冒烟复跑通过（1.28s/60v+113a/console 零 error）。

### B-2 字幕字体白名单定名

- **现状**：第十一轮 canvas 量宽法实测数据点——可用：Microsoft YaHei(微软雅黑)/Segoe UI/Verdana/Tahoma/Arial；不可用：SimHei(黑体)/Noto Sans CJK SC/Source Han Sans SC。代码即 `"Segoe UI","Microsoft YaHei",sans-serif`（export.js:178，拉丁/中文/兜底各占位）。
- **选项**：
  - B-2a **定名现三元组（建议）**：零代码改动，仅把条文从"最终定名待产品拍板"固化为"已定案（2026-10-22 拍板）"。
  - B-2b 换用 Verdana 等纯英池：中文主体验崩坏（数据点已排除）。
- **批准后改动清单（若 a）**：spec §5 第十一轮行备注+§6 第 7 项措辞、README 字体说明一行；static-check/回归不动。

> **拍板记录（2026-10-22）：用户选 a「定名现三元组」**——条文已固化（spec §6 第 7 项「已定案（2026-10-22 拍板）」），代码零改动。

---

## C. 平台排期项（不进本批，给 Overview/排期引用）

### C-1 fileDialog 放行语义提案（放行=平台实现 dialog/fileDialog broker 方法时）

提案语：**"检测到≠放行"** 已是包内实现语义（探测分支已接 `fileDialog.open/saveBlob`，失败自动回退 `downloadBlob`/file input 并如实上报）。平台实现时请保持：方法未接入 → facade 成员存在但返回 `null`+稳定 reason code（建议 `unimplemented`/`host-declined`），**不抛异常、不假成功**；open 与 saveBlob 成为 stub 到真实实现间无行为差异。包内无需改动即可随放行生效。
（需要拍板的是确认这一语义方向，成本为零；具体实现属平台排期。）

> **拍板记录（2026-10-22）：用户「确认」**——语义方向条文固化（spec §6 第 5 项、本档案注释），包内实现不变，平台实现时照此放行。

### C-2 ASP 4 MiB 分片转发 CPU 实测方案（试点部署时照单执行）

包内无法测（需真机 ASP 环境）。实测计数器清单（诊断面板已有 `ZY.diag`快照基础）：
- 每分片 wall-clock（4 MiB 端到端 vs 纯 settle 时间）、GC 暂停次数/总时长、并发会话数下吞吐衰减、跨片哈希校验 CPU 占比。
- 判定线（建议）：单分片 ≤400ms 或吞吐 ≥6 MiB/s 即合格；超标则分片 2 MiB 复测。
- 复用场景：e2e trailer.mp4（52.2s/2435 AAC 块样本常驻 `tmp/v2-probe/trailer.mp4`）已就绪可直接当载荷。

### C-3 1080p 导出提速（V3，非评审项）

实测瓶颈=逐帧独立 seek 解码链（19.8fps@1080p=0.66× 实时；合成/编码均 >100fps）。方案已注明：导出顺序走时复用单条解码链。V3 排期即做，无需拍板。

---

## D. 已定案不再重推（避免重复评审）

- **保音调**：用户拍板一期不保（V3 做重采样）——两档导出同声明。
- **发讯筒联动**：一期降级 + 二期 Host-owned share 契约（`api/dt_file_transfer.asp` 契约核对已锁：类型白名单不含 mp4/webm、15MiB 上限、需登录态头+好友校验→沙箱永不可直连）。
- **ID/收费/安装位置**：com.aryansoft.deskshadow、免费、功能仓库不默认安装（manifest v2 已如此）。

## E. 证据索引

| 主题 | 证据 |
| --- | --- |
| 导出主档（MP4）及边界、WebM 原型、写盘分流 | 第十/十二轮表（spec §5）/README「V2 导出管线」，commit `027e9d9`、`d80d675` |
| L1 本地素材分析（assetReport 车道数据） | 第十三轮表（spec §5）/README「L1 本地素材分析」节，commit `22a6c3f`；断网蜜罐 netCalls 空 |
| 多片段预览接力 | 第十一轮（`b53699d`） |
| C5 CSP 沙箱实测（media-src data:/connect-src 'none'、opaque origin 存储） | G5 实测固化（spec「沙箱警戒线」+ai.js 诊断面板标注） |
| G1/G2/cloud.* 机器草案三件套 | `33df95d`；本附包 A-1/A-2 |
| 回归门禁现状 | 静态门 9/9、jsdom 51/51、真机 e2e console 零 error（2026-10-22 复跑） |
