const { expect } = require('@playwright/test');

/**
 * Execute a fetch call inside a Playwright page context and return the
 * parsed response payload.  This eliminates the repeated
 * `page.goto('about:blank') + page.evaluate(async () => { fetch(...) })`
 * boilerplate used by route-interception tests.
 */
async function fetchViaPage(page, url) {
  await page.goto('about:blank');

  return page.evaluate(async (fetchUrl) => {
    const response = await fetch(fetchUrl);
    const body = await response.json();
    return { status: response.status, ok: response.ok, body };
  }, url);
}

/**
 * Convenience wrapper for fetch calls that are expected to throw
 * (e.g. aborted / timed-out requests).
 */
async function fetchErrorViaPage(page, url) {
  await page.goto('about:blank');

  return page.evaluate(async (fetchUrl) => {
    try {
      await fetch(fetchUrl);
      return 'NO ERROR';
    } catch (error) {
      return error.message;
    }
  }, url);
}

/**
 * Assert that a GET endpoint returns 200 with a non-empty array at the
 * given `collectionKey`.  Covers the pattern shared by the products and
 * users list-endpoint tests.
 */
async function assertCollection(request, endpoint, collectionKey) {
  const response = await request.get(endpoint);
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body[collectionKey])).toBe(true);
  expect(body[collectionKey].length).toBeGreaterThan(0);

  return body;
}

module.exports = { fetchViaPage, fetchErrorViaPage, assertCollection };
