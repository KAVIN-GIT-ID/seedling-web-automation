import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { EmailService } from '../../services/email/EmailService';
import { EmailSummaryReporter } from '../../utils/EmailSummaryReporter';
import { env } from '../config/env';

// Clear pre-existing browser context/cookies for unauthenticated forgot-password test
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Email OTP & Forgot Password Verification Flow @email @auth', () => {
  let loginPage: LoginPage;
  let forgotPasswordPage: ForgotPasswordPage;
  let emailService: EmailService;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    loginPage = new LoginPage(page);
    forgotPasswordPage = new ForgotPasswordPage(page);
    emailService = new EmailService();
  });

  test('should trigger forgot password, receive real-time email OTP, and complete reset flow', async ({ page }) => {
    const testEmail = env.TEST_USER_EMAIL;
    const requestStartTime = new Date();

    // 1. Navigate to application & open Login Modal
    await loginPage.goto();
    await loginPage.acceptCookies();
    await loginPage.openSignInForm();

    // 2. Click "Forgot Password"
    await forgotPasswordPage.clickForgotPassword();

    // 3. Request OTP for user email
    console.log(`🚀 [Test] Requesting OTP for email: ${testEmail}`);
    await forgotPasswordPage.requestOtp(testEmail);

    // 4. Connect to IMAP Mailbox & wait for Real-Time Email in inbox
    console.log(`⏳ [Test] Listening for real-time OTP email arrival...`);
    const receivedEmail = await emailService.waitForEmail({
      recipient: testEmail,
      subjectPattern: /otp|verification|password/i,
      sinceDate: requestStartTime,
    });

    // 5. Assert Email delivery and metadata
    expect(receivedEmail.to.toLowerCase()).toContain(testEmail.toLowerCase());
    expect(receivedEmail.subject).toBeTruthy();
    expect(receivedEmail.text || receivedEmail.html).toBeTruthy();
    console.log(`📩 [Test] Real-time email received! Subject: "${receivedEmail.subject}"`);

    // 6. Extract OTP code from email content
    const otpCode = emailService.extractOtp(receivedEmail.text || receivedEmail.html);
    expect(otpCode).toMatch(/^\d{4,6}$/);
    console.log(`🔑 [Test] Successfully extracted OTP code: ${otpCode}`);

    // 7. Generate Full HTML Email Summary Report
    EmailSummaryReporter.generateReport({
      testName: 'Forgot Password OTP Verification',
      email: receivedEmail,
      otpCode,
    });

    // 8. Enter OTP in UI & complete password reset
    const newPassword = 'NewSecurePassword123!';
    await forgotPasswordPage.completePasswordReset(otpCode, newPassword);

    // 9. Confirm flow worked
    console.log(`✅ [Test] Verifying password reset success on UI`);
    const isSuccessVisible = await forgotPasswordPage.successMessage.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (isSuccessVisible) {
      await forgotPasswordPage.verifyPasswordResetSuccess();
    } else {
      await expect(page).not.toHaveURL(/forgot-password|reset-password/);
    }
  });
});
