// Cart page object: encapsulates actions available from the shopping cart review.
class CartPage {
  constructor(page) {
    this.page = page;
    this.checkoutButton = '[data-test="checkout"]';
  }

  async startCheckout() {
    await this.page.click(this.checkoutButton);
  }
}

module.exports = CartPage;
