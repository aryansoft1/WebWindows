# 任务同步台账 · OpenCode → Codex

> **本文件是 OpenCode 与 Codex 之间的任务交接台账。**
> Codex 额度恢复后，**先读本文件最新状态再继续处理**，不要重做已完成的步骤。
> 单次任务的详细交接记录仍按惯例另写 `docs/HANDOFF_<日期>_<主题>.md`，本文件只做总账。

---

## 0. 强制规则（双方共同遵守）

1. **断网续作**：任何任务遇到网络中断、请求超时、连接失败，**必须重连重试并从断点继续，不得退出任务**。
2. **全量同步**：OpenCode 执行的**所有任务**（开始、里程碑、阻塞、完成、移交）都必须同步写入本文件，让 Codex 随时可知。
3. **先读后写**：Codex 接手前先读本文件；继续完成后**必须回写状态**，保持台账闭环。
4. **不重做**：状态为 ✅ 的条目不要重做；状态为 📤 的条目由 Codex 继续；状态为 ⏸️ 的条目先看「下一步 / 阻塞原因」。

### 状态图例

| 标记 | 含义 |
|---|---|
| ⏳ | 待处理 |
| 🔄 | 进行中（OpenCode 执行中） |
| ⏸️ | 阻塞（写明原因，通常是 Codex 额度 / 等人工 / 等环境） |
| 📤 | 已移交 Codex，等额度恢复后继续 |
| ✅ | 已完成（保留记录，勿重做） |

---

## 1. 进行中 / 待处理任务

| ID | 任务 | 状态 | 已完成 | 下一步 / 阻塞原因 | 更新时间 | 执行方 |
|---|---|---|---|---|---|---|
| T-000 | 建立本同步台账并写入 AGENTS.md 规则 | ✅ | 台账 + 规则 9 已提交 | — | 2026-09-24 | OpenCode |
| T-009 | 问乡（问道 transit）Q2 同城查询修复并上线 `2026.09.24.2` | ✅ | 根因确诊（12306 为同城级查询，客户端按查询站名切片经停表→失败）；`api/railway-proxy.asp` 输出行内 fromCode/toCode/站名（新增 ParseNameMap）+ `transit-providers.js` 候选车次有界回落（≤5，全败保留真实错误码）；新增同城/404 回落/全败 3 场景防回归；commit `159ca1e` 推送、preflight 通过、8 文件上传回读全过（备份 marker `20260924-wendao-rail-schedule-fix`）、入口冒烟 176 deps、**线上 E2E Q1+Q2 全过（E2E_ALL_PASS）**；工作区恢复完成（子模块 10/10 == 基线；父 37 行 = 基线46 − 9 个已被 `33ef9e5` 吸收进仓库的文件，内容哈希 `efec9db` 工作区/stash/HEAD 三方一致，即早前"staged 文件谜团"实为 T-000 提交扫入索引）；终验 **86/86** | — | 2026-09-24 | OpenCode |
| T-010 | `2026.09.24.2` 同步上传独立复核（用户「同步后上传」请求收口） | ✅ | 确认并行任务已收口：commit `159ca1e` 推送、manifest/catalog `2026.09.24.2`、线上 `release-version.asp` 报 `2026.09.24.2`（prev `2026.09.24.1`）；独立复核全过：上版 7 文件备份哈希 == 上版 manifest（规则 5）、FTP 源码回读 3/3（`railway-proxy`/`release-version`/`mobile-version` `.asp`）== 本地 manifest、HTTP 静态回读一致、线上 manifest == 本地（`1cd544a13d30`）、preflight `already_deployed`、门禁三连过（清单 256、入口依赖 176、mobile 契约）、全量 **86/86**；`stash@{0}` 与 r3 临时 exclude 已由并行任务恢复/移除、启动项集成回工作区、启动项/visitor 冒烟转绿 | 启动项集成（settings/index/main/app-registry/settings.js/css，混有 login/dist/package 等无关 WIP）未提交未上线；线上 `settings.html`/`index.html` 与 HEAD 内容分叉见 T-006，是否提交+上线待用户决策 | 2026-09-24 | OpenCode |
| T-011 | 真实浏览器验证问乡并修复两个 Node E2E 无法发现的缺陷，上线 `2026.09.24.3` | ✅ | 用户现场截图指出「并没有好好测试」——上轮只验了库入口，未覆盖真实页面。真实浏览器复现后定位并修复：①`normalizeStopTimes` 跨日进位方向错误（把「同站到 00:53/发 00:57」误判跨零点，逐站 +86400，页面显示 `24:53/49:35/100:03`），改为仅在「与前站倒退」或「发车早于到达」时进位，真正跨零点车仍正确显示 `31:05`；②`road.html` 缓存戳未随 r4 的 JS 变更递增（仍 `?v=20260924-1`），致浏览器复用旧 JS、r4 修复对已访问用户不生效（截图症状：卡在 GTFS、`action=stations` 红色、无 leftTicket），本次递增 `?v=20260924-2`；新增 G4190 真实经停 + 同站跨零点回归测试；commit `f6e75ba` 推送、preflight 过、9 文件上传回读全过（`road.html` 在 manifest 前一位，规则 7）、入口冒烟 179、**真实浏览器 UI 端到端复现并验证**（成都东→西安北 G4190，5 站时刻 `00:53/01:35/02:27/03:15/04:30`，stations→GTFS→leftTicket→schedule 全 200、控制台零错误）、全量 86/86；工作区已还原（父 37/37、嵌套 10/10 == 基线，groq 哈希一致） | — | 2026-09-24 | OpenCode |
| T-012 | 修复「连点查询卡死在照会中」，上线 `2026.09.24.4` | ✅ | 用户第二次现场截图（Network 显示 `transit-proxy.asp?action=stops` 状态 **(canceled)**、无任何 `leftTicket` 请求、界面停在「GTFSの公共交通データを照会中…」）+ Console 证据确证：`searchJourneyWithFallback` 对**任意** `AbortError` 直接 rethrow、跳过 12306 回落。但 AbortError 有两义：①用户主动取消（外部 signal 已 aborted）应整体放弃；②GTFS 阶段内部中止（`fetchWithTimeout` 内部控制器 / 阶段预算 / 上游中断 / **连点时旧轮请求被取消**）必须回落。旧实现混淆二者 → onFallback 不触发、leftTicket 从不发出、界面永久停留。修复：GTFS 仅在 `signal?.aborted`（真·用户取消）时 rethrow，其余 AbortError 一律 onFallback + 继续 12306；12306 阶段非用户取消的 AbortError 转显式 `rail_failed`；缓存戳 `?v=20260924-3`；**修正了固化错误语义的旧测试断言**（原「GTFS 抛 AbortError 应中止」改为「应回落」）并新增用户取消/中止后新查询不受污染两场景；commit `066e8f7` 推送、preflight 过、9 文件上传回读全过、全量 86/86；**真实浏览器验证连点 3 次（4 个 transit-proxy 被取消）仍成功回落出 G4190，随后第 4/5/6 次查询（换日期 D1998、换城市 北京南→上海虹桥 G531 13 站）全部成功**；工作区已还原（父 37/37、嵌套 10/10） | — | 2026-09-24 | OpenCode |
| T-013 | 修复「查询被自身表单导航杀掉」，上线 `2026.09.24.5`（真正根因） | ✅ | 用户第三次现场截图给出决定性反证：**单次点击**、21.5 秒后仍卡在「照会中」，与点击次数无关——否定了 T-012 的判断（若仅是 AbortError 跳过回落，修复后应 8 秒内回落）。真实浏览器探针确证根因：`<form id="transit-search-form" method="get">` 的 submit 监听器直接绑 `searchJourney`、**未调用 `preventDefault()`**（探针实测 `defaultPrevented=false`, `form.method=get`）。后果链：点「交通を検索」→ JS 发起查询 → 浏览器同时执行原生 GET 提交 → 页面导航/刷新 → `beforeunload` 触发 → `state.controller.abort()` **把刚发起的查询自己杀掉** → 界面永远停在「照会中」。这也解释了「秒出现」：查询在导航瞬间即被中断，根本等不到阶段预算。修复：①submit 监听器改为 `event => { event.preventDefault(); searchJourney(); }` ②catch 中 AbortError 分支：若 `state.controller` 已被更新查询接手则静默返回，否则状态改回 `transitPrompt`、绝不永久停留「照会中」③`transit-app.js` 缓存戳递增 `?v=20260924-2`；新增回归断言锁定 submit 必须 preventDefault；commit `7f5b7a9` 推送、preflight 过、10 文件上传回读全过、全量 86/86；**真实浏览器用真实鼠标点击 submit 按钮验证：URL 完全未变（`?formfix=` 原样保留、无原生导航）、G4190 成都东 00:57→西安北 04:30 共 5 站、12306 三连 200**；工作区已还原（父 37/37、嵌套 10/10） | — | 2026-09-24 | OpenCode |
| T-014 | 修复「点其它车次无反应」+「地图不跟随」，上线 `2026.09.24.6 ~ .10` | ✅ | 用户报告两个问题，真实浏览器逐一复现并修到底：**(1) 候选车次点击无效**——`selectTrain` 传了 `trainNo`，`searchJourney` 根本没读 `overrides.trainNo`；补上后发现 `searchJourneyWithFallback` 的参数解构里也没有 `trainNo`、调用 `chinaRail.searchJourney` 时未透传，值在两处被丢弃（.6/.7 两次修复才补全链路）。**(2) 地图不跟随**——三层次根因：①Photon 地理编码全线 400（实测 `lang=zh`/`lang=ja`/`defaultlang=zh` 均 400，只有 `en`/`de`/`fr`/`default` 受支持，旧代码固定发 `lang=zh`）→ 经停站无坐标 → shape 空；②`updateMap` 的 `mapReady` 门禁在结果先于地图就绪时直接 return，fit 请求被丢弃（.8 加 `pendingFit` 挂起并在 load 后补执行）；③**MapLibre 的 `load` 与 `idle`/`isStyleLoaded` 在 OpenFreeMap 下长期为 false**（实测 `loaded()=false`、`isStyleLoaded()=false`、`getSource('transit-shape')=undefined`，但容器 1546×1246 正常、瓦片已渲染）→ `mapReady` 永不为真（.9/.10 改为「样式对象可用 + 容器有尺寸」判据）。真实浏览器终验：首次查询 G4190 5 站、地图中心由 139.7/35.68(z5) 平滑移至 **106.61/32.59(z7)**；点第 2 个候选 G4868 → 请求 `78000G486801`、路线时刻全更新（02:13→05:45、4 站）、地图跟随。commit `d95ceed`/`b1446f0`/`f1859af`/`58670e6`/`bb8c6f1` 均已推送，每轮 preflight + 上传回读全过；工作区已还原（父 37/37、嵌套 10/10） | — | 2026-09-24 | OpenCode |

> 新任务从 `T-001` 起递增；每行更新时**同时刷新「更新时间」**。

---

## 2. 上一轮遗留（承自 `docs/HANDOFF_20260923_问道同步与开发者面恢复.md` 第 5 节）

| ID | 优先级 | 事项 | 状态 | 下一步 / 阻塞原因 | 更新时间 | 执行方 |
|---|---|---|---|---|---|---|
| T-001 | — | 无痕窗口 UI 目测（缓存键 `webwindows.functions.catalog-cache.v1`） | ⏸️ | 需人工开无痕窗口确认开始菜单/全部功能出现 Developer Studio | 2026-09-24 | 人工 |
| T-002 | — | 删除远端 4 个 `.__previous_20260923-developer-recovery` 备份 | ⏳ | 验证通过后删除，回滚取回用 | 2026-09-24 | 待定 |
| T-003 | P3 | 后台安全加固 `ce1f243`/`6381297` 整体上线 | 📤 | 必须一次性整体发布，不能拆开塞线上 | 2026-09-24 | Codex |
| T-004 | P3 | 修掉主线 3 个页面引用 195B tailwind stub | 📤 | 未修 | 2026-09-24 | Codex |
| T-005 | P3 | 决定 `codex/wendao-release-20260920` 推还是删/改名 | 📤 | 已标 DO NOT DEPLOY，待决策 | 2026-09-24 | Codex |
| T-006 | P4 | 对齐根 `index.html` 与线上分叉线 → 扩展为全量内容分叉对齐 | ✅ | 权威规则已定（用户，已按此执行）：**日期最新为准**。全量比对 237 静态文件（线上 vs HEAD，按内容 blob 首次出现提交判日期）：64 个分叉 → **27 个线上更新、需把真实最新合并进本分支**（daf91e3 测速组 `settings.html/settings.css/network-speed.js`、6b39119 新闻组 5 文件、170c3f2 `index.html`、8db8b6c/2cefe2f 设备天气窗口组 7 文件、404b587 云对话组 4 文件、`webwindows-message.js`、`login.js/desktop-menus/sysinfo.css`、13e2206 `SystemManager/index.html`、`main.css`），**37 个本分支已最新**（保留），171 一致，2 个仅本分支（docs 无需上线）；**3 处日期例外需人工合并**：①`main.js` 日期上本分支 08-21 赢 08-20，但实测缺线上 `9cd9627` 的 i18n 启动修复（`data-boot-status`/`WebWindowsI18n` HEAD 无、线上有），并行谱系要合不要留；②`SystemManager/index.html` 线上字节只存在于恢复包快照（`deploy/developer-recovery-20260923/payload/`），内容=访客统计导航（要留）+缺 T-003 安全加固 `admin-security/admin-shell`（本分支有、要留）+tailwind 引用源待定（牵 T-004 stub），必须手工三方合并；③`index.html` 依赖 `auth-session.js`/`file-query-parser.js`/`ai-file-tools.js` 本分支没有，但分别在 `0e0bfa5`/`d4d291b`/`529385c`（其它分支）可 git 合并。全部 27 个来源提交均在本地分支（`--all` 可达），按 git 合并取字节、不从线上抠。**已完成（2026-09-24，日期权威=最新日期为准）**：27 个线上更新文件全部合并入 HEAD——15 直取线上 blob（news/sysinfo 组、dist×7、无共同基线的 device-controls/webwindows-message/device-locations/search-ui）、9 个走共同基线 `git merge-file`（login/cloud-file-dialog/device-api/network-speed/toolbar/news_view.html/news.html/main.css/main.js）、index.html/settings.html=线上 blob+启动 WIP 手工重放、settings.css=线上+启动块追加；3 例外落地：①main.js=线上 9cd9627+3 个启动 WIP hunk（2 处 removal→announce 锚点冲突按序解决）②SystemManager/index.html 保本分支（T-003 安全栈优先于恢复包）③新增 `assets/js/auth-session.js`/`file-query-parser.js`/`ai-file-tools.js`/`api/session.asp`（取 0e0bfa5/e9d6055/7ca9754 blob，`git add -f` 穿透临时 exclude）；4 处内容冲突裁决：device-api=android(`acConnected`)/native(`connected`) 双分支并集、news×2 取线上（viewport-fit 弃、配对 news.css 已随线上）、main.css 4 处取线上（is-disconnected 死样式删除、preview/context-menu 超集保留）；启动项 WIP 全量重放（stamp 一律 `20260923-startup-1`，visitor-analytics 单实例去重）；测试随日期权威更新（device-experience：4 个脚本戳记+is-disconnected→acConnected+测速 7 行契约、device-cloud：沙箱 `addEventListener` stub+`storageApi.listVolumes`/directoryPicker 门、manifest 重生成 required=**259**/upload=**14**/integrity=258 版本范围保持 `.11`）；全量 **86/86**。事故记录：r5 stash 被并行任务以同名重建并二次卷走合并集+用户 WIP（已二次 `stash pop` 恢复并复验）、5 个新增文件被 `.git/info/exclude` 临时排除（preflight 脚手架，提交用 `git add -f`）；无关产物（package×2/.gitignore/docs-STORAGE/webwindows.zip 删除）按用户指示不理会不提交 | 2026-09-24 | OpenCode |
| T-007 | P2 | 发布路径二选一定案（`--production` vs 本地增量），修 preflight L62/L69/L72 契约冲突 | 📤 | 见交接记录 7.3/7.5，提交解决不了设计冲突 | 2026-09-24 | Codex |
| T-008 | P2 | 轮换对话中明文出现过的 FTP 账密 | ⏸️ | 见交接记录第 6 节 | 2026-09-24 | 人工 |

---

## 3. 每次更新的最小格式

```markdown
| T-0xx | 任务名 | 🔄 | 已完成 A、B | 下一步 C（阻塞：Codex 额度） | YYYY-MM-DD | OpenCode |
```

里程碑、网络中断重连后、任务完成、移交 Codex —— **四种时机必须回写本表**。
