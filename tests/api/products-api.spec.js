const { test, expect } = require('@playwright/test');

test('Validate products API', async ({ request }) => {

  const response = await request.get('https://dummyjson.com/products');

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body.products.length).toBeGreaterThan(0);
});