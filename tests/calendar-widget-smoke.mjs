import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const port = 4189;
const server = spawn(process.execPath, ["tools/static-server.mjs", String(port)], { stdio: "ignore" });
let browser;
let china2028Attempts = 0;
try {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const page = await browser.newPage();
  await page.route("**/api/holiday/year/*", async (route) => {
    const year = new URL(route.request().url()).pathname.split("/").at(-1);
    if (year === "2028" && china2028Attempts++ === 0) {
      await route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
      return;
    }
    const holiday = Object.fromEntries(Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1).padStart(2, "0");
      return [`${year}-${month}-01`, { date: `${year}-${month}-01`, name: "China Test", holiday: true }];
    }));
    await route.fulfill({ status: 200, headers: { "access-control-allow-origin": "*" }, contentType: "application/json", body: JSON.stringify({ holiday }) });
  });
  await page.route("**/PublicHolidays/*/*", async (route) => {
    const year = new URL(route.request().url()).pathname.split("/").at(-2);
    await route.fulfill({ status: 200, headers: { "access-control-allow-origin": "*" }, contentType: "application/json", body: JSON.stringify([
      { date: `${year}-01-01`, localName: "Local Test" }
    ]) });
  });
  await page.addInitScript(() => {
    const NativeDate = Date;
    class FixedDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : ["2026-01-31T12:00:00.000Z"])); }
      static now() { return NativeDate.parse("2026-01-31T12:00:00.000Z"); }
    }
    Object.setPrototypeOf(FixedDate, NativeDate);
    window.Date = FixedDate;
    localStorage.setItem("lang", "en");
    localStorage.setItem("webwindows.region", "CN");
    sessionStorage.setItem("booted", "yes");
  });

  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded" });
  await page.locator("#taskbar-datetime").click({ force: true });
  await page.waitForFunction(() => document.querySelectorAll("#calendar-days .day[data-date]").length === 31);
  await page.waitForFunction(() => document.querySelectorAll('#calendar-days [data-date="2026-01-01"] .holiday-marker').length === 2);
  assert.equal(await page.locator("#calendar-today").innerText(), "Today", "today control follows the selected UI language");
  assert.match(await page.locator(".calendar-legend").innerText(), /China holiday\s+Local holiday/,
    "the holiday color legend follows the selected UI language");
  assert.equal(await page.locator("#calendar-weekdays > span").count(), 7, "weekday names use a dedicated seven-column header");
  assert.equal(await page.locator("#calendar-days .day-empty").count(), 4, "month-leading cells remain as transparent spacing only");
  const overlapDay = page.locator('#calendar-days [data-date="2026-01-01"]');
  assert.equal(await overlapDay.locator(".holiday-marker").count(), 2,
    "overlapping China and local holidays show both color markers");
  assert.match(await overlapDay.getAttribute("title"), /China holiday：China Test \/ Local holiday：Local Test/,
    "holiday tooltip names each region and holiday separately");
  const blankBackground = await page.locator("#calendar-days .day-empty").first().evaluate((el) => getComputedStyle(el).backgroundColor);
  assert.equal(blankBackground, "rgba(0, 0, 0, 0)", "empty calendar cells do not look like dates");
  await page.locator("#next-month").click();
  assert.equal(await page.locator("#calendar-month-picker").inputValue(), "2026-02", "advancing from January 31 lands in February");
  await page.locator("#calendar-today").click();
  assert.equal(await page.locator("#calendar-month-picker").inputValue(), "2026-01", "today returns to the current month");
  const today = page.locator('#calendar-days [data-date="2026-01-31"]');
  assert.equal(await today.evaluate((el) => el.classList.contains("today")), true, "today receives an independent outline state");
  await page.locator('#calendar-days [data-date="2026-01-29"]').click();
  assert.equal(await page.locator('#calendar-days [data-date="2026-01-29"]').getAttribute("aria-pressed"), "true",
    "clicking a date gives it a selected state");
  await page.evaluate(() => window.WebWindowsI18n.setLanguage("jp"));
  await page.waitForFunction(() => document.querySelector("#calendar-today")?.textContent === "今日");
  assert.match(await page.locator(".calendar-legend").innerText(), /中国の祝日\s+現地の祝日/,
    "the legend also updates when the interface language changes while the calendar is open");
  await page.locator("#calendar-month-picker").fill("2028-05");
  await page.locator("#calendar-data-status:not([hidden])").waitFor();
  assert.match(await page.locator("#calendar-data-status").innerText(), /取得できません/, "failed API data is reported in the active language");
  assert.equal(await page.locator("#calendar-month-picker").inputValue(), "2028-05", "month picker jumps directly to another year");
  await page.locator(".calendar-retry").click();
  await page.waitForFunction(() => document.querySelector("#calendar-data-status")?.hidden === true);
  assert.equal(china2028Attempts, 2, "failed API responses are not cached and can be retried");
  console.log("calendar widget smoke test passed");
} finally {
  await browser?.close();
  server.kill();
}
