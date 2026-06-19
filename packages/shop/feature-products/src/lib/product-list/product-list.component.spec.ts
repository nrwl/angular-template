import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductsService } from '@org/shop/data';
import { Product } from '@org/models';
import { describe, it, beforeEach, expect, vi } from 'vitest';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockProductsService: Partial<ProductsService>;
  let mockRouter: Partial<Router>;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 99.99,
      imageUrl: 'https://example.com/1.jpg',
      category: 'Electronics',
      inStock: true,
      rating: 4.5,
      reviewCount: 100,
    },
    {
      id: '2',
      name: 'Product 2',
      description: 'Description 2',
      price: 149.99,
      imageUrl: 'https://example.com/2.jpg',
      category: 'Clothing',
      inStock: false,
      rating: 4.0,
      reviewCount: 50,
    },
  ];

  beforeEach(async () => {
    mockProductsService = {
      getProducts: vi.fn(),
      getCategories: vi.fn(),
      loading: vi.fn().mockReturnValue(false),
      error: vi.fn().mockReturnValue(null),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products and categories on init', () => {
    mockProductsService.getProducts.mockReturnValue(of({
      items: mockProducts,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }));
    mockProductsService.getCategories.mockReturnValue(of(['Electronics', 'Clothing']));

    component.ngOnInit();

    expect(mockProductsService.getProducts).toHaveBeenCalled();
    expect(mockProductsService.getCategories).toHaveBeenCalled();
    expect(component.products()).toEqual(mockProducts);
  });

  it('should navigate to product detail when product is selected', () => {
    const product = mockProducts[0];

    component.onProductSelect(product);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', product.id]);
  });

  it('should apply filters when search term changes', () => {
    mockProductsService.getProducts.mockReturnValue(of({
      items: mockProducts,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }));

    component.searchTerm = 'Product 1';
    component.onSearchChange();

    expect(mockProductsService.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        searchTerm: 'Product 1',
      }),
      1,
      12
    );
  });

  it('should apply filters when category changes', () => {
    mockProductsService.getProducts.mockReturnValue(of({
      items: [mockProducts[0]],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }));

    component.selectedCategory = 'Electronics';
    component.onFilterChange();

    expect(mockProductsService.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Electronics',
      }),
      1,
      12
    );
  });
});