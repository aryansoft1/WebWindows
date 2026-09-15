---
id: cloud-files
title: 认识云资料与“此设备”
summary: 区分公共、私人和已授权设备资料，选择正确的读写位置。
category: 云资料
category_order: 30
order: 10
status: verified
product_version: 2026.09
last_verified: 2026-09-15
keywords: 云资料,公共资料,私人资料,此设备,本地位置,权限
covers: webwindows.system.cloud-files
open_url: cloud/browser/files.asp
media: assets/guide/cloud-files.png
media_alt: 云资料公共区域、位置侧栏、搜索栏和三种视图按钮的实际界面
media_caption: 公开站点实拍。界面语言跟随设置；私人文件仅在登录后显示。
tested_by: cloud/browser/files.asp,cloud/browser/device-locations.js,tests/device-cloud-integration-smoke.mjs
---
# 认识云资料与“此设备”

## 功能用途

云资料把文件位置分成公共资料、当前账户的私人资料和用户主动授权的“此设备”目录。公共资料可读，私人资料可由支持的应用保存，“此设备”目前只提供受控读取。

## 适用场景

查阅共享文件、编辑自己的文档、从已授权本地目录打开文件，或判断某个位置能否写入时使用。

## 操作步骤

1. 从开始菜单打开“云资料”，先在左侧确认当前位置。
2. 选择“公共区域”浏览共享内容；登录后单击“私人文件”进入个人空间。
3. 如环境支持，在“此设备”选择“添加本地位置”，由浏览器或 WebWindows 客户端显示授权界面。
4. 只授予任务所需目录；完成后通过面包屑、返回和上一级按钮导航。

## 操作结果

文件列表显示当前位置可访问的文件和文件夹；设备目录会带只读、可读写或权限失效状态，但公开 Storage v1 只承诺列出、读取和元数据能力。

## 常见问题与权限提示

- 私人文件入口不可用：先正式登录，并允许同源 Cookie。
- “此设备”不出现：浏览器或客户端不支持目录授权；使用普通上传/云资料替代。
- 设备位置授权失效：重新选择同一目录；系统不会静默扩大授权范围。

