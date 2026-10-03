---
id: cloud-secretary
title: 云秘书服务入口
summary: 从云秘书根窗口进入当前已配置的服务，而不把规划能力当作现成功能。
category: 功能与开发
category_order: 60
order: 30
status: testing
product_version: 2026.09
last_verified: 2026-09-15
keywords: 云秘书,评测中心,服务入口,对日外贸
covers: webwindows.system.cloud-secretary
open_url: index.html
media: assets/guide/service-flow.svg
media_alt: 开始菜单中的云秘书打开根窗口，再进入已配置服务的示意图
media_caption: 当前代码只明确注册“云秘书对日外贸评测中心”入口，其他设想不作为现成功能描述。
tested_by: webwindows-vue/src/stores/legacyWindow.js,data/apps/system-apps.json
---
# 云秘书服务入口

## 功能用途

云秘书当前是一个系统根窗口，用于进入已配置的云秘书服务。当前代码明确提供“云秘书对日外贸评测中心”磁贴；没有在代码中确认的秘书自动化能力不在本向导承诺范围内。

## 适用场景

需要进入当前已上线的云秘书评测服务，或确认服务入口是否可达时使用。

## 操作步骤

1. 从桌面或开始菜单打开“云秘书”。
2. 在根窗口选择“云秘书对日外贸评测中心”。
3. 等待服务窗口打开，并按页面自身要求继续操作。
4. 若服务窗口未加载，记录提示并检查网络后重试。

## 操作结果

成功时会出现独立服务窗口；重复打开根入口会聚焦已有窗口。

## 常见问题与权限提示

- 根窗口只有一个磁贴不是加载失败，而是当前注册范围。
- 具体服务可能有自己的账户、网络和数据处理规则，应阅读服务页提示。
- 向导不把产品构想或历史文档中的能力写成已经上线。

