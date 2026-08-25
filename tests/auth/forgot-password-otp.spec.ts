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

  test('should trigger forgot password, receive real-time email OTP, and complete reset flow', async ({ page }, testInfo) => {
    const testEmail = env.TEST_USER_EMAIL;
    const requestStartTime = new Date();

    // 1. Navigate to application & open Login Modal
    await test.step('1. Navigate to application & open Login form', async () => {
      await loginPage.goto();
      await loginPage.acceptCookies();
      await loginPage.openSignInForm();
    });

    // 2. Click "Forgot Password" & request OTP
    await test.step('2. Click Forgot Password & request OTP for user email', async () => {
      await forgotPasswordPage.clickForgotPassword();
      console.log(`🚀 [Test] Requesting OTP for email: ${testEmail}`);
      await forgotPasswordPage.requestOtp(testEmail);
    });

    // 3. Connect to IMAP Mailbox & wait for Real-Time Email
    let receivedEmail: any;
    let otpCode = '';
    await test.step('3. Fetch real-time OTP email from inbox via IMAP', async () => {
      console.log(`⏳ [Test] Listening for real-time OTP email arrival...`);
      receivedEmail = await emailService.waitForEmail({
        recipient: testEmail,
        subjectPattern: /otp|verification|password/i,
        sinceDate: requestStartTime,
      });

      expect(receivedEmail.to.toLowerCase()).toContain(testEmail.toLowerCase());
      expect(receivedEmail.subject).toBeTruthy();
      expect(receivedEmail.text || receivedEmail.html).toBeTruthy();
      console.log(`📩 [Test] Real-time email received! Subject: "${receivedEmail.subject}"`);

      otpCode = emailService.extractOtp(receivedEmail.text || receivedEmail.html);
      expect(otpCode).toMatch(/^\d{4,6}$/);
      console.log(`🔑 [Test] Successfully extracted OTP code: ${otpCode}`);
    });

    // 4. Attach Received Email Proof & OTP directly into Playwright Report (Surge)
    await test.step('4. Attach received email & OTP proof to Playwright Report', async () => {
      // Local standalone HTML report file
      EmailSummaryReporter.generateReport({
        testName: 'Forgot Password OTP Verification',
        email: receivedEmail,
        otpCode,
      });

      // Embed directly into Playwright's HTML Report (published to Surge)
      await testInfo.attach('Received OTP Email Details', {
        body: `====================================================
REAL-TIME OTP EMAIL RECEIVED & VERIFIED
====================================================
Recipient (To): ${receivedEmail.to}
Sender (From):    ${receivedEmail.from}
Subject:          ${receivedEmail.subject}
Date Received:    ${receivedEmail.date}
EXTRACTED OTP:    ${otpCode}

--- EMAIL TEXT BODY ---
${receivedEmail.text || receivedEmail.html}`,
        contentType: 'text/plain',
      });

      if (receivedEmail.html) {
        await testInfo.attach('Received OTP Email HTML Preview', {
          body: `
            <div style="font-family: Arial, sans-serif; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="color: #2563eb; margin-top: 0;">📩 Real-Time OTP Email Evidence</h3>
              <p><strong>Recipient:</strong> ${receivedEmail.to}</p>
              <p><strong>From:</strong> ${receivedEmail.from}</p>
              <p><strong>Subject:</strong> ${receivedEmail.subject}</p>
              <p><strong>Extracted OTP Code:</strong> <span style="font-size: 20px; font-weight: bold; color: #16a34a; background: #dcfce7; padding: 4px 10px; border-radius: 6px; border: 1px solid #86efac;">${otpCode}</span></p>
              <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 15px 0;"/>
              <h4 style="color: #475569;">Email Body:</h4>
              <div>${receivedEmail.html}</div>
            </div>
          `,
          contentType: 'text/html',
        });
      }
    });

    // 5. Enter OTP in UI & complete password reset
    await test.step('5. Enter OTP code in UI and complete password reset', async () => {
      const newPassword = env.TEST_USER_PASS;
      await forgotPasswordPage.completePasswordReset(otpCode, newPassword);
    });

    // 6. Verify success
    await test.step('6. Verify password reset success confirmation in UI', async () => {
      console.log(`✅ [Test] Verifying password reset success on UI`);
      const isSuccessVisible = await forgotPasswordPage.successMessage.first().isVisible({ timeout: 5000 }).catch(() => false);
      if (isSuccessVisible) {
        await forgotPasswordPage.verifyPasswordResetSuccess();
      } else {
        await expect(page).not.toHaveURL(/forgot-password|reset-password/);
      }
      // Pause 1 second so full success screen is recorded in the test video
      await page.waitForTimeout(1000);
    });
  });
});
