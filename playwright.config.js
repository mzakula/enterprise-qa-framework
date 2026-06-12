const { defineConfig } = require('@playwright/test');
const { baseURL } = require('./utils/testConfig');

// Enterprise-grade Playwright configuration for QA automation framework.
// This config balances speed, reliability, and maintainability across local and CI environments.
module.exports = defineConfig({

  testDir: './tests',

  timeout: 60000,

  // CI-Aware Retries: Retry only in GitHub Actions to save local dev time.
  // Local runs are fast and developers can debug failures immediately.
  // CI runs may experience intermittent failures due to network/resource constraints.
  retries: process.env.CI ? 2 : 0,

  fullyParallel: true,

  // CI-Aware Workers: Control test concurrency based on environment.
  // CI: lock to 4 workers for predictable resource usage and stable results.
  // Local: undefined lets Playwright auto-detect based on available CPU cores.
  workers: process.env.CI ? 4 : undefined,

  // Global Setup: Centralize authentication and test data seeding.
  // Runs once before all test suites to prepare shared state (auth tokens, DB seeding, etc).
  globalSetup: require.resolve('./global-setup.js'),

  // Output Folder: Explicit test results directory for CI/CD integration and reporting.
  // Consolidates all test artifacts (screenshots, videos, traces) in one location.
  outputDir: 'test-results',

  use: {
    baseURL,

    // Storage State: Persist authenticated browser state to avoid repeated logins.
    // Each test starts with a pre-authenticated session from auth/auth.json (populated by global-setup).
    // Saves ~500ms-2s per test by reusing login state, dramatically improving suite speed.
    storageState: './auth/auth.json',

    headless: true,

    screenshot: 'only-on-failure',

    // Video and trace artifacts are expensive to generate and store.
    // Only record them on the first retry to preserve debugging data
    // for flaky failures, while keeping successful runs fast.
    video: 'on-first-retry',

    trace: 'on-first-retry'
  },

  reporter: [
    ['html'],
    ['allure-playwright']
  ],

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    }
  ]
});