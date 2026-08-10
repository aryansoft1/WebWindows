import vm from "node:vm";
import { readFile } from "node:fs/promises";

for (const name of ["worker_SheetCreater.html", "worker_WriteEditor.html", "worker_SlideEditor.html"]) {
  const html = await readFile(new URL(`../${name}`, import.meta.url), "utf8");
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(match => !/\bsrc\s*=/i.test(match[1]));
  for (const [index, match] of scripts.entries()) {
    new vm.Script(match[2], { filename:`${name}#inline-${index + 1}` });
  }
}

console.log("Office editor inline script syntax tests passed");
