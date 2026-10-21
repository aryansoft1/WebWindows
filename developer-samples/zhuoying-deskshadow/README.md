# 桌影 DeskShadow（com.aryansoft.deskshadow）V1 骨架

WebWindows 第三方应用生态的功能包样例：**三轨视频剪辑软件**（视频轨/音频轨/字幕轨）。本目录是与
`developer-samples/hello-webwindows/`、`developer-samples/battery-pilot-v2/` 平级的 Developer Studio 样例，
遵守 `browser-zip-sandbox-v1` 运行环境硬约束：无外部网络、非同源、无 ES Module、无外链资源，全部资源相对包内路径。

## 在 Developer Studio 里打开 / 预览

1. 打开 Developer Studio → 功能样例入口，选择 `developer-samples/zhuoying-deskshadow/`（或把本目录打成 ZIP 上传到私人云资料后从开发者中心提交）。
2. 保持 `manifest.json`、`index.html`、`icon.svg`、`styles/`、`js/` 位于 ZIP 根目录（与 `hello-webwindows` 的打包惯例一致）。
3. 本地人工核对：仓库根目录执行 `node tools/static-server.mjs 4599`，浏览器访问
   `http://localhost:4599/developer-samples/zhuoying-deskshadow/index.html`（端口可用环境变量 `PORT` 覆盖；服务器不执行 .asp，属预期）。
4. 在浏览器直开时 `window.WebWindows` 不存在，应用按降级路径运行并在“诊断”抽屉如实显示检测结果。

## 当前实现范围（V1 骨架）

- **顶栏**：新建工程 / 打开工程（`.json` file input 降级；`WebWindows.fileDialog.open` 为探测占位）/ 保存工程（`a[download]` 下载降级；`fileDialog.saveBlob` 为探测占位）/ 导入素材（`<input type=file multiple accept="video/*,audio/*">`）/ 诊断 / 桌讯 AI 助手。
- **三轨时间线**（`js/timeline.js`，纯 DOM 渲染）：轨道头 sticky 固定、秒/帧刻度标尺（帧刻度 30fps）、Ctrl+滚轮与 ± 按钮缩放；单击选中、同轨拖拽移动、`Delete` 删除、`拆分播放头` 按播放头切两段；轨道头「＋」可添加空片段便于排版。
- **预览播放器**（`js/player.js`）：`<video>` + 画幅比例框、播放/暂停、逐帧步进（方向键）、跳回起点、播放头时码与帧码显示；按“播放头所在的最上层片段”逐段播放，时间线播放头与媒质 currentTime 双向联动。第十一轮增补两条闭合项：**字幕预览实时叠层**（预览画框内按播放头实时显示当前字幕卡，DOM 近似：底部居中、白字暗描边，与导出烧录同语义，字号按画框高/输出高缩放）与**多片段衔接接力**（相邻同轨片段边界自动续播：衔接点相邻 ≤0.05s 才接力，有空档跳转维持"片段末自动停"；实现为 stopPlayer+play 逐段重启，段间可能一帧停顿，如实实现）。
- **片段检查面板**（`js/clips.js`）：名称/时长编辑、变速倍率 0.25~4、音量单值 0~1.5、媒质信息、删除片段。
- **字幕轨**：字幕轨双击空白新增字幕卡（默认 2 秒）、双击已有卡进入编辑（起止时间/文本/字号/描边开关；底部居中 V1 固定）。
- **滤镜与过渡面板**：6 个滤镜预设（none/暖/冷/灰度/高对比/复古，CSS filter 字符串常量，片段级存储）、过渡下拉（none/叠化/黑场/白闪，存于“相邻片段衔接处”＝前段 `transitionOut`）、画幅预设（16:9/9:16/1:1/4:5，工程级）。
- **诊断 + AI 抽屉**（`js/ai.js`）：`window.WebWindows`/device/dialog/fileDialog/ai/localStorage/WebCodecs/MediaRecorder 等的真实检测结果；桌讯 AI 占位卡、本地素材分析 L1（拟定，只统计不发送）、L2 置灰按钮、隐私边界引用。
- **导出面板**（`js/export.js`）：能力支持矩阵 + 画幅/格式选择；MP4 导出已实现（逐帧合成→H.264/AAC 编码→mp4box.js 封装→下载），WebM 原型档（MediaRecorder 实时录制）作为无 VideoEncoder 宿主的诚实降级路径同步落地，细节见下「V2 导出管线」。
- **持久化**：全部工程状态入 `localStorage`（键 `ww.deskshadow.project.v1`），语言偏好 `ww.deskshadow.lang`；工程 JSON 结构为 `format/formatVersion/settings/media[]/clips[]/captions[]`，字段含义见 `js/app.js` 头部注释，便于 V2 增量实现。

