const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

async function sendEmailReport() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const user = process.env.EMAIL_USERNAME || process.env.TEST_USER_EMAIL || 'kavinap@uit.ac.in';
  const pass = process.env.EMAIL_PASSWORD || process.env.IMAP_PASS || 'yewoyvymmbjqxtus';
  const to = process.env.TL_EMAIL || process.env.TEST_USER_EMAIL || 'kavinap@uit.ac.in';
  const status = (process.env.JOB_STATUS || 'SUCCESS').toUpperCase();
  const component = process.env.TEST_COMPONENT || 'all';

  const htmlFilePath = path.resolve('email-body.html');
  let htmlContent = '<p>Test run completed. No report body generated.</p>';
  if (fs.existsSync(htmlFilePath)) {
    htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  } else {
    console.warn(`[send-email] Warning: ${htmlFilePath} not found, sending fallback content.`);
  }

  console.log(`[send-email] Connecting to ${host}:${port} as ${user}...`);

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: {
      user: user,
      pass: pass
    }
  });

  const mailOptions = {
    from: `Seedling Automation <${user}>`,
    to: to,
    subject: `Playwright QA Run ${status} - Component: ${component}`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [send-email] Email sent successfully! MessageId: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ [send-email] Error sending email:`, error);
    process.exit(1);
  }
}

sendEmailReport();
