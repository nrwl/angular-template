import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductsService } from './products.service';
import { Product, ApiResponse, PaginatedResponse, ProductFilter } from '@org/models';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3333/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProductsService
      ],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    const mockProductsResponse: ApiResponse<PaginatedResponse<Product>> = {
      success: true,
      data: {
        items: [
          {
            id: '1',
            name: 'Product 1',
            description: 'Description 1',
            price: 100,
            imageUrl: 'image1.jpg',
            category: 'Electronics',
            inStock: true,
            rating: 4.5,
            reviewCount: 10,
          },
          {
            id: '2',
            name: 'Product 2',
            description: 'Description 2',
            price: 200,
            imageUrl: 'image2.jpg',
            category: 'Clothing',
            inStock: false,
            rating: 3.5,
            reviewCount: 5,
          },
        ],
        total: 2,
        page: 1,
        pageSize: 12,
        totalPages: 1,
      },
    };

    it('should return products with default pagination', () => {
      service.getProducts().subscribe((response) => {
        expect(response.items.length).toBe(2);
        expect(response.total).toBe(2);
        expect(response.page).toBe(1);
        expect(service.loading()).toBeFalsy();
        expect(service.error()).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/products?page=1&pageSize=12`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductsResponse);
    });

    it('should apply filters when provided', () => {
      const filter: ProductFilter = {
        category: 'Electronics',
        minPrice: 50,
        maxPrice: 150,
        inStock: true,
        searchTerm: 'test',
      };

      service.getProducts(filter, 2, 20).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(
        `${apiUrl}/products?page=2&pageSize=20&category=Electronics&minPrice=50&maxPrice=150&inStock=true&searchTerm=test`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockProductsResponse);
    });

    it('should handle error response', () => {
      const errorResponse: ApiResponse<PaginatedResponse<Product>> = {
        success: false,
        error: 'Server error',
        data: undefined as unknown
      };

      // Silence console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.getProducts().subscribe((response) => {
        expect(response.items).toEqual([]);
        expect(response.total).toBe(0);
        expect(service.error()).toContain('Server error');
      });

      const req = httpMock.expectOne(`${apiUrl}/products?page=1&pageSize=12`);
      req.flush(errorResponse);

      consoleErrorSpy.mockRestore();
    });

    it('should handle network error', () => {
      // Silence console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.getProducts().subscribe((response) => {
        expect(response.items).toEqual([]);
        expect(response.total).toBe(0);
        expect(service.error()).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/products?page=1&pageSize=12`);
      req.error(new ProgressEvent('Network error'));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getProductById', () => {
    const mockProduct: Product = {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 100,
      imageUrl: 'image1.jpg',
      category: 'Electronics',
      inStock: true,
      rating: 4.5,
      reviewCount: 10,
    };

    it('should return a product by id', () => {
      const mockResponse: ApiResponse<Product> = {
        success: true,
        data: mockProduct,
      };

      service.getProductById('1').subscribe((product) => {
        expect(product).toEqual(mockProduct);
        expect(service.loading()).toBeFalsy();
        expect(service.error()).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/products/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return null on error', () => {
      // Silence console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.getProductById('1').subscribe((product) => {
        expect(product).toBeNull();
        expect(service.error()).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/products/1`);
      req.error(new ProgressEvent('Network error'));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCategories', () => {
    it('should return categories list', () => {
      const mockCategories = ['Electronics', 'Clothing', 'Books'];
      const mockResponse: ApiResponse<string[]> = {
        success: true,
        data: mockCategories,
      };

      service.getCategories().subscribe((categories) => {
        expect(categories).toEqual(mockCategories);
      });

      const req = httpMock.expectOne(`${apiUrl}/products-metadata/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty array on error', () => {
      // Silence console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.getCategories().subscribe((categories) => {
        expect(categories).toEqual([]);
      });

      const req = httpMock.expectOne(`${apiUrl}/products-metadata/categories`);
      req.error(new ProgressEvent('Network error'));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getPriceRange', () => {
    it('should return price range', () => {
      const mockPriceRange = { min: 10, max: 500 };
      const mockResponse: ApiResponse<{ min: number; max: number }> = {
        success: true,
        data: mockPriceRange,
      };

      service.getPriceRange().subscribe((range) => {
        expect(range).toEqual(mockPriceRange);
      });

      const req = httpMock.expectOne(`${apiUrl}/products-metadata/price-range`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return default range on error', () => {
      // Silence console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.getPriceRange().subscribe((range) => {
        expect(range).toEqual({ min: 0, max: 1000 });
      });

      const req = httpMock.expectOne(`${apiUrl}/products-metadata/price-range`);
      req.error(new ProgressEvent('Network error'));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loading and error signals', () => {
    it('should set loading to true when fetching products', () => {
      expect(service.loading()).toBeFalsy();

      service.getProducts().subscribe();
      expect(service.loading()).toBeTruthy();

      const req = httpMock.expectOne(`${apiUrl}/products?page=1&pageSize=12`);
      req.flush({ success: true, data: { items: [], total: 0, page: 1, pageSize: 12, totalPages: 0 } });

      expect(service.loading()).toBeFalsy();
    });

    it('should set error message on failure', () => {
      // Silence console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(service.error()).toBeNull();

      service.getProductById('1').subscribe(() => {
        expect(service.error()).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/products/1`);
      req.error(new ProgressEvent('Network error'));

      consoleErrorSpy.mockRestore();
    });
  });
});
