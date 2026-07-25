// dotenv is already loaded in playwright.config.ts before this runs

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const env = {
  BASE_URL:        process.env['BASE_URL']        ?? 'https://qa.seedlingsocial.org',
  TEST_USER_EMAIL: process.env['TEST_USER_EMAIL'] ?? 'kavinap@uit.ac.in',
  TEST_USER_PASS:  requiredEnv('TEST_USER_PASS'),
};