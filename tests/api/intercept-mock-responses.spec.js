const { test, expect } = require('@playwright/test');
const { apiBaseURL } = require('../../utils/testConfig');
const { fetchViaPage, fetchErrorViaPage } = require('../../utils/apiHelper');

test.describe('API interception and mock response examples', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${apiBaseURL}/**`, async (route) => {
      const url = route.request().url();

      if (url.endsWith('/products/999')) {
        return route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: 'Product not found',
            code: 'NOT_FOUND'
          })
        });
      }

      if (url.includes('/posts/1?simulate=timeout')) {
        return route.abort('timedout');
      }

      if (url.endsWith('/users/1')) {
        return route.fulfill({
          status: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Server error',
            detail: 'Mocked internal server failure'
          })
        });
      }

      return route.continue();
    });
  });

  test('should mock a negative API response body', async ({ page }) => {
    const payload = await fetchViaPage(page, `${apiBaseURL}/products/999`);

    expect(payload.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.body.success).toBe(false);
    expect(payload.body.message).toContain('Product not found');
  });

  test('should mock a network timeout failure', async ({ page }) => {
    const errorMessage = await fetchErrorViaPage(page, `${apiBaseURL}/posts/1?simulate=timeout`);

    expect(errorMessage.toLowerCase()).toMatch(/failed|networkerror|timedout/);
  });

  test('should mock a server error response', async ({ page }) => {
    const payload = await fetchViaPage(page, `${apiBaseURL}/users/1`);

    expect(payload.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.body.error).toBe('Server error');
    expect(payload.body.detail).toContain('Mocked');
  });
});
