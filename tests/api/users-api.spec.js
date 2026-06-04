const { test, expect } = require('@playwright/test');

// Verify the users endpoint remains available and returns a valid collection payload.
test('Fetch users list from dummyjson', async ({ request }) => {
  const response = await request.get('https://dummyjson.com/users');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body.users)).toBe(true);
  expect(body.users.length).toBeGreaterThan(0);
});
