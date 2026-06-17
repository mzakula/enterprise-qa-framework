const { test, expect } = require('../fixtures/base.fixture');
const InventoryPage = require('../../pages/InventoryPage');
const CartPage = require('../../pages/CartPage');
const CheckoutPage = require('../../pages/CheckoutPage');

// E2E regression coverage for the full checkout path.
// Uses storageState preloaded by global-setup — no login step needed.
// test.step() blocks appear as named steps in Allure and HTML reports,
// giving a readable audit trail beyond a single pass/fail line.
test.describe('Purchase flow', () => {

  test('completes a full purchase from inventory to order confirmation', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await test.step('Navigate to inventory and add product to cart', async () => {
      await inventoryPage.navigate();
      await inventoryPage.addProductToCart('sauce-labs-backpack');
    });

    await test.step('Open cart and verify cart page loaded', async () => {
      await inventoryPage.openCart();
      await expect(page).toHaveURL(/cart.html/);
    });

    await test.step('Start checkout and verify step-one page loaded', async () => {
      await cartPage.startCheckout();
      await expect(page).toHaveURL(/checkout-step-one/);
    });

    await test.step('Fill customer info and proceed to step two', async () => {
      await checkoutPage.fillCustomerInfo('John', 'Doe', '10000');
      await expect(page).toHaveURL(/checkout-step-two/);
    });

    await test.step('Finish order and verify confirmation', async () => {
      await checkoutPage.finishOrder();
      await checkoutPage.expectOrderComplete();
    });
  });

});