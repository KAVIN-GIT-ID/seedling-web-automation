import { test } from '@playwright/test';
import { SearchPage } from '../../../pages/SearchPage';
import { charitySearchCases } from '../../utils/searchdata';

test.describe('Guest - Charity Search @prod', () => {
  for (const searchCase of charitySearchCases) {
    test(`Search and view "${searchCase.query}"`, async ({ page }) => {
      const searchPage = new SearchPage(page);

      await page.goto('/');
      await searchPage.dismissContinueDialogIfPresent();
      await searchPage.openSearchMenu();
      await searchPage.searchFor(searchCase.query);
      await searchPage.openCharitiesTab();
      await searchPage.openResultByHeading(searchCase.headingName);

      await searchPage.verifyCharityDetails({
        descriptionSnippet: searchCase.descriptionSnippet,
        addressLine1: searchCase.addressLine1,
        addressLine2: searchCase.addressLine2,
        einSnippet: searchCase.einSnippet,
      });
    });
  }
});