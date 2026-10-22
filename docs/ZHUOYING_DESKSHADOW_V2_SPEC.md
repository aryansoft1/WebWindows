# «桌影»DeskShadow V2 细节规格（开工前定档文档）

状态：2026-10-21 细节讨论定档（用户逐项确认 + 我方默认方案成文）。V2 开工以本文为细节基准；与两份契约文档（`WEBWINDOWS_STORAGE_MEDIA_V1_DRAFT.md` / `WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md`）冲突时以契约为准。

## 1. 来源模型（用户澄清，纠偏）

**云资料 = WebWindows 文件系统本身**。«桌影»是生态内的普通应用：
- 素材 = 用户文件系统里的文件，经 `fileDialog.open`（权限 `cloud.files.open`）取读句柄，再走 G1 分片读；
- 产物 = 经 `fileDialog.save` 取写句柄 + G1 写会话写回同一文件系统；
- **不存在**独立的"本地文件直接读"通道（A5：本地 fileHandlers 平台保留，不动）；素材先行进入文件系统是用户自己的云盘行为，不进本应用的评审面与负担核算。

## 2. 定档决策（用户拍板）

| # | 事项 | 决策 |
| --- | --- | --- |
| D1 | 会话上限 | ≤2 GiB/会话；用户云盘配额是天然约束，应用不做二次配额体系；`QUOTA_EXCEEDED` 如实上报任务面板 |
| D2 | 导出中断 | **会话内续传**：传输失败后以 `writeSession.status` 重查服务端权威游标，从游标继续写；关窗仍丢弃（无持久化），导出前 UI 明示"请保持窗口打开约 N 分钟" |
| D3 | 变速音频 | 一期**不保音调**（采样重采样），UI 明示"音调随速度变化"；WSOLA 保音调列二期 |
| D4 | 导出期间交互 | **冻结时间线编辑**（导出中禁改工程），进度抽屉常驻；规避快照一致性复杂度 |
| D5 | 工程保存策略 | **单文件覆盖写 + 显式"另存副本"**；不做每版本自动副本（云配额保护） |
| D6 | L2 AI 提案 | 逐项确认卡（此前已定）；本档无新增 |

## 3. 我方默认方案（细节基准）

### 3.1 大文件输入（读路径）
1. **素材永不整体入内存**：预览只解播放头 ±3s 窗口；缩略图只解 I 帧；分析独立抽样（见 3.3）。
2. **scrub 两段式**：拖动中显示最近关键帧（快），松手精确 seek 目标帧（准）；两态 UI 均如实反馈。
3. **帧内存纪律**：`VideoFrame` 用完必 `close()`；在飞帧 ≤8，超限丢最旧。coding 纪律，审查项。
4. **读分片节流**：主线程每帧预算 ≤1 分片（4 MiB）；分析队列最低优先级让位于预览。

### 3.2 大文件输出（写路径）
5. **本地大文件不走 saveBlob**（整 Blob 内存不可行）：统一 `fileDialog.save` 句柄 + writeSession 分片。
6. **进度三段**：编码（帧 n/N）→ 封装 → 写盘（bytes/sizeHint），单总进度条 + 段标签；不弹模态。
7. **失败路径**：OFFSET_SEQUENCE_ERROR → 重发同片（以 status 权威游标为准）；QUOTA_EXCEEDED / target 失效 → 会话 abort + 完整错误卡；commit 必须收到 ack 才算成功。
8. **完成卡**：打开文件 / 去云资料查看 / 提示"发桌讯手动分享"三入口。

### 3.3 性能
9. **音频预览滑窗**：`decodeAudioData` 整文件不可行（30min AAC ≈ 700MB PCM）。AudioDecoder 分窗解码（播放头 ±10s 滑窗）→ WebAudio 播放，窗口随播放头前移。
10. **L1 分析抽样**：仅对已上故事版片段，每 2s 抽 1 帧（直方图/运动/响度/静音），异步最低优先级队列，面板显示预计时长，可暂停。
11. **解码阶梯**：capability 检测定级 →1080p30 全速 / 1080p@15fps 跳帧 / 720p canvas 缩放 三档；V2 第一任务 = 本机 benchmark 实测定档。
12. **渲染分层**：滤镜走 `ctx.filter`（GPU）；字幕与画幅遮幅为独立后画层；预览 canvas 独立于导出分辨率（≤1280 宽）。

