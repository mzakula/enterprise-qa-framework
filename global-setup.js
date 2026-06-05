const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
  // Create auth directory if it doesn't exist
  const authDir = path.join(__dirname, 'auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const authFile = path.join(authDir, 'auth.json');

  try {
    // Initialize headless browser for authentication flow
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Navigate to application
    const baseURL = process.env.BASE_URL || 'https://www.saucedemo.com';
    console.log(`[Global Setup] Authenticating against: ${baseURL}`);

    await page.goto(baseURL);

    // Perform login with standard user credentials
    // Using standard_user allows access to full product catalog for testing
    const username = 'standard_user';
    const password = 'secret_sauce';

    console.log(`[Global Setup] Logging in as: ${username}`);
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');

    // Wait for navigation to inventory page (confirms successful login)
    await page.waitForURL('**/inventory.html', { timeout: 10000 });
    console.log('[Global Setup] Login successful, saving storage state...');

    // Save authenticated browser page state
    // This includes cookies, localStorage, sessionStorage, and DOM state
    // Tests will start with this state pre-loaded, avoiding login overhead
    await page.context().storageState({ path: authFile });

    console.log(`[Global Setup] Storage state saved to: ${authFile}`);

    // Optional: Seed database with test data (if DB_HOST configured)
    if (process.env.DB_HOST) {
      console.log('[Global Setup] Database configured, seeding test data...');
      // Seed logic would go here (example: insert test products)
      // For now, just log that DB is available
      console.log('[Global Setup] Database available - ready for integration tests');
    } else {
      console.log('[Global Setup] Database not configured - skipping seed data');
    }

    await browser.close();
    console.log('[Global Setup] Setup complete');

  } catch (error) {
    console.error('[Global Setup] Failed to authenticate:', error.message);
    
    // If authentication fails but auth.json already exists, continue
    // This allows tests to run with potentially stale auth state
    if (!fs.existsSync(authFile)) {
      // If no existing auth.json, this is a hard failure
      throw error;
    } else {
      console.warn('[Global Setup] Using existing auth.json - setup may be outdated');
    }
  }
}

module.exports = globalSetup;
