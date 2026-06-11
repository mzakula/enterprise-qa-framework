const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');

// Sanity check for the web UI surface: ensures the app entrypoint renders correctly.
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
