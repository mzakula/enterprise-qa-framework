const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');

// E2E regression coverage for the checkout path.
// Prioritizes the core conversion funnel and verifies order completion.
test('Complete purchase flow', async ({ page }) => {

  const loginPage = new LoginPage(page);

  // Preconditions: app loads and user is authenticated before starting purchase flow.
  await loginPage.navigate();
  await loginPage.login('standard_user', 'secret_sauce');

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

  // Add a product to cart and walk through the checkout screens.
  await page.click('.shopping_cart_link');

  await page.click('[data-test="checkout"]');

  await page.fill('[data-test="firstName"]', 'John');
  await page.fill('[data-test="lastName"]', 'Doe');
  await page.fill('[data-test="postalCode"]', '10000');

  await page.click('[data-test="continue"]');
  await page.click('[data-test="finish"]');

  // Verify the success confirmation to ensure the order completed successfully.
  await expect(page.locator('.complete-header'))
    .toContainText('Thank you for your order');
});