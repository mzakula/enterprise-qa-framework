const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');

// Positive and negative coverage for login workflows.
// This file validates both authenticated storage state reuse and explicit login error handling.
test.describe('Login flow', () => {
  test('reuses authenticated storage state and lands on inventory page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // A fresh page with configured storageState should open the inventory page directly.
    await loginPage.navigateToInventory();

    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('rejects invalid credentials on a fresh unauthenticated session', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('invalid_user', 'wrong_password');

    await expect(page.locator(loginPage.errorMessage)).toContainText(/Epic sadface/i);

    await context.close();
  });
});
