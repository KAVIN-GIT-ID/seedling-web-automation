import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgotPasswordPage extends BasePage {
  // Locators
  readonly forgotPasswordLink  = this.page.getByText(/forgot.*password/i).or(this.page.getByRole('link', { name: /forgot.*password/i }));
  readonly emailInput          = this.page.getByRole('textbox', { name: /email/i }).or(this.page.locator('input[type="email"]'));
  readonly sendOtpButton       = this.page.getByRole('button', { name: 'Verify', exact: true }).or(this.page.getByRole('button', { name: /send otp|reset|continue/i }));
  readonly otpInput            = this.page.getByRole('textbox', { name: /otp|code|verification/i }).or(this.page.locator('input[name="otp"]'));
  readonly verifyCodeButton     = this.page.getByRole('button', { name: /verify code/i });
  readonly newPasswordInput    = this.page.locator('input[name="newPassword"], input[placeholder*="New Password"]');
  readonly confirmPasswordInput= this.page.locator('input[name="confirmPassword"], input[placeholder*="Confirm Password"]');
  readonly successMessage      = this.page.getByRole('alert').or(this.page.getByText(/password reset successfully|verification successful|identity confirmed/i));

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
    await this.emailInput.fill(email);
    await this.sendOtpButton.first().click();
  }

  /**
   * Fills the extracted OTP code into the UI 4-digit input fields
   */
  async enterOtp(otpCode: string) {
    // Collect all currently visible inputs on the modal screen
    const allInputs = await this.page.locator('input').all();
    const visibleInputs: Locator[] = [];
    for (const inp of allInputs) {
      if (await inp.isVisible()) {
        visibleInputs.push(inp);
      }
    }

    console.log(`🔍 [ForgotPasswordPage] Found ${visibleInputs.length} visible input field(s) for OTP code.`);

    if (visibleInputs.length >= otpCode.length) {
      // The last N visible inputs correspond to the OTP digit boxes
      const startIndex = visibleInputs.length - otpCode.length;
      for (let i = 0; i < otpCode.length; i++) {
        const input = visibleInputs[startIndex + i];
        await input.focus();
        await input.pressSequentially(otpCode[i], { delay: 50 });
      }
    } else if (visibleInputs.length > 0) {
      await visibleInputs[0].fill(otpCode);
    }
  }

  /**
   * Enters the OTP, clicks "Verify Code", and completes the password reset flow
   */
  async completePasswordReset(otpCode: string, newPassword?: string) {
    await this.enterOtp(otpCode);

    // Wait briefly for UI reactivity
    await this.page.waitForTimeout(500);

    // Click "Verify Code" button when enabled
    await expect(this.verifyCodeButton.first()).toBeEnabled({ timeout: 10000 });
    await this.verifyCodeButton.first().click();

    // If a new password step follows, enter the new password
    if (await this.newPasswordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      if (newPassword) {
        await this.newPasswordInput.fill(newPassword);
        if (await this.confirmPasswordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await this.confirmPasswordInput.fill(newPassword);
        }
        await this.page.getByRole('button', { name: /submit|reset|confirm/i }).first().click();
      }
    }
  }

  /**
   * Asserts that the verification or password reset success alert/modal is visible
   */
  async verifyPasswordResetSuccess() {
    await expect(this.successMessage.first()).toBeVisible({ timeout: 10000 });
  }
}
