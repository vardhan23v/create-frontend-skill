// @ts-check
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: { command: 'python3 -m http.server 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 }, browserName: 'chromium' } },
    { name: 'mobile', use: { viewport: { width: 375, height: 812 }, browserName: 'chromium', isMobile: true } },
  ],
});