### 3.4 任务与生命周期
13. **任务中心**：顶栏任务抽屉（导入/分析/导出/保存各一行：进度+取消）；并行上限 = 导出 1 + 保存 1 + 分析 1，超限排队。
14. **取消语义**：读=停调度；写=abort（无半成品）；分析=清队列；全部 fail-closed。
15. **导出锁**：导出中禁编辑（D4）+ 顶栏"导出中请勿关闭"横条；关窗即 abrt 诚实处理。
16. **i18n**：.zh 全量，en/jp 一期补齐任务面板与完成卡文案（骨架已有键值层）。

### 3.5 工程文件
17. **素材指纹**：文件名 + mtime + size 三元组（句柄 token 会话级不可持久化）；重开工程 → 素材清单逐个重选 → 指纹校验自动接回，不匹配标红。
18. **schemaVersion**：工程 JSON 带 `schemaVersion` + `appVersion`；向后忽略未知字段；`schemaVersion` 大于本版 = 拒绝打开并提示升级。
19. **撤销栈**：内存 50 步，关窗弃（诚实标注）。

### 3.6 兼容矩阵（G3 落地逻辑）
20. **检测顺序**：`isSecureContext`（先决——**能力缺失结论必须先排除 secure-context 干扰**，2026-10-21 勘误教训）→ WebCodecs 接口存在 → codec 级 isTypeSupported → 解码 benchmark 定阶梯档位。
21. **降级模式阶梯**：全功能（WebCodecs 全）→ 基本剪辑（MediaRecorder 导出）→ 只读查看（仅预览）。最差档不谎称可剪。
22. 画幅×分辨率矩阵固定：9:16 / 1:1 / 4:5 / 16:9 / 21:9 × 720p / 1080p；不提供自由分辨率导出。

## 4. 评审联动事项

- D1/D2 已写入 media methods 草案（`writeSession.status` 新 method、chunk 回报 `cursorOffset`、TTL 30min、2 GiB 上限注记）——评审材料随第三轮草案同批；
- D4（冻结编辑）与 G6 导出生命周期约定一致（前台导出无后台常驻）；
- 服务器负担核算（`WEBWINDOWS_MEDIA_EDITING_APP_SUPPORT_V1.md` §8）中"3.5 分钟 1080p"表述按 D1 的 2 GiB 更新为"受云盘配额约束、 UI 明示预计时间"，256 MiB 评审建议值调整为 2 GiB 上限 + 云配额天然约束。

## 5. 解码/编码基准（2026-10-21 V2 任务 #1 已实测）

自合成内容 benchmark（`tmp/v2-bench/index.html`，审核环境 Chrome/Electron 152 · localhost 可信上下文 · 合成渐变内容易压缩，数字是**乐观上界**，真实素材接入后复核）：

| 项目 | 结果 | 结论 |
| --- | --- | --- |
| VideoEncoder avc1.640028 1080p30 4Mbps | **106.6fps（3.55× 实时）**，60 帧 563ms/1120KB | 主导出格式成立：10min 1080p 编码 ≈ 3min |
| VideoEncoder av01 1080p | 64fps（2.13× 实时） | 高压缩备选，二期再评 |
| VideoEncoder vp09 1080p | 36.5fps（1.22× 实时） | webm 降级路径最慢，非必要不用 |
| VideoDecoder avc1 1080p | **551fps（1.8ms/帧，18× 实时）** | 预览满速档直接可行；跳帧/缩放档备而不用 |
| VideoDecoder vp9 720p | 1096fps（0.9ms/帧） | 全格式解码余量充足 |
| AudioEncoder mp4a.40.2 (AAC-LC) 48kHz×2ch | 83ms/5s（**60× 实时**） | 音频编码零瓶颈 |
| canvas 合成（1080p→1280 直缩） | 0.02ms/帧 | 绘制免费 |
| canvas 合成（滤镜 blur+saturate + 字幕描边） | **1.9ms/帧（527fps）** | 合成层对主线程预算无威胁 |

