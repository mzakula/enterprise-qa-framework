const { test, expect } = require('@playwright/test');
const { apiBaseURL } = require('../../utils/testConfig');
const productData = require('./data/products-lookup-data.json');

test.describe('Products API data-driven validation', () => {
  for (const { id, expectedTitle, expectedPrice } of productData.cases) {
    test(`Validate product ${id} returns expected title and price`, async ({ request }) => {
      const response = await request.get(`${apiBaseURL}/products/${id}`);
      expect(response.status()).toBe(200);

      const body = await response.json();

      expect(body.id).toBe(id);
      expect(body.title).toBe(expectedTitle);
      expect(Number(body.price)).toBe(expectedPrice);
    });
  }
});
