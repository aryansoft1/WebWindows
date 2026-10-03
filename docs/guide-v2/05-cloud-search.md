---
id: cloud-search
title: 自然语言与 AI 文件搜索
summary: 在云资料或 DeskTalk 中用文件名、类型、日期和来源查找真实文件。
category: 云资料
category_order: 30
order: 20
status: testing
product_version: 2026.09
last_verified: 2026-09-27
keywords: AI搜索,自然语言,文件搜索,上周修改,PDF,Excel,DeskTalk
open_url: cloud/browser/files.asp
media: assets/guide/cloud-files.png
media_alt: 云资料顶部文件搜索框和文件列表区域
media_caption: 在搜索框可输入“上周修改的 PDF”等条件；结果仍由受控文件索引返回。
tested_by: cloud/browser/FILE_SEARCH_API.md,tests/file-search-api-smoke.mjs,assets/js/ai-file-tools.js
---
# 自然语言与 AI 文件搜索

## 功能用途

统一搜索可理解文件类型、日期动作、名称和来源，例如“上周修改的 PDF”“7 月 3 日保存的 Excel”“我的云资料里名字有 WebWindows 的文件”。搜索是确定性文件查询，不会让模型猜测不存在的文件。

DeskTalk 已接入受控 AI 文件工具：模型只提出结构化查询，原始路径和读取地址不会交给模型；打开文件仍需要用户明确选择结果。

## 适用场景

记得文件大致时间或类型但忘了文件名，或希望用一句话缩小公共、私人、设备文件范围时使用。

## 操作步骤

1. 打开云资料，在顶部搜索框输入“上周修改的 PDF”“我的 Excel”或文件名片段，然后执行搜索。
2. 在结果中查看来源、位置、日期和匹配原因；需要缩小范围时补充“公共资料”“私人资料”或“此设备”。
3. 单击确认过的结果，由系统按文件类型打开预览器或对应应用；不要仅凭相似文件名直接编辑。
4. 也可以打开 DeskTalk 的 AI 对话，输入同样的查找要求；结果出现后再明确说“打开第一个文件”。
5. 若 AI 工具提示登录、设备授权或服务不可用，按提示恢复权限，或回到云资料顶部搜索框继续查询。

## 操作结果

系统返回真实索引结果并按相关度排序；私人结果只在有效登录会话中出现，设备结果只来自已授权位置。

## 常见问题与权限提示

- 搜不到“上传日期”：当前云端 `uploadedAt` 暂以文件创建时间代替，旧文件可能与记忆不一致。
- DeskTalk 找不到私人或设备文件：确认已登录，并在云资料中完成对应设备目录授权；AI 不会绕过权限。
- AI 不会自动打开结果；这是防止误开敏感文件的有意限制。