**阶梯定档（§3.3/11 落值）**：默认满速档（decode 18× 实时余量）；跳帧档与 720p 档保留为低配宿主降级，阈值由 G3 `device.media.getCapabilities` + 首次导入时的 60 帧 probe 实测定（不再预设机器档位）。

**待复核项**：合成内容 ≠ 真实素材（复杂纹理码率/编码耗时上浮，预计仍在 2× 实时之上）；GPU/软编码路径未区分记录（下一步接入真实 mp4 + mp4box.js 分块转送后加重测）。

**真实素材数据点（2026-10-22 第八轮，Sintel trailer.mp4 4.3MB 实测补档，`tmp/v2-probe/`）**：

| 项目 | 结果 | 备注 |
| --- | --- | --- |
| 样本索引表 | 视频 1253 / 音频 2435 条全有（trailer 实测） | `getTrackSamplesInfo` 驱动，弃 onSamples/start() 抽取 |
| 媒体元数据 | 854×480 · avc1.64001e · 视频时基 24Hz（cts=帧序）· 音频 mp4a.40.2 48kHz×2ch 48000Hz · durationMs 52209 | mp4box onReady：宽高在 `t.video.{width,height}`，`t.width` 为 undefined（已归一化） |
| seek 解码链 | kf0 链 47 帧物化+解码 46ms（≈1ms/帧）→ 目标帧绘出 46–119ms | 索引表 + `_blockFor` 双槽 1MiB 块缓存（命中 0.2ms） |
| 播放实时性 | LEAD=260ms 预取（≤持有窗 8 帧/333ms）下 24fps 实时绘制达成（5 绘/2.2s→54 绘/2.2s） | `MAX_FRAMES=8` 纪律实测刚性：存活 VideoFrame ≈9 张 Chrome 停发 output（微分实验 shapeA/B/C），试 14 卡死 |
| 包内页端到端 | 画布 854×480、seek 非黑帧、播放头 1→2.57→3.58s 跟墙钟、像素实时变化、pause 保持、管线 pos 与 playhead 一致、零 window error | player.js setInterval(16ms) 驱动（rAF 后台节流 ~1/s 的宿主实测） |

综合：合成基准的乐观上界结论在真实 854×480 H.264 素材上方向一致（解码 ≈1ms/帧、播放实时），1080p 真素材复核仍留待导出管线接入时一并做。

**第十一轮补档（2026-10-22，导出/预览闭合项数据点）**：

| 项目 | 结果 | 备注 |
| --- | --- | --- |
| 720p 真素材导出（854×480→1280×720） | 2s/60 帧全程 **5.1s**（含逐片段独立 seek 解码链、Mixed 60 帧含 crossfade/filter/0.5× 慢放变体 1.5s） | 帧级原语：独立 seek 链每输出帧开新 decoder（导出非实时，成本可接受） |
| 1080p 合成导出基准 | 60 帧 415ms（**144.5fps**，8Mbps，avc1.640028，产生 711KB） | 与 §5 首行 106.6fps 同量级，编码路径依旧不是瓶颈 |
| 字体可用性探测（canvas 量宽法，审核环境） | 可用：**Microsoft YaHei/微软雅黑、Segoe UI、Verdana、Tahoma、Arial；不可用：SimHei/黑体、Noto Sans CJK SC、Source Han Sans SC** | 字幕白名单三选数据点落地：`"Segoe UI","Microsoft YaHei",sans-serif`（当前代码即此三元组，中字/拉丁/兜底各占，黑体与思源均不可用不宜入选） |
| 字幕预览实时叠层 | seek 0.5s 显示"测试字幕"、区间外隐藏，与烧录同语义（DOM 近似） | 新增 `updateCaptionOverlay`；tick/seek 双路径刷新 |
| 多片段衔接接力预览 | 0.9s 起 pipeline canvas 模式 → 跨 1.0s 边界全自动接力 → 2.0s 片段末停（isPlaying=false）| `chainTo` 逐段重启（stopPlayer+play），衔接点相邻 ≤0.05s 才接力；jsdom 30/30（含验 V1 路径） |

