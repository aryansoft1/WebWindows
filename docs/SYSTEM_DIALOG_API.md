# WebWindows 系统对话框 API

应用内的提示与确认必须使用 `WebWindows.dialog`，不得直接调用浏览器原生的
`alert()`、`confirm()` 或 `prompt()`。系统对话框会跟随 WebWindows 当前语言，
并在桌面窗口和同源 iframe 中保持一致的外观与焦点行为。

## 提示

```js
await WebWindows.dialog.alert("操作已完成。", {
  title: "应用名称",
  confirmLabel: "确定"
});
```

## 确认

```js
const accepted = await WebWindows.dialog.confirm("确定继续吗？", {
  title: "应用名称",
  confirmLabel: "继续",
  cancelLabel: "取消"
});

if (accepted) {
  // 只在用户明确确认后执行。
}
```

`confirm()` 返回 `Promise<boolean>`。确认按钮或 Enter 返回 `true`；取消按钮、
Escape、API `close()` 返回 `false`。应用必须 `await` 结果，不能把它当作浏览器
原生同步 `confirm()` 使用。

同源应用窗口会获得相同的 `WebWindows.dialog` 对象。跨源页面不会被注入此 API。
显示不受信任内容时只传入纯文本；实现使用 `textContent`，不得将消息拼为 HTML。
