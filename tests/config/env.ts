// dotenv is already loaded in playwright.config.ts before this runs

export const env = {
  ENV: (process.env['ENV'] || 'qa').trim(),
  ENV_TAG: `@${(process.env['ENV'] || 'qa').trim()}`,
  BASE_URL: (process.env['BASE_URL'] || 'https://qa.seedlingsocial.org').trim(),
  API_BASE_URL: (process.env['API_BASE_URL'] || 'https://qa.seedlingsocial.org/api').trim(),
  TEST_USER_EMAIL: (process.env['TEST_USER_EMAIL'] || 'kavinap@uit.ac.in').trim(),
  TEST_USER_PASS: process.env['TEST_USER_PASS'] || 'Uit@1234567890',

  // Social OAuth API Credentials
  GOOGLE_CLIENT_ID: (process.env['GOOGLE_CLIENT_ID'] || '').trim(),
  GOOGLE_CLIENT_SECRET: (process.env['GOOGLE_CLIENT_SECRET'] || '').trim(),
  GOOGLE_REFRESH_TOKEN: (process.env['GOOGLE_REFRESH_TOKEN'] || '').trim(),

  APPLE_CLIENT_ID: (process.env['APPLE_CLIENT_ID'] || '').trim(),
  APPLE_TEAM_ID: (process.env['APPLE_TEAM_ID'] || '').trim(),
  APPLE_KEY_ID: (process.env['APPLE_KEY_ID'] || '').trim(),
  APPLE_PRIVATE_KEY: (process.env['APPLE_PRIVATE_KEY'] || '').trim(),

  TWITTER_CLIENT_ID: (process.env['TWITTER_CLIENT_ID'] || '').trim(),
  TWITTER_CLIENT_SECRET: (process.env['TWITTER_CLIENT_SECRET'] || '').trim(),
  TWITTER_REFRESH_TOKEN: (process.env['TWITTER_REFRESH_TOKEN'] || '').trim(),

  // Real-time Email Verification & IMAP Configuration
  IMAP_HOST: (process.env['IMAP_HOST'] || 'imap.gmail.com').trim(),
  IMAP_PORT: parseInt(process.env['IMAP_PORT'] || '993', 10) || 993,
  IMAP_USER: (process.env['IMAP_USER'] || process.env['TEST_USER_EMAIL'] || 'kavinap@uit.ac.in').trim(),
  IMAP_PASS: (process.env['IMAP_PASS'] || 'yewoyvymmbjqxtus').replace(/\s+/g, ''),
  IMAP_TLS: process.env['IMAP_TLS'] !== 'false',
  EMAIL_POLL_TIMEOUT: parseInt(process.env['EMAIL_POLL_TIMEOUT'] || '30000', 10) || 30000,
};