const { test, expect } = require('@playwright/test');

// API contract test for the /users endpoint.
// Validates both the collection shape and the field-level contract of individual user objects.
// A contract test goes beyond "it returned 200" — it verifies the structure the app depends on.
test('users endpoint returns a valid collection with correct field structure', async ({ request }) => {
  const response = await request.get('https://dummyjson.com/users');
  expect(response.status()).toBe(200);

  const body = await response.json();

  // Collection-level contract
  expect(Array.isArray(body.users)).toBe(true);
  expect(body.users.length).toBeGreaterThan(0);
  expect(typeof body.total).toBe('number');
  expect(body.total).toBeGreaterThan(0);

  // Field-level contract on the first user object
  const user = body.users[0];
  expect(typeof user.id).toBe('number');
  expect(typeof user.firstName).toBe('string');
  expect(typeof user.lastName).toBe('string');
  expect(typeof user.email).toBe('string');
  expect(user.email).toContain('@');
});