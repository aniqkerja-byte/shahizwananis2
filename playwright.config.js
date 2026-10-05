import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4179', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev:preview -- --port 4179 --strictPort', url: 'http://127.0.0.1:4179', reuseExistingServer: !process.env.CI },
});
