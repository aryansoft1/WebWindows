---
id: desktalk
title: DeskTalk 聊天、联系人、AI 与讯筒
summary: 查找联系人、添加好友、发送文字消息、使用 AI，并理解讯筒和占位能力。
category: 沟通
category_order: 50
order: 10
status: testing
product_version: 2026.09
last_verified: 2026-09-15
keywords: DeskTalk,桌讯,聊天,联系人,好友,在线,AI,讯筒,邮件
covers: webwindows.system.mailbox
open_url: index.html
media: assets/guide/desktalk-flow.svg
media_alt: DeskTalk 推荐联系人、好友、文字会话、AI 助手和讯筒之间的示意图
media_caption: 实线表示已实现的主要流程；语音、视频和发送文件目前不列为可用流程。
tested_by: assets/js/desktalk.js,tests/desktalk-bigmodel-smoke.mjs,cloud/desktalk/README.md
---
# DeskTalk 聊天、联系人、AI 与讯筒

## 功能用途

DeskTalk 从任务栏打开，包含推荐联系人、好友、文字会话、AI 助手、发现隐私与讯筒。联系人在线状态来自 presence 接口，文字消息通过会话接口收发；好友列表和部分偏好会保存在当前浏览器。

讯筒用于查看邮筒、邮送记录、写信、废纸篓和讯址设置。界面会明确说明哪些邮件仍只保存在本机、哪些需要讯址中心连接。

## 适用场景

查找当前在线用户、建立联系人、发送文字消息、向 AI 提问，或管理讯筒内容时使用。

## 操作步骤

1. 单击任务栏 DeskTalk 图标，进入“推荐”或“好友”；可按用户名搜索并筛选在线。
2. 选择联系人，单击“加好友”，再在会话输入框输入文字；按发送或 `Ctrl+Enter`。
3. 切换到 AI，输入问题并等待回复；遇到繁忙提示时让自动重试完成，不要重复发送。
4. 打开“讯筒”后选择邮筒、写信或讯址设置，并根据界面状态确认数据保存在本机还是服务端。

## 操作结果

文字消息会出现在当前会话，未读消息显示角标；联系人列表显示在线或离开；AI 回复显示在 AI 对话区。

## 常见问题与权限提示

- 语音、视频和发送文件按钮在当前代码中是占位提示，不能写成已完成能力。
- “不被推荐”需要服务端支持；界面会显示同步状态，失败时不能假定隐私设置已生效。
- AI 服务可能因凭据、额度或网络返回 503/429；稍后重试，且不要发送密码、授权码或私人文件内容。
- 讯筒本机消息可能随浏览器数据清除而丢失；只有界面明确确认的服务端操作才算云端完成。

