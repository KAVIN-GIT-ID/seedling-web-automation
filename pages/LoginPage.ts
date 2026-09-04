import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Locators as readonly properties
  private readonly signInMenuItem    = this.page.getByRole('menuitem', { name: 'Sign In' });
  private readonly emailInput        = this.page.getByRole('textbox', { name: 'Email or Phone Number*' });
  private readonly passwordInput     = this.page.getByRole('textbox', { name: 'Password*' });
  private readonly signInButton      = this.page.getByRole('button', { name: 'Sign In' });
  private readonly continueButton    = this.page.getByRole('button', { name: 'Continue' });
  private readonly errorMessage      = this.page.locator(
    '[role="dialog"], [role="alert"], .alert, .error-message, .toast-error, .text-danger, .ant-notification-notice-error, .swal2-modal, [aria-modal="true"]'
  ).first();

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/');
  }

  async acceptCookies() {
    if (await this.continueButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.continueButton.click().catch(() => {});
    }
  }

  async openSignInForm() {
    if (await this.signInMenuItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.signInMenuItem.click();
    }
  }

  async fillCredentials(email: string, password: string) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.signInButton.click();
  }

  // High-level action — use this in most tests
  async login(email: string, password: string) {
    await this.goto();
    await this.acceptCookies();
    await this.openSignInForm();
    await this.fillCredentials(email, password);
    await this.submit();
    await this.waitForPageLoad();

    const err = await this.getErrorMessage(3000);
    if (err) {
      throw new Error(`Login failed with UI error: ${err}`);
    }
  }

  async getErrorMessage(timeout = 15000): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout });
      const text = await this.errorMessage.textContent();
      return text?.trim() ?? null;
    } catch {
      const fallback = this.page.getByText(/invalid credentials|wrong password|incorrect/i).first();
      if (await fallback.isVisible({ timeout: 2000 }).catch(() => false)) {
        return (await fallback.textContent())?.trim() ?? null;
      }
      return null;
    }
  }
}