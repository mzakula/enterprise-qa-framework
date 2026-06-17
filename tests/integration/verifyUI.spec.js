const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');

// Integration-tier sanity check — verifies the app UI surface is reachable
// from the same runner environment as the DB and API integration tests.
// This is distinct from tests/ui/login.spec.js, which tests login interaction
// logic. This test only confirms the page loads and the login button is visible,
// acting as a "is the app up?" check for the integration test environment.
test.describe('Integration UI sanity checks', () => {
  test('should load the application login page', async ({ browser }) => {
    // Use a fresh context without preloaded auth state for login page validation.
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await expect(page.locator(loginPage.loginButton)).toBeVisible();

    await context.close();
  });
});
