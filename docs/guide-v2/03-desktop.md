---
id: desktop-windows
title: 桌面、开始菜单与窗口
summary: 打开、移动、缩放、最小化和切换窗口，并适应手机布局。
category: 桌面与窗口
category_order: 20
order: 10
status: verified
product_version: 2026.09
last_verified: 2026-09-15
keywords: 桌面,窗口,任务栏,拖动,缩放,最大化,手机,触控
open_url: index.html
media: assets/guide/desktop-overview.png
media_alt: WebWindows 桌面左侧功能图标、右上天气和底部任务栏
media_caption: 实际桌面布局；任务栏左侧用于启动与 DeskTalk，右侧显示设备状态和时间。
tested_by: webwindows-vue/src/desktop/WindowManager.vue,tests/desktop-layout-stability-smoke.mjs,tests/mobile-frontend-smoke.mjs
---
# 桌面、开始菜单与窗口

## 功能用途

桌面用于快速启动常用功能，开始菜单展示系统功能、我的功能和全部功能；窗口支持拖动、缩放、最小化、最大化、关闭及任务栏切换。

## 适用场景

同时处理云资料与办公文档、窗口被遮挡、需要整理桌面，或在手机上切换功能时使用。

## 操作步骤

1. 单击图标打开功能；若桌面没有该图标，从开始菜单或功能中心查找。
2. 拖动标题栏移动窗口，拖动边缘调整大小；单击标题栏按钮最小化、最大化或关闭。
3. 单击任务栏中的功能图标恢复或切换窗口；已打开的单实例功能会被前置，而不会重复创建。
4. 在窄屏设备上使用紧凑窗口布局，优先通过任务栏切换，不要依赖精细的鼠标拖动。

## 操作结果

每个打开的功能都能在任务栏找到；关闭后对应任务栏项消失，最小化后内容保留。

## 常见问题与权限提示

- 窗口超出屏幕：尝试最大化，或把浏览器缩放恢复到 100% 后刷新。
- 拖动不顺畅：触屏请从标题栏空白处开始，避免按到按钮或嵌入页面。
- “锁定、休眠、关闭、重新启动”只作用于 WebWindows 会话，不会控制设备电源。

