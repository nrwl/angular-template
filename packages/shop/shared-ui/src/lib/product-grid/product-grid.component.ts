import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@org/models';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'shop-product-grid',
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="product-grid">
      @for (product of products(); track product.id) {
        <shop-product-card
          [product]="product"
          (productClick)="productSelect.emit($event)"
        />
      }
      @empty {
        <div class="no-products">
          <p>No products found</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 24px;
      padding: 24px 0;
    }

    .no-products {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px;
      color: #666;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGridComponent {
  readonly products = input.required<Product[]>();
  readonly productSelect = output<Product>();
}