# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integration\verifyDatabase.spec.js >> Database validation >> should find a product record when the products table exists
- Location: tests\integration\verifyDatabase.spec.js:16:3

# Error details

```
Error: Playwright Test did not expect test() to be called here.
Most common reasons include:
- You are calling test() in a configuration file.
- You are calling test() in a file that is imported by the configuration file.
- You have two different versions of @playwright/test. This usually happens
  when one of the dependencies in your package.json depends on @playwright/test.
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | const { connectDB, executeQuery } = require('../../database/dbUtils');
  3  | 
  4  | // Only execute database validations when the environment provides DB credentials.
  5  | // This prevents CI/local runs without a database from failing on infrastructure gaps.
  6  | const hasDbConfig = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD);
  7  | 
  8  | test.describe('Database validation', () => {
  9  |   test.beforeAll(async () => {
  10 |     if (!hasDbConfig) {
> 11 |       test(true, 'Database is not configured in the environment');
     |       ^ Error: Playwright Test did not expect test() to be called here.
  12 |     }
  13 |     await connectDB();
  14 |   });
  15 | 
  16 |   test('should find a product record when the products table exists', async () => {
  17 |     // This test is guarded so it does not fail when the DB is intentionally unavailable.
  18 |     test(!hasDbConfig, 'Database is not configured in the environment');
  19 | 
  20 |     // The query is intentionally lightweight: verify the products table exists and the DB connection works.
  21 |     const result = await executeQuery(`SELECT * FROM products LIMIT 1`);
  22 |     expect(Array.isArray(result)).toBe(true);
  23 |     expect(result.length).toBeGreaterThanOrEqual(0);
  24 |   });
  25 | });
  26 | 
```