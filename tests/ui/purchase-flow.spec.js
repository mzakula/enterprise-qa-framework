const { test } = require('@playwright/test');
const InventoryPage = require('../../pages/InventoryPage');
const CartPage = require('../../pages/CartPage');
const CheckoutPage = require('../../pages/CheckoutPage');

// E2E regression coverage for the checkout path.
// This test assumes Playwright storageState is preloaded with valid auth.
test('Complete purchase flow', async ({ page }) => {

  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Navigate directly into the inventory experience and avoid redundant login.
  await inventoryPage.navigate();
  await inventoryPage.addProductToCart('sauce-labs-backpack');
  await inventoryPage.openCart();

  // Walk through checkout using reusable page object abstractions.
  await cartPage.startCheckout();
  await checkoutPage.fillCustomerInfo('John', 'Doe', '10000');
  await checkoutPage.finishOrder();

  await checkoutPage.expectOrderComplete();
});