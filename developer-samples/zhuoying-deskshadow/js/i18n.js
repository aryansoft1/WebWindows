/* 桌影 i18n 层：仿仓库 tw.js 的键值习惯——以简体中文文案为键，
 * 每种语言用「文案 -> 译文」映射，缺失键回退为键本身（即中文）。
 * zh/en/jp 的 chrome 层键全量对齐（en/jp 第十三轮补齐）；面板内部长文案仍走回退。
 * 不引用仓库 assets/js/tw.js。 */
(function () {
  "use strict";
  var ZY = (window.ZY = window.ZY || {});

  var dict = {
    zh: {
      "新建工程": "新建工程",
      "打开工程": "打开工程",
      "保存工程": "保存工程",
      "导入素材": "导入素材",
      "拆分播放头": "拆分播放头",
      "诊断": "诊断",
      "桌讯 AI 助手": "桌讯 AI 助手",
      "桌影": "桌影",
      "DeskShadow · 三轨视频剪辑": "DeskShadow · 三轨视频剪辑",
      "无片段：请在时间线放置片段或导入素材": "无片段：请在时间线放置片段或导入素材",
      "视频轨": "视频轨",
      "音频轨": "音频轨",
      "字幕轨": "字幕轨",
      "双击空白处添加字幕卡": "双击空白处添加字幕卡",
      "片段检查": "片段检查",
      "字幕卡": "字幕卡",
      "滤镜与过渡": "滤镜与过渡",
      "导出": "导出",
      "运行环境诊断": "运行环境诊断",
      "桌影 · 桌讯 AI 剪辑助手（契约评审中）": "桌影 · 桌讯 AI 剪辑助手（契约评审中）"
    },
    en: {
      "新建工程": "New Project",
      "打开工程": "Open Project",
      "保存工程": "Save Project",
      "导入素材": "Import Media",
      "拆分播放头": "Split at Playhead",
      "诊断": "Diagnostics",
      "桌讯 AI 助手": "DeskTalk AI Assistant",
      "视频轨": "Video Track",
      "音频轨": "Audio Track",
      "字幕轨": "Caption Track",
      "片段检查": "Clip Inspector",
      "字幕卡": "Caption Card",
      "滤镜与过渡": "Filters & Transitions",
      "导出": "Export",
      "桌影": "DeskShadow",
      "DeskShadow · 三轨视频剪辑": "DeskShadow · Three-Track Video Editing",
      "无片段：请在时间线放置片段或导入素材": "No clips: place clips on the timeline or import media",
      "双击空白处添加字幕卡": "Double-click empty space to add a caption",
      "运行环境诊断": "Runtime Diagnostics",
      "桌影 · 桌讯 AI 剪辑助手（契约评审中）": "DeskShadow · DeskTalk AI Assistant (under contract review)"
      /* chrome 层 21 键已全部覆盖；面板内部长文案保持中文键值回退，后续轮次再议 */
    },
    jp: {
      "新建工程": "新規プロジェクト",
      "打开工程": "プロジェクトを開く",
      "保存工程": "プロジェクトを保存",
      "导入素材": "メディアを読み込む",
      "拆分播放头": "再生ヘッドで分割",
      "诊断": "診断",
      "桌讯 AI 助手": "DeskTalk AI アシスタント",
      "视频轨": "映像トラック",
      "音频轨": "音声トラック",
      "字幕轨": "字幕トラック",
      "片段检查": "クリップ検査",
      "字幕卡": "字幕カード",
      "滤镜与过渡": "フィルターとトランジション",
      "导出": "書き出し",
      "桌影": "デスクシャドウ",
      "DeskShadow · 三轨视频剪辑": "DeskShadow・三トラック動画編集",
      "无片段：请在时间线放置片段或导入素材": "クリップがありません：タイムラインに配置するか、メディアを読み込んでください",
      "双击空白处添加字幕卡": "空白をダブルクリックで字幕カードを追加",
      "运行环境诊断": "実行環境診断",
      "桌影 · 桌讯 AI 剪辑助手（契约评审中）": "デスクシャドウ・DeskTalk AI アシスタント（契約審査中）"
      /* chrome 层 21 键已全部覆盖；面板内部长文案保持中文键值回退，后续轮次再议 */
    }
  };

  var langs = ["zh", "en", "jp"];
  var current = "zh";

  function t(key) {
    var d = dict[current];
    if (d && Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    return key; /* 回退：键本身即中文文案 */
  }

  /* 将带 data-i18n / data-i18n-title 的叶子元素替换为 t(键)。
   * data-i18n 属性可为空：空值时以元素当前文本（去除首尾空白）为键。 */
  function apply(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll("[data-i18n]");
    var i;
    var node;
    var key;
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      if (node.children.length > 0) continue; /* 只处理叶子，避免覆盖动态子内容 */
      key = node.getAttribute("data-i18n") || String(node.textContent || "").replace(/^\s+|\s+$/g, "");
      if (!key) continue;
      /* 首次以元素文本作键时把键固化回属性，避免切回 zh 时把译文当键 */
      if (node.getAttribute("data-i18n") !== key) node.setAttribute("data-i18n", key);
      node.textContent = t(key);
    }
    nodes = scope.querySelectorAll("[data-i18n-title]");
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      key = node.getAttribute("data-i18n-title") || node.getAttribute("title") || "";
      if (!key) continue;
      node.setAttribute("title", t(key));
    }
  }

  function setLang(lang) {
    if (langs.indexOf(lang) === -1) lang = "zh";
    current = lang;
    apply(document);
    try {
      localStorage.setItem("ww.deskshadow.lang", lang); /* 语言偏好走独立键，不入工程文件 */
    } catch (e) { /* localStorage 不可用时静默降级 */ }
  }

  function getLang() { return current; }

  ZY.i18n = { t: t, apply: apply, setLang: setLang, getLang: getLang, langs: langs };
})();
