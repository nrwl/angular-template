import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '@org/shop/data';
import { Product, ProductFilter } from '@org/models';
import {
  ProductGridComponent,
  LoadingSpinnerComponent,
  ErrorMessageComponent,
} from '@org/shop/shared-ui';

@Component({
  selector: 'shop-product-list',
  imports: [
    CommonModule,
    FormsModule,
    ProductGridComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  template: `
    <div class="product-list-container">
      <header class="page-header">
        <h1>Our Products</h1>
        <p>Explore our wide selection of high-quality products</p>
      </header>

      <div class="filters-section">
        <div class="search-box">
          <input
            type="text"
            placeholder="Search products..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            class="search-input"
          />
        </div>

        <div class="filter-controls">
          <select
            [(ngModel)]="selectedCategory"
            (ngModelChange)="onFilterChange()"
            class="filter-select"
          >
            <option value="">All Categories</option>
            @for (category of categories(); track category) {
              <option [value]="category">{{ category }}</option>
            }
          </select>

          <label class="checkbox-label">
            <input
              type="checkbox"
              [(ngModel)]="inStockOnly"
              (ngModelChange)="onFilterChange()"
            />
            In Stock Only
          </label>
        </div>
      </div>

      @if (loading()) {
        <shop-loading-spinner />
      } @else if (error()) {
        <shop-error-message
          [message]="error() || undefined"
          (retry)="loadProducts()"
        />
      } @else {
        <div class="results-info">
          Showing {{ products().length }} of {{ totalProducts() }} products
        </div>

        <shop-product-grid
          [products]="products()"
          (productSelect)="onProductSelect($event)"
        />

        @if (hasMorePages()) {
          <div class="pagination">
            <button
              class="btn-secondary"
              [disabled]="currentPage() === 1"
              (click)="previousPage()"
            >
              Previous
            </button>
            <span class="page-info">
              Page {{ currentPage() }} of {{ totalPages() }}
            </span>
            <button
              class="btn-secondary"
              [disabled]="currentPage() === totalPages()"
              (click)="nextPage()"
            >
              Next
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .product-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .page-header h1 {
      font-size: 2.5rem;
      margin-bottom: 8px;
      color: #333;
    }

    .page-header p {
      font-size: 1.1rem;
      color: #666;
    }

    .filters-section {
      background: #f8f9fa;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 32px;
    }

    .search-box {
      margin-bottom: 16px;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px;
      font-size: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: #3498db;
    }

    .filter-controls {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 8px 16px;
      font-size: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 1rem;
    }

    .checkbox-label input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .results-info {
      color: #666;
      margin-bottom: 16px;
      font-size: 0.95rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .page-info {
      color: #666;
      font-size: 1rem;
    }

    .btn-secondary {
      padding: 8px 16px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .product-list-container {
        padding: 16px;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .filter-controls {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);

  // State signals
  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal(0);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly categories = signal<string[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Filter state
  searchTerm = '';
  selectedCategory = '';
  inStockOnly = false;

  // Computed values
  readonly hasMorePages = computed(() => this.totalPages() > 1);

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.productsService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Error loading categories:', err),
    });
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    const filter: ProductFilter = {};

    if (this.searchTerm) {
      filter.searchTerm = this.searchTerm;
    }
    if (this.selectedCategory) {
      filter.category = this.selectedCategory;
    }
    if (this.inStockOnly) {
      filter.inStock = true;
    }

    this.productsService.getProducts(filter, this.currentPage(), 12).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.totalProducts.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products. Please try again.');
        this.loading.set(false);
        console.error('Error loading products:', err);
      },
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onProductSelect(product: Product) {
    this.router.navigate(['/products', product.id]);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadProducts();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadProducts();
    }
  }
}