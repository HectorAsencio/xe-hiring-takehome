import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',

  projects: [
    {
      name: 'api',
      testMatch: '**/*.api.spec.ts',
      use: {
        baseURL: 'http://localhost:5180',
      },
    },
    {
      name: 'e2e',
      testMatch: '**/*.e2e.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
      },
    },
  ],
})