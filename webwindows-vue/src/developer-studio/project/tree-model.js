import { parentProjectPath, projectPathName } from "./path-policy.js";

export function buildProjectTree(entries) {
  const roots = [];
  const nodes = new Map();
  entries.forEach((entry) => nodes.set(entry.path, {
    ...entry,
    name: projectPathName(entry.path),
    children: []
  }));
  nodes.forEach((node) => {
    const parent = parentProjectPath(node.path);
    if (!parent) roots.push(node);
    else nodes.get(parent)?.children.push(node);
  });
  const sort = (items) => items.sort((left, right) => {
    if (left.kind !== right.kind) return left.kind === "directory" ? -1 : 1;
    return left.name.localeCompare(right.name);
  }).forEach((item) => sort(item.children));
  sort(roots);
  return roots;
}

export function languageForPath(path) {
  const extension = String(path).toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";
  return {
    html: "html",
    htm: "html",
    css: "css",
    js: "javascript",
    json: "json",
    svg: "xml",
    md: "markdown",
    txt: "plaintext"
  }[extension] || "plaintext";
}
