const BasePage = require('./BasePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);

    this.checkoutButton = '[data-test="checkout"]';
  }

  async startCheckout() {
    await this.page.click(this.checkoutButton);
    await this.logNavigation('checkout step 1');
  }
}

module.exports = CartPage;