## i18n

`js/i18n.js` 仿仓库 `assets/js/tw.js` 的键值习惯（以简体中文文案为键、目标语言映射译文、缺失回退中文键值），
`zh` 完整，`en`/`jp` 为骨架占位；不引用 `assets/js/tw.js`。

## 诚实边界（写进 UI 文案并全站一致）

- **未接入 / 设计待评审**：`fileDialog.open`、`fileDialog.saveBlob`、`dialog`、Broker 调用——`window.WebWindows` 检测不到时走普通浏览器降级，检测到了也只是“命名空间存在≠契约放行”。
- **桌讯 AI**：面板明确标注“契约评审中”，L2 发送按钮置灰，“依赖桌讯 AI 协助契约评审通过后可用”；L1 仅本地统计且展示。
- **导出**：MP4（avc1.640028+AAC）主档已实现；**WebM 原型档（MediaRecorder 实时录制）已作为无 VideoEncoder 宿主的诚实降级路径落地**——面板如实标注"原型/1× 速/待评审"，mediaRecorder+captureStream 缺失时选项置灰（不做空按钮）；边界如实标注：变速音频按一期拍板**不保音调**（两档同）；MP4 无 AudioEncoder 时自动导出无音轨版本并提示；写盘分流已接入：检测到 Production `fileDialog.saveBlob` 先走宿主写盘（**检测到≠放行**：失败自动回退 `downloadBlob` 并如实上报），浏览器降级模式直接下载；导出用开始时刻的工程快照，导出期间请勿改动时间线。
- **媒体二进制**：仅会话内 objectURL 暂存，不写入工程文件与 localStorage；重新打开旧工程时引用媒质无本地文件，需重新导入——UI 如实提示。

## 后续契约依赖（把 manifest.permissions 填上时对照）

| 依赖点 | 状态 | 针对 manifest 的动作 |
| --- | --- | --- |
| `ai.desktalk-assist`（`ai.requestAssist`/`ai.assist.received`/`ai.isSupported`） | `docs/WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md` Phase 0B 提案中的权限 ID 值 | 待 `data/sdk/permissions-v1.json` 登记该 ID 后加入 `permissions: []` |
| 存储/工程文件读写（`storage` 契约族） | `docs/STORAGE_CAPABILITY_V1_DESIGN.md` 设计稿，权限 ID 未定 | ID 定名并登记后在 permissions 数组补入 |
| `fileHandlers`（`.zhuoying.json` 工程文件关联） | `data/sdk/manifest-v2.schema.json` 已有 `fileHandlers` 字段 | 待 fileDialog/存储联调方案明确后随 V2 增补顶层 `fileHandlers` 数组 |

`manifest.json` 中以上依赖均写在 `"com.aryansoft.deskshadow"` 命名空间对象内；**顶层的 `permissions` 保持空数组**——
`data/sdk/permissions-v1.json` 目前 `declarablePermissionIds` 只允许 `device.battery-status.read`，填入未登记 ID 会在 schema 校验时挂掉。
顶层的 `catalog/package/runtime/launch` 为服务端/Shell 保留，源manifest 不写。

## V2 预览管线（2026-10-21 落地，2026-10-22 第八轮全实现）

