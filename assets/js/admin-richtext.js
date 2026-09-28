(function () {
  "use strict";
  function create(root, field) {
    const rich = window.WebWindowsNewsContent;
    function sanitized(value) {
      const holder = document.createElement("div");
      rich.load(holder, value);
      return rich.serialize(holder);
    }
    if (!window.Jodit) throw new Error("新闻编辑器资源未加载，请刷新后重试。");
    const instance = Jodit.make(field, {
      language: "zh_cn", readonly: true, height: 400, minHeight: 300,
      toolbarAdaptive: false, toolbarSticky: false,
      buttons: ["paragraph", "font", "fontsize", "brush", "|", "bold", "italic", "underline", "strikethrough", "|", "align", "ul", "ol", "outdent", "indent", "|", "link", "image", "table", "hr", "eraser", "|", "undo", "redo", "fullsize", "source"],
      controls: {
        font: { list: Jodit.atom(Object.fromEntries([["", "默认"], ...rich.fonts.map(font => [font, font])])) },
        fontsize: { list: Jodit.atom([10,12,14,16,18,24,30,32,36,48,60,72]) },
        paragraph: { list: Jodit.atom({p:"正文",h1:"标题 1",h2:"标题 2",h3:"标题 3",h4:"标题 4",h5:"标题 5",h6:"标题 6",blockquote:"引用",pre:"代码块"}) }
      },
      defaultFontSizePoints: "px", imageDefaultWidth: 300,
      sourceEditor: "area", sourceEditorCDNUrlsJS: [],
      disablePlugins: ["file", "video", "filebrowser", "uploader", "image-editor", "speech-recognize"],
      uploader: { url: "", insertImageAsBase64URI: false, showTabInFileSelector: false },
      filebrowser: { ajax: { url: "" }, items: { url: "" } },
      image: { editSrc: false, useImageEditor: false, editStyle: false, editClass: false, editId: false, editBorderRadius: false, editMargins: false, editAlign: false, editLink: false },
      askBeforePasteHTML: false, askBeforePasteFromWord: false,
      processPasteFromWord: false,
      cleanHTML: { denyTags: "script,style,iframe,object,embed,svg,math,form,input,button,textarea,select,video,audio,link,meta,base" },
      events: {
        beforeSetNativeEditorValue(data) { data.value = sanitized(data.value); },
        beforePaste(event) {
          if (!event.clipboardData) return;
          const value = event.clipboardData.getData("text/html") || event.clipboardData.getData("text/plain");
          if (value) { this.s.insertHTML(sanitized(value)); event.preventDefault(); return false; }
        }
      }
    });
    instance.editor.classList.add("ww-news-content");
    instance.editor.setAttribute("aria-labelledby", "newsContentLabel");
    instance.editor.setAttribute("aria-multiline", "true");
    instance.editor.setAttribute("role", "textbox");
    // Validate the native image URL form; uploader/file-browser tabs are disabled.
    document.addEventListener("submit", event => {
      const form = event.target;
      if (!form.closest?.(".jodit-file-selector")) return;
      const input = form.querySelector('input[name="url"]');
      if (input && !rich.safeLink(input.value, true)) {
        event.preventDefault(); event.stopImmediatePropagation();
        input.setCustomValidity("图片必须使用 HTTPS 地址，不支持本地上传或 data URL。"); input.reportValidity();
      }
    }, true);
    document.addEventListener("input", event => {
      if (event.target.matches?.('.jodit-file-selector input[name="url"]')) event.target.setCustomValidity("");
    });
    instance.e.on("beforeInsertNode", node => {
      const images = node.nodeName === "IMG" ? [node] : Array.from(node.querySelectorAll?.("img") || []);
      images.forEach(image => { if (!rich.safeLink(image.getAttribute("src"), true)) { image.removeAttribute("src"); image.removeAttribute("srcset"); } });
    });
    instance.e.on(instance.editor, "drop", event => { if (event.dataTransfer?.files?.length) { event.preventDefault(); return false; } });
    root.addEventListener("keydown", event => { if (event.key === "Escape" && instance.isFullSize) { instance.toggleFullSize(false); event.preventDefault(); } });
    return Object.freeze({
      setContent(value) { instance.setMode(Jodit.MODE_WYSIWYG); instance.value = sanitized(value); instance.history.clear(); },
      getContent() { return sanitized(instance.value); },
      setEnabled(value) { instance.setReadOnly(!value); },
      close() { instance.toggleFullSize(false); instance.e.fire("closeAllPopups"); }
    });
  }
  window.WebWindowsAdminRichText = Object.freeze({ create });
})();
