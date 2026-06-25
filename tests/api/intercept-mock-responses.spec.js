const { test, expect } = require('@playwright/test');

/**
 * =============================================================================
 * API Interception & Mock Response Examples
 * =============================================================================
 *
 * Purpose:
 * Demonstrate advanced Playwright network interception capabilities
 * commonly used in enterprise automation frameworks.
 *
 * Why API mocking?
 * - Removes dependency on unstable environments.
 * - Reduces flaky tests.
 * - Enables deterministic execution.
 * - Allows testing negative scenarios that are difficult to reproduce.
 * - Improves execution speed.
 *
 * Scenarios covered:
 *
 * 1. Business validation failure with HTTP 200.
 * 2. Network timeout simulation.
 * 3. Internal server error (HTTP 500).
 * 4. UI validation against mocked backend responses.
 *
 * Enterprise use cases:
 * - Error handling validation.
 * - Frontend resilience testing.
 * - Retry mechanism validation.
 * - Environment-independent automation.
 * =============================================================================
 */

test.describe('API interception and mock response examples', () => {

  /**
   * Intercept all requests sent to DummyJSON.
   *
   * Playwright acts as a proxy between the browser and the backend.
   * Depending on the requested URL, custom responses are returned
   * instead of reaching the real external API.
   */
  test.beforeEach(async ({ page }) => {

    await page.route('https://dummyjson.com/**', async (route) => {

      const url = route.request().url();

      /**
       * -----------------------------------------------------------------------
       * Scenario 1
       * Simulate business-level validation failure.
       *
       * HTTP transport succeeds (200 OK),
       * but business operation itself fails.
       * -----------------------------------------------------------------------
       */
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

      /**
       * -----------------------------------------------------------------------
       * Scenario 2
       * Simulate network timeout.
       *
       * Useful for validating:
       * - retry mechanisms
       * - offline behavior
       * - error banners
       * - graceful degradation
       * -----------------------------------------------------------------------
       */
      if (url.includes('/posts/1?simulate=timeout')) {

        return route.abort('timedout');
      }

      /**
       * -----------------------------------------------------------------------
       * Scenario 3
       * Simulate server-side failure.
       *
       * Typical real-world examples:
       * - database outage
       * - unhandled exception
       * - infrastructure failure
       * -----------------------------------------------------------------------
       */
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

      /**
       * Continue any request that is not explicitly mocked.
       */
      return route.continue();
    });
  });

  /**
   * ===========================================================================
   * Test 1
   * Verify behavior when backend returns
   * business-level failure with HTTP 200.
   * ===========================================================================
   */
  test('should mock a negative API response body', async ({ page }) => {

    await page.goto('about:blank');

    const payload = await page.evaluate(async () => {

      const response =
        await fetch('https://dummyjson.com/products/999');

      return {
        status: response.status,
        ok: response.ok,
        body: await response.json()
      };
    });

    expect(payload.status).toBe(200);
    expect(payload.ok).toBe(true);

    expect(payload.body.success).toBe(false);
    expect(payload.body.message)
      .toContain('Product not found');

    expect(payload.body.code)
      .toBe('NOT_FOUND');
  });

  /**
   * ===========================================================================
   * Test 2
   * Verify application behavior when network connectivity fails.
   * ===========================================================================
   */
  test('should mock a network timeout failure', async ({ page }) => {

    await page.goto('about:blank');

    const errorMessage = await page.evaluate(async () => {

      try {

        await fetch(
          'https://dummyjson.com/posts/1?simulate=timeout'
        );

        return 'NO ERROR';

      } catch (error) {

        return error.message;
      }
    });

    /**
     * Different browsers expose different network failure messages.
     * Validate common variants rather than exact text.
     */
    expect(errorMessage.toLowerCase())
      .toMatch(/failed|networkerror|timedout/);
  });

  /**
   * ===========================================================================
   * Test 3
   * Verify behavior when backend responds with HTTP 500.
   * ===========================================================================
   */
  test('should mock a server error response', async ({ page }) => {

    await page.goto('about:blank');

    const payload = await page.evaluate(async () => {

      const response =
        await fetch('https://dummyjson.com/users/1');

      return {
        status: response.status,
        ok: response.ok,
        body: await response.json()
      };
    });

    expect(payload.status).toBe(500);
    expect(payload.ok).toBe(false);

    expect(payload.body.error)
      .toBe('Server error');

    expect(payload.body.detail)
      .toContain('Mocked');
  });

  /**
   * ===========================================================================
   * Test 4
   * Real UI + Mocked Backend validation.
   *
   * Purpose:
   * Validate that the frontend correctly handles
   * business validation errors returned by backend services.
   *
   * This pattern is widely used in enterprise automation
   * to isolate UI tests from unstable environments.
   * ===========================================================================
   */
  test(
    'should display user-friendly error message when API returns business error',
    async ({ page }) => {

      /**
       * Build a lightweight UI dynamically.
       *
       * In a real enterprise project this would usually be:
       *
       * await page.goto('/products');
       */
      await page.setContent(`
        <button id="load-product">Load Product</button>
        <div id="message"></div>

        <script>

          document
            .getElementById('load-product')
            .addEventListener('click', async () => {

              try {

                const response =
                  await fetch('https://dummyjson.com/products/999');

                const body = await response.json();

                if (!body.success) {

                  document.getElementById('message').innerText =
                    body.message;

                  return;
                }

                document.getElementById('message').innerText =
                  'Product loaded';

              } catch (error) {

                document.getElementById('message').innerText =
                  'Unexpected error';
              }
            });

        </script>
      `);

      /**
       * Simulate user interaction.
       */
      await page.click('#load-product');

      /**
       * Validate that frontend correctly displays
       * backend business validation message.
       */
      await expect(page.locator('#message'))
        .toHaveText('Product not found');
    }
  );

});