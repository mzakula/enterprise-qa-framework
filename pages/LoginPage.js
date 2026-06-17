const BasePage = require('./BasePage');

/**
 * LoginPage — page object for the Sauce Demo login screen.
 *
 * Selector strategy: all locators use [data-test="..."] attributes,
 * which are stable across CSS refactors and match the global-setup selectors.
 *
 * Two navigation methods exist by design:
 *  - navigate()            → goes to "/" (the unauthenticated login page).
 *                            Use this in negative tests that need to test
 *                            the login form itself (wrong creds, empty fields).
 *  - navigateToInventory() → goes to "/inventory.html" directly.
 *                            Use this in positive tests that have storageState
 *                            preloaded and just need to confirm auth is working.
 */
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