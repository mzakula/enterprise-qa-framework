const { test, expect } = require('@playwright/test');

test('Fetch users list from dummyjson', async ({ request }) => {
  const response = await request.get('https://dummyjson.com/users');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body.users)).toBe(true);
  expect(body.users.length).toBeGreaterThan(0);
});
