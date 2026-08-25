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

  // Social OAuth API Credentials (Configurable via .env or GitHub Secrets)
  GOOGLE_CLIENT_ID: process.env['GOOGLE_CLIENT_ID'] ?? 'mock-google-client-id',
  GOOGLE_CLIENT_SECRET: process.env['GOOGLE_CLIENT_SECRET'] ?? 'mock-google-client-secret',
  GOOGLE_REFRESH_TOKEN: process.env['GOOGLE_REFRESH_TOKEN'] ?? 'mock-google-refresh-token',

  APPLE_CLIENT_ID: process.env['APPLE_CLIENT_ID'] ?? 'mock-apple-client-id',
  APPLE_TEAM_ID: process.env['APPLE_TEAM_ID'] ?? 'mock-apple-team-id',
  APPLE_KEY_ID: process.env['APPLE_KEY_ID'] ?? 'mock-apple-key-id',
  APPLE_PRIVATE_KEY: process.env['APPLE_PRIVATE_KEY'] ?? 'mock-apple-private-key',

  TWITTER_CLIENT_ID: process.env['TWITTER_CLIENT_ID'] ?? 'mock-twitter-client-id',
  TWITTER_CLIENT_SECRET: process.env['TWITTER_CLIENT_SECRET'] ?? 'mock-twitter-client-secret',
  TWITTER_REFRESH_TOKEN: process.env['TWITTER_REFRESH_TOKEN'] ?? 'mock-twitter-refresh-token',

  QA_MOCK_AUTH: process.env['QA_MOCK_AUTH'] ?? 'true',

  // Real-time Email Verification & IMAP Configuration
  IMAP_HOST: process.env['IMAP_HOST'] ?? 'imap.gmail.com',
  IMAP_PORT: parseInt(process.env['IMAP_PORT'] ?? '993', 10),
  IMAP_USER: process.env['IMAP_USER'] ?? process.env['TEST_USER_EMAIL'] ?? 'kavinap@uit.ac.in',
  IMAP_PASS:            (process.env['IMAP_PASS']           ?? 'yewoyvymmbjqxtus').replace(/\s+/g, ''),
  IMAP_TLS: process.env['IMAP_TLS'] !== 'false',
  EMAIL_POLL_TIMEOUT: parseInt(process.env['EMAIL_POLL_TIMEOUT'] ?? '30000', 10),
};