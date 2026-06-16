const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class InventoryPage extends BasePage {
  constructor(page) {
    super(page);

    this.inventoryList = '.inventory_list';
    this.cartLink      = '.shopping_cart_link';
  }

  async navigate() {
    await this.page.goto('/inventory.html');
    await this.waitForPageLoad();
    await this.logNavigation('inventory');
    await expect(this.page).toHaveURL(/inventory.html/);
    await expect(this.page.locator(this.inventoryList)).toBeVisible();
  }

  async addProductToCart(productId) {
    await this.page.click(`[data-test="add-to-cart-${productId}"]`);
  }

  async openCart() {
    await this.page.click(this.cartLink);
    await this.logNavigation('cart');
  }
}

module.exports = InventoryPage;