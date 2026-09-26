import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT || 4173);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * 浏览器端到端测试配置。
 * - 使用本机已安装的 Google Chrome（channel: 'chrome'），无需下载浏览器内核。
 * - webServer 启动零依赖静态服务器 tools/static-server.mjs（不执行经典 ASP）。
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: {
    command: 'node tools/static-server.mjs',
    url: `${baseURL}/index.html`,
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
