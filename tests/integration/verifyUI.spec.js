const { test, expect } = require('@playwright/test');

// Sanity check for the web UI surface: ensures the app entrypoint renders correctly.
test.describe('Integration UI sanity checks', () => {
  test('should load the application login page', async ({ page }) => {
    // The login page is the entrypoint for most user journeys, so it must be reachable.
    await page.goto('/');
    await expect(page.locator('#login-button')).toBeVisible();
  });
});
