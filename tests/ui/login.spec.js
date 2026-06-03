const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');

test.describe('Login flow', () => {
  test('logs in with valid standard user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });
});
