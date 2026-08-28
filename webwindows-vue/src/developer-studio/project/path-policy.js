export const MAX_PROJECT_PATH_LENGTH = 240;

export function normalizeProjectPath(input, options = {}) {
  const raw = String(input ?? "");
  if (raw.includes("\0")) throw pathError("项目路径不能包含 NUL。", input);
  if (/^[a-z]:/i.test(raw)) throw pathError("项目路径不能使用盘符。", input);

  const normalized = raw.replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!normalized) {
    if (options.allowRoot === true) return "";
    throw pathError("项目路径不能为空。", input);
  }
  if (normalized.startsWith("/")) throw pathError("项目路径必须是相对路径。", input);
  if (normalized.length > MAX_PROJECT_PATH_LENGTH) {
    throw pathError(`项目路径不能超过 ${MAX_PROJECT_PATH_LENGTH} 个字符。`, input);
  }
  const parts = normalized.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) {
    throw pathError("项目路径包含不安全的路径段。", input);
  }
  return parts.join("/");
}

export function parentProjectPath(path) {
  const normalized = normalizeProjectPath(path);
  const index = normalized.lastIndexOf("/");
  return index < 0 ? "" : normalized.slice(0, index);
}

export function projectPathName(path) {
  const normalized = normalizeProjectPath(path);
  return normalized.slice(normalized.lastIndexOf("/") + 1);
}

export function joinProjectPath(parent, name) {
  const parentPath = normalizeProjectPath(parent, { allowRoot: true });
  const childName = String(name ?? "");
  if (!childName || childName.includes("/") || childName.includes("\\")) {
    throw pathError("文件或目录名称必须是单个安全路径段。", name);
  }
  return normalizeProjectPath(parentPath ? `${parentPath}/${childName}` : childName);
}

function pathError(message, value) {
  const error = new TypeError(message);
  error.code = "invalid-project-path";
  error.value = value;
  return error;
}
