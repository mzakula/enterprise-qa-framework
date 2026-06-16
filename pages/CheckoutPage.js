const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);

    this.firstNameField  = '[data-test="firstName"]';
    this.lastNameField   = '[data-test="lastName"]';
    this.postalCodeField = '[data-test="postalCode"]';
    this.continueButton  = '[data-test="continue"]';
    this.finishButton    = '[data-test="finish"]';
    this.completeHeader  = '.complete-header';
  }

  async fillCustomerInfo(firstName, lastName, postalCode) {
    await this.page.fill(this.firstNameField, firstName);
    await this.page.fill(this.lastNameField, lastName);
    await this.page.fill(this.postalCodeField, postalCode);
    await this.page.click(this.continueButton);
    await this.logNavigation('checkout step 2');
  }

  async finishOrder() {
    await this.page.click(this.finishButton);
    await this.logNavigation('order confirmation');
  }

  async expectOrderComplete() {
    await expect(this.page.locator(this.completeHeader))
      .toContainText('Thank you for your order');
  }
}

module.exports = CheckoutPage;