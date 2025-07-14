
// === tw.js: 简体转繁体转换模块 ===

// 简体转繁体字典（示例，可扩展）
const twTable = {
  "设置": "設定", "语言": "語言", "联系我们": "聯絡我們",
  "新闻中心": "新聞中心", "刷新": "重新整理", "最大化": "最大化",
  "最小化": "最小化", "关闭": "關閉", "控制面板": "控制面板",
  "个性化": "個人化", "文件管理器": "檔案總管", "邮件": "郵件",
  "浏览器": "瀏覽器", "日历": "行事曆", "系统信息": "系統資訊",
  "公司新闻": "公司新聞", "文章标题": "文章標題", "行业动态": "產業動態"
};

// 简体转繁体函数：仅替换文本中的中文字符
function tw(text) {
  return text.replace(/[一-龥]/g, ch => twTable[ch] || ch);
}

// 遍历 container 中的所有文本节点并进行繁体转换
function convertToTraditional(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    node.nodeValue = tw(node.nodeValue);
  }
}

// 主语言切换函数，支持桌面 + 所有窗口批量处理
function switchLanguage(lang) {
    const currentLang = localStorage.getItem("lang") || "zh";

    // 如果当前语言已是简体中文，且不需要切换，则不刷新
    if (lang === "zh" && currentLang === "zh") {
        return; // ✅ 避免无限刷新
    }

    localStorage.setItem("lang", lang);

    if (lang === "tw") {
        convertToTraditional(document.body);
        document.querySelectorAll(".window-content").forEach(el => convertToTraditional(el));
    } else if (lang === "zh") {
        location.reload(); // ✅ 仅在确实需要从繁体切回简体时刷新
    }
}

// 启动语言控制：页面加载或收到设置指令后自动切换语言
function setupLanguageControl() {
  const currentLang = localStorage.getItem("lang") || "zh";
  switchLanguage(currentLang);

  window.addEventListener("message", (event) => {
    if (event.data.type === "change-language") {
      switchLanguage(event.data.lang);
    }
  });
}
