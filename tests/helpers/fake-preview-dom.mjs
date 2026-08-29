export class FakeNode {
  constructor(tagName, attributes = {}, textContent = "") {
    this.tagName = tagName;
    this.attributes = new Map(Object.entries(attributes));
    this.textContent = textContent;
    this.replacement = null;
    this.nextSibling = null;
  }
  hasAttribute(name) { return this.attributes.has(name); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  replaceWith(node) { this.replacement = node; }
}

export class FakePreviewDocument {
  constructor(html) {
    this.moduleScript = /<script[^>]+type=["']module["']/i.test(html);
    const scriptSource = html.match(/<script[^>]+src=["']([^"']+)["']/i)?.[1] || null;
    const stylesheet = html.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || null;
    const imageSource = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null;
    const sourceSet = html.match(/srcset=["']([^"']+)["']/i)?.[1] || null;
    this.script = scriptSource ? new FakeNode("script", { src: scriptSource }) : null;
    this.link = stylesheet ? new FakeNode("link", { rel: "stylesheet", href: stylesheet }) : null;
    this.image = imageSource ? new FakeNode("img", { src: imageSource }) : null;
    this.sourceSet = sourceSet ? new FakeNode("img", { srcset: sourceSet }) : null;
    this.styles = [];
    this.csp = null;
    this.bootstrap = null;
    this.head = {
      prepend: (node) => { this.csp = node; },
      insertBefore: (node) => { this.bootstrap = node; }
    };
    this.documentElement = {};
    Object.defineProperty(this.documentElement, "outerHTML", {
      get: () => JSON.stringify({
        cspHttpEquiv: this.csp?.httpEquiv || "",
        csp: this.csp?.content || "",
        bootstrap: this.bootstrap?.textContent || "",
        scriptSource: this.script?.getAttribute("src"),
        scriptText: this.script?.textContent || "",
        styles: this.styles.map((style) => style.textContent),
        imageSource: this.image?.getAttribute("src"),
        sourceSet: this.sourceSet?.getAttribute("srcset")
      })
    });
  }
  querySelector(selector) {
    return selector === 'script[type="module"]' && this.moduleScript ? {} : null;
  }
  createElement(tagName) {
    const node = new FakeNode(tagName);
    if (tagName === "style") this.styles.push(node);
    return node;
  }
  querySelectorAll(selector) {
    if (selector === "script[src]") return this.script ? [this.script] : [];
    if (selector === 'link[rel~="stylesheet"][href]') return this.link ? [this.link] : [];
    if (selector === "style") return this.styles;
    if (selector === "[src],[href],[poster]") return [this.script, this.image].filter(Boolean);
    if (selector === "[srcset]") return this.sourceSet ? [this.sourceSet] : [];
    return [];
  }
}

export class FakeDOMParser {
  parseFromString(html) { return new FakePreviewDocument(html); }
}
