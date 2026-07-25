import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { env } from '../config/env';

const authFile = 'auth/user.json';

// This project runs before all others — Playwright handles the dependency
setup('authenticate and save session', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.login(env.TEST_USER_EMAIL, env.TEST_USER_PASS);

  // ✅ Verify we're actually logged in before saving
  await expect(page).not.toHaveURL(/sign-in|login/);

  // ✅ Save cookies + localStorage to disk
  await page.context().storageState({ path: authFile });
});