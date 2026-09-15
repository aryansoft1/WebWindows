---
id: developer-studio
title: Developer Studio
summary: 创建本地功能项目、编辑 Manifest、验证、预览、构建并保存 ZIP。
category: 功能与开发
category_order: 60
order: 20
status: testing
product_version: 2026.09
last_verified: 2026-09-15
keywords: Developer Studio,开发者,Manifest,代码,预览,构建,ZIP,权限
covers: webwindows.system.developer-studio
open_url: developer-studio.html
media: assets/guide/developer-flow.svg
media_alt: Developer Studio 从项目、编辑、验证、沙箱预览到构建 ZIP 的流程示意图
media_caption: 本地预览不会自动发布；正式上架还需要独立提交、审核和发布链路。
tested_by: developer-studio.html,assets/js/developer-preview-host.js,tests/public-api-sdk-boundary-smoke.mjs
---
# Developer Studio

## 功能用途

Developer Studio 提供本地项目、资源管理器、Monaco 编辑器、Manifest 表单/JSON、问题与权限诊断、隔离预览、确定性构建和保存 ZIP 到云资料。项目默认保存在当前浏览器的独立 IndexedDB 工作区。

## 适用场景

制作 WebWindows 功能原型、验证 Manifest、在不安装和不发布的情况下预览，或生成待提交 ZIP 时使用。

## 操作步骤

1. 打开 Developer Studio，选择“新建功能”，输入项目名称并等待模板建立。
2. 在资源管理器编辑文件；修改 `manifest.json` 时同时查看检查器和问题面板。
3. 选择“验证”，修复错误后再“运行”；预览在隔离会话中执行。
4. 选择“构建”，确认产物就绪后导出 ZIP，或保存 ZIP 到私人云资料。

## 操作结果

验证通过后可启动预览；构建结果带项目与 Manifest 身份信息。导出成功后得到可用于后续提交的 ZIP，但不会自动上架。

## 常见问题与权限提示

- 清除浏览器数据会删除本地项目；重要项目应定期导出 ZIP。
- 预览权限由 Manifest、平台策略和用户授权共同决定；当前能力试点不等于所有设备 API 都开放。
- “运行成功”不代表审核或生产发布通过，正式发布仍需服务端校验与审核。
