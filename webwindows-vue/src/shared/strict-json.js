export function assertUnambiguousJson(text) {
  if (typeof text !== "string" || text.charCodeAt(0) === 0xfeff) throw syntax("JSON BOM is forbidden");
  let offset = 0;
  const whitespace = () => { while (/[\u0009\u000a\u000d\u0020]/.test(text[offset] || "")) offset += 1; };
  const string = () => {
    if (text[offset++] !== '"') throw syntax("Expected JSON string");
    let value = "";
    while (offset < text.length) {
      const character = text[offset++];
      if (character === '"') { assertUnicodeScalarString(value); return value; }
      if (character.charCodeAt(0) < 0x20) throw syntax("Control character in JSON string");
      if (character !== "\\") { value += character; continue; }
      const escape = text[offset++];
      const simple = { '"':'"', "\\":"\\", "/":"/", b:"\b", f:"\f", n:"\n", r:"\r", t:"\t" };
      if (Object.prototype.hasOwnProperty.call(simple, escape)) { value += simple[escape]; continue; }
      if (escape !== "u") throw syntax("Invalid JSON escape");
      const hex = text.slice(offset, offset + 4);
      if (!/^[0-9a-fA-F]{4}$/.test(hex)) throw syntax("Invalid JSON Unicode escape");
      value += String.fromCharCode(Number.parseInt(hex, 16)); offset += 4;
    }
    throw syntax("Unterminated JSON string");
  };
  const value = (depth = 0) => {
    if (depth > 100) throw syntax("JSON nesting limit exceeded");
    whitespace();
    if (text[offset] === "{") {
      offset += 1; whitespace(); const keys = new Set();
      if (text[offset] === "}") { offset += 1; return; }
      while (true) {
        const key = string();
        if (keys.has(key)) throw syntax(`Duplicate JSON property: ${key}`);
        keys.add(key); whitespace(); if (text[offset++] !== ":") throw syntax("Expected JSON colon");
        value(depth + 1); whitespace();
        if (text[offset] === "}") { offset += 1; return; }
        if (text[offset++] !== ",") throw syntax("Expected JSON comma"); whitespace();
      }
    }
    if (text[offset] === "[") {
      offset += 1; whitespace(); if (text[offset] === "]") { offset += 1; return; }
      while (true) { value(depth + 1); whitespace(); if (text[offset] === "]") { offset += 1; return; } if (text[offset++] !== ",") throw syntax("Expected JSON comma"); whitespace(); }
    }
    if (text[offset] === '"') { string(); return; }
    for (const literal of ["true", "false", "null"]) if (text.startsWith(literal, offset)) { offset += literal.length; return; }
    const number = text.slice(offset).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!number) throw syntax("Invalid JSON value");
    if (!Number.isFinite(Number(number[0]))) throw syntax("Non-finite JSON number");
    offset += number[0].length;
  };
  whitespace(); value(); whitespace();
  if (offset !== text.length) throw syntax("Trailing JSON data is forbidden");
}

function assertUnicodeScalarString(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw syntax("Unpaired JSON surrogate");
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) throw syntax("Unpaired JSON surrogate");
  }
}

function syntax(message) { const error = new SyntaxError(message); error.code = "ambiguous-json"; return error; }