**第十二轮补档（2026-10-22，WebM 原型档 + 真素材 1080p 数据点）**：

| 项目 | 结果 | 备注 |
| --- | --- | --- |
| WebM 原型档 e2e（MediaRecorder 实时录制） | 2s 双片段（crossfade+warm+字幕+音量差+音轨）实时录制墙钟 **2.57s → 62.7KB**，`vp9,opus` 择型、含音轨 | 原型性质如实标注：1× 速录制（导出耗时=时间线时长）、帧率贴墙钟、webm 时长元数据缺省；**转正待评审** |
| 1080p 真素材视频链路复核（解码+合成+编码） | 854×480 源→1920×1080 烧字幕→avc1.640028@8Mbps，60 帧 **3.02s=19.8fps（0.66× 实时）**、262KB | 瓶颈在逐帧独立 seek 解码链+1080p draw，非编码器（对照：1080p 合成编码基准 144.5fps）；提速归 V3 复用解码链 |
| jsdom 回归 | 扩至 **35/35**（webm 选项三态：缺能力置灰/含 mediaRecorder 桩可选/无 VE 仍可点） | 按钮启用条件统一为 `!capabilityOk() && !canRecorderExport()` 才置灰 |

**第十三轮补档（2026-10-22，L1 本地素材分析 + i18n 补齐）**：

| 项目 | 结果 | 备注 |
| --- | --- | --- |
| L1 assetReport e2e（52.2s 854×480 真素材） | 65 视觉采样点 + 63 响度窗、全扫描 **6.7s**、报告 615B ≤16KiB；断网蜜罐 `netCalls` 全程为空（零外发实证） | 视觉车道=luma 16-bin 柱状图相邻差（峰值 0.67，阈值 0.55）；音频车道=全块拼接过窗 RMS dBFS（-50dB/≥300ms 静音段）；车道阈值与"估算"标注=诚实边界 |
| 2s 双片段工程结构摘要 | 615B：clip 2/media 1/字幕覆盖 1.2s 均字 6/warm✓crossfade✓/gap 0 | 纯工程数据同步生成；缺 `captions` 字段旧 JSON 防御容错 |
| `frameAt(0)` 修复（`_pickFrame`） | 目标早于首帧时取首帧；修复前反派 null | **副产**：导出首帧黑帧老 bug 顺带治好（export 冒烟 60v+113a 回灌 `firstFrameAtZero:true`）；jsdom 既有 35 例全数通过无回归 |
| i18n en/jp 补齐 | chrome 层 12 缺键全量真翻译（en + jp），jsdom 断言三语键翻齐 | 面板内部长文案仍中文键值（回退可读），深层国际化属后续轮次 |
| jsdom 回归 | 扩至 **51/51**（L1 结构确定性/车道统计/诚实 skip/noteOnly/缺 provider 报告组装/零网络静态断言） | ai.js 不得含 `fetch(`/`XMLHttpRequest`/`sendBeacon` |

**第十五轮拍板执行（2026-10-22，四项拍板落地——决策记录见评审备忘录 §A-4/§B-1/§B-2/§C-1）**：

