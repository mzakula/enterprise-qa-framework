const { test, expect } = require('@playwright/test');
const { apiBaseURL } = require('../../utils/testConfig');

test.describe('Integration API tests', () => {
  test('Create a new dummy product if API supports it', async ({ request }) => {
    const response = await request.post(`${apiBaseURL}/products/add`, {
      data: {
        title: 'Playwright Book',
        price: 29.99,
        description: 'Sample product created by integration test'
      }
    });

    expect([200, 201]).toContain(response.status());
  });
});
