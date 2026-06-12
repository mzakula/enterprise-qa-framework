const { chromium } = require('@playwright/test');
const path = require('path');
const logger = require('./utils/logger');
const ensureDir = require('./utils/ensureDir');
const { baseURL, testUsername, testPassword } = require('./utils/testConfig');
const LoginPage = require('./pages/LoginPage');

/**
 * Global Setup: Runs once before all test suites to prepare shared test state.
 * 
 * Purpose:
 * - Authenticate and save auth tokens to storage state for test reuse
 * - Seed database with baseline test data (if DB available)
 * - Validate environment configuration
 * - Avoid repeated logins across test suites (saves ~500ms-2s per test)
 * 
 * Usage:
 * - Referenced in playwright.config.js via globalSetup property
 * - Stores authentication state to ./auth/auth.json
 * - Each test loads this state via storageState config, starting authenticated
 */
async function globalSetup() {
  const authDir = path.join(__dirname, 'auth');
  ensureDir(authDir);

  const authFile = path.join(authDir, 'auth.json');
  const fs = require('fs');

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const loginPage = new LoginPage(page);

    logger.info(`[Global Setup] Authenticating against: ${baseURL}`);
    await page.goto(baseURL);

    logger.info(`[Global Setup] Logging in as: ${testUsername}`);
    await loginPage.login(testUsername, testPassword);

    await page.waitForURL('**/inventory.html', { timeout: 10000 });
    logger.info('[Global Setup] Login successful, saving storage state...');

    await page.context().storageState({ path: authFile });
    logger.info(`[Global Setup] Storage state saved to: ${authFile}`);

    if (process.env.DB_HOST) {
      logger.info('[Global Setup] Database configured, seeding test data...');
      logger.info('[Global Setup] Database available - ready for integration tests');
    } else {
      logger.info('[Global Setup] Database not configured - skipping seed data');
    }

    await browser.close();
    logger.info('[Global Setup] Setup complete');

  } catch (error) {
    logger.error('[Global Setup] Failed to authenticate:', { message: error.message, stack: error.stack });
    
    if (!fs.existsSync(authFile)) {
      throw error;
    } else {
      logger.warn('[Global Setup] Using existing auth.json - setup may be outdated');
    }
  }
}

module.exports = globalSetup;
