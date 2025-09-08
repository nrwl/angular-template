import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '@org/models';

@Component({
  selector: 'shop-product-card',
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div
      class="product-card"
      (click)="productClick.emit(product())"
      (keyup.enter)="productClick.emit(product())"
      (keyup.space)="productClick.emit(product())"
      [class.out-of-stock]="!product().inStock"
      tabindex="0"
      role="button"
      [attr.aria-label]="'View details for ' + product().name"
    >
      <div class="product-image">
        <img [src]="product().imageUrl" [alt]="product().name" />
        @if (!product().inStock) {
          <div class="out-of-stock-overlay">Out of Stock</div>
        }
      </div>
      <div class="product-info">
        <h3 class="product-name">{{ product().name }}</h3>
        <p class="product-category">{{ product().category }}</p>
        <div class="product-rating">
          <span class="stars">
            @for (star of getStars(); track $index) {
              <span [class.filled]="star">★</span>
            }
          </span>
          <span class="review-count">({{ product().reviewCount }})</span>
        </div>
        <div class="product-price">
          {{ product().price | currency }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .product-card.out-of-stock {
      opacity: 0.7;
    }

    .product-image {
      position: relative;
      width: 100%;
      padding-top: 100%;
      overflow: hidden;
      background: #f5f5f5;
    }

    .product-image img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .out-of-stock-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
    }

    .product-info {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .product-category {
      margin: 0 0 8px 0;
      font-size: 0.9rem;
      color: #666;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .stars {
      color: #ddd;
    }

    .stars .filled {
      color: #ffd700;
    }

    .review-count {
      font-size: 0.85rem;
      color: #666;
    }

    .product-price {
      font-size: 1.25rem;
      font-weight: bold;
      color: #2c3e50;
      margin-top: auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly productClick = output<Product>();

  getStars(): boolean[] {
    const rating = this.product().rating;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return Array(5).fill(false).map((_, index) => {
      if (index < fullStars) return true;
      if (index === fullStars && hasHalfStar) return true;
      return false;
    });
  }
}