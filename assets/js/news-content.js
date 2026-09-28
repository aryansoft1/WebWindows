(function () {
  "use strict";
  const allowed = new Set(["P", "DIV", "BR", "STRONG", "B", "EM", "I", "U", "H2", "H3", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE", "A"]);
  const discard = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "TEMPLATE", "FORM", "INPUT", "BUTTON", "TEXTAREA"]);
  function safeLink(value) {
    if (!String(value || "").trim()) return null;
    try {
      const url = new URL(value, location.href);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  function clean(input) {
    const template = document.createElement("template");
    template.innerHTML = String(input || "");
    function copy(node) {
      if (node.nodeType === 3) return document.createTextNode(node.textContent);
      const fragment = document.createDocumentFragment();
      if (node.nodeType !== 1 || discard.has(node.tagName)) return fragment;
      const target = allowed.has(node.tagName) ? document.createElement(node.tagName.toLowerCase()) : fragment;
      if (node.tagName === "A") {
        const href = safeLink(node.getAttribute("href") || "");
        if (href) { target.setAttribute("href", href); target.setAttribute("rel", "noopener noreferrer"); }
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
    if (!holder.textContent.replace(/\u00a0/g, " ").trim()) return "";
    return holder.innerHTML;
  }
  window.WebWindowsNewsContent = Object.freeze({ load, serialize, safeLink });
})();
