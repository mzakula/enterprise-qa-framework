const result = await executeQuery(
  `SELECT * FROM products
   WHERE title='Playwright Book'`
);

expect(result.length).toBe(1);