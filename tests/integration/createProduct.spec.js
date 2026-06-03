const { test, expect } = require('@playwright/test');
const { connectDB, executeQuery } = require('../../database/dbUtils');

test('Create product', async ({ request }) => {

  const product = {
    title: 'Playwright Book',
    price: 29.99
  };

  const response = await request.post(
    'http://localhost:3000/products',
    {
      data: product
    }
  );

  expect(response.status()).toBe(201);
});