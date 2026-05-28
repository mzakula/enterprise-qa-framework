const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');

test('Complete purchase flow', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.navigate();

  await loginPage.login('standard_user', 'secret_sauce');

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

  await page.click('.shopping_cart_link');

  await page.click('[data-test="checkout"]');

  await page.fill('[data-test="firstName"]', 'John');
  await page.fill('[data-test="lastName"]', 'Doe');
  await page.fill('[data-test="postalCode"]', '10000');

  await page.click('[data-test="continue"]');

  await page.click('[data-test="finish"]');

  await expect(page.locator('.complete-header'))
    .toContainText('Thank you for your order');
});