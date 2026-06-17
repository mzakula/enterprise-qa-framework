const { test: base, expect } = require('@playwright/test');
const BasePage = require('../../pages/BasePage');

/**
 * Custom Playwright fixture that extends the default test object.
 *
 * Why this exists:
 * BasePage.screenshotOnFailure() is a useful debugging helper but needs
 * to be called automatically when a test fails — not manually in every spec.
 * This fixture hooks into Playwright's afterEach lifecycle and fires the
 * screenshot only when a test actually fails, keeping passing runs fast.
 *
 * Usage:
 *   const { test, expect } = require('../fixtures/base.fixture');
 *   Replace the standard @playwright/test import in any UI spec with this.
 */
const test = base.extend({
  // 'page' is a built-in Playwright fixture. We override it here to wrap
  // it with an automatic afterEach screenshot on failure.
  page: async ({ page }, use, testInfo) => {
    // Hand the page to the test as normal.
    await use(page);

    // After the test finishes, check if it failed.
    // testInfo.status is the actual outcome; testInfo.expectedStatus is 'passed' for normal tests.
    if (testInfo.status !== testInfo.expectedStatus) {
      const basePage = new BasePage(page);
      // Sanitise the test title so it is safe to use as a filename.
      const safeName = testInfo.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      await basePage.screenshotOnFailure(safeName);
    }
  }
});

module.exports = { test, expect };