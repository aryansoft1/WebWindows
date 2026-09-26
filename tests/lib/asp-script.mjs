/*
 * VBScript 片段的最小词法扫描：把「代码」与「字符串字面量」分开。
 *
 * 用途：门禁要断言「非 ASCII 文本只允许出现在注释和字符串字面量里」。
 * 用正则做这件事是不可靠的 —— 行尾注释（`Const X = 1   ' 说明`）会被漏掉，
 * 而粗暴的字符串替换还会把相邻字面量折叠成一串、让行号错位，
 * 于是门禁给出的结论是错的（写这个门禁时就被自己的实现坑过一次）。
 *
 * 规则够用即可：VBScript 里字符串以 " 界定、内部用 "" 转义；
 * 字符串外的 ' 开始注释直到行尾；' 不会出现在字符串之外的其他位置。
 */
export function splitAspCode(source) {
  const code = [];
  const strings = [];
  let index = 0;
  let inString = false;
  while (index < source.length) {
    const char = source[index];
    if (inString) {
      strings.push(char);
      if (char === '"') {
        if (source[index + 1] === '"') {
          strings.push('"');
          index += 2;
          continue;
        }
        inString = false;
      }
      index += 1;
      continue;
    }
    if (char === '"') {
      inString = true;
      strings.push(char);
      index += 1;
      continue;
    }
    if (char === "'") {
      while (index < source.length && source[index] !== "\n") index += 1;
      continue;
    }
    code.push(char);
    index += 1;
  }
  return { code: code.join(""), strings: strings.join("") };
}

export function assertAsciiOutsideStrings(source, message) {
  const { code } = splitAspCode(source);
  const bad = code.match(/[^\x00-\x7F]/g);
  if (bad) {
    const at = code.search(/[^\x00-\x7F]/);
    const line = code.slice(0, at).split("\n").length;
    const context = code.split("\n")[line - 1] || "";
    throw new Error(`${message}\n  offending characters: ${bad.join("")}\n  line ${line}: ${context.trim().slice(0, 120)}`);
  }
}

/** 与 assertAsciiOutsideStrings 相同，但把非 ASCII 替换成 '?'，供 cscript 执行。 */
export function toAsciiScript(source) {
  return splitAspCode(source).code.replace(/[^\x00-\x7F]/g, "?");
}
