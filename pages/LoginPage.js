// Page object for the login screen. Abstracts UI selectors from test logic.
class LoginPage {

  constructor(page) {
    this.page = page;

    this.usernameInput = '[data-test="username"]';
    this.passwordInput = '[data-test="password"]';
    this.loginButton = '[data-test="login-button"]';
    this.errorMessage = '[data-test="error"]';
  }

  async navigate() {
    await this.page.goto('/');
  }

  async login(username, password) {

    await this.page.fill(this.usernameInput, username);

    await this.page.fill(this.passwordInput, password);

    await this.page.click(this.loginButton);
  }
}

module.exports = LoginPage;