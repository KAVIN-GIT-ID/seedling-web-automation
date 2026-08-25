// dotenv is already loaded in playwright.config.ts before this runs

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const env = {
  BASE_URL: process.env['BASE_URL'] ?? 'https://qa.seedlingsocial.org',
  API_BASE_URL: process.env['API_BASE_URL'] ?? 'https://qa.seedlingsocial.org/api',
  TEST_USER_EMAIL: process.env['TEST_USER_EMAIL'] ?? 'kavinap@uit.ac.in',
  TEST_USER_PASS: requiredEnv('TEST_USER_PASS'),

  // Social OAuth API Credentials
  GOOGLE_CLIENT_ID: process.env['GOOGLE_CLIENT_ID'] ?? '',
  GOOGLE_CLIENT_SECRET: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
  GOOGLE_REFRESH_TOKEN: process.env['GOOGLE_REFRESH_TOKEN'] ?? '',

  APPLE_CLIENT_ID: process.env['APPLE_CLIENT_ID'] ?? '',
  APPLE_TEAM_ID: process.env['APPLE_TEAM_ID'] ?? '',
  APPLE_KEY_ID: process.env['APPLE_KEY_ID'] ?? '',
  APPLE_PRIVATE_KEY: process.env['APPLE_PRIVATE_KEY'] ?? '',

  TWITTER_CLIENT_ID: process.env['TWITTER_CLIENT_ID'] ?? '',
  TWITTER_CLIENT_SECRET: process.env['TWITTER_CLIENT_SECRET'] ?? '',
  TWITTER_REFRESH_TOKEN: process.env['TWITTER_REFRESH_TOKEN'] ?? '',

  // Real-time Email Verification & IMAP Configuration
  IMAP_HOST: process.env['IMAP_HOST'] ?? 'imap.gmail.com',
  IMAP_PORT: parseInt(process.env['IMAP_PORT'] ?? '993', 10),
  IMAP_USER: process.env['IMAP_USER'] ?? process.env['TEST_USER_EMAIL'] ?? 'kavinap@uit.ac.in',
  IMAP_PASS: (process.env['IMAP_PASS'] ?? 'yewoyvymmbjqxtus').replace(/\s+/g, ''),
  IMAP_TLS: process.env['IMAP_TLS'] !== 'false',
  EMAIL_POLL_TIMEOUT: parseInt(process.env['EMAIL_POLL_TIMEOUT'] ?? '30000', 10),
};