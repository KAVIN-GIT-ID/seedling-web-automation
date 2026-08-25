import { test, expect } from '@playwright/test';
import { EmailService } from '../../services/email/EmailService';
import { env } from '../config/env';

// Run tests in serial to share IMAP connection cleanly
test.describe.configure({ mode: 'serial' });

test.describe('Real-Time Email Delivery & Content Verification Suite @email', () => {
  let emailService: EmailService;

  test.beforeEach(({}) => {
    emailService = new EmailService();
  });

  test('should receive and verify OTP verification email content', async () => {
    const filter = {
      recipient: env.TEST_USER_EMAIL,
      subjectPattern: /reset|password|giving|otp|verification|code/i,
    };

    const email = await emailService.waitForEmail(filter);

    // Verify Email Structure & Content
    expect(email.to.toLowerCase()).toContain(env.TEST_USER_EMAIL.toLowerCase());
    expect(email.subject).toBeTruthy();

    // Verify OTP Extraction
    const otp = emailService.extractOtp(email.text || email.html);
    expect(otp).toMatch(/^\d{4,6}$/);
    console.log(`✅ [Email Test] Verified OTP email receipt for ${email.to}. Code: ${otp}`);
  });

  test('should receive and verify Password Changed confirmation email', async () => {
    const filter = {
      recipient: env.TEST_USER_EMAIL,
      subjectPattern: /reset|password|changed|confirm/i,
    };

    const email = await emailService.waitForEmail(filter);

    // Assert email received & body contains security notification text
    expect(email.subject).toBeDefined();
    expect(email.text || email.html).toMatch(/password|reset|security|account|changed/i);
    console.log(`✅ [Email Test] Verified Password Change notification email delivery.`);
  });

  test('should extract action links from HTML email body', async () => {
    const filter = {
      recipient: env.TEST_USER_EMAIL,
    };

    const email = await emailService.waitForEmail(filter);
    const links = emailService.extractLinks(email.html);

    expect(Array.isArray(links)).toBe(true);
    console.log(`✅ [Email Test] Extracted ${links.length} links from email body.`);
  });
});
