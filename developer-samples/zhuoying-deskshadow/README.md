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
- **预览播放器**（`js/player.js`）：`<video>` + 画幅比例框、播放/暂停、逐帧步进（方向键）、跳回起点、播放头时码与帧码显示；按“播放头所在的最上层片段”逐段播放，时间线播放头与媒质 currentTime 双向联动。
- **片段检查面板**（`js/clips.js`）：名称/时长编辑、变速倍率 0.25~4、音量单值 0~1.5、媒质信息、删除片段。
- **字幕轨**：字幕轨双击空白新增字幕卡（默认 2 秒）、双击已有卡进入编辑（起止时间/文本/字号/描边开关；底部居中 V1 固定）。
- **滤镜与过渡面板**：6 个滤镜预设（none/暖/冷/灰度/高对比/复古，CSS filter 字符串常量，片段级存储）、过渡下拉（none/叠化/黑场/白闪，存于“相邻片段衔接处”＝前段 `transitionOut`）、画幅预设（16:9/9:16/1:1/4:5，工程级）。
- **诊断 + AI 抽屉**（`js/ai.js`）：`window.WebWindows`/device/dialog/fileDialog/ai/localStorage/WebCodecs/MediaRecorder 等的真实检测结果；桌讯 AI 占位卡、本地素材分析 L1（拟定，只统计不发送）、L2 置灰按钮、隐私边界引用。
- **导出面板**（`js/export.js`）：能力支持矩阵 + 画幅/格式选择器；导出按钮置灰。
- **持久化**：全部工程状态入 `localStorage`（键 `ww.deskshadow.project.v1`），语言偏好 `ww.deskshadow.lang`；工程 JSON 结构为 `format/formatVersion/settings/media[]/clips[]/captions[]`，字段含义见 `js/app.js` 头部注释，便于 V2 增量实现。

## i18n

`js/i18n.js` 仿仓库 `assets/js/tw.js` 的键值习惯（以简体中文文案为键、目标语言映射译文、缺失回退中文键值），
`zh` 完整，`en`/`jp` 为骨架占位；不引用 `assets/js/tw.js`。

## 诚实边界（写进 UI 文案并全站一致）

- **未接入 / 设计待评审**：`fileDialog.open`、`fileDialog.saveBlob`、`dialog`、Broker 调用——`window.WebWindows` 检测不到时走普通浏览器降级，检测到了也只是“命名空间存在≠契约放行”。
- **桌讯 AI**：面板明确标注“契约评审中”，L2 发送按钮置灰，“依赖桌讯 AI 协助契约评审通过后可用”；L1 仅本地统计且展示。
- **导出**：标注“导出管线属 V3”。
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
- 下一里程碑：导出管线（主格式 MP4 avc1.640028+AAC，av1/vp9 备选表）。
