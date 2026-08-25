import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgotPasswordPage extends BasePage {
  // Locators
  readonly forgotPasswordLink   = this.page.getByText(/forgot.*password/i).or(this.page.getByRole('link', { name: /forgot.*password/i }));
  readonly emailInput           = this.page.getByRole('textbox', { name: /email/i }).or(this.page.locator('input[type="email"]'));
  readonly sendOtpButton        = this.page.getByRole('button', { name: 'Verify', exact: true }).or(this.page.getByRole('button', { name: /send otp|reset|continue/i }));
  readonly verifyCodeButton      = this.page.getByRole('button', { name: /verify|confirm|submit/i }).or(this.page.locator('button[type="submit"]'));
  readonly newPasswordInput     = this.page.locator('input[type="password"], input[name="newPassword"], input[name="password"], input[placeholder*="Password"]');
  readonly confirmPasswordInput = this.page.locator('input[name="confirmPassword"], input[placeholder*="Confirm"]');
  readonly updatePasswordButton = this.page.getByRole('button', { name: /update|reset|submit|save|confirm|change/i });
  readonly successMessage       = this.page.getByRole('alert').or(this.page.getByText(/password reset successfully|verification successful|identity confirmed|password updated/i));

  constructor(page: Page) {
    super(page);
  }

  /**
   * Clicks on the "Forgot Password" link on the sign-in modal/page
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.first().click();
  }

  /**
   * Fills the user's email address and submits to trigger the real-time OTP email
   */
  async requestOtp(email: string) {
    await this.emailInput.first().fill(email);
    await this.sendOtpButton.first().click();
  }

  /**
   * Fills the extracted OTP code into the UI digit input fields
   */
  async enterOtp(otpCode: string) {
    // Wait for the UI modal to transition to the OTP input screen (Confirm Your Identity)
    await this.page.waitForFunction(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.some((i) => {
        const ph = (i.getAttribute('placeholder') || '').toLowerCase();
        const name = (i.getAttribute('name') || '').toLowerCase();
        const type = (i.getAttribute('type') || '').toLowerCase();
        return (
          i.offsetWidth > 0 &&
          i.offsetHeight > 0 &&
          !type.includes('email') &&
          !name.includes('email') &&
          !ph.includes('email')
        );
      });
    }, { timeout: 10000 }).catch(() => {});

    // Collect all visible OTP input elements (excluding the email field)
    const inputs = await this.page.locator('input').all();
    const otpInputs: Locator[] = [];
    for (const input of inputs) {
      if (!(await input.isVisible())) continue;

      const type = (await input.getAttribute('type')) || '';
      const name = (await input.getAttribute('name')) || '';
      const placeholder = (await input.getAttribute('placeholder')) || '';

      const isEmail =
        type === 'email' ||
        name.toLowerCase().includes('email') ||
        placeholder.toLowerCase().includes('email');

      if (!isEmail) {
        otpInputs.push(input);
      }
    }

    console.log(`🔍 [ForgotPasswordPage] Found ${otpInputs.length} visible OTP input field(s).`);

    // Slice OTP code to match visible digit box count (e.g. 4 boxes)
    const codeToType = otpInputs.length > 0 ? otpCode.slice(0, otpInputs.length) : otpCode;

    if (otpInputs.length >= codeToType.length) {
      const startIndex = otpInputs.length - codeToType.length;
      for (let i = 0; i < codeToType.length; i++) {
        await otpInputs[startIndex + i].focus();
        await otpInputs[startIndex + i].pressSequentially(codeToType[i], { delay: 50 });
      }
    } else if (otpInputs.length > 0) {
      await otpInputs[0].fill(codeToType);
    }
  }

  /**
   * Enters the OTP, clicks "Verify Code", and completes the password reset flow
   */
  async completePasswordReset(otpCode: string, newPassword?: string) {
    // 1. Enter OTP into the 4 digit boxes
    for (let attempt = 1; attempt <= 2; attempt++) {
      await this.enterOtp(otpCode);
      await this.page.waitForTimeout(400);

      const isEnabled = await this.verifyCodeButton.first().isEnabled({ timeout: 3000 }).catch(() => false);
      if (isEnabled) {
        console.log(`✅ [ForgotPasswordPage] Verify Code button enabled. Submitting OTP.`);
        await this.verifyCodeButton.first().click();
        break;
      } else if (attempt === 2) {
        await expect(this.verifyCodeButton.first()).toBeEnabled({ timeout: 5000 });
        await this.verifyCodeButton.first().click();
      }
    }

    // 2. Next Screen: Set New Password Modal
    if (newPassword) {
      const passInput = this.newPasswordInput.first();
      if (await passInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`🔑 [ForgotPasswordPage] On Next Screen: Entering new password.`);
        await passInput.fill(newPassword);

        const confirmInput = this.confirmPasswordInput.first();
        if (await confirmInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmInput.fill(newPassword);
        }

        // Click Update / Save Password button
        await this.updatePasswordButton.first().click();
        console.log(`✅ [ForgotPasswordPage] Clicked Update Password button.`);
      }
    }
  }

  /**
   * Asserts that the verification or password reset success message is visible
   */
  async verifyPasswordResetSuccess() {
    await expect(this.successMessage.first()).toBeVisible({ timeout: 10000 });
  }
}
