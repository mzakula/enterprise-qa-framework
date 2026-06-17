const { test, expect } = require('../fixtures/base.fixture');
const LoginPage = require('../../pages/LoginPage');

// Helper: creates a fresh browser context with NO preloaded storageState.
// Required for any test that needs to validate the unauthenticated login page.
async function freshPage(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  return { context, page };
}

test.describe('Login flow', () => {

  // ── Positive ─────────────────────────────────────────────────────────────
  test('reuses authenticated storage state and lands on inventory page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToInventory();
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  // ── Negative: wrong credentials ───────────────────────────────────────────
  test('rejects invalid credentials', async ({ browser }) => {
    const { context, page } = await freshPage(browser);
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('invalid_user', 'wrong_password');

    await expect(page.locator(loginPage.errorMessage)).toContainText(/Epic sadface/i);
    await context.close();
  });

  // ── Negative: locked account ──────────────────────────────────────────────
  test('shows locked-out error for a locked user account', async ({ browser }) => {
    const { context, page } = await freshPage(browser);
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(page.locator(loginPage.errorMessage))
      .toContainText(/Sorry, this user has been locked out/i);

    await context.close();
  });

  // ── Negative: empty fields ────────────────────────────────────────────────
  test('shows validation error when username field is empty', async ({ browser }) => {
    const { context, page } = await freshPage(browser);
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('', 'secret_sauce'); // empty username

    await expect(page.locator(loginPage.errorMessage))
      .toContainText(/Username is required/i);

    await context.close();
  });

  test('shows validation error when password field is empty', async ({ browser }) => {
    const { context, page } = await freshPage(browser);
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', ''); // empty password

    await expect(page.locator(loginPage.errorMessage))
      .toContainText(/Password is required/i);

    await context.close();
  });
});