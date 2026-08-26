import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignUpPage extends BasePage {
  readonly continueButton          = this.page.getByRole('button', { name: 'Continue' });
  readonly signInMenuItem          = this.page.getByRole('menuitem', { name: 'Sign In' });
  readonly signUpLink              = this.page.getByRole('link', { name: 'Sign Up' }).or(this.page.getByRole('link', { name: /sign\s*up/i }));
  readonly signUpWithEmailPhoneBtn = this.page.getByRole('button', { name: 'Sign Up with Email/Phone' });

  readonly salutationMr            = this.page.getByRole('button', { name: 'Mr.', exact: true });
  readonly salutationMrs           = this.page.getByRole('button', { name: 'Mrs.', exact: true });
  readonly salutationMs            = this.page.getByRole('button', { name: 'Ms.', exact: true });
  readonly salutationMx            = this.page.getByRole('button', { name: 'Mx.', exact: true });
  readonly salutationDr            = this.page.getByRole('button', { name: 'Dr.', exact: true });
  readonly salutationProf          = this.page.getByRole('button', { name: 'Prof.', exact: true });

  readonly fullNameInput           = this.page.getByRole('textbox', { name: 'Full Name*' });
  readonly dobMonthSelect          = this.page.getByRole('combobox').first();
  readonly dobDaySelect            = this.page.getByRole('combobox').nth(1);
  readonly dobYearSelect           = this.page.getByRole('combobox').nth(2);
  readonly emailOrPhoneInput       = this.page.getByRole('textbox', { name: 'Email or Phone Number*' });
  readonly passwordInput           = this.page.getByRole('textbox', { name: 'Password*' });
  readonly termsCheckbox           = this.page.getByRole('checkbox', { name: 'By continuing, you agree to' });
  readonly signUpButton            = this.page.getByRole('button', { name: 'Sign Up', exact: true });

  readonly fullNameFormatError     = this.page.getByText('Invalid format', { exact: true });
  readonly emailFormatError        = this.page.getByText('Invalid email format', { exact: true });
  readonly emailAlreadyExistsError = this.page.getByText(/Failed to register! Email is/i);
  readonly passwordMinLengthError  = this.page.getByText('Must be at least 8 characters', { exact: true });

  readonly ruleAtLeast8Chars       = this.page.getByText(/At least 8 characters/i);
  readonly ruleUppercaseLetter     = this.page.getByText(/1 upper\s*case letter/i);
  readonly ruleNumber              = this.page.getByText(/1 number/i);
  readonly ruleSpecialChar         = this.page.getByText(/1 special character/i);

  readonly otpModalHeader          = this.page.getByRole('heading', { name: 'Confirm Your Identity' });
  readonly otpModalDescription     = this.page.getByText(/To ensure your account is secure, we need to confirm your identity/i);
  readonly otpCodeBox0             = this.page.locator('#code-0');
  readonly otpCodeBox1             = this.page.locator('#code-1');
  readonly otpCodeBox2             = this.page.locator('#code-2');
  readonly otpCodeBox3             = this.page.locator('#code-3');
  readonly verifyCodeButton        = this.page.getByRole('button', { name: 'Verify Code' });
  readonly resendCodeLink          = this.page.getByText('Resend Code');
  readonly cancelButton         = this.page.getByRole('button', { name: 'Cancel' });

  constructor(page: Page) {
    super(page);
  }

  async openSignUpForm() {
    await this.navigate('/');
    if (await this.continueButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.continueButton.click();
    }
    await this.signInMenuItem.click();
    await this.signUpLink.click();
    await this.signUpWithEmailPhoneBtn.click();
    await this.fullNameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  getSalutationButton(salutation: 'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | 'Dr.' | 'Prof.') {
    return this.page.getByRole('button', { name: salutation, exact: true });
  }

  async selectSalutation(salutation: 'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | 'Dr.' | 'Prof.' = 'Mr.') {
    const salutationBtn = this.getSalutationButton(salutation);
    await salutationBtn.click();
  }

  async fillFullName(name: string) {
    await this.fullNameInput.click();
    await this.fullNameInput.fill(name);
  }

  async selectDateOfBirth(monthIndexOrValue: string, dayIndexOrValue: string, yearValue: string) {
    await this.dobMonthSelect.selectOption(monthIndexOrValue);
    await this.dobDaySelect.selectOption(dayIndexOrValue);
    await this.dobYearSelect.selectOption(yearValue);
  }

  async fillEmailOrPhone(emailOrPhone: string) {
    await this.emailOrPhoneInput.click();
    await this.emailOrPhoneInput.fill(emailOrPhone);
  }

  async fillPassword(password: string) {
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
  }

  async setTermsCheckbox(check: boolean = true) {
    const isChecked = await this.termsCheckbox.isChecked();
    if (isChecked !== check) {
      await this.termsCheckbox.click();
    }
  }

  async submitSignUp() {
    await this.signUpButton.click();
  }

  async fillForm(details: {
    salutation?: 'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | 'Dr.' | 'Prof.';
    fullName: string;
    dob?: { month: string; day: string; year: string };
    email: string;
    password: string;
    agreeTerms?: boolean;
  }) {
    if (details.salutation) {
      await this.selectSalutation(details.salutation);
    }
    await this.fillFullName(details.fullName);
    if (details.dob) {
      await this.selectDateOfBirth(details.dob.month, details.dob.day, details.dob.year);
    }
    await this.fillEmailOrPhone(details.email);
    await this.fillPassword(details.password);
    if (details.agreeTerms !== false) {
      await this.setTermsCheckbox(true);
    }
  }

  async verifyOtpModalVisible() {
    await expect(this.otpModalHeader).toBeVisible({ timeout: 15000 });
    await expect(this.otpModalDescription).toBeVisible();
    await expect(this.otpCodeBox0).toBeVisible();
    await expect(this.otpCodeBox1).toBeVisible();
    await expect(this.otpCodeBox2).toBeVisible();
    await expect(this.otpCodeBox3).toBeVisible();
    await expect(this.verifyCodeButton).toBeVisible();
  }
}
