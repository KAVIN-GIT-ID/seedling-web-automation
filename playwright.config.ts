import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// ✅ Load .env before accessing process.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL ?? 'https://qa.seedlingsocial.org';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html'], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    {
      // Tests that NEED a logged-in session (existing tests/auth/... files)
      name: 'authenticated',
      testDir: './tests/auth',
      testIgnore: '**/auth.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/user.json',
      },
      dependencies: ['setup'],   // <- login runs first, only for THIS project
    },
    {
      // Tests that must run as a guest — NO login, straight to baseURL
      name: 'unauth',
      testDir: './tests/unauth',
      use: {
        ...devices['Desktop Chrome'],
        // no storageState, no dependencies — fresh guest browser every time
      },
      // no "dependencies" key at all = setup never runs for this project
    },
  ],
});