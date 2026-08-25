import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Read the ENV variable, defaulting to 'qa'
const env = process.env.ENV || 'qa';

// ✅ Load specific .env file based on environment
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

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
    video: 'on',
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
      testIgnore: ['**/auth.setup.ts', '**/*email*.spec.ts', '**/*otp*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/user.json',
      },
      dependencies: ['setup'],   // <- login runs first, only for THIS project
    },
    {
      // Standalone Email OTP and Delivery Verification tests
      name: 'email',
      testDir: './tests/auth',
      testMatch: ['**/*email*.spec.ts', '**/*otp*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
      },
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
    {
      // Standalone API tests — fast REST API execution without browser setup
      name: 'api',
      testDir: './tests/api',
    },
  ],
});