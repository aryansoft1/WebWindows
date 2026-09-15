---
id: dreama
title: Dreama 浏览器
summary: 在 WebWindows 窗口中访问网页，并处理网站拒绝嵌入的情况。
category: 浏览与信息
category_order: 70
order: 10
status: testing
product_version: 2026.09
last_verified: 2026-09-15
keywords: Dreama,浏览器,网页,iframe,拒绝连接,嵌入
covers: com.aryansoft.webwindows.dreama
open_url: dreama.html
media: assets/guide/browser-limits.svg
media_alt: 网页地址经 Dreama 尝试内嵌，受网站安全策略允许或拒绝的示意图
media_caption: 目标网站的 CSP、X-Frame-Options、Cookie 和登录策略决定能否内嵌。
tested_by: dreama.html,data/apps/system-apps.json,docs/NATIVE_BRIDGE_V1.md
---
# Dreama 浏览器

## 功能用途

Dreama 是 WebWindows 窗口中的网页浏览入口，可输入网址或搜索词并尝试内嵌页面。它不是完整设备浏览器，也不会绕过目标网站的安全策略。

## 适用场景

在桌面工作流旁快速查看允许嵌入的网页，或测试某站点能否在 WebWindows 中显示时使用。

## 操作步骤

1. 打开 Dreama，在地址栏输入完整网址或搜索词。
2. 提交后等待页面加载，检查地址和页面来源是否正确。
3. 若出现空白、拒绝连接或登录循环，复制地址到设备完整浏览器。
4. 涉及敏感登录或付款时优先使用完整浏览器并核对域名。

## 操作结果

允许嵌入的网站会显示在 Dreama 窗口；不允许的网站会失败或提示拒绝，属于预期安全边界。

## 常见问题与权限提示

- 第三方网站可通过 CSP 或 `X-Frame-Options` 禁止嵌入，WebWindows 不应绕过。
- 第三方 Cookie、弹窗和下载在嵌入环境中可能受限。
- 设备亮度、音量和电池能力属于 WebWindows 受控设备接口，不等于任意网页都能访问。
