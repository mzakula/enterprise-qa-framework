const { test, expect } = require('../fixtures/base.fixture');
const LoginPage = require('../../pages/LoginPage');

/**
 * Login flow — UI test suite
 *
 * Coverage:
 *   - Positive: storageState re-use confirms session persists across tests
 *   - Negative: wrong credentials, locked account, empty username, empty password
 *
 * Auth strategy:
 *   The positive test uses the storageState injected by global-setup.js (auth/auth.json).
 *   All negative tests call freshPage() to get a context WITHOUT storageState so they
 *   hit the real login form — not the already-authenticated session.
 *
 * Failure handling:
 *   base.fixture.js auto-captures a full-page screenshot on any test failure.
 *   Screenshots are saved to test-results/screenshots/<test-title>.png.
 */

/**
 * Creates a clean browser context with no preloaded storageState.
 *
 * Why not use the default { page } fixture here?
 * The default page fixture inherits storageState from playwright.config.js,
 * which means the user is already authenticated. Negative login tests need
 * an unauthenticated session — this helper provides exactly that.
 *
 * Always call context.close() in a finally block or after the last assertion
 * to release the browser context and avoid resource leaks across workers.
 *
 * @param {import('@playwright/test').Browser} browser
 * @returns {{ context: BrowserContext, page: Page }}
 */
async function freshPage(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  return { context, page };
}

test.describe('Login flow', () => {

  // ── Positive ──────────────────────────────────────────────────────────────
  // Verifies that the storageState saved by global-setup.js is valid and that
  // Playwright correctly injects it into the default page context.
  // If this test fails, all other authenticated tests in the suite will also
  // fail — it acts as a canary for auth infrastructure health.
  test('reuses authenticated storage state and lands on inventory page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Navigate directly to the protected route — no login form interaction needed.
    // A valid storageState means the app skips the login redirect entirely.
    await loginPage.navigateToInventory();

    // Dual assertion: URL confirms the route was not redirected back to login,
    // and the inventory list confirms the page rendered its main content.
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  // ── Negative: wrong credentials ───────────────────────────────────────────
  // Validates the application's response to credentials that exist in no account.
  // "Epic sadface" is the exact error prefix Sauce Demo returns for auth failures —
  // using a regex rather than full text makes the assertion resilient to minor
  // copy changes in the error message.
  test('rejects invalid credentials', async ({ browser }) => {
    const { context, page } = await freshPage(browser);
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('invalid_user', 'wrong_password');

    await expect(page.locator(loginPage.errorMessage)).toContainText(/Epic sadface/i);

    // Always close the context after a freshPage test to release browser resources.
    await context.close();
  });

  // ── Negative: locked account ──────────────────────────────────────────────
  // Validates account-level access control: correct credentials, blocked account.
  // This tests a distinct failure mode from wrong credentials — the backend must
  // differentiate between "auth failed" and "account suspended" and return the
  // appropriate message. Critical for compliance and support workflows.
  test('shows locked-out error for a locked user account', async ({ browser }) => {
    const { context, page } = await freshPage(browser);
    const loginPage = new LoginPage(page);

    await loginPage.navigate();

    // locked_out_user has valid credentials but is blocked at the account level.
    // Using the real Sauce Demo fixture user — no mock needed.
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(page.locator(loginPage.errorMessage))
      .toContainText(/Sorry, this user has been locked out/i);

    await context.close();
  });

  // ── Negative: empty fields ────────────────────────────────────────────────
  // Client-side validation tests — the form should reject submission before
  // any network request is made. These two tests are intentionally separate:
  // the application may return different error messages for each missing field,
  // and combining them into one test would hide which field failed validation.

  test('shows validation error when username field is empty', async ({ browser }) => {
    const { context, page } = await freshPage(browser);
    const loginPage = new LoginPage(page);

    await loginPage.navigate();

    // Pass empty string for username — LoginPage.login() fills the field with
    // an empty value, simulating a user clicking Login without entering a name.
    await loginPage.login('', 'secret_sauce');

    await expect(page.locator(loginPage.errorMessage))
      .toContainText(/Username is required/i);

    await context.close();
  });

  test('shows validation error when password field is empty', async ({ browser }) => {
    const { context, page } = await freshPage(browser);
    const loginPage = new LoginPage(page);

    await loginPage.navigate();

    // Pass empty string for password — username is valid to isolate
    // the validation to the password field specifically.
    await loginPage.login('standard_user', '');

    await expect(page.locator(loginPage.errorMessage))
      .toContainText(/Password is required/i);

    await context.close();
  });

});