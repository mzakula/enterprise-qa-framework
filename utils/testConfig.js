require('dotenv').config();

const testConfig = {
  baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
  apiBaseURL: process.env.API_BASE_URL || 'https://dummyjson.com',
  testUsername: process.env.TEST_USERNAME || 'standard_user',
  testPassword: process.env.TEST_PASSWORD || 'secret_sauce',
};

module.exports = testConfig;