- `js/vendor/mp4box.all.min.js`（+ `LICENSE-mp4box.txt`、`js/SOURCE-mp4box.txt`）：MP4 解复用 vendor 库，来源 gpac/mp4box.js v0.5.3（BSD-3-Clause）。沙箱 `network:none` 禁外链，第三方库必须包内自解析；体积 155 KiB，在 30 MiB 包预算内。
- `js/media-pipeline.js`：WebCodecs→canvas 预览管线。能力检测顺序 `isSecureContext → WebCodecs → MP4Box`（缺一即降级 V1 `<video>` 路径，诊断面板如实显示"预览管线"能力行）。
- `readProvider` 抽象：浏览器降级模式 = `File.slice()`；Production 将切 G1 `device.storage.readChunk`（契约见 `docs/WEBWINDOWS_STORAGE_MEDIA_V1_DRAFT.md`）。描述符提取支持 avcC（跳 box 头取 body）与 mp4a.40.2 的 AudioSpecificConfig（ES>DC>ASC 嵌套 tag 解析——两条路径均在真文件上现场验证过）。
- **样本读取走索引表驱动**：`getTrackSamplesInfo`（offset/size/cts/dts/is_sync/description）+ 自行 `provider.readRange` 物化，配合 `_blockFor` 双槽 1 MiB 块级缓存（一次 IO 物化几十样本，物化后命中 ~0.2ms）。
- 帧纪律（实测刚性）：`VideoFrame` 用完即 `close()`，在飞 ≤8——存活 ≈9 张时 Chrome 停发解码器 output 事件（微分实验实锤），勿调大；解码链从最近 keyframe 起步；播放预取 LEAD=260ms 必须落在 8 帧持有窗内。
- **seek/播放闭环全通**：`seekDecode`（kf 起步解码链→flush→pick→绘）、`startPlay/tickPlay/pausePlay`（墙钟驱动 24fps 实时、片段末自动停）、音频滑窗（AudioDecoder→`f32-planar` copyTo 逐平面拷→BufferSource 按 pts 调度，在飞 ≤24 + `_waitADrain`）。
- `js/player.js` 播放控制接管，fail-closed 分流：WebCodecs 可用 + 视频媒质 + 速度=1 走管线 canvas 路径；变速、音频媒质、无 WebCodecs 一律回 V1 `<video>`；播放循环用 `setInterval(16ms)` 驱动（rAF 在后台/无焦点 tab 被宿主节流到 ~1/s）；滤镜预览 video+canvas 双目标。
- 实测基准与阶梯：见 `docs/ZHUOYING_DESKSHADOW_V2_SPEC.md` §5（合成基准 + 2026-10-22 真实素材 854×480 数据点：seek 解码 ≈1ms/帧、包内页端到端零 window error）。
- 下一里程碑：已完成（见下节）。

## V2 导出管线（2026-10-22 落地）

主力格式锁定 **MP4（avc1.640028 + AAC mp4a.40.2）**，全链路 WebCodecs 离线渲染 + `mp4box.js` 重封装：

