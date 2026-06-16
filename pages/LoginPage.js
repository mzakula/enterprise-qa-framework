const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page); // passes `page` up to BasePage

    this.usernameInput = '[data-test="username"]';
    this.passwordInput = '[data-test="password"]';
    this.loginButton   = '[data-test="login-button"]';
    this.errorMessage  = '[data-test="error"]';
  }

  async navigate() {
    await this.page.goto('/');
    await this.logNavigation('login page');
  }

  async navigateToInventory() {
    await this.page.goto('/inventory.html');
    await this.logNavigation('inventory direct');
  }

  async login(username, password) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }
}

module.exports = LoginPage;