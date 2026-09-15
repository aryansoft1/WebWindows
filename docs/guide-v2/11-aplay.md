---
id: aplay
title: APlay 音视频播放
summary: 播放音乐、视频、电视或广播，并从支持版本的云资料打开媒体。
category: 办公与创作
category_order: 40
order: 40
status: testing
product_version: 2026.09
last_verified: 2026-09-15
keywords: APlay,傲映,音乐,视频,广播,云媒体,播放
covers: com.aryansoft.webwindows.aplay
open_url: aplay.html
media: assets/guide/media-flow.svg
media_alt: 云资料媒体或在线来源进入 APlay 播放器的流程示意图
media_caption: 媒体能否播放取决于格式、来源跨域策略、网络和浏览器解码能力。
tested_by: aplay.html,tests/aplay-cloud-media-smoke.mjs
---
# APlay 音视频播放

## 功能用途

APlay 提供音乐、视频、电视、广播和收藏视图，支持浏览器可解码的媒体。2026.08.12 之后的部署可从云资料把媒体交给 APlay；较旧版本的“打开 URL”仍只是后期提示。

## 适用场景

播放公开流媒体、查看浏览器支持的视频，或从云资料打开音视频文件时使用。

## 操作步骤

1. 打开 APlay，选择音乐、视频、电视或广播分类。
2. 选择媒体项目并单击播放；需要时使用暂停、静音、进度或全屏。
3. 在支持云媒体的部署中，从云资料打开音视频并选择 APlay。
4. 播放失败时下载文件，用设备播放器验证文件和编码是否正常。

## 操作结果

播放器显示当前项目并开始播放；视频模式可进入全屏，退出后返回 APlay 导航。

## 常见问题与权限提示

- 自动播放可能被浏览器阻止，需再次手动单击播放。
- 在线源可能禁止跨域或嵌入；这不是 WebWindows 能绕过的限制。
- 当前检出分支仍保留旧“打开 URL”提示；云媒体入口以实际部署是否出现为准。
