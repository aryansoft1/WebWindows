---
id: troubleshooting
title: 故障排除
summary: 处理窗口、登录、文件、同步、AI、媒体和移动布局问题。
category: 安全与排障
category_order: 90
order: 20
status: verified
product_version: 2026.09
last_verified: 2026-09-15
keywords: 常见问题,故障,打不开,同步失败,空白,刷新,恢复
media: assets/guide/troubleshooting-flow.svg
media_alt: 从确认状态、重试、检查权限到记录信息的故障排查流程示意图
media_caption: 先做可逆检查；不要用清除全部浏览器数据作为第一步。
tested_by: tests/guide-smoke.mjs,tests/system-dialog-smoke.mjs,tests/mobile-frontend-smoke.mjs
---
# 故障排除

## 功能用途

用统一顺序判断问题来自登录、网络、权限、格式、浏览器兼容性还是暂未上线能力，并保留足够信息供后续定位。

## 适用场景

功能打不开、文件无法保存、同步卡住、AI 无回复、媒体空白或手机布局异常时使用。

## 操作步骤

1. 记录功能名称、操作步骤、完整错误提示和系统信息中的版本；不要记录敏感凭据。
2. 确认网络、登录状态、文件位置/大小/格式和浏览器站点权限。
3. 关闭出错窗口后重新打开；仍失败再刷新 WebWindows，并把浏览器缩放恢复到 100%。
4. 对照本向导的功能状态和限制；若仍可复现，提交步骤、版本和截图。

## 操作结果

可恢复的问题会在重新授权、登录或刷新后正常；不能恢复时，记录应足以区分客户端、服务端与功能边界问题。

## 常见问题与权限提示

- 不要先清除全部浏览器数据：这可能删除 Developer Studio 项目、DeskTalk 本地偏好和讯筒本机消息。
- AI 429/503：等待自动重试后稍后再发；重复点击会增加压力。
- 页面拒绝嵌入：改用完整浏览器；不要尝试绕过目标站点策略。
- 已明确标为占位、未启用或规划中的入口无法通过刷新变成可用功能。

