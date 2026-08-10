import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sheet = await readFile(new URL("../worker_SheetCreater.html", import.meta.url), "utf8");
const write = await readFile(new URL("../worker_WriteEditor.html", import.meta.url), "utf8");
const slide = await readFile(new URL("../worker_SlideEditor.html", import.meta.url), "utf8");
const privateResource = await readFile(new URL("../cloud/browser/private-resource.asp", import.meta.url), "utf8");

assert.doesNotMatch(sheet, /id="download-editor-data"/,
  "Sheet Editor must not expose JSON as a normal save format");
assert.match(sheet, /WebWindows\.fileDialog\.write\(target, workbookBlob\(\), \{ overwrite: true \}\)/,
  "Sheet primary Save must write a real XLSX blob");
assert.match(sheet, /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/,
  "Sheet output must use the XLSX MIME type");

assert.doesNotMatch(write, /uploadEditorBytes|webwindows-write-editor/,
  "Write Editor primary Save must not write a JSON sidecar");
assert.match(write, /WebWindows\.fileDialog\.write\(target, createDocxBlob\(\), \{ overwrite: true \}\)/,
  "Write primary Save must write a DOCX blob");
assert.match(write, /application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/,
  "Write output must use the DOCX MIME type");

assert.match(slide, /new Blob\(\[state\.buffer\], \{[\s\S]*?application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation/,
  "Slide Save Copy must preserve a real PPTX binary payload");
assert.match(privateResource, /AllowedCloudFile = \(InStr[\s\S]*?xlsx,xls,csv,docx,doc,pptx,ppt/,
  "Private cloud storage must accept Office binary extensions");

console.log("Office binary save smoke tests passed");
