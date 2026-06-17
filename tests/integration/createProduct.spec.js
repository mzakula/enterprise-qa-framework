const { test, expect } = require('@playwright/test');

const apiBase = process.env.API_BASE_URL || 'https://dummyjson.com';

// API integration test that validates product creation behavior on the target backend.
// This verifies that the system supports POST-based record creation and returns a valid success code.
test.describe('Integration API tests', () => {
  test('Create a new dummy product if API supports it', async ({ request }) => {
    const response = await request.post(`${apiBase}/products/add`, {
      data: {
        title: 'Playwright Book',
        price: 29.99,
        description: 'Sample product created by integration test'
      }
    });
    expect([200, 201]).toContain(response.status());

    // Verify the response body contains the echoed fields.
    // DummyJSON returns a fake auto-incremented id on successful creation.
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.title).toBe('Playwright Book');
    expect(Number(body.price)).toBe(29.99);
  });
});

