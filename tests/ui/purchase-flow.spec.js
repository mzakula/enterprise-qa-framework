const { test, expect } = require('../fixtures/base.fixture');
const InventoryPage = require('../../pages/InventoryPage');
const CartPage = require('../../pages/CartPage');
const CheckoutPage = require('../../pages/CheckoutPage');

/**
 * Purchase flow — E2E regression suite
 *
 * Scope:
 *   Covers the complete happy-path checkout journey: inventory → cart →
 *   checkout form → order review → order confirmation.
 *
 * Auth:
 *   Relies on storageState preloaded by global-setup.js. No login step is
 *   performed inside this suite — the test starts as an authenticated user.
 *   If global-setup fails, this entire suite will fail at the first navigation.
 *
 * Reporting:
 *   Each logical phase is wrapped in test.step(). Steps appear as a named,
 *   collapsible tree in Allure and Playwright HTML reports, making it
 *   immediately clear which phase of the checkout broke without reading logs.
 *
 * URL assertions:
 *   After each navigation step an explicit toHaveURL() assertion is added.
 *   This acts as a checkpoint — if the app redirects unexpectedly (e.g. cart
 *   empties, session expires), the failure message identifies the exact step
 *   rather than surfacing a confusing "element not found" error later in the flow.
 *
 * Failure handling:
 *   base.fixture.js captures a full-page screenshot automatically on failure.
 *   Combined with trace-on-first-retry (playwright.config.js), any flaky
 *   failure can be reproduced step-by-step via the Playwright trace viewer.
 */
test.describe('Purchase flow', () => {

  test('completes a full purchase from inventory to order confirmation', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1 — Land on inventory and add a product to the cart.
    // InventoryPage.navigate() waits for networkidle before returning,
    // so the product list is fully rendered before addProductToCart runs.
    await test.step('Navigate to inventory and add product to cart', async () => {
      await inventoryPage.navigate();
      await inventoryPage.addProductToCart('sauce-labs-backpack');
    });

    // Step 2 — Open cart and confirm the route changed to /cart.html.
    // The URL assertion here guards against a silent failure where the cart
    // icon click is intercepted but the navigation does not complete.
    await test.step('Open cart and verify cart page loaded', async () => {
      await inventoryPage.openCart();
      await expect(page).toHaveURL(/cart.html/);
    });

    // Step 3 — Initiate checkout and confirm the form (step one) is loaded.
    // checkout-step-one contains the customer info form; confirming this URL
    // means the app accepted the cart state and advanced to checkout entry.
    await test.step('Start checkout and verify step-one page loaded', async () => {
      await cartPage.startCheckout();
      await expect(page).toHaveURL(/checkout-step-one/);
    });

    // Step 4 — Fill customer info and advance to the order summary page.
    // fillCustomerInfo() submits the form internally by clicking Continue.
    // The postal code '10000' is valid for Sauce Demo's non-validating form.
    // checkout-step-two is the order review page — confirming this URL means
    // the form was accepted and summary data rendered correctly.
    await test.step('Fill customer info and proceed to step two', async () => {
      await checkoutPage.fillCustomerInfo('John', 'Doe', '10000');
      await expect(page).toHaveURL(/checkout-step-two/);
    });

    // Step 5 — Finish the order and assert the confirmation message.
    // expectOrderComplete() asserts the ".complete-header" element contains
    // "Thank you for your order" — the final business-level outcome assertion.
    // If this passes, the full purchase flow is verified end-to-end.
    await test.step('Finish order and verify confirmation', async () => {
      await checkoutPage.finishOrder();
      await checkoutPage.expectOrderComplete();
    });
  });

});