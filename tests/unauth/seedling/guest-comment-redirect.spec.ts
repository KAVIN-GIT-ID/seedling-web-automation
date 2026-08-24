import { test, expect } from '@playwright/test';
import { SeedlingCommentPage } from '../../../pages/SeedlingCommentPage';
import { env } from '../../config/env';
import { seedlingTestData } from '../../utils/seedlingdata';

test.describe('Guest Comment Flow - Sign In & Auto Redirect @qa @prod', () => {
  test('unregistered user attempts comment/interaction, signs in, redirects back, and posts comment', async ({ page }) => {
    const commentPage = new SeedlingCommentPage(page);
    const commentText = `Automated comment - ${Date.now()}`;
    const seedlingTitle = seedlingTestData.title || 'Seedling Full Flow';

    test.setTimeout(180000); // 3 minutes timeout for scrolling feed & flow

    // 1. Navigate to home page as unauthenticated guest
    await page.goto('/');
    await commentPage.dismissContinueDialogIfPresent();

    // 2. Scroll video feed on home until seedling title is found, then open comments section
    await commentPage.findAndOpenSeedlingComments(seedlingTitle);

    // 3. Trigger authentication prompt (unregistered user tries to interact)
    await commentPage.triggerAuthPrompt();

    // 4. Fill credentials and sign in
    await commentPage.login(env.TEST_USER_EMAIL, env.TEST_USER_PASS);

    // 5. Verify auto-redirect returned to the seedling details page
    await expect(page).not.toHaveURL(/sign-in|login/);

    // 6. Post text comment now that user is signed in
    await commentPage.postComment(commentText);

    // 7. Verify comment has been submitted / posted successfully
    await commentPage.verifyCommentPosted(commentText);
  });
});
