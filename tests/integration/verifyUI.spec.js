const { test, expect } = require('@playwright/test');

test.describe('Integration UI sanity checks', () => {
  test('should load the application login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#login-button')).toBeVisible();
  });
});
