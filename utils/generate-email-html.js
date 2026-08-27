const fs = require('fs');
const path = require('path');

function generateEmailHtml() {
  const status = process.env.JOB_STATUS || 'success';
  const envName = (process.env.TEST_ENV || 'QA').toUpperCase();
  const component = process.env.TEST_COMPONENT || 'all';
  const reportUrl = process.env.REPORT_URL || '#';
  const runUrl = process.env.RUN_URL || '#';
  const logFilePath = process.env.LOG_FILE_PATH || 'test-output.log';

  let highlights = '';
  let failures = [];

  if (fs.existsSync(logFilePath)) {
    const logContent = fs.readFileSync(logFilePath, 'utf8');

    // Extract OTP / Real-time highlights
    const highlightLines = logContent.split('\n').filter(line => 
      /Real-time email|Extracted OTP code|Verified OTP/i.test(line)
    );
    if (highlightLines.length > 0) {
      highlights = highlightLines.map(l => l.trim()).join('<br>');
    }

    // Extract failure locators if status is not success
    if (status !== 'success') {
      const locatorMatches = logContent.match(/Locator:\s*(.*)/gi) || [];
      const cleanLocators = [...new Set(
        locatorMatches.map(l => l.replace(/\x1B\[[0-9;]*m/g, '').replace(/Locator:\s*/i, '').trim())
      )];

      cleanLocators.forEach(loc => {
        if (loc.includes('getByText')) {
          const match = loc.match(/getByText\(['"]([^'"]+)['"]\)/);
          const val = match ? match[1] : loc;
          failures.push(`Missing text on page: "<strong>${escapeHtml(val)}</strong>"`);
        } else {
          failures.push(`Missing UI element: <code>${escapeHtml(loc)}</code>`);
        }
      });
    }
  }

  let suiteSummaryHtml = '';
  const jsonReportPath = path.resolve('test-results.json');
  if (fs.existsSync(jsonReportPath)) {
    try {
      const reportJson = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
      let rows = [];
      const extractSuites = (suiteList) => {
        suiteList.forEach(suite => {
          if (suite.specs && suite.specs.length > 0) {
            suite.specs.forEach(spec => {
              const file = spec.file ? path.relative(process.cwd(), spec.file) : suite.title;
              const ok = spec.ok;
              const durationMs = spec.tests ? spec.tests.reduce((acc, t) => acc + (t.results ? t.results.reduce((rAcc, r) => rAcc + r.duration, 0) : 0), 0) : 0;
              const durationSec = (durationMs / 1000).toFixed(1) + 's';
              rows.push({ file, ok, durationSec });
            });
          }
          if (suite.suites) {
            extractSuites(suite.suites);
          }
        });
      };

      if (reportJson.suites) {
        extractSuites(reportJson.suites);
      }

      if (rows.length > 0) {
        suiteSummaryHtml = `
        <div style="margin-top: 22px; margin-bottom: 22px;">
          <div class="card-title">📊 Manager Executive Summary — Sequential Execution Order</div>
          <table class="meta-table" style="font-size: 13px; width: 100%;">
            <thead>
              <tr style="background: #F3F4F6; text-align: left;">
                <th style="padding: 10px 14px;">#</th>
                <th style="padding: 10px 14px;">Test File</th>
                <th style="padding: 10px 14px;">Status</th>
                <th style="padding: 10px 14px;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((r, idx) => `
                <tr>
                  <td style="padding: 10px 14px; font-weight: bold; width: 30px;">${idx + 1}</td>
                  <td style="padding: 10px 14px;"><code>${escapeHtml(r.file)}</code></td>
                  <td style="padding: 10px 14px;">
                    <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; background: ${r.ok ? '#E8F5E9' : '#FDECEA'}; color: ${r.ok ? '#2E7D32' : '#C62828'};">
                      ${r.ok ? '✓ PASSED' : '✕ FAILED'}
                    </span>
                  </td>
                  <td style="padding: 10px 14px; color: #6B7280;">${r.durationSec}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `;
      }
    } catch (err) {
      console.error('Could not parse test-results.json:', err);
    }
  }

  const isSuccess = status === 'success';
  const badgeBg = isSuccess ? '#E8F5E9' : '#FDECEA';
  const badgeColor = isSuccess ? '#2E7D32' : '#C62828';
  const badgeText = isSuccess ? '✓ PASSED' : '✕ FAILED';

  const dateOptions = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' };
  const formattedTime = new Date().toLocaleString('en-GB', dateOptions);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playwright Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F4F6F5;
      margin: 0;
      padding: 24px 12px;
      color: #263229;
    }
    .email-container {
      max-width: 620px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
      border: 1px solid #E4E9E5;
    }
    .header {
      background-color: #FFFFFF;
      padding: 28px 28px 22px 28px;
      text-align: center;
      border-bottom: 1px solid #EDEFEC;
    }
    .header-title {
      font-size: 19px;
      font-weight: 700;
      margin: 0 0 14px 0;
      color: #1A1A1A;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 18px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      background-color: ${badgeBg};
      color: ${badgeColor};
      letter-spacing: 0.5px;
    }
    .body-content {
      padding: 28px;
    }
    .intro-text {
      font-size: 15px;
      color: #263229;
      margin: 0 0 22px 0;
      line-height: 1.6;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 22px;
      background-color: #FAFAFA;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #EDEFEC;
    }
    .meta-table td {
      padding: 13px 18px;
      font-size: 14px;
      border-bottom: 1px solid #EDEFEC;
    }
    .meta-table tr:last-child td {
      border-bottom: none;
    }
    .meta-label {
      font-weight: 600;
      color: #6B7280;
      width: 35%;
    }
    .meta-val {
      font-weight: 600;
      color: #1A1A1A;
      word-break: break-all;
    }
    .btn-container {
      margin: 26px 0 6px 0;
      text-align: center;
    }
    .btn-primary {
      display: inline-block;
      background-color: #1A1A1A;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 13px 30px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .btn-secondary {
      display: inline-block;
      color: #4B5563 !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      padding: 8px 16px;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
      background-color: #FFFFFF;
    }
    .card-highlights {
      background-color: #F5F7FA;
      border-left: 4px solid #6B7280;
      border-radius: 8px;
      padding: 18px 20px;
      margin-bottom: 22px;
      font-size: 13px;
      color: #374151;
      line-height: 1.7;
    }
    .card-failures {
      background-color: #FDECEA;
      border-left: 4px solid #C62828;
      border-radius: 8px;
      padding: 18px 20px;
      margin-bottom: 22px;
      font-size: 13px;
      color: #9B3226;
      line-height: 1.7;
    }
    .card-title {
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1A1A1A;
    }
    .failure-list {
      margin: 0;
      padding-left: 20px;
    }
    .failure-list li {
      margin-bottom: 6px;
    }
    .footer {
      background-color: #FAFAFA;
      padding: 20px 28px;
      text-align: center;
      font-size: 12px;
      color: #9CA3AF;
      border-top: 1px solid #EDEFEC;
    }
    .preview-section {
      margin-top: 28px;
    }
    .preview-label {
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6B7280;
      margin-bottom: 10px;
    }
    .preview-frame-wrap {
      border: 1px solid #EDEFEC;
      border-radius: 10px;
      overflow: hidden;
      background-color: #FAFAFA;
    }
    .preview-frame {
      width: 100%;
      height: 480px;
      border: none;
      display: block;
    }
    .preview-note {
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 8px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 18px auto;">
        <tr>
          <td style="vertical-align: middle; padding-right: 8px;">
            <img src="https://playwright.dev/img/playwright-logo.svg" width="28" height="28" alt="Playwright" style="display: block; height: 28px; width: 28px; border: 0;" />
          </td>
          <td style="vertical-align: middle;">
            <span style="font-size: 17px; font-weight: 700; color: #1A1A1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Seedling Web Automation Suite</span>
          </td>
        </tr>
      </table>
      <div class="header-title">Playwright Test Run Report</div>
      <span class="status-badge">${badgeText}</span>
    </div>

    <div class="body-content">
      <p class="intro-text">A Playwright automation run has completed for <strong>${escapeHtml(component)}</strong> on <strong>${envName}</strong>. Details of the run are below.</p>

      <table class="meta-table">
        <tr>
          <td class="meta-label">Environment</td>
          <td class="meta-val">${envName}</td>
        </tr>
        <tr>
          <td class="meta-label">Component / Suite</td>
          <td class="meta-val"><code>${escapeHtml(component)}</code></td>
        </tr>
        <tr>
          <td class="meta-label">Execution Time</td>
          <td class="meta-val">${formattedTime}</td>
        </tr>
      </table>

      ${suiteSummaryHtml}

      ${highlights ? `
      <div class="card-highlights">
        <div class="card-title">⚡ Real-Time Email Delivery Highlights</div>
        <div>${highlights}</div>
      </div>
      ` : ''}

      ${failures.length > 0 ? `
      <div class="card-failures">
        <div class="card-title">❌ Application Issues / Failures Detected</div>
        <ul class="failure-list">
          ${failures.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      ` : (isSuccess ? '' : `
      <div class="card-failures">
        <div class="card-title">❌ Execution Failed</div>
        <div>Test suite failed. Please check the interactive HTML report for detailed breakdown.</div>
      </div>
      `)}

      <div class="btn-container">
        <div>
          <a href="${reportUrl}" target="_blank" class="btn-primary">View Playwright Report</a>
        </div>
        <div style="margin-top: 10px;">
          <a href="${runUrl}" target="_blank" class="btn-secondary">View GitHub Actions Run Log</a>
        </div>
      </div>

      ${reportUrl && reportUrl !== '#' ? `
      <div class="preview-section">
        <div class="preview-label">Report Preview</div>
        <div class="preview-frame-wrap">
          <iframe class="preview-frame" src="${reportUrl}" title="Playwright Report Preview" loading="lazy"></iframe>
        </div>
        <div class="preview-note">If the preview doesn't load, use the "View Playwright Report" button above.</div>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      This is an automated notification from Seedling Social QA Automation.<br>
      © ${new Date().getFullYear()} Seedling Social. All rights reserved.
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('email-body.html', html, 'utf8');
  console.log('Successfully generated email-body.html');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

generateEmailHtml();
