---
id: sheet
title: Sheet Editor 表格
summary: 打开 XLSX、XLS、CSV，编辑后保存副本或导出 XLSX。
category: 办公与创作
category_order: 40
order: 10
status: testing
product_version: 2026.09
last_verified: 2026-09-15
keywords: Sheet,表格,XLSX,XLS,CSV,公式,另存
covers: com.aryansoft.webwindows.sheet
open_url: worker_SheetCreater.html
media: assets/guide/office-flow.svg
media_alt: 云资料中的表格经过 Sheet Editor 编辑、核对并保存副本的流程示意图
media_caption: 建议保留原件，以编辑副本完成浏览器内修改。
tested_by: worker_SheetCreater.html,tests/editor-empty-state-smoke.mjs,tests/office-binary-save-smoke.mjs
---
# Sheet Editor 表格

## 功能用途

Sheet Editor 可从云资料打开 XLSX、XLS 和 CSV，在浏览器中编辑单元格，并保存编辑副本或导出 XLSX。

## 适用场景

快速修改普通表格、整理 CSV、在不同设备上完成轻量表格工作时使用。

## 操作步骤

1. 打开 Sheet Editor，选择“从云资料打开”，再选择公共或私人表格。
2. 修改单元格并检查工作表、公式和数字格式。
3. 先保存为私人资料中的编辑副本，避免覆盖唯一原件。
4. 需要交换时导出 XLSX，再重新打开导出文件核对。

## 操作结果

保存成功后，私人资料中出现目标文件；导出的 XLSX 可下载或由 Sheet Editor 再次打开。

## 常见问题与权限提示

- 宏、复杂图表、高级公式和特殊格式可能不能完整保留。
- CSV 不保存多工作表和丰富格式；需要这些内容请导出 XLSX。
- 公共文件是只读来源，修改结果必须保存到私人资料。
