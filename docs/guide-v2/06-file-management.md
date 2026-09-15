---
id: file-management
title: 上传、下载与管理文件
summary: 新建文件夹、上传、下载、重命名和删除私人文件。
category: 云资料
category_order: 30
order: 30
status: verified
product_version: 2026.09
last_verified: 2026-09-15
keywords: 上传,下载,新建文件夹,重命名,删除,备份,15MB
open_url: cloud/browser/files.asp
media: assets/guide/file-lifecycle.svg
media_alt: 本地文件上传到私人云资料后进行重命名、下载与删除的流程示意图
media_caption: 文件管理流程示意；公共区域不提供写入入口。
tested_by: cloud/browser/private-files.asp,cloud/browser/createFolder.asp,tests/private-cloud-version-smoke.mjs
---
# 上传、下载与管理文件

## 功能用途

登录用户可在私人资料中新建文件夹、上传文件、重命名和删除；公共资料提供打开、复制逻辑路径、下载、信息与图片壁纸操作，不允许普通用户直接写入。

## 适用场景

整理个人文件、把设备文件上传到云端、下载副本，或为办公编辑器准备保存目录时使用。

## 操作步骤

1. 登录后进入云资料，选择“私人文件”并打开目标文件夹。
2. 使用上传入口选择文件；单个文件不得超过 15 MB，等待成功提示后再离开页面。
3. 右键或长按项目打开操作菜单，按需重命名、新建文件夹、刷新或删除。
4. 下载时选择“下载”，并在浏览器下载列表中确认文件已完成。

## 操作结果

刷新后可看到新文件或新名称；下载会生成设备副本。办公应用同名覆盖采用分块提交，完成前不会用半成品替换目标，并由服务端保留 `.bak` 备份。

## 常见问题与权限提示

- 上传失败：检查登录状态、15 MB 限制、文件名和网络；不要连续重复提交。
- 找不到删除：公共文件不可由普通用户删除；先确认位于私人区域。
- 删除不可撤销时应先下载备份；`.bak` 保护针对写入覆盖，不是通用回收站。
