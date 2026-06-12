const { test } = require('@playwright/test');
const { apiBaseURL } = require('../../utils/testConfig');
const { assertCollection } = require('../../utils/apiHelper');

test('Fetch users list from dummyjson', async ({ request }) => {
  await assertCollection(request, `${apiBaseURL}/users`, 'users');
});
