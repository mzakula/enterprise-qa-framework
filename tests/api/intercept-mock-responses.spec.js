const { test, expect } = require('@playwright/test');

// This test demonstrates simple Playwright route interception and mock responses.
// It is intentionally implemented as a browser-level intercept because Playwright
// mocks HTTP traffic through page routing, even for API-only validation.
// The three scenarios are implemented in the `page.route` handler below:
// 1) `GET https://dummyjson.com/products/999` returns a negative API response body with success=false.
// 2) `GET https://dummyjson.com/posts/1?simulate=timeout` triggers a mocked network timeout.
// 3) `GET https://dummyjson.com/users/1` returns a mocked 500 server error.

test.describe('API interception and mock response examples', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://dummyjson.com/**', async (route) => {
      const url = route.request().url();

      // Scenario 1: negative application-level API response body.
      if (url.endsWith('/products/999')) {
        return route.fulfill({
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Product not found',
            code: 'NOT_FOUND'
          })
        });
      }

      // Scenario 2: mocked network timeout on the request.
      if (url.includes('/posts/1?simulate=timeout')) {
        return route.abort('timedout');
      }

      // Scenario 3: mocked server-side 500 error response.
      if (url.endsWith('/users/1')) {
        return route.fulfill({
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          },
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
    await page.goto('about:blank');

    const payload = await page.evaluate(async () => {
      const response = await fetch('https://dummyjson.com/products/999');
      const body = await response.json();
      return {
        status: response.status,
        ok: response.ok,
        body
      };
    });

    expect(payload.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.body.success).toBe(false);
    expect(payload.body.message).toContain('Product not found');
  });

  test('should mock a network timeout failure', async ({ page }) => {
    await page.goto('about:blank');

    const errorMessage = await page.evaluate(async () => {
      try {
        await fetch('https://dummyjson.com/posts/1?simulate=timeout');
        return 'NO ERROR';
      } catch (error) {
        return error.message;
      }
    });

    expect(errorMessage.toLowerCase()).toContain('failed');
  });

  test('should mock a server error response', async ({ page }) => {
    await page.goto('about:blank');

    const payload = await page.evaluate(async () => {
      const response = await fetch('https://dummyjson.com/users/1');
      return {
        status: response.status,
        ok: response.ok,
        body: await response.json()
      };
    });

    expect(payload.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.body.error).toBe('Server error');
    expect(payload.body.detail).toContain('Mocked');
  });
});
