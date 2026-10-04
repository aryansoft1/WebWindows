---
id: sheet
title: Sheet Editor 表格
summary: 打开或拖入 XLSX、XLS、CSV，使用公式、排序筛选与格式工具编辑并导出。
category: 办公与创作
category_order: 40
order: 10
status: testing
product_version: 2026.10
last_verified: 2026-10-04
keywords: Sheet,Spreadsheet,スプレッドシート,試算表,表格,XLSX,XLS,CSV,公式,Formula,関数,排序,筛选,冻结,条件格式,另存
covers: com.aryansoft.webwindows.sheet
open_url: worker_SheetCreater.html
media: assets/guide/office-flow.svg
media_alt: 云资料中的表格经过 Sheet Editor 编辑、核对并保存副本的流程示意图
media_caption: 建议保留原件，以编辑副本完成浏览器内修改。
tested_by: worker_SheetCreater.html,assets/js/i18n-editors.js,tests/editor-empty-state-smoke.mjs,tests/generic-cloud-file-dialog-smoke.mjs
---
# Sheet Editor 表格

## 功能用途

Sheet Editor 可从云资料打开或从设备拖入 XLSX、XLS 和 CSV，编辑单元格与公式，并使用查找替换、行列插入、排序筛选、冻结、条件格式和数字格式。结果可保存为编辑副本，或导出 XLSX/CSV。

## 适用场景

快速修改普通表格、整理 CSV、计算汇总数据、筛选和格式化数据，或在不同设备上完成日常轻量表格工作时使用。

## 操作步骤

1. 打开 Sheet Editor，从“文件”选择“从云资料打开”，或选择“本地导入”后把 XLSX、XLS、CSV 拖到表格区域。
2. 直接编辑单元格；使用“编辑”中的撤销、重做、查找替换或定位单元格检查修改范围。
3. 需要计算时从“插入”选择函数模板，或使用 SUM、AVERAGE、IF、COUNT；写入后核对公式引用和结果。
4. 需要整理数据时在“数据”中选择升序/降序、自动筛选、冻结首行首列；在“格式”中设置数字格式或条件格式。
5. 编辑过程中使用顶部“保存”把编辑副本写入私人云资料；公共文件不会原地覆盖。
6. 交付前选择“导出 XLSX 到云”“导出 CSV 到云”或“本地导出 XLSX”，再重新打开导出文件核对公式、格式和工作表。

## 操作结果

保存成功后，私人资料中出现目标文件；导出的 XLSX 可下载或由 Sheet Editor 再次打开。

## 常见问题与权限提示

- 宏、复杂图表、高级公式和特殊格式可能不能完整保留；“插入图表说明”是操作提示，不等同完整图表设计器。
- CSV 不保存多工作表和丰富格式；需要这些内容请导出 XLSX。
- 公共文件是只读来源，修改结果必须保存到私人资料。
- 文件、编辑、插入、数据、格式等菜单已接入繁中、English、日本語；步骤中的中文名称会随当前语言显示对应翻译。