- **快照冻结**：导出开始时复制 clips/captions 到 `snapshotPlan`（导出期间编辑不污染产物）；输出分辨率按画幅（16:9→1280×720 等），帧率取 `settings.fps`（默认 30）。
- **导出专用解码管线**：`ZY.pipeline.create({canvas:null})` 每媒质独立实例，与预览 `session.mediaPipelines` 隔离；结束 `destroy()` 归还。新增两条导出原语（`js/media-pipeline.js`）：`frameAt(timeMs)`（解码到指定时刻、返回最近一帧的 `VideoFrame`，其余帧全释放归还帧预算）与 `decodeAudioRange(startMs, endMs, bufferCtx)`（离线解码音频段→`[{ptsMs,buffer}]`，null=无音轨，尾部 flush 兜底）。
- **逐帧合成**（`compositeFrame`）：黑底→片段帧（变速 `srcMs=(t-clip.start)*speed*1000`）→滤镜（Canvas 2D `ctx.filter` 接 CSS filter 预设串）→过渡（crossfade/fadeBlack/flashWhite，窗口=min(1s, 片段时长/2)；crossfade 取 B.start 首帧防重播）→字幕烧录（底部居中、outline=strokeText、fontSize 按 H/720 缩放）。
- **编码**：`VideoEncoder(avc1.640028)` backpressure（`encodeQueueSize>8` 等待）+ 每 8 帧让出主线程更新进度；音频走 `OfflineAudioContext` 混音（playbackRate=speed **不保音调**、GainNode=volume）→ `AudioEncoder(mp4a.40.2, 128k, 48k×2ch, AAC 每 1024 帧一 AudioData f32-planar)`。
- **封装**：视频轨 `addTrack({type:"avc1", timescale:fps, avcDecoderConfigRecord:编码器 meta.description})`（`MP4BoxStream` 只吃 ArrayBuffer，已折型）；音频轨 esds 用 `craftEsdsBox(ascBytes)` 手工拼 ES(3)>DC(4)>ASC(5)>SL(6) 字节流经 `MP4Box.createFile+appendBuffer` 解析出 Box 实例喂 `addTrack({description})`——用编码器输出的全新 ASC（保证与 48k 编码一致，不用源 esds 防采样率错配）；末态 `dbuf.write(DataStream BIG_ENDIAN)`→`slice(0,position)`→`Blob(video/mp4)`→`downloadBlob` 落盘。
- **回灌自检（真实浏览器 e2e 已过）**：2s trailer 片段导出 190KB/60 帧/含音轨，blob ftyp 魔数 ✓；导出 blob 回灌新建 pipeline → vTrack 60 样本 + aTrack 113 样本 + `frameAt(500)` 非空；双片段 crossfade + warm 滤镜 + 0.5× 慢放第二轮全过；全程 console 零 error。jsdom 回归扩至 35 用例（导出面板诚实置灰、webm 原型项三态、画幅选项、预览叠层/接力/写盘分流）。
- **WebM 原型档（MediaRecorder 实时录制，第十二轮）**：为缺 `VideoEncoder` 的宿主提供诚实降级——沿用同一 `compositeFrame` 合成器（滤镜/过渡/字幕/变速取帧完全一致），视频走 `canvas.captureStream(fps)`、音频用活 `AudioContext` + `MediaStreamAudioDestinationNode` 实时排源（playbackRate 变速同拍板不保音调），`MediaRecorder(vp9/opus 择型)` 封装 webm。**档位性质=原型**：实时 1× 速录制（导出耗时=时间线时长）、帧率贴墙钟、webm 容器时长元数据缺省；面板格式 select 双项如实标注「原型/待评审」，mediaRecorder/captureStream 缺失时选项置灰（不做空按钮）。e2e：2s 双片段（crossfade+warm+字幕+音量差+音轨）实时录制墙钟 2.57s→62.7KB vp9+opus 含音轨，console 零 error。
- **实测耗时（真素材，诚实数据）**：720p 真素材完整导出（854×480 源→1280×720、含解码+合成+音频混音+AAC+封装）2s/60 帧全程 ≈5.1s——瓶颈在逐帧独立 seek 解码链（每帧新 decoder）而非编码器（合成基准 144.5fps、1080p 编码基准均 >100fps）；1080p 真素材视频链路（解码+合成+编码，无音轨）60 帧 3.02s=**19.8fps（0.66× 实时）**。结论：主档 720p 导出耗时≈素材时长 2~3 倍量级、可用；1080p 提速属 V3「复用解码链/快照窗口」优化项。720p 主档为当前性能优档，1080p 输出建议谨慎使用（如实提示）。
- **开放项（收口后遗留，全部有明确归属）**：变速保音调重采样（V3，用户拍板一期不保）、WebM 原型档转正评审（时长元数据缺省/帧率偏移收敛后）、1080p 导出提速（V3 复用解码链）。
