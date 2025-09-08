import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '@org/shop/data';
import { Product } from '@org/models';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '@org/shop/shared-ui';

@Component({
  selector: 'shop-product-detail',
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  template: `
    <div class="product-detail-container">
      @if (loading()) {
        <shop-loading-spinner />
      } @else if (error()) {
        <shop-error-message
          [title]="'Product Not Found'"
          [message]="error() || undefined"
          (retry)="loadProduct()"
        />
      } @else if (product()) {
        <div class="breadcrumb">
          <a routerLink="/products">← Back to Products</a>
        </div>

        <div class="product-detail">
          <div class="product-image-section">
            <img
              [src]="product()!.imageUrl"
              [alt]="product()!.name"
              class="product-image"
            />
            @if (!product()!.inStock) {
              <div class="out-of-stock-badge">Out of Stock</div>
            }
          </div>

          <div class="product-info-section">
            <div class="product-category">{{ product()!.category }}</div>
            <h1 class="product-name">{{ product()!.name }}</h1>

            <div class="product-rating">
              <span class="stars">
                @for (star of getStars(); track $index) {
                  <span [class.filled]="star">★</span>
                }
              </span>
              <span class="rating-text">
                {{ product()!.rating }} out of 5
              </span>
              <span class="review-count">
                ({{ product()!.reviewCount }} reviews)
              </span>
            </div>

            <div class="product-price">
              {{ product()!.price | currency }}
            </div>

            <div class="product-description">
              <h2>Description</h2>
              <p>{{ product()!.description }}</p>
            </div>

            <div class="product-actions">
              @if (product()!.inStock) {
                <button class="btn-primary" (click)="addToCart()">
                  Add to Cart
                </button>
                <button class="btn-secondary" (click)="addToWishlist()">
                  Add to Wishlist
                </button>
              } @else {
                <button class="btn-disabled" disabled>
                  Currently Unavailable
                </button>
              }
            </div>

            <div class="product-info">
              <h3>Product Information</h3>
              <dl>
                <dt>Product ID:</dt>
                <dd>{{ product()!.id }}</dd>
                <dt>Category:</dt>
                <dd>{{ product()!.category }}</dd>
                <dt>Availability:</dt>
                <dd>{{ product()!.inStock ? 'In Stock' : 'Out of Stock' }}</dd>
              </dl>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .breadcrumb {
      margin-bottom: 24px;
    }

    .breadcrumb a {
      color: #3498db;
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.3s;
    }

    .breadcrumb a:hover {
      color: #2980b9;
      text-decoration: underline;
    }

    .product-detail {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .product-image-section {
      position: relative;
    }

    .product-image {
      width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .out-of-stock-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(220, 53, 69, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
    }

    .product-info-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .product-category {
      color: #6c757d;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .product-name {
      font-size: 2rem;
      margin: 0;
      color: #333;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stars {
      color: #ddd;
      font-size: 1.25rem;
    }

    .stars .filled {
      color: #ffd700;
    }

    .rating-text {
      font-weight: 600;
      color: #333;
    }

    .review-count {
      color: #666;
      font-size: 0.95rem;
    }

    .product-price {
      font-size: 2rem;
      font-weight: bold;
      color: #28a745;
    }

    .product-description {
      border-top: 1px solid #e0e0e0;
      padding-top: 24px;
    }

    .product-description h2 {
      font-size: 1.25rem;
      margin-bottom: 12px;
      color: #333;
    }

    .product-description p {
      color: #666;
      line-height: 1.6;
    }

    .product-actions {
      display: flex;
      gap: 16px;
    }

    .btn-primary {
      flex: 1;
      padding: 12px 24px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .btn-secondary {
      flex: 1;
      padding: 12px 24px;
      background: transparent;
      color: #3498db;
      border: 2px solid #3498db;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-secondary:hover {
      background: #3498db;
      color: white;
    }

    .btn-disabled {
      flex: 1;
      padding: 12px 24px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 600;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .product-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }

    .product-info h3 {
      font-size: 1.1rem;
      margin-bottom: 16px;
      color: #333;
    }

    .product-info dl {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 12px;
      margin: 0;
    }

    .product-info dt {
      font-weight: 600;
      color: #666;
    }

    .product-info dd {
      margin: 0;
      color: #333;
    }

    @media (max-width: 768px) {
      .product-detail {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .product-name {
        font-size: 1.5rem;
      }

      .product-price {
        font-size: 1.5rem;
      }

      .product-actions {
        flex-direction: column;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  // State signals
  readonly product = signal<Product | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.loadProduct();
  }

  loadProduct() {
    const productId = this.route.snapshot.paramMap.get('id');

    if (!productId) {
      this.error.set('Product ID not provided');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.productsService.getProductById(productId).subscribe({
      next: (product) => {
        if (product) {
          this.product.set(product);
        } else {
          this.error.set('Product not found');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load product details');
        this.loading.set(false);
        console.error('Error loading product:', err);
      },
    });
  }

  getStars(): boolean[] {
    const product = this.product();
    if (!product) return [];

    const rating = product.rating;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return Array(5).fill(false).map((_, index) => {
      if (index < fullStars) return true;
      if (index === fullStars && hasHalfStar) return true;
      return false;
    });
  }

  addToCart() {
    // This would typically call a cart service
    console.log('Adding to cart:', this.product()?.id);
    alert('Product added to cart!');
  }

  addToWishlist() {
    // This would typically call a wishlist service
    console.log('Adding to wishlist:', this.product()?.id);
    alert('Product added to wishlist!');
  }
}