const { test, expect } = require('@playwright/test');

// API contract validation test: ensures the products endpoint returns a valid catalogue payload.
test('Validate products API returns a non-empty product list', async ({ request }) => {
  const response = await request.get('https://dummyjson.com/products');
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body.products)).toBe(true);
  expect(body.products.length).toBeGreaterThan(0);
});