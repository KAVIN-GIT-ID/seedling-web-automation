import { test, expect } from '@playwright/test';
import { SignUpPage } from '../../pages/SignUpPage';
import { env } from '../config/env';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Sign Up Page - Comprehensive Validation Suite', () => {
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await signUpPage.openSignUpForm();
  });

  test('1. Validate empty form submit button disabled state', async () => {
    await expect(signUpPage.signUpButton).toBeDisabled();
    await expect(signUpPage.fullNameInput).toBeVisible();
    await expect(signUpPage.emailOrPhoneInput).toBeVisible();
    await expect(signUpPage.passwordInput).toBeVisible();
  });

  test('2. Validate salutation selection across all options', async () => {
    const salutations = ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.', 'Prof.'] as const;

    for (const title of salutations) {
      await signUpPage.selectSalutation(title);
      const button = signUpPage.getSalutationButton(title);
      await expect(button).toBeVisible();
    }
  });

  test('3. Validate full name field negative and positive formats', async () => {
    await signUpPage.fillFullName('Kavin@$@');
    await signUpPage.emailOrPhoneInput.click();
    await expect(signUpPage.fullNameFormatError).toBeVisible({ timeout: 5000 });

    await signUpPage.fillFullName('Kavin Automation');
    await expect(signUpPage.fullNameFormatError).not.toBeVisible();
  });

  test('4. Validate email input formats and duplicate user error handling', async () => {
    await signUpPage.selectSalutation('Mr.');
    await signUpPage.fillFullName('Kavin Automation');
    await signUpPage.selectDateOfBirth('2', '3', '2024');
    await signUpPage.fillEmailOrPhone('kavinaewtewtr$%$%^$6p@uit.ac.inttureyre');
    await signUpPage.fillPassword('Uit@1234567890-');
    await signUpPage.setTermsCheckbox(true);

    await signUpPage.submitSignUp();
    await expect(signUpPage.emailFormatError).toBeVisible({ timeout: 5000 });

    await signUpPage.fillEmailOrPhone(env.TEST_USER_EMAIL);
    await signUpPage.submitSignUp();
    await expect(signUpPage.emailAlreadyExistsError).toBeVisible({ timeout: 10000 });
  });

  test('5. Validate password length constraints and complexity indicators', async () => {
    await signUpPage.fillPassword('Uit@1');
    await signUpPage.emailOrPhoneInput.click();
    await expect(signUpPage.passwordMinLengthError).toBeVisible({ timeout: 5000 });

    await signUpPage.fillPassword('a');
    await expect(signUpPage.ruleAtLeast8Chars.first()).toBeVisible({ timeout: 5000 });
    await expect(signUpPage.ruleUppercaseLetter.first()).toBeVisible({ timeout: 5000 });
    await expect(signUpPage.ruleNumber.first()).toBeVisible({ timeout: 5000 });
    await expect(signUpPage.ruleSpecialChar.first()).toBeVisible({ timeout: 5000 });

    await signUpPage.fillPassword('Uit@1234567890-');
    await expect(signUpPage.passwordMinLengthError).not.toBeVisible();
  });

  test('6. Validate terms of service checkbox requirement', async () => {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const uniqueEmail = `kavinqa${randomSuffix}@gmail.com`;

    await signUpPage.selectSalutation('Mr.');
    await signUpPage.fillFullName('Kavin Automation');
    await signUpPage.selectDateOfBirth('2', '3', '2024');
    await signUpPage.fillEmailOrPhone(uniqueEmail);
    await signUpPage.fillPassword('Uit@1234567890-');
    await signUpPage.setTermsCheckbox(false);

    await expect(signUpPage.signUpButton).toBeDisabled();
  });

  test('7. Complete valid registration flow to OTP modal and capture screenshot', async ({ page }, testInfo) => {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const uniqueEmail = `kavinqa${randomSuffix}@gmail.com`;

    await signUpPage.selectSalutation('Mr.');
    await signUpPage.fillFullName('Kavin Automation');
    await signUpPage.selectDateOfBirth('2', '3', '2024');
    await signUpPage.fillEmailOrPhone(uniqueEmail);
    await signUpPage.fillPassword('Uit@1234567890-');
    await signUpPage.setTermsCheckbox(true);

    await signUpPage.submitSignUp();

    await signUpPage.verifyOtpModalVisible();

    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('OTP_Verification_Modal_Screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });

    await expect(signUpPage.cancelButton).toBeVisible();
    await expect(signUpPage.resendCodeLink).toBeVisible();
  });
});
