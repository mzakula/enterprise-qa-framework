const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');

// Positive path smoke test for the login workflow.
// This is a high-value gate: if authentication fails, most business flows are blocked.
test.describe('Login flow', () => {
  test('logs in with valid standard user', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Preconditions: application is reachable and the standard_user fixture exists.
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');

    // Postcondition: successful redirect to inventory and visible product list.
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });
});
