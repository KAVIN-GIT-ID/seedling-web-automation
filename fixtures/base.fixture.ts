import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { SeedlingPage } from '../pages/SeedlingPage';
import { DonationPage } from '../pages/DonationPage';
import { DashboardPage } from '../pages/DashboardPage';

type MyFixtures = {
  loginPage:    LoginPage;
  homePage:     HomePage;
  seedlingPage: SeedlingPage;
  donationPage: DonationPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<MyFixtures>({
  loginPage:    async ({ page }, use) => use(new LoginPage(page)),
  homePage:     async ({ page }, use) => use(new HomePage(page)),
  seedlingPage: async ({ page }, use) => use(new SeedlingPage(page)),
  donationPage: async ({ page }, use) => use(new DonationPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
});

export { expect } from '@playwright/test';