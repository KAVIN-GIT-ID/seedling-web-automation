import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgotPasswordPage extends BasePage {
  // Locators
  readonly forgotPasswordLink   = this.page.getByText(/forgot.*password/i).or(this.page.getByRole('link', { name: /forgot.*password/i }));
  readonly emailInput           = this.page.getByRole('textbox', { name: /email/i }).or(this.page.locator('input[type="email"]'));
  readonly sendOtpButton        = this.page.getByRole('button', { name: 'Verify', exact: true }).or(this.page.getByRole('button', { name: /send otp|reset|continue/i }));
  readonly verifyCodeButton      = this.page.getByRole('button', { name: /verify code/i });
  readonly newPasswordInput     = this.page.locator('input[name="newPassword"], input[placeholder*="New Password"]');
  readonly confirmPasswordInput = this.page.locator('input[name="confirmPassword"], input[placeholder*="Confirm Password"]');
  readonly successMessage       = this.page.getByRole('alert').or(this.page.getByText(/password reset successfully|verification successful|identity confirmed/i));

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
    // Wait for the UI modal to transition to the OTP input screen
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

    if (otpInputs.length >= otpCode.length) {
      const startIndex = otpInputs.length - otpCode.length;
      for (let i = 0; i < otpCode.length; i++) {
        await otpInputs[startIndex + i].focus();
        await otpInputs[startIndex + i].pressSequentially(otpCode[i], { delay: 50 });
      }
    } else if (otpInputs.length > 0) {
      await otpInputs[0].fill(otpCode);
    }
  }

  /**
   * Enters the OTP, clicks "Verify Code", and completes the password reset flow
   */
  async completePasswordReset(otpCode: string, newPassword?: string) {
    // In-step retry: Re-attempts typing OTP locally if UI button is not enabled yet
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

    // Fill new password if password reset inputs follow
    if (newPassword && (await this.newPasswordInput.isVisible({ timeout: 3000 }).catch(() => false))) {
      await this.newPasswordInput.fill(newPassword);
      if (await this.confirmPasswordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.confirmPasswordInput.fill(newPassword);
      }
      await this.page.getByRole('button', { name: /submit|reset|confirm/i }).first().click();
    }
  }

  /**
   * Asserts that the verification or password reset success message is visible
   */
  async verifyPasswordResetSuccess() {
    await expect(this.successMessage.first()).toBeVisible({ timeout: 10000 });
  }
}
