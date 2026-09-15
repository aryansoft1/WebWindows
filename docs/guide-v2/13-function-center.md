---
id: function-center
title: 功能中心与可安装应用
summary: 浏览、搜索、添加、打开和移除功能，理解系统功能保护。
category: 功能与开发
category_order: 60
order: 10
status: testing
product_version: 2026.09
last_verified: 2026-09-15
keywords: 功能中心,安装,添加,移除,功能仓库,应用商店
covers: webwindows.system.function-center
open_url: function-center.html
media: assets/guide/function-center.png
media_alt: 功能中心侧栏、搜索框和全部功能列表的实际界面
media_caption: 公开站点实拍；目录加载结果取决于当前服务和账户。
tested_by: assets/js/function-center.js,tests/function-center-smoke.mjs,tests/function-management-smoke.mjs
---
# 功能中心与可安装应用

## 功能用途

功能中心是当前的功能目录前台，按全部功能、我的功能、可添加、系统功能和办公文件分类，支持搜索、添加、打开和移除。

## 适用场景

找不到桌面图标、想添加应用、移除不再使用的普通功能，或确认某功能是否属于受保护系统组件时使用。

## 操作步骤

1. 打开功能中心，等待“功能仓库”连接状态完成。
2. 在“全部功能”搜索名称、功能 ID 或文件格式，查看描述和安装状态。
3. 对可添加项目选择“添加”；完成后从“我的功能”打开。
4. 移除普通功能前确认没有依赖它打开的文件，再执行移除。

## 操作结果

添加成功后功能进入“我的功能”，并按注册表设置出现在桌面或开始菜单；移除只解除当前使用者关联。

## 常见问题与权限提示

- 系统功能不可移除，这是保护设计。
- 移除不会删除服务器程序、云资料或个人文件。
- 目录加载失败：检查网络并刷新；只有功能中心实际列出的项目代表当前环境可提供。

