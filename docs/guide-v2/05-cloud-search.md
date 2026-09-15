---
id: cloud-search
title: 自然语言与 AI 文件搜索
summary: 用文件名、类型、日期和来源查找文件，并理解 DeskTalk AI 工具的版本边界。
category: 云资料
category_order: 30
order: 20
status: testing
product_version: 2026.09
last_verified: 2026-09-15
keywords: AI搜索,自然语言,文件搜索,上周修改,PDF,Excel,DeskTalk
open_url: cloud/browser/files.asp
media: assets/guide/cloud-files.png
media_alt: 云资料顶部文件搜索框和文件列表区域
media_caption: 在搜索框可输入“上周修改的 PDF”等条件；结果仍由受控文件索引返回。
tested_by: cloud/browser/FILE_SEARCH_API.md,tests/file-search-api-smoke.mjs,origin/codex/bigmodel-glm47-flash:tests/file-search-tool-smoke.mjs
---
# 自然语言与 AI 文件搜索

## 功能用途

统一搜索可理解文件类型、日期动作、名称和来源，例如“上周修改的 PDF”“7 月 3 日保存的 Excel”“我的云资料里名字有 WebWindows 的文件”。搜索是确定性文件查询，不会让模型猜测不存在的文件。

DeskTalk 的受控 AI 文件工具只在包含 2026.09 工具注册表的部署中可用：模型只提出结构化查询，原始路径和读取地址不会交给模型；打开文件还需要用户明确选择。

## 适用场景

记得文件大致时间或类型但忘了文件名，或希望用一句话缩小公共、私人、设备文件范围时使用。

## 操作步骤

1. 打开云资料，在顶部搜索框输入“上周修改的 PDF”等描述并选择搜索。
2. 查看每项结果的来源、位置、日期与匹配原因，再单击正确项目。
3. 若当前 DeskTalk 显示 AI 文件搜索，可输入同样问题；看到结果后再说“打开第一个文件”。
4. 若 DeskTalk 只返回普通问答或提示工具不可用，回到云资料搜索框完成查询。

## 操作结果

系统返回真实索引结果并按相关度排序；私人结果只在有效登录会话中出现，设备结果只来自已授权位置。

## 常见问题与权限提示

- 搜不到“上传日期”：当前云端 `uploadedAt` 暂以文件创建时间代替，旧文件可能与记忆不一致。
- DeskTalk 找不到文件工具：当前检出分支尚未包含该工具，以云资料搜索为稳定入口。
- AI 不会自动打开结果；这是防止误开敏感文件的有意限制。

