const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({

  testDir: './tests',

  timeout: 60000,

  retries: 2,

  fullyParallel: true,

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

    headless: true,

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    trace: 'retain-on-failure'
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