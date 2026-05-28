const { test, expect } = require('@playwright/test');
const { connectDB, executeQuery } = require('../../database/dbUtils');

test('Validate API data against DB', async ({ request }) => {

  await connectDB();

  const response = await request.get(
    'https://dummyjson.com/products/1'
  );

  expect(response.status()).toBe(200);

  const body = await response.json();

  const dbResult = await executeQuery(
    `SELECT title FROM products WHERE id = 1`
  );

  expect(body.title).toBe(dbResult[0].title);
});