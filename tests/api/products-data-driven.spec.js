const { test, expect } = require('@playwright/test');
const productData = require('./data/products-lookup-data.json');

// NEW: Data-driven API validation example using a JSON fixture.
// This demonstrates how to reuse the same test flow for multiple input cases.
// The fixture stores a `cases` array plus a `_comment` field for self-documentation.
test.describe('Products API data-driven validation', () => {
  for (const { id, expectedTitle, expectedPrice } of productData.cases) {
    test(`Validate product ${id} returns expected title and price`, async ({ request }) => {
      const response = await request.get(`https://dummyjson.com/products/${id}`);
      expect(response.status()).toBe(200);

      const body = await response.json();

      // Validate the response contract and the specific fixture values.
      expect(body.id).toBe(id);
      expect(body.title).toBe(expectedTitle);
      expect(Number(body.price)).toBe(expectedPrice);
    });
  }
});