| 项目 | 结果 | 备注 |
| --- | --- | --- |
| WebM 原型档移除（用户拍板：**从面板移除**） | export.js 六处手术：头部注释、按钮门控回归 `state.active \|\| !capabilityOk()`、`canRecorderExport`/`runRecorderExport`/`pickRecorderMime` 三函数删除、格式 select 单 mp4 项、点击处理器纯 MP4 路径、`ZY.export.run` 诚实回退（`format:"webm"` → MP4 + 如实提示，API 签名不变） | 无 VideoEncoder 宿主下导出按钮置灰+面板保留「已按 2026-10-22 拍板移除」诚实提示；实时 1× 速与 webm 时长元数据缺省两项技术债不因移除而失忆（历史数据点保留本表第十二轮行） |
| 申报化批次应用（用户拍板：**批准提交**） | 生产 `data/sdk/permissions-v1.json` 逐字应用 `permissions-declarable-batch-draft-v0.json` 全部 5 operations：upsert `ai.desktalk-assist`（targets ai.isSupported/requestAssist/on，sourceDeclarable）+ 3 条 publicApiTargets 追加（`device.storage-file.read` +stat/readChunk；`cloud.files.save` +writeSession.begin；`cloud.files.write-selected` +writeChunk/commit/abort——骑既有授权句柄）+ `declarablePermissionIds` 扩 battery+8；`$defs.permissionId.enum`（manifest 校验词汇 ref）同步扩 9；notes 决策注记 | **申报≠授权≠能力实现**：registry 仍 `draft-not-enforced`，broker 方法 `productionAvailability: proposed-disabled` 不变，Runtime 接入是独立排期；三件套草案 `reviewDecision` 已记 |
| manifest v2 permissions | `[]` → **5 项**（cloud.files.open/read-selected/save/write-selected + ai.desktalk-assist，= §7.1 清单）；plannedPermissions 从「 ждать 登记/ID 未定」更新为「registered + runtime pending」 | `device.storage-directory.*`/`device.storage-file.read` 在 registry 已申报化（任何应用可申报），但桌影 manifest 不申报（本产品 G8 走 cloud.files.*，desk 媒质文件拾取设计沿用 fileDialog/浏览器降级） |
| 字体白名单（用户拍板：**定名现三元组**） | 条文固化「已定案（2026-10-22 拍板）：`"Segoe UI","Microsoft YaHei",sans-serif`」，代码零改动 | §5 第十一轮实测数据点（可用/不可用清单）维持为定案依据 |
| fileDialog 放行语义（用户拍板：**确认**） | 「检出但未实现 → facade 成员在但返回 null + reason 码（`unimplemented`/`host-declined`），不假成功、不抛异常」为平台实现时的错误模型方向 | 包内已按此语义实现（探测分支+失败回退+如实上报），零改动即随放行生效 |
| 门禁 | `tmp/static-check.cjs` 9/9（新增断言：manifest permissions ⊆ registry 申报词汇 5/9）；`tmp/v2-regression.cjs` **51/51**（webm 三态断言替换为拍板生效断言：无 webm 选项+移除提示在、格式单项、recorder-only 宿主按钮置灰）；`tmp/review-crosscheck.cjs` 重写为**已应用验证器 5 pass / 0 fail**（registry 落点 vs 草案 delta 逐项对账） | 真机 e2e：面板格式只剩 mp4+移除提示、MP4 冒烟 1.28s **60v+113a**（realtime:false）、console 零 error、tab 全清 |

## 6. 剩余开放项

1. ~~导出 1080p 真素材编码复核~~ **数据点已补**（第十二轮：854×480→1920×1080 视频链路 19.8fps=0.66× 实时，瓶颈=逐帧独立 seek 解码链+1080p draw，见 §5 第十二轮表；1080p 导出提速属 V3 复用解码链优化，不做 hack）；
2. **变速保音调重采样**（V3 拍板项，一期按不保音调交付并如实标注）；
3. ~~webm 备选档 / MediaRecorder 原型档~~ **已按 2026-10-22 拍板从面板移除**（用户拍板见评审备忘录 §B-1：实时 1× 速与 webm 时长元数据缺省两项技术债不因"转正"文案而消失，不留半成品档位；`ZY.export.run` API 保留、`format:"webm"` 如实回退 MP4 主档；无 VideoEncoder 宿主导出按钮诚实置灰——历史数据点与移除后行为见 §5 第十五轮表）；
4. ~~字幕预览实时叠层~~ **已落地**（第十一轮：DOM 叠层与烧录同语义，tick/seek 双路径刷新）；
5. ~~Production 写盘~~ **探测分支已接**（第十一轮：导出完成先试 `fileDialog.saveBlob`（检测到≠放行），失败自动回退 `downloadBlob` 并如实上报；**放行语义已确认（2026-10-22 拍板，评审备忘录 §C-1）**：平台实现 dialog/fileDialog 方法时「检出但未实现 → facade 成员在但返回 null+reason 码，不假成功、不抛异常」——包内零改动即随放行生效，方法实现属平台排期）；
6. **ASP 侧 4 MiB 分片转发 CPU 实测**（试点诊断计数器）；
7. ~~字幕样式字体白名单最终三选~~ **已定案（2026-10-22 拍板）**：定名 `"Segoe UI","Microsoft YaHei",sans-serif`（代码零改动）。第十一轮 canvas 量宽法实测为定案依据——可用 Microsoft YaHei/Segoe UI/Verdana/Tahoma/Arial；SimHei/黑体/Noto·思源不可用；
8. ~~mp4box.js vendor~~ **已落地**（第七轮：v0.5.3 BSD-3-Clause + LICENSE + SOURCE 入库）；~~导出管线~~ **已落地**（第十轮，见 README「V2 导出管线」）；~~多片段衔接预览接力~~ **已落地**（第十一轮 `chainTo`，e2e 实测跨边界续播至末尾正确停）；
9. ~~L1 本地素材分析~~ **已落地**（第十三轮，页内两级：工程结构摘要 + assetReport 车道〔抽帧场景/运动/响度/静音〕，schema 对齐 §7.4、≤16KiB 下采样、断网蜜罐实证零外发；e2e 52.2s 素材 65 点+63 窗 6.7s；`_pickFrame` 副产修复 frameAt(0)/导出首帧黑帧）；~~i18n en/jp~~ chrome 层 **已补齐**（第十三轮，21 键三语对齐；面板内部长文案后续轮次再议）。L2 桌讯编排：`ai.desktalk-assist` 权限**已登记（2026-10-22 批次批准）**；方法契约 `ai.desktalk.requestAssist` 与事件 `ai.assist.received`（facade `ai.on`）也**已登记进生产 broker registry 作 proposed-disabled 候选**（2026-10-22 第十七轮，V1-V10 schema 修订批准后逐字登记，battery 行不动）。**Studio Preview 侧试点 L2 纵深全链已落地（2026-10-22 第十八轮，用户拍板「预览纵深全链」）**：ai audit 模式 broker（`preview-ai-broker.js`，deep 校验先于确认卡的 fail-closed 变体、auditAllowance 试点放行、6/min+1 in-flight+timeout=min(120000,session) 记 timeoutBudgetSource）+ Host 确认卡 UI（机器摘要三按钮：发送到桌讯=one-shot/仅本次会话=session-grant/拒绝；拒绝→resolve(null) 即 registry sanitization）+ sandbox 组合引导（ai+battery 共用同一 MessageChannel，battery 块逐字镜像）+ DeskTalk 预览仿真提案源（【预览仿真】诚实标记，无任何真实 provider）+ 验收 smoke `tmp/studio-audit-smoke.cjs` 58/58。**wire 事件 gap**（broker v1 `$defs.event` 枚举无 `ai.assist.received` → 事件走 `webwindows-studio-preview-assist-event-v1` pilot 帧协议；schema 修订评审留待下轮）、**试点错误码本地表**（8 码不进冻结 errors registry，逐码评审后正式化）、**timeout 姿态不被 10s policy 钳制（启用评审 finding）**均记评审备忘录第十八轮条目。仍待独立排期：askAppAssist 真实接线、`previewAvailability` 翻 enabled（试点证据已备，等用户拍板）——**L2 发送按钮保持 disabled 诚实降级**。
