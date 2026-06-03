await page.goto('/products');

await expect(
 page.getByText('Playwright Book')
).toBeVisible();