const { test, expect } = require('@playwright/test');
const { apiBaseURL } = require('../../utils/testConfig');

test('Rejects invalid authentication credentials', async ({ request }) => {
  const response = await request.post(`${apiBaseURL}/auth/login`, {
    data: {
      username: 'invalid_user',
      password: 'wrong_password'
    }
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.message).toMatch(/Invalid credentials/i);
});
