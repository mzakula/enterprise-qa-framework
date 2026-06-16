const { expect } = require('@playwright/test');
const logger = require('../utils/logger');

/**
 * BasePage — shared foundation for all Page Object Models.
 *
 * All POMs extend this class to inherit:
 *  - waitForPageLoad()     waits for the network to settle
 *  - screenshotOnFailure() captures a screenshot for debugging
 *  - logNavigation()       logs page URL transitions via Winston
 *  - expectUrl()           asserts the current URL matches a pattern
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Waits for the page network to be idle.
   * Use after navigation or any action that triggers a network request.
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Captures a full-page screenshot and saves it to test-results/.
   * Call this in a catch block or afterEach hook when a step fails.
   * @param {string} name - a short label that becomes part of the filename
   */
  async screenshotOnFailure(name = 'failure') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `test-results/screenshots/${name}-${timestamp}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    logger.warn(`[BasePage] Screenshot saved: ${screenshotPath}`);
  }

  /**
   * Logs the current page URL via Winston.
   * Useful for tracing navigation in CI logs without opening a trace file.
   * @param {string} label - context label for the log line
   */
  async logNavigation(label = '') {
    const url = this.page.url();
    logger.info(`[BasePage] Navigation${label ? ' — ' + label : ''}: ${url}`);
  }

  /**
   * Asserts the current URL matches the given string or regex.
   * @param {string|RegExp} pattern
   */
  async expectUrl(pattern) {
    await expect(this.page).toHaveURL(pattern);
  }
}

module.exports = BasePage;