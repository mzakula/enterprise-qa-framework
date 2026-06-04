const { test, expect } = require('@playwright/test');

// Negative API coverage: verify the authentication endpoint rejects invalid credentials.
// This prevents false positive behavior where a bad login could accidentally return success.
test('Rejects invalid authentication credentials', async ({ request }) => {
  const response = await request.post('https://dummyjson.com/auth/login', {
    data: {
      username: 'invalid_user',
      password: 'wrong_password'
    }
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.message).toMatch(/Invalid credentials/i);
});
