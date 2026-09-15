---
id: privacy-security
title: 隐私、安全与权限
summary: 保护账户、私人文件、设备授权、AI 对话和第三方功能数据。
category: 安全与排障
category_order: 90
order: 10
status: verified
product_version: 2026.09
last_verified: 2026-09-15
keywords: 隐私,安全,权限,私人资料,公共资料,API Key,AI,功能包
media: assets/guide/account-security.svg
media_alt: 私人数据保留在账户边界内，公共资料和第三方服务位于外部边界的示意图
media_caption: 最小授权原则：先确认位置、接收方和用途，再登录、上传或授权设备目录。
tested_by: docs/WEBWINDOWS_SECURITY_FREEZE_PHASE_2E.md,tests/end-to-end-security-freeze-smoke.mjs,tests/private-cloud-session-isolation.mjs
---
# 隐私、安全与权限

## 功能用途

本章说明公共/私人资料、登录会话、设备目录、AI、第三方网页和功能包之间的边界，帮助用户只授予完成任务所需的权限。

## 适用场景

上传文件、在公共设备登录、授权本地目录、向 AI 发送内容、安装第三方功能或连接讯址前使用。

## 操作步骤

1. 操作前确认当前位置是公共资料还是私人资料；公共区域不要放个人或敏感信息。
2. 浏览器请求相机、目录等权限时核对功能名称和用途，只选择必要范围。
3. 不把密码、API Key、邮箱授权码、会话 ID 或私人读取地址写入文档、聊天或功能包。
4. 离开公共设备前注销账户，关闭敏感窗口，并按需要清理浏览器保存的数据。

## 操作结果

私人操作保持在有效账户和已授权范围内；不需要的权限不会被默认扩大。

## 常见问题与权限提示

- 第三方功能和网页可能有独立数据政策，安装或登录前应核对来源。
- AI 对话需要发送输入文本到配置的模型服务；不要发送不必要的私人内容。
- 设备目录公开接口当前不提供创建、删除、重命名或写入，不应把“可读写授权”理解为应用已经会写入。

