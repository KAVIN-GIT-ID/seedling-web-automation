export const users = {
  standard: {
    email:    process.env.TEST_USER_EMAIL ?? 'kavinap@uit.ac.in',
    password: process.env.TEST_USER_PASS  ?? '',
  },
} as const;