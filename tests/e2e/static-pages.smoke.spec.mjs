import { test, expect } from '@playwright/test';

/**
 * 纯静态页面的浏览器冒烟测试。
 * - 本地静态服务器不执行经典 ASP/ASHX，因此跳过服务端动态接口（见 tools/static-server.mjs 说明）。
 * - 阻塞外部 CDN 请求，使测试不依赖网络状况，稳定可重复。
 */

const baseURL = `http://127.0.0.1:${process.env.PORT || 4173}`;
const baseOrigin = new URL(baseURL).origin;

test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.origin !== baseOrigin,
    (route) => route.abort(),
  );
});

/** 服务端技术扩展名：本地静态服务器不执行，跳过其失败请求。 */
const SERVER_SIDE_EXTENSIONS = ['.asp', '.ashx', '.aspx', '.asmx', '.ascx'];

/** 收集同源、非服务端动态资源的失败请求（状态码 >= 400）。 */
function trackSameOriginFailures(page) {
  const failures = [];
  const seen = new Set();
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin !== new URL(page.url() || response.url()).origin) return;
    if (SERVER_SIDE_EXTENSIONS.some((ext) => url.pathname.toLowerCase().endsWith(ext))) return;
    if (response.status() >= 400 && !seen.has(url.pathname)) {
      seen.add(url.pathname);
      failures.push(`${response.status()} ${url.pathname}`);
    }
  });
  return failures;
}

test('首页加载并渲染桌面、任务栏与开始菜单', async ({ page }) => {
  const failures = trackSameOriginFailures(page);

  const response = await page.goto('/index.html');
  expect(response.status()).toBe(200);
  await expect(page).toHaveTitle(/成都亚原软件有限公司/);

  await expect(page.locator('.desktop')).toBeVisible();
  await expect(page.locator('.taskbar')).toBeVisible();
  await expect(page.locator('#start-menu-static-fallback li').first()).toBeAttached();

  // 关键本地脚本必须成功加载
  for (const asset of ['/assets/js/main.js', '/assets/js/app-registry.js']) {
    const assetResponse = await page.request.get(asset);
    expect(assetResponse.status(), asset).toBe(200);
  }

  expect(failures, `存在加载失败的同源资源: ${failures.join(', ')}`).toEqual([]);
});

test('二级页面可正常打开', async ({ page }) => {
  await page.goto('/about.html');
  await expect(page).toHaveTitle(/认识我/);

  await page.goto('/services.html');
  await expect(page).toHaveTitle(/业务介绍/);

  await page.goto('/contact.html');
  await expect(page).toHaveTitle(/联系我们/);
});

test('访问不存在的路径返回 404 页面', async ({ page }) => {
  const response = await page.goto('/no-such-page-xyz.html');
  expect(response.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('404');
});
