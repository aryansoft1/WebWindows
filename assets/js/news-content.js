(function () {
  "use strict";
  const allowed = new Set("P DIV BR STRONG B EM I U S DEL H1 H2 H3 H4 H5 H6 UL OL LI BLOCKQUOTE PRE CODE A SPAN HR IMG TABLE THEAD TBODY TFOOT TR TH TD".split(" "));
  const discard = new Set("SCRIPT STYLE IFRAME OBJECT EMBED SVG MATH TEMPLATE FORM INPUT BUTTON TEXTAREA SELECT VIDEO AUDIO LINK META BASE".split(" "));
  const fonts = ["Arial", "Segoe UI", "Verdana", "Georgia", "Times New Roman", "Courier New", "Microsoft YaHei"];
  function safeLink(value, image = false) {
    const text = String(value || "").trim();
    if (!text || /[\u0000-\u0020\u007f]/.test(text)) return null;
    if (image && !/^https:\/\//i.test(text)) return null;
    try {
      const url = new URL(text, location.href);
      return (image ? url.protocol === "https:" : ["http:", "https:", "mailto:"].includes(url.protocol)) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }
  function safeStyle(style) {
    const output = [];
    for (const part of String(style || "").split(";")) {
      const index = part.indexOf(":"), key = part.slice(0, index).trim().toLowerCase(), value = part.slice(index + 1).trim();
      if (index < 1) continue;
      let valid = false;
      if (["color", "background-color"].includes(key)) valid = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value) || /^rgb\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)$/i.test(value) && (value.match(/\d+/g) || []).every(n => +n <= 255);
      if (key === "font-family") valid = fonts.some(font => font.toLowerCase() === value.replace(/['"]/g, "").toLowerCase());
      if (key === "font-size") valid = /^\d{1,2}px$/.test(value) && parseInt(value) >= 10 && parseInt(value) <= 72;
      if (key === "text-align") valid = /^(left|center|right|justify)$/.test(value);
      if (key === "margin-left") valid = /^\d{1,3}px$/.test(value) && parseInt(value) <= 320;
      if (key === "font-weight") valid = /^(bold|normal|[1-9]00)$/.test(value);
      if (key === "font-style") valid = /^(italic|normal)$/.test(value);
      if (key === "text-decoration") valid = /^(underline|line-through|none)$/.test(value);
      if (valid) output.push(`${key}:${value.replace(/['"]/g, "")}`);
    }
    return output.join(";");
  }
  function clean(input) {
    const template = document.createElement("template");
    template.innerHTML = String(input || "");
    function copy(node) {
      if (node.nodeType === 3) return document.createTextNode(node.textContent);
      const fragment = document.createDocumentFragment();
      if (node.nodeType !== 1 || discard.has(node.tagName)) return fragment;
      const tag = node.tagName === "FONT" ? "SPAN" : node.tagName === "STRIKE" ? "S" : node.tagName;
      const target = allowed.has(tag) ? document.createElement(tag.toLowerCase()) : fragment;
      if (target.nodeType === 1) {
        let style = node.getAttribute("style") || "";
        if (node.tagName === "FONT") {
          if (node.hasAttribute("face")) style += `;font-family:${node.getAttribute("face")}`;
          if (node.hasAttribute("color")) style += `;color:${node.getAttribute("color")}`;
          const size = [0, 10, 13, 16, 18, 24, 32, 48][+node.getAttribute("size")];
          if (size) style += `;font-size:${size}px`;
        }
        const indent = /(?:^|;)\s*margin:\s*0(?:px)?\s+0(?:px)?\s+0(?:px)?\s+(\d{1,3}px)\s*(?:;|$)/i.exec(style);
        if (indent) style += `;margin-left:${indent[1]}`;
        const cleaned = safeStyle(style);
        if (cleaned) target.setAttribute("style", cleaned);
        if (tag === "A") {
          const href = safeLink(node.getAttribute("href"));
          if (href) { target.setAttribute("href", href); target.setAttribute("rel", "noopener noreferrer"); }
          if (node.hasAttribute("title")) target.title = node.getAttribute("title").slice(0, 200);
        }
        if (tag === "IMG") {
          const src = safeLink(node.getAttribute("src"), true);
          if (!src) return fragment;
          target.setAttribute("src", src);
          target.setAttribute("alt", (node.getAttribute("alt") || "").slice(0, 500));
        }
        for (const attr of tag === "IMG" ? ["width", "height"] : ["TH", "TD"].includes(tag) ? ["colspan", "rowspan"] : []) {
          const value = node.getAttribute(attr);
          if (/^[1-9]\d{0,3}$/.test(value) && +value <= (tag === "IMG" ? 2000 : 20)) target.setAttribute(attr, value);
        }
      }
      for (const child of node.childNodes) target.append(copy(child));
      return target;
    }
    const output = document.createDocumentFragment();
    for (const child of template.content.childNodes) output.append(copy(child));
    return output;
  }
  function load(target, value) {
    const content = String(value || "");
    if (/<\/?[a-z][^>]*>/i.test(content)) target.replaceChildren(clean(content));
    else target.textContent = content;
  }
  function serialize(target) {
    const holder = document.createElement("div");
    holder.append(clean(target.innerHTML));
    if (!holder.textContent.replace(/\u00a0/g, " ").trim() && !holder.querySelector("img,hr")) return "";
    return holder.innerHTML;
  }
  window.WebWindowsNewsContent = Object.freeze({ load, serialize, safeLink, safeStyle, fonts });
})();
