import * as fs from 'fs';
import * as path from 'path';
import { ReceivedEmail } from '../services/email/EmailService';

export class EmailSummaryReporter {
  /**
   * Saves a formatted HTML report summarizing the received email content, OTP, and test metadata.
   */
  static generateReport(options: {
    testName: string;
    email: ReceivedEmail;
    otpCode: string;
    videoPath?: string;
  }) {
    const reportDir = path.resolve(process.cwd(), 'playwright-report');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email OTP Verification Summary - ${options.testName}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding: 30px; }
    .header { background: #2d8a56; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .status-badge { display: inline-block; background: #22c55e; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; }
    .otp-box { background: #eefbf3; border: 2px dashed #22c55e; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 32px; font-weight: bold; color: #15803d; letter-spacing: 6px; }
    .section-title { border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; color: #1f2937; margin-top: 25px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .meta-table td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
    .meta-table td.label { font-weight: bold; width: 30%; color: #4b5563; }
    .email-body { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 15px; font-family: monospace; white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Seedling Social Email OTP Test Report</h2>
      <span class="status-badge">TEST PASSED</span>
    </div>

    <div class="otp-box">
      <div>Extracted Real-Time OTP Code:</div>
      <div class="otp-code">${options.otpCode}</div>
    </div>

    <h3 class="section-title">📩 Received Email Metadata</h3>
    <table class="meta-table">
      <tr><td class="label">Subject:</td><td>${options.email.subject}</td></tr>
      <tr><td class="label">From:</td><td>${options.email.from}</td></tr>
      <tr><td class="label">To (Recipient):</td><td>${options.email.to}</td></tr>
      <tr><td class="label">Received Date:</td><td>${new Date(options.email.date).toLocaleString()}</td></tr>
    </table>

    <h3 class="section-title">📄 Full Email Body Content</h3>
    <div class="email-body">${options.email.text || options.email.html}</div>
  </div>
</body>
</html>`;

    const outputPath = path.join(reportDir, 'email-otp-summary.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');
    console.log(`📊 [EmailSummaryReporter] Saved HTML email report to: ${outputPath}`);
  }
}
