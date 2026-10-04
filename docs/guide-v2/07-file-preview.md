---
id: file-preview-edit
title: 文件预览与“打开方式”
summary: 预览常见文件，临时选择其他应用打开，并可为文件类型保存默认应用。
category: 云资料
category_order: 30
order: 40
status: verified
product_version: 2026.10
last_verified: 2026-10-04
keywords: 文件预览,打开方式,開啟方式,Open with,プログラムから開く,默认应用,Default app,既定のアプリ,图片,PDF,文本,JSON,编辑器
covers: webwindows.system.file-preview
open_url: cloud/browser/files.asp
open_app: webwindows.system.cloud-files
media: assets/guide/file-lifecycle.svg
media_alt: 文件类型经过打开方式匹配后进入预览器或 Office 编辑器的示意图
media_caption: 打开方式由功能注册表的 fileHandlers 决定；不支持的格式可先下载。
tested_by: data/apps/system-apps.json,assets/js/app-registry.js,assets/js/file-types.js,cloud/browser/open-with.js,tests/app-registry-smoke.mjs
---
# 文件预览、打开方式与编辑

## 功能用途

系统按扩展名和 MIME 类型识别文件，再交给当前默认应用。图片、PDF、TXT、LOG、Markdown 和 JSON 可进入只读预览；XLSX/XLS/CSV、DOCX/DOC、PPTX/PPT 会优先交给对应办公功能。一个文件类型有多个可用应用时，菜单会显示“打开方式”。

## 适用场景

快速查看文件内容、临时改用另一个应用、为某种文件保存默认应用、从云资料进入编辑器，或排查“没有可用功能打开此文件”时使用。

## 操作步骤

1. 在云资料中双击文件，系统会使用该文件类型的当前默认应用打开。
2. 需要临时改用其他应用时，右键或长按文件，展开“打开方式”，然后选择已列出的应用。
3. 列表中没有目标时选择“选择其他应用…”，检查文件类型和可用应用，再选择本次使用的应用。
4. 希望以后都用该应用时勾选“始终使用此应用打开”，再确认；不勾选时只影响本次打开。
5. 打开 Office 文件前确认对应编辑器仍在“我的功能”中；公共文件需要修改时，在编辑器中另存到私人资料。
6. 完成后重新从私人资料双击保存结果，确认默认应用、格式和内容符合预期。

## 操作结果

支持的文件会在新的 WebWindows 窗口中预览或编辑；编辑结果只有在应用明确提示保存成功后才写入目标。

## 常见问题与权限提示

- 浏览器直接显示下载：该 MIME 类型可能不能内嵌预览，改用下载或对应应用。
- 编辑器被移除：到功能中心重新添加后再打开。
- “打开方式 / 開啟方式 / Open with / プログラムから開く”会随界面语言变化；不同语言下保存的是同一个文件类型默认应用。
- 预览地址受同源权限保护，不应复制私人读取地址给他人。
