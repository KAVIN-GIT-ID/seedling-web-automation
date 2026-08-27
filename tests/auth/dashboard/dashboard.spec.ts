import { test, expect } from '../../../fixtures';

test.describe('Dashboard Home Video Feed Flow', () => {

  test('verifies home video feed scrolling, captures screenshots, and confirms end page', async ({ dashboardPage }, testInfo) => {
    test.setTimeout(120000);

    await dashboardPage.goto();
    await dashboardPage.acceptCookiesIfPresent();
    await dashboardPage.scrollFeedAndCapture(testInfo);
  });

});
