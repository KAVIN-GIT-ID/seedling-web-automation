import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgotPasswordPage extends BasePage {
  // Locators matching exact application DOM from user recording
  readonly forgotPasswordLink   = this.page.getByRole('link', { name: 'Forgot your password?' }).or(this.page.getByText(/forgot.*password/i));
  readonly emailInput           = this.page.getByRole('textbox', { name: 'Email or phone number' }).or(this.page.locator('input[type="email"]'));
  readonly sendOtpButton        = this.page.getByRole('button', { name: 'Verify', exact: true });
  readonly verifyCodeButton      = this.page.getByRole('button', { name: 'Verify Code', exact: true });
  
  readonly newPasswordInput     = this.page.getByRole('textbox', { name: /new password/i })
    .or(this.page.locator('input[placeholder*="New Password"]'))
    .or(this.page.locator('input[type="password"]').first())
    .or(this.page.locator('input:not([id*="code"]):not([type="email"])'));

  readonly confirmPasswordInput = this.page.getByRole('textbox', { name: /confirm password/i })
    .or(this.page.locator('input[placeholder*="Confirm Password"]'))
    .or(this.page.locator('input[type="password"]').nth(1));

  readonly resetPasswordButton  = this.page.getByRole('button', { name: 'Reset Password' }).or(this.page.getByRole('button', { name: /reset password/i }));
  readonly successMessage       = this.page.getByText('Your password has been reset').or(this.page.getByRole('alert'));
  readonly okButton             = this.page.getByRole('button', { name: 'OK', exact: true });

  constructor(page: Page) {
    super(page);
  }

  /**
   * Clicks "Forgot your password?" on sign-in form
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.first().click();
  }

  /**
   * Fills user email and clicks Verify to request OTP
   */
  async requestOtp(email: string) {
    await this.emailInput.fill(email);
    await this.sendOtpButton.click();
  }

  /**
   * Fills 4-digit OTP code directly into #code-0, #code-1, #code-2, #code-3
   */
  async enterOtp(otpCode: string) {
    await this.page.waitForSelector('#code-0', { state: 'visible', timeout: 10000 });

    const digits = otpCode.slice(0, 4);

    await this.page.locator('#code-0').fill(digits[0]);
    await this.page.locator('#code-1').fill(digits[1]);
    await this.page.locator('#code-2').fill(digits[2]);
    await this.page.locator('#code-3').fill(digits[3]);
  }

  /**
   * Enters OTP, clicks Verify Code, fills new password, and clicks Reset Password
   */
  async completePasswordReset(otpCode: string, newPassword?: string) {
    // 1. Fill OTP into #code-0..3
    await this.enterOtp(otpCode);
    await this.page.waitForTimeout(500);

    // 2. Click Verify Code
    await expect(this.verifyCodeButton).toBeEnabled({ timeout: 5000 });
    await this.verifyCodeButton.click();

    // 3. Wait for Next Screen (New Password) after OTP API verification
    if (newPassword) {
      const passInput = this.newPasswordInput.first();
      await passInput.waitFor({ state: 'visible', timeout: 15000 });
      await passInput.click();
      await passInput.fill(newPassword);

      const confirmPassInput = this.confirmPasswordInput.first();
      if (await confirmPassInput.isVisible().catch(() => false)) {
        await confirmPassInput.click();
        await confirmPassInput.fill(newPassword);
      }

      // 4. Click Reset Password
      await expect(this.resetPasswordButton).toBeEnabled({ timeout: 5000 });
      await this.resetPasswordButton.click();
    }
  }

  /**
   * Asserts password reset success popup and clicks OK
   */
  async verifyPasswordResetSuccess() {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
    if (await this.okButton.isVisible().catch(() => false)) {
      await this.okButton.click();
    }
  }
}
