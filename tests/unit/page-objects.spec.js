const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const CartPage = require('../../pages/CartPage');
const InventoryPage = require('../../pages/InventoryPage');
const CheckoutPage = require('../../pages/CheckoutPage');

// Lightweight mock page that records every interaction for assertion.
function createMockPage() {
  const calls = [];
  const page = {
    calls,
    goto: async (url) => {
      calls.push({ method: 'goto', args: [url] });
    },
    fill: async (selector, value) => {
      calls.push({ method: 'fill', args: [selector, value] });
    },
    click: async (selector) => {
      calls.push({ method: 'click', args: [selector] });
    },
    locator: (selector) => ({
      _selector: selector,
      toBeVisible: async () => {},
      toContainText: async () => {}
    })
  };
  return page;
}

// ---------------------------------------------------------------------------
// LoginPage
// ---------------------------------------------------------------------------
test.describe('LoginPage', () => {
  test('sets correct selectors in constructor', () => {
    const page = createMockPage();
    const loginPage = new LoginPage(page);

    expect(loginPage.usernameInput).toBe('[data-test="username"]');
    expect(loginPage.passwordInput).toBe('[data-test="password"]');
    expect(loginPage.loginButton).toBe('[data-test="login-button"]');
    expect(loginPage.errorMessage).toBe('[data-test="error"]');
  });

  test('navigate() goes to root path', async () => {
    const page = createMockPage();
    const loginPage = new LoginPage(page);

    await loginPage.navigate();

    expect(page.calls).toEqual([{ method: 'goto', args: ['/'] }]);
  });

  test('navigateToInventory() goes to /inventory.html', async () => {
    const page = createMockPage();
    const loginPage = new LoginPage(page);

    await loginPage.navigateToInventory();

    expect(page.calls).toEqual([{ method: 'goto', args: ['/inventory.html'] }]);
  });

  test('login() fills username, password and clicks login button', async () => {
    const page = createMockPage();
    const loginPage = new LoginPage(page);

    await loginPage.login('alice', 'p@ssw0rd');

    expect(page.calls).toEqual([
      { method: 'fill', args: ['[data-test="username"]', 'alice'] },
      { method: 'fill', args: ['[data-test="password"]', 'p@ssw0rd'] },
      { method: 'click', args: ['[data-test="login-button"]'] }
    ]);
  });
});

// ---------------------------------------------------------------------------
// CartPage
// ---------------------------------------------------------------------------
test.describe('CartPage', () => {
  test('sets correct selectors in constructor', () => {
    const page = createMockPage();
    const cartPage = new CartPage(page);

    expect(cartPage.checkoutButton).toBe('[data-test="checkout"]');
  });

  test('startCheckout() clicks the checkout button', async () => {
    const page = createMockPage();
    const cartPage = new CartPage(page);

    await cartPage.startCheckout();

    expect(page.calls).toEqual([
      { method: 'click', args: ['[data-test="checkout"]'] }
    ]);
  });
});

// ---------------------------------------------------------------------------
// InventoryPage
// ---------------------------------------------------------------------------
test.describe('InventoryPage', () => {
  test('sets correct selectors in constructor', () => {
    const page = createMockPage();
    const inventoryPage = new InventoryPage(page);

    expect(inventoryPage.inventoryList).toBe('.inventory_list');
    expect(inventoryPage.cartLink).toBe('.shopping_cart_link');
  });

  test('addProductToCart() clicks the add-to-cart button for the given product', async () => {
    const page = createMockPage();
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addProductToCart('sauce-labs-backpack');

    expect(page.calls).toEqual([
      { method: 'click', args: ['[data-test="add-to-cart-sauce-labs-backpack"]'] }
    ]);
  });

  test('openCart() clicks the cart link', async () => {
    const page = createMockPage();
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.openCart();

    expect(page.calls).toEqual([
      { method: 'click', args: ['.shopping_cart_link'] }
    ]);
  });
});

// ---------------------------------------------------------------------------
// CheckoutPage
// ---------------------------------------------------------------------------
test.describe('CheckoutPage', () => {
  test('sets correct selectors in constructor', () => {
    const page = createMockPage();
    const checkoutPage = new CheckoutPage(page);

    expect(checkoutPage.firstNameField).toBe('[data-test="firstName"]');
    expect(checkoutPage.lastNameField).toBe('[data-test="lastName"]');
    expect(checkoutPage.postalCodeField).toBe('[data-test="postalCode"]');
    expect(checkoutPage.continueButton).toBe('[data-test="continue"]');
    expect(checkoutPage.finishButton).toBe('[data-test="finish"]');
    expect(checkoutPage.completeHeader).toBe('.complete-header');
  });

  test('fillCustomerInfo() fills all fields and clicks continue', async () => {
    const page = createMockPage();
    const checkoutPage = new CheckoutPage(page);

    await checkoutPage.fillCustomerInfo('John', 'Doe', '10000');

    expect(page.calls).toEqual([
      { method: 'fill', args: ['[data-test="firstName"]', 'John'] },
      { method: 'fill', args: ['[data-test="lastName"]', 'Doe'] },
      { method: 'fill', args: ['[data-test="postalCode"]', '10000'] },
      { method: 'click', args: ['[data-test="continue"]'] }
    ]);
  });

  test('finishOrder() clicks the finish button', async () => {
    const page = createMockPage();
    const checkoutPage = new CheckoutPage(page);

    await checkoutPage.finishOrder();

    expect(page.calls).toEqual([
      { method: 'click', args: ['[data-test="finish"]'] }
    ]);
  });
});
