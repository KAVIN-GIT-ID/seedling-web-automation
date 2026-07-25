import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // Locators as readonly properties
  private readonly signInMenuItem    = this.page.getByRole('menuitem', { name: 'Sign In' });
  private readonly emailInput        = this.page.getByRole('textbox', { name: 'Email or Phone Number*' });
  private readonly passwordInput     = this.page.getByRole('textbox', { name: 'Password*' });
  private readonly signInButton      = this.page.getByRole('button', { name: 'Sign In' });
  private readonly continueButton    = this.page.getByRole('button', { name: 'Continue' });
  private readonly errorMessage      = this.page.getByRole('alert');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/');
  }

  async acceptCookies() {
    await this.continueButton.click();
  }

  async openSignInForm() {
    await this.signInMenuItem.click();
  }

  async fillCredentials(email: string, password: string) {
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
  }

  async getErrorMessage(): Promise<string | null> {
    return this.errorMessage.textContent();
  }
}