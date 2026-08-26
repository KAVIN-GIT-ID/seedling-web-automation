import { test, expect } from '@playwright/test';
import { SignUpPage } from '../../pages/SignUpPage';
import { env } from '../config/env';

test.use({ storageState: { cookies: [], origins: [] } });

const RECORDING_DELAY_MS = 3000;

test.describe('Sign Up Page - Comprehensive Validation Suite', () => {
  test.describe.configure({ mode: 'serial' });
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await signUpPage.openSignUpForm();
  });

  test('0. Complete Continuous Sign-Up Execution Flow (Single-Run Recording)', async ({ page }, testInfo) => {
    test.setTimeout(240000); // 4 minutes to accommodate continuous flow + 10s recording delays

    // Step 1: Empty Form Submit State
    await expect(signUpPage.signUpButton).toBeDisabled();
    await expect(signUpPage.fullNameInput).toBeVisible();
    await expect(signUpPage.emailOrPhoneInput).toBeVisible();
    await expect(signUpPage.passwordInput).toBeVisible();
    await page.waitForTimeout(RECORDING_DELAY_MS);

    // Step 2: Validate Salutation Selection across all options (All other required fields filled with valid data)
    await signUpPage.fillValidDefaults();
    const salutations = ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.', 'Prof.'] as const;
    for (const title of salutations) {
      await signUpPage.selectSalutation(title);
      const button = signUpPage.getSalutationButton(title);
      await expect(button).toBeVisible();
    }
    await page.waitForTimeout(RECORDING_DELAY_MS);

    // Step 3: Validate Full Name Field (All other required fields filled with valid data)
    await signUpPage.fillValidDefaults({ fullName: 'Kavin@$@' });
    await signUpPage.emailOrPhoneInput.click();
    await expect(signUpPage.fullNameFormatError).toBeVisible({ timeout: 5000 });
    await signUpPage.fillFullName('Kavin Automation');
    await expect(signUpPage.fullNameFormatError).not.toBeVisible();
    await page.waitForTimeout(RECORDING_DELAY_MS);

    // Step 4: Validate Email Input Invalid Format Error (All other required fields filled with valid data)
    await signUpPage.fillValidDefaults({ email: 'kavinaewtewtr$%$%^$6p@uit.ac.inttureyre' });
    await signUpPage.submitSignUp();
    await expect(signUpPage.emailFormatError).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(RECORDING_DELAY_MS);

    // Step 5: Validate Email Duplicate User Error (All other required fields filled with valid data)
    await signUpPage.fillValidDefaults({ email: env.TEST_USER_EMAIL });
    await signUpPage.submitSignUp();
    await expect(signUpPage.emailAlreadyExistsError).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(RECORDING_DELAY_MS);

    // Step 6: Validate Password Length & Complexity Indicators (All other required fields filled with valid data)
    await signUpPage.fillValidDefaults({ password: 'Uit@1' });
    await signUpPage.emailOrPhoneInput.click();
    await expect(signUpPage.passwordMinLengthError).toBeVisible({ timeout: 5000 });
    await signUpPage.fillPassword('a');
    await expect(signUpPage.ruleAtLeast8Chars.first()).toBeVisible({ timeout: 5000 });
    await expect(signUpPage.ruleUppercaseLetter.first()).toBeVisible({ timeout: 5000 });
    await expect(signUpPage.ruleNumber.first()).toBeVisible({ timeout: 5000 });
    await expect(signUpPage.ruleSpecialChar.first()).toBeVisible({ timeout: 5000 });
    await signUpPage.fillPassword('Uit@1234567890-');
    await expect(signUpPage.passwordMinLengthError).not.toBeVisible();
    await page.waitForTimeout(RECORDING_DELAY_MS);

    // Step 7: Validate Terms of Service Requirement (All other required fields filled with valid data)
    const randomSuffix1 = Math.random().toString(36).substring(2, 9);
    await signUpPage.fillValidDefaults({
      email: `kavinqa${randomSuffix1}@gmail.com`,
      password: 'Uit@1234567890-',
      agreeTerms: false,
    });
    await expect(signUpPage.signUpButton).toBeDisabled();
    await page.waitForTimeout(RECORDING_DELAY_MS);

    // Step 8: Complete Valid Registration Flow to OTP Modal
    await signUpPage.openSignUpForm();
    const randomSuffix2 = Math.random().toString(36).substring(2, 9);
    await signUpPage.fillValidDefaults({
      email: `kavinqa${randomSuffix2}@gmail.com`,
      password: 'Uit@1234567890-',
      agreeTerms: true,
    });
    await signUpPage.submitSignUpWithRetry();
    await signUpPage.verifyOtpModalVisible();

    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('OTP_Verification_Modal_Screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });

    await expect(signUpPage.cancelButton).toBeVisible();
    await expect(signUpPage.resendCodeLink).toBeVisible();
    await page.waitForTimeout(RECORDING_DELAY_MS);
  });

  test('1. Validate empty form submit button disabled state', async ({ page }) => {
    await expect(signUpPage.signUpButton).toBeDisabled();
    await expect(signUpPage.fullNameInput).toBeVisible();
    await expect(signUpPage.emailOrPhoneInput).toBeVisible();
    await expect(signUpPage.passwordInput).toBeVisible();
    await page.waitForTimeout(RECORDING_DELAY_MS);
  });

  test('2. Validate salutation selection across all options', async ({ page }) => {
    await signUpPage.fillValidDefaults();
    const salutations = ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.', 'Prof.'] as const;

    for (const title of salutations) {
      await signUpPage.selectSalutation(title);
      const button = signUpPage.getSalutationButton(title);
      await expect(button).toBeVisible();
    }
    await page.waitForTimeout(RECORDING_DELAY_MS);
  });

  test('3. Validate full name field negative and positive formats', async ({ page }) => {
    await signUpPage.fillValidDefaults({ fullName: 'Kavin@$@' });
    await signUpPage.emailOrPhoneInput.click();
    await expect(signUpPage.fullNameFormatError).toBeVisible({ timeout: 5000 });

    await signUpPage.fillFullName('Kavin Automation');
    await expect(signUpPage.fullNameFormatError).not.toBeVisible();
    await page.waitForTimeout(RECORDING_DELAY_MS);
  });

  test('4. Validate email input formats and duplicate user error handling', async ({ page }) => {
    await signUpPage.fillValidDefaults({ email: 'kavinaewtewtr$%$%^$6p@uit.ac.inttureyre' });
    await signUpPage.submitSignUp();
    await expect(signUpPage.emailFormatError).toBeVisible({ timeout: 5000 });

    await signUpPage.fillEmailOrPhone(env.TEST_USER_EMAIL);
    await signUpPage.submitSignUpWithRetry();
    await expect(signUpPage.emailAlreadyExistsError).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(RECORDING_DELAY_MS);
  });

  test('5. Validate password length constraints and complexity indicators', async ({ page }) => {
    await signUpPage.fillValidDefaults({ password: 'Uit@1' });
    await signUpPage.emailOrPhoneInput.click();
    await expect(signUpPage.passwordMinLengthError).toBeVisible({ timeout: 5000 });

    await signUpPage.fillPassword('a');
    await expect(signUpPage.ruleAtLeast8Chars.first()).toBeVisible({ timeout: 5000 });
    await expect(signUpPage.ruleUppercaseLetter.first()).toBeVisible({ timeout: 5000 });
    await expect(signUpPage.ruleNumber.first()).toBeVisible({ timeout: 5000 });
    await expect(signUpPage.ruleSpecialChar.first()).toBeVisible({ timeout: 5000 });

    await signUpPage.fillPassword('Uit@1234567890-');
    await expect(signUpPage.passwordMinLengthError).not.toBeVisible();
    await page.waitForTimeout(RECORDING_DELAY_MS);
  });

  test('6. Validate terms of service checkbox requirement', async ({ page }) => {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const uniqueEmail = `kavinqa${randomSuffix}@gmail.com`;

    await signUpPage.fillValidDefaults({
      email: uniqueEmail,
      password: 'Uit@1234567890-',
      agreeTerms: false,
    });

    await expect(signUpPage.signUpButton).toBeDisabled();
    await page.waitForTimeout(RECORDING_DELAY_MS);
  });

  test('7. Complete valid registration flow to OTP modal and capture screenshot', async ({ page }, testInfo) => {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const uniqueEmail = `kavinqa${randomSuffix}@gmail.com`;

    await signUpPage.fillValidDefaults({
      email: uniqueEmail,
      password: 'Uit@1234567890-',
      agreeTerms: true,
    });

    await signUpPage.submitSignUpWithRetry();
    await signUpPage.verifyOtpModalVisible();

    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('OTP_Verification_Modal_Screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });

    await expect(signUpPage.cancelButton).toBeVisible();
    await expect(signUpPage.resendCodeLink).toBeVisible();
    await page.waitForTimeout(RECORDING_DELAY_MS);
  });
});
