import { test, expect } from '@playwright/test';

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page first
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should navigate to product detail when clicking a product', async ({ page }) => {
    // Click on the first product
    const firstProduct = page.locator('[class*="product-card"]').first();
    await firstProduct.click();

    // Wait for navigation
    await page.waitForURL('**/products/**');

    // Verify URL changed to product detail
    expect(page.url()).toMatch(/\/products\/prod-\d+/);

    // Verify back link is visible
    const backLink = page.locator('a:has-text("Back to Products")');
    await expect(backLink).toBeVisible();
  });

  test('should display complete product information', async ({ page }) => {
    // Navigate directly to a product detail page
    await page.goto('/products/prod-1');
    await page.waitForLoadState('domcontentloaded');

    // Check product name
    const productName = page.locator('h1').filter({ hasText: /Product \d+/ });
    await expect(productName).toBeVisible();

    // Check product image
    const productImage = page.locator('[class*="product-detail"] img');
    await expect(productImage).toBeVisible();
    await expect(productImage).toHaveAttribute('alt', /Product/);

    // Check category
    const category = page.locator('text=/Home & Garden|Electronics|Clothing|Sports|Books/');
    await expect(category.first()).toBeVisible();

    // Check rating
    const ratingSection = page.locator('[class*="product-rating"]');
    await expect(ratingSection).toBeVisible();
    const stars = ratingSection.locator('[class*="stars"]');
    await expect(stars).toBeVisible();

    // Check price
    const price = page.locator('text=/\\$\\d+\\.\\d{2}/').first();
    await expect(price).toBeVisible();

    // Check description
    const descriptionHeading = page.locator('h2:has-text("Description")');
    await expect(descriptionHeading).toBeVisible();
    const description = page.locator('p').filter({ hasText: /high-quality/ });
    await expect(description).toBeVisible();

    // Check product information section
    const productInfoHeading = page.locator('h3:has-text("Product Information")');
    await expect(productInfoHeading).toBeVisible();

    // Check product ID
    const productId = page.locator('text=/prod-\\d+/');
    await expect(productId).toBeVisible();

    // Check availability
    const availability = page.locator('text=/In Stock|Out of Stock/');
    await expect(availability).toBeVisible();
  });

  test('should show action buttons for in-stock products', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');

    // Find an in-stock product (one without "Out of Stock" badge)
    const inStockProduct = page.locator('[class*="product-card"]').filter({ hasNot: page.locator('text="Out of Stock"') }).first();
    await inStockProduct.click();

    // Wait for product detail page
    await page.waitForURL('**/products/**');

    // Check for Add to Cart button
    const addToCartButton = page.locator('button:has-text("Add to Cart")');
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();

    // Check for Add to Wishlist button
    const addToWishlistButton = page.locator('button:has-text("Add to Wishlist")');
    await expect(addToWishlistButton).toBeVisible();
    await expect(addToWishlistButton).toBeEnabled();

    // Test clicking Add to Cart (should show alert)
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Product added to cart');
      dialog.accept();
    });
    await addToCartButton.click();
  });

  test('should show disabled button for out-of-stock products', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');

    // Find an out-of-stock product
    const outOfStockProduct = page.locator('[class*="product-card"]').filter({ has: page.locator('text="Out of Stock"') }).first();

    // Get the product before clicking to handle case where there might not be any
    const hasOutOfStock = await outOfStockProduct.count() > 0;

    if (!hasOutOfStock) {
      // Skip test if no out-of-stock products
      return;
    }

    await outOfStockProduct.click();

    // Wait for product detail page
    await page.waitForURL('**/products/**');

    // Check for out of stock badge on detail page - use more specific selector to avoid strict mode violation
    const outOfStockBadge = page.locator('.out-of-stock-badge').filter({ hasText: 'Out of Stock' });
    await expect(outOfStockBadge).toBeVisible();

    // Check for disabled button
    const unavailableButton = page.locator('button:has-text("Currently Unavailable")');
    await expect(unavailableButton).toBeVisible();
    await expect(unavailableButton).toBeDisabled();

    // Should not have Add to Cart or Wishlist buttons
    const addToCartButton = page.locator('button:has-text("Add to Cart")');
    await expect(addToCartButton).toBeHidden();
  });

  test('should navigate back to products list', async ({ page }) => {
    // Navigate to a product detail page
    await page.goto('/products/prod-1');
    await page.waitForLoadState('domcontentloaded');

    // Click the back link
    const backLink = page.locator('a:has-text("Back to Products")');
    await backLink.click();

    // Should navigate back to products page
    await page.waitForURL('**/products');
    expect(page.url()).toContain('/products');

    // Products grid should be visible
    const productsGrid = page.locator('[class*="product-grid"], [class*="products"]');
    await expect(productsGrid).toBeVisible();
  });
});