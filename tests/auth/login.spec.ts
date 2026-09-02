import { test, expect } from '@playwright/test'; // raw test, no storageState
import { LoginPage } from '../../pages/LoginPage';
import { env } from '../config/env';

// These tests manage their own session — they test the login flow itself
test.use({ storageState: { cookies: [], origins: [] } });

test.describe(`Login page ${env.ENV_TAG}`, () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.acceptCookies();
    await loginPage.openSignInForm();
  });

  test('logs in with valid credentials', async ({ page }) => {
    await loginPage.fillCredentials(env.TEST_USER_EMAIL, env.TEST_USER_PASS);
    await loginPage.submit();

    await expect(page).not.toHaveURL(/sign-in|login/);
  });

  test('shows error with wrong password', async () => {
    await loginPage.fillCredentials(env.TEST_USER_EMAIL, 'WrongPass123!');
    await loginPage.submit();

    const error = await loginPage.getErrorMessage();
    expect(error).toBeTruthy();
  });
});