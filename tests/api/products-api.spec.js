const { test } = require('@playwright/test');
const { apiBaseURL } = require('../../utils/testConfig');
const { assertCollection } = require('../../utils/apiHelper');

test('Validate products API returns a non-empty product list', async ({ request }) => {
  await assertCollection(request, `${apiBaseURL}/products`, 'products');
});
