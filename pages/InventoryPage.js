const { expect } = require('@playwright/test');

// Inventory page object: encapsulates the product browsing and cart entry experience.
class InventoryPage {
  constructor(page) {
    this.page = page;

    this.inventoryList = '.inventory_list';
    this.cartLink = '.shopping_cart_link';
  }

  async navigate() {
    await this.page.goto('/inventory.html');
    await expect(this.page).toHaveURL(/inventory.html/);
    await expect(this.page.locator(this.inventoryList)).toBeVisible();
  }

  async addProductToCart(productId) {
    await this.page.click(`[data-test="add-to-cart-${productId}"]`);
  }

  async openCart() {
    await this.page.click(this.cartLink);
  }
}

module.exports = InventoryPage;
