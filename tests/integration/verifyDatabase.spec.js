const { test, expect } = require('@playwright/test');
const { connectDB, executeQuery, closeDB } = require('../../database/dbUtils');

// Only execute database validations when the environment provides DB credentials.
// This prevents CI/local runs without a database from failing due to optional infrastructure.
const hasDbConfig = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD);
const describeDb = hasDbConfig ? test.describe : test.describe.skip;

describeDb('Database validation', () => {
  test.beforeAll(async () => {
    // Connect early so failures are reported at suite startup.
    await connectDB();
  });

  test.afterAll(async () => {
    // Ensure DB client is closed to avoid open-handle issues in test runners.
    await closeDB();
  });

  test('should insert, update, and verify a test product in the database', async () => {
    const testTitle = `QA Test Product ${Date.now()}`;
    const initialPrice = 19.95;
    const updatedPrice = 24.95;

    try {
      await executeQuery('BEGIN');

      const insertRows = await executeQuery(
        'INSERT INTO products (title, price) VALUES ($1, $2) RETURNING id, title, price',
        [testTitle, initialPrice]
      );

      expect(insertRows.length).toBe(1);
      const inserted = insertRows[0];
      expect(inserted.title).toBe(testTitle);
      expect(Number(inserted.price)).toBe(initialPrice);

      await executeQuery('UPDATE products SET price = $1 WHERE id = $2', [updatedPrice, inserted.id]);

      const selectRows = await executeQuery(
        'SELECT id, title, price FROM products WHERE id = $1',
        [inserted.id]
      );

      expect(selectRows.length).toBe(1);
      expect(selectRows[0].title).toBe(testTitle);
      expect(Number(selectRows[0].price)).toBe(updatedPrice);
    } catch (err) {
      throw new Error(`Database validation CRUD workflow failed: ${err.message}`);
    } finally {
      try {
        await executeQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Rollback failed after DB test', rollbackErr);
      }
    }
  });
});
