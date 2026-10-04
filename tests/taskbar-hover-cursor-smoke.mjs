import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const port = 4188;
const server = spawn(process.execPath, ["tools/static-server.mjs", String(port)], { stdio: "ignore" });
let browser;
try {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const windowElement = document.createElement("div");
      windowElement.className = "window";
      document.body.appendChild(windowElement);
      window.__bootWindowGate = {
        bootPending: document.documentElement.classList.contains("ww-boot-pending"),
        visibility: getComputedStyle(windowElement).visibility,
        pointerEvents: getComputedStyle(windowElement).pointerEvents
      };
    }, { once: true });
  });
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded" });
  assert.deepEqual(await page.evaluate(() => window.__bootWindowGate), {
    bootPending: true,
    visibility: "hidden",
    pointerEvents: "none"
  }, "body-mounted windows remain hidden and inert while the desktop boot overlay is pending");
  await page.evaluate(() => {
    window.WebWindows.cursor.setTheme("classic");
    let strip = document.querySelector(".taskbar-app-strip");
    if (!strip) {
      strip = document.createElement("div");
      strip.className = "taskbar-app-strip";
      document.querySelector(".taskbar").appendChild(strip);
    }
    for (const id of ["cursor-test-a", "cursor-test-b"]) {
      const icon = document.createElement("button");
      icon.className = "taskbar-app";
      icon.dataset.id = id;
      icon.innerHTML = `<img alt=""><span>${id}</span>`;
      strip.appendChild(icon);
    }
  });
  await page.waitForFunction(() => {
    const icon = document.querySelector('.taskbar-app[data-id="cursor-test-a"]');
    return icon?.draggable && getComputedStyle(icon).getPropertyValue("--ww-cursor-render-state").trim() === "default";
  });
  const icon = page.locator('.taskbar-app[data-id="cursor-test-a"]');
  await icon.hover();
  const states = await icon.evaluate((element) => [element, ...element.querySelectorAll("*")].map((node) => ({
    state: getComputedStyle(node).getPropertyValue("--ww-cursor-render-state").trim(),
    cursor: getComputedStyle(node).cursor
  })));
  assert.equal(states.every(({ state, cursor }) => state === "default" && cursor.includes("classic/default.png")), true,
    "hovering a draggable taskbar item and its children keeps the normal cursor");
  console.log("taskbar hover cursor smoke test passed");
} finally {
  await browser?.close();
  server.kill();
}
