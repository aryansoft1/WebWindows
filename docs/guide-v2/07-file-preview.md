---
id: file-preview-edit
title: 文件预览、打开方式与编辑
summary: 预览图片、PDF、文本和 JSON，并把 Office 文件交给对应编辑器。
category: 云资料
category_order: 30
order: 40
status: verified
product_version: 2026.09
last_verified: 2026-09-15
keywords: 文件预览,打开方式,图片,PDF,文本,JSON,编辑器
covers: webwindows.system.file-preview
open_url: cloud/browser/files.asp
open_app: webwindows.system.cloud-files
media: assets/guide/file-lifecycle.svg
media_alt: 文件类型经过打开方式匹配后进入预览器或 Office 编辑器的示意图
media_caption: 打开方式由功能注册表的 fileHandlers 决定；不支持的格式可先下载。
tested_by: data/apps/system-apps.json,assets/js/app-registry.js,tests/app-registry-smoke.mjs
---
# 文件预览、打开方式与编辑

## 功能用途

系统按扩展名和 MIME 类型选择打开方式。图片、PDF、TXT、LOG、Markdown 和 JSON 可进入只读预览；XLSX/XLS/CSV、DOCX/DOC、PPTX/PPT 会优先交给对应 Office 功能。

## 适用场景

快速查看文件内容、从云资料进入编辑器，或排查“没有可用功能打开此文件”时使用。

## 操作步骤

1. 在云资料中双击文件或通过操作菜单选择“打开”。
2. 等待系统匹配已安装功能；若是 Office 文件，确认对应编辑器仍在“我的功能”中。
3. 公共文件先以只读方式打开；需要修改时，在编辑器中另存到私人资料。
4. 完成后重新从私人资料打开保存结果，检查格式和内容。

## 操作结果

支持的文件会在新的 WebWindows 窗口中预览或编辑；编辑结果只有在应用明确提示保存成功后才写入目标。

## 常见问题与权限提示

- 浏览器直接显示下载：该 MIME 类型可能不能内嵌预览，改用下载或对应应用。
- 编辑器被移除：到功能中心重新添加后再打开。
- 预览地址受同源权限保护，不应复制私人读取地址给他人。
