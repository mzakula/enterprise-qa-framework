const { test: base, expect } = require('@playwright/test');
const BasePage = require('../../pages/BasePage');

/**
 * base.fixture.js — custom Playwright test fixture
 *
 * Purpose:
 *   Extends Playwright's built-in `test` object to add automatic screenshot
 *   capture on test failure. This avoids duplicating afterEach boilerplate
 *   across every spec file — any spec that imports from this module gets the
 *   behaviour for free.
 *
 * How Playwright fixtures work:
 *   Fixtures are Playwright's dependency injection system. When you call
 *   base.extend(), you can override or augment built-in fixtures like `page`,
 *   `browser`, `context`, etc. The `use(value)` call hands the fixture value
 *   to the test — everything before `use` is setup, everything after is teardown.
 *
 * Why override `page` rather than adding a new fixture?
 *   Overriding `page` means all existing tests that destructure `{ page }`
 *   from the test function automatically pick up the teardown logic with no
 *   changes to the test body. A separate fixture would require every spec to
 *   explicitly opt in.
 *
 * Screenshot naming:
 *   The test title is sanitised (spaces and special chars → hyphens, lowercased)
 *   to produce a valid filename. BasePage.screenshotOnFailure() appends an ISO
 *   timestamp so multiple failures from retries don't overwrite each other.
 *
 * Usage in spec files:
 *   Replace:  const { test, expect } = require('@playwright/test');
 *   With:     const { test, expect } = require('../fixtures/base.fixture');
 *   No other changes needed.
 */
const test = base.extend({
  /**
   * Overrides the built-in `page` fixture.
   * Setup phase: hands the unmodified page to the test via use().
   * Teardown phase: fires screenshotOnFailure() if the test did not pass.
   */
  page: async ({ page }, use, testInfo) => {
    // Setup — pass the page to the test exactly as Playwright would normally.
    await use(page);

    // Teardown — runs after the test body completes (pass or fail).
    // testInfo.status   → actual outcome: 'passed', 'failed', 'timedOut', 'skipped'
    // testInfo.expectedStatus → what Playwright expected, almost always 'passed'
    // They differ when a test fails, times out, or is marked test.fail().
    if (testInfo.status !== testInfo.expectedStatus) {
      const basePage = new BasePage(page);

      // Sanitise the test title to a filesystem-safe string.
      // Example: "shows locked-out error for a locked user account"
      //       → "shows-locked-out-error-for-a-locked-user-account"
      const safeName = testInfo.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

      await basePage.screenshotOnFailure(safeName);
    }
  }
});

module.exports = { test, expect };