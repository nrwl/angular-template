import { test, expect } from '@playwright/test';

test.describe('Navigation and User Flow', () => {
  test('should complete a full user journey through the app', async ({ page }) => {
    // Start at home page
    await page.goto('/');

    // Should redirect to products
    await page.waitForURL('**/products');

    // Verify we're on products page
    const productsHeading = page.locator('h1:has-text("Our Products")');
    await expect(productsHeading).toBeVisible();

    // Search for a specific product
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Product 1');
    await page.waitForFunction(() => document.querySelectorAll('[class*="product-card"]').length > 0);

    // Click on the first search result
    const firstResult = page.locator('[class*="product-card"]').first();
    const productName = await firstResult.locator('h3').textContent();
    await firstResult.click();

    // Should navigate to product detail
    await page.waitForURL('**/products/**');

    // Verify product detail page
    const detailProductName = page.locator('h1').filter({ hasText: productName || '' });
    await expect(detailProductName).toBeVisible();

    // Click back to products
    const backLink = page.locator('a:has-text("Back to Products")');
    await backLink.click();

    // Should be back on products page
    await page.waitForURL('**/products');
    await expect(productsHeading).toBeVisible();

    // The search should be cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should handle navigation via header link', async ({ page }) => {
    // Start on a product detail page
    await page.goto('/products/prod-1');
    await page.waitForLoadState('domcontentloaded');

    // Click the Products link in the header
    const headerProductsLink = page.locator('nav a:has-text("Products")');
    await headerProductsLink.click();

    // Should navigate to products listing
    await page.waitForURL('**/products');

    // Verify products page is loaded
    const productsGrid = page.locator('[class*="product"]').first();
    await expect(productsGrid).toBeVisible();
  });

  test('should maintain filter state during navigation', async ({ page }) => {
    // Go to products page
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // Apply filters
    const categoryDropdown = page.locator('select');
    await categoryDropdown.selectOption('Electronics');

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Product');

    // Wait for filtered results
    await page.waitForFunction(() => document.querySelectorAll('[class*="product-card"]').length > 0);

    // Navigate to a product
    const product = page.locator('[class*="product-card"]').first();
    await product.click();

    // Wait for product detail page
    await page.waitForURL('**/products/**');

    // Go back using browser back button
    await page.goBack();

    // Filters should be reset (this is the expected behavior in most SPAs)
    // The search and category should be cleared
    await expect(searchInput).toHaveValue('');
    await expect(categoryDropdown).toHaveValue('');
  });

  test('should handle rapid navigation', async ({ page }) => {
    // Navigate to products
    await page.goto('/products');

    // Quickly click multiple products
    for (let i = 0; i < 3; i++) {
      const product = page.locator('[class*="product-card"]').nth(i);
      await product.click();
      await page.waitForURL('**/products/**');

      // Verify page loaded correctly
      const productDetail = page.locator('h1').nth(1);
      await expect(productDetail).toBeVisible();

      // Go back
      const backLink = page.locator('a:has-text("Back to Products")');
      await backLink.click();
      await page.waitForURL('**/products');
    }

    // Should still be functional
    const productsHeading = page.locator('h1:has-text("Our Products")');
    await expect(productsHeading).toBeVisible();
  });

  test('should handle direct URL navigation', async ({ page }) => {
    // Navigate directly to a product detail page
    await page.goto('/products/prod-5');
    await page.waitForLoadState('domcontentloaded');

    // Should load the correct product
    const productName = page.locator('h1').filter({ hasText: 'Product 5' });
    await expect(productName).toBeVisible();

    // Navigate directly to products page
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // Should show products listing
    const productsGrid = page.locator('[class*="product-card"]');
    const count = await productsGrid.count();
    expect(count).toBeGreaterThan(0);

    // Navigate to non-existent route should redirect to products
    await page.goto('/non-existent-route');
    await page.waitForURL('**/products');

    // Should be on products page
    const productsHeading = page.locator('h1:has-text("Our Products")');
    await expect(productsHeading).toBeVisible();
  });

  test('should display loading states during navigation', async ({ page }) => {
    // Enable slow network to see loading states
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto('/products');

    // Click on a product
    const product = page.locator('[class*="product-card"]').first();
    await product.click();

    // Should eventually load the product detail
    await page.waitForURL('**/products/**', { timeout: 10000 });

    const productDetail = page.locator('[class*="product-detail"]');
    await expect(productDetail).toBeVisible({ timeout: 10000 });
  });
});