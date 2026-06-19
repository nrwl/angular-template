import { ProductsService } from './products.service';
import { ProductFilter } from '@org/models';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllProducts', () => {
    it('should return paginated products with default pagination', () => {
      const result = service.getAllProducts();

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('pageSize');
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(12);
      expect(result.items.length).toBeLessThanOrEqual(12);
    });

    it('should filter products by category', () => {
      const filter: ProductFilter = { category: 'Electronics' };
      const result = service.getAllProducts(filter);

      result.items.forEach((product) => {
        expect(product.category).toBe('Electronics');
      });
    });

    it('should filter products by price range', () => {
      const filter: ProductFilter = { minPrice: 50, maxPrice: 150 };
      const result = service.getAllProducts(filter);

      result.items.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(50);
        expect(product.price).toBeLessThanOrEqual(150);
      });
    });

    it('should handle search term filtering', () => {
      const filter: ProductFilter = { searchTerm: 'Product 1' };
      const result = service.getAllProducts(filter);

      result.items.forEach((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes('product 1') ||
          product.description.toLowerCase().includes('product 1');
        expect(matchesSearch).toBe(true);
      });
    });

    it('should paginate results correctly', () => {
      const page1 = service.getAllProducts(undefined, 1, 5);
      const page2 = service.getAllProducts(undefined, 2, 5);

      expect(page1.items.length).toBeLessThanOrEqual(5);
      expect(page2.items.length).toBeLessThanOrEqual(5);
      expect(page1.items[0]?.id).not.toBe(page2.items[0]?.id);
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', () => {
      const product = service.getProductById('prod-1');

      expect(product).toBeTruthy();
      expect(product?.id).toBe('prod-1');
    });

    it('should return null for non-existent id', () => {
      const product = service.getProductById('non-existent');

      expect(product).toBeNull();
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', () => {
      const categories = service.getCategories();

      expect(categories).toBeTruthy();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    });
  });

  describe('getPriceRange', () => {
    it('should return min and max prices', () => {
      const range = service.getPriceRange();

      expect(range).toHaveProperty('min');
      expect(range).toHaveProperty('max');
      expect(range.min).toBeLessThanOrEqual(range.max);
      expect(range.min).toBeGreaterThanOrEqual(0);
    });
  });
});