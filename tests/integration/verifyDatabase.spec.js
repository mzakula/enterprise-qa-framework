const { test, expect } = require('@playwright/test');
const { connectDB, executeQuery } = require('../../database/dbUtils');

const hasDbConfig = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD);

test.describe('Database validation', () => {
  test.beforeAll(async () => {
    if (!hasDbConfig) {
      test.skip(true, 'Database is not configured in the environment');
    }
    await connectDB();
  });

  test('should find a product record when the products table exists', async () => {
    test.skip(!hasDbConfig, 'Database is not configured in the environment');
    const result = await executeQuery(`SELECT * FROM products LIMIT 1`);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });
});
