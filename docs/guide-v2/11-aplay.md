---
id: aplay
title: APlay 音视频播放
summary: 在音乐、视频、电视和广播分类中选择项目并控制播放。
category: 办公与创作
category_order: 40
order: 40
status: testing
product_version: 2026.09
last_verified: 2026-09-27
keywords: APlay,傲映,音乐,视频,电视,广播,播放,全屏
covers: com.aryansoft.webwindows.aplay
open_url: aplay.html
media: assets/guide/media-flow.svg
media_alt: 云资料媒体或在线来源进入 APlay 播放器的流程示意图
media_caption: 媒体能否播放取决于格式、来源跨域策略、网络和浏览器解码能力。
tested_by: aplay.html,data/apps/system-apps.json
---
# APlay 音视频播放

## 功能用途

APlay 提供音乐、视频、电视、广播和收藏视图，播放页面内已配置且浏览器能够解码的媒体。当前“打开 URL”按钮仍是后续功能提示，不作为可用的云资料入口。

## 适用场景

收听已配置的音乐或广播、观看电视和视频，并使用播放、进度、音量与全屏控制时使用。

## 操作步骤

1. 从开始菜单打开 APlay，在左侧选择“音乐”“视频”“电视”或“广播”分类。
2. 在内容列表中选择一个项目，再单击播放按钮；浏览器阻止自动播放时再次手动单击。
3. 播放音乐或广播时使用暂停、进度和音量控制；播放视频或电视时按需选择全屏。
4. 切换项目后查看标题和播放状态，确认当前播放内容与所选项目一致。
5. 播放失败时检查网络与浏览器格式支持；如果媒体可下载，可用设备播放器验证文件和编码。

## 操作结果

播放器显示当前项目并开始播放；视频模式可进入全屏，退出后返回 APlay 导航。

## 常见问题与权限提示

- 自动播放可能被浏览器阻止，需再次手动单击播放。
- 在线源可能禁止跨域或嵌入；这不是 WebWindows 能绕过的限制。
- “打开 URL”当前只显示后续功能提示，不能用来打开云资料或任意网络地址。
