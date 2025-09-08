import { test, expect } from '@playwright/test';

test.describe('Product Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display products grid with at least one product', async ({ page }) => {
    // Check that products are displayed
    const productCards = page.locator('[class*="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    // Check first product has required elements
    const firstProduct = productCards.first();
    await expect(firstProduct).toBeVisible();

    // Check for product image
    const productImage = firstProduct.locator('img');
    await expect(productImage).toBeVisible();

    // Check for product name (heading level 3)
    const productName = firstProduct.locator('h3');
    await expect(productName).toBeVisible();

    // Check for price
    const productPrice = firstProduct.locator('text=/\\$\\d+\\.\\d{2}/');
    await expect(productPrice).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    // Select a specific category from dropdown
    const categoryDropdown = page.locator('select');
    await categoryDropdown.selectOption('Electronics');

    // Wait for products to load
    await page.waitForFunction(() => document.querySelectorAll('[class*="product-card"]').length > 0);

    // Verify all visible products are from Electronics category
    const productCategories = page.locator('[class*="product-card"] p:first-of-type');
    const count = await productCategories.count();

    for (let i = 0; i < count; i++) {
      const category = productCategories.nth(i);
      await expect(category).toHaveText('Electronics');
    }
  });

  test('should filter products by search term', async ({ page }) => {
    // Enter search term
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Product 1');

    // Wait for debounce and results
    await page.waitForFunction(() => document.querySelectorAll('[class*="product-card"]').length > 0);

    // Check that filtered products contain the search term
    const productNames = page.locator('[class*="product-card"] h3');
    const count = await productNames.count();

    for (let i = 0; i < count; i++) {
      const name = await productNames.nth(i).textContent();
      expect(name?.toLowerCase()).toContain('product 1');
    }
  });

  test('should filter by in-stock products only', async ({ page }) => {
    // Get initial product count
    const resultsInfo = page.locator('text=/Showing \\d+ of \\d+ products/');
    const initialText = await resultsInfo.textContent();

    // Click the "In Stock Only" checkbox
    const inStockCheckbox = page.locator('input[type="checkbox"]');
    await inStockCheckbox.check();

    // Wait for the results to update (the total count should change)
    await page.waitForFunction(
      (initialText) => {
        const resultsElement = document.querySelector('[class*="results-info"]');
        return resultsElement && resultsElement.textContent !== initialText;
      },
      initialText,
      { timeout: 5000 }
    );

    // Additional wait to ensure DOM is fully updated
    await page.waitForTimeout(500);

    // Verify no "Out of Stock" badges are visible
    const outOfStockBadges = page.locator('text="Out of Stock"');
    const count = await outOfStockBadges.count();
    expect(count).toBe(0);
  });

  test('should handle pagination', async ({ page }) => {
    // Check that pagination controls exist
    const paginationSection = page.locator('[class*="pagination"]');
    await expect(paginationSection).toBeVisible();

    // Check initial state - Previous should be disabled, Next should be enabled
    const prevButton = page.locator('button:has-text("Previous")');
    const nextButton = page.locator('button:has-text("Next")');
    const pageInfo = page.locator('text=/Page \\d+ of \\d+/');

    await expect(prevButton).toBeDisabled();
    await expect(nextButton).toBeEnabled();
    await expect(pageInfo).toBeVisible();

    // Click next button
    await nextButton.click();

    // Wait for new products to load
    await page.waitForFunction(() => document.querySelectorAll('[class*="product-card"]').length > 0);

    // Verify page changed
    const newPageInfo = await pageInfo.textContent();
    expect(newPageInfo).toContain('Page 2');

    // Now Previous should be enabled
    await expect(prevButton).toBeEnabled();
  });

  test('should show correct product count', async ({ page }) => {
    // Check the results info text
    const resultsInfo = page.locator('text=/Showing \\d+ of \\d+ products/');
    await expect(resultsInfo).toBeVisible();

    // Get the count from the text
    const text = await resultsInfo.textContent();
    const match = text?.match(/Showing (\d+) of (\d+)/);

    if (!match) {
      return;
    }

    const showing = parseInt(match[1]);
    const total = parseInt(match[2]);

    // Verify we're showing reasonable numbers
    expect(showing).toBeGreaterThan(0);
    expect(showing).toBeLessThanOrEqual(12); // Default page size
    expect(total).toBeGreaterThan(0);

    // Count actual product cards
    const productCards = page.locator('[class*="product-card"]');
    const actualCount = await productCards.count();
    expect(actualCount).toBe(showing);
  });
});