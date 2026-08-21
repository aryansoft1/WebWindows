import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sheet = await readFile(new URL("../worker_SheetCreater.html", import.meta.url), "utf8");
const slide = await readFile(new URL("../worker_SlideEditor.html", import.meta.url), "utf8");
const write = await readFile(new URL("../worker_WriteEditor.html", import.meta.url), "utf8");

assert.match(sheet, /getElementById\("save-cloud"\)\.textContent\s*=\s*[\s\S]*?"保存到云资料"\s*:\s*"保存"/,
  "Sheet primary save must not duplicate the Save As label for a new workbook");
assert.match(sheet, /id="save-as-cloud"[^>]*>另存到云资料</,
  "Sheet must retain a distinct Save As command");

assert.match(slide, /function requireOpenedPresentation\(action\)/,
  "Slide must centralize empty-presentation feedback");
assert.match(slide, /setStatus\("请先打开文件", true\)/,
  "Slide save without a PPTX must update visible status");
assert.match(slide, /if \(!requireOpenedPresentation\("保存"\)\) return;/,
  "Slide Save must reject an empty presentation with feedback");
assert.match(slide, /if \(!requireOpenedPresentation\("保存原文件副本"\)\) return;/,
  "Slide Save Original must reject an empty presentation with feedback");

assert.match(write, /尚未打开 Word 文档，无法保存原文件副本/,
  "Write Save Original must not silently return when no document is open");

console.log("editor empty-state smoke test passed");
