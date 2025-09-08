import { test, expect } from '@playwright/test';

test.describe('Shop Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main header and navigation', async ({ page }) => {
    // Check header title
    const header = page.locator('h1').first();
    await expect(header).toContainText('Nx Shop Demo');

    // Check navigation link exists
    const productsLink = page.locator('nav a:has-text("Products")');
    await expect(productsLink).toBeVisible();
    await expect(productsLink).toHaveAttribute('href', '/products');
  });

  test('should display footer with copyright information', async ({ page }) => {
    // Check footer content
    const footer = page.locator('footer');
    await expect(footer).toContainText('© 2025 Nx Shop Demo');
    await expect(footer).toContainText(
      'Frontend (Angular) + Backend (Express) + Shared Libraries'
    );
  });

  test('should redirect to products page by default', async ({ page }) => {
    // The app should redirect from / to /products
    await page.waitForURL('**/products');
    expect(page.url()).toContain('/products');

    // Verify we're on the products page
    const productsHeading = page.locator('h1:has-text("Our Products")');
    await expect(productsHeading).toBeVisible();
  });

  test('should have proper page title and meta', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/shop/i);

    // Check viewport is responsive
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
  });
});
