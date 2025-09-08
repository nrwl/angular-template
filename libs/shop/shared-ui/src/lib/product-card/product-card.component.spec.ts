import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';
import { Product } from '@org/models';
import { describe, it, beforeEach, expect, vi } from 'vitest';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    imageUrl: 'https://example.com/image.jpg',
    category: 'Electronics',
    inStock: true,
    rating: 4.5,
    reviewCount: 100,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', mockProduct);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display product information', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.product-name').textContent).toContain('Test Product');
    expect(compiled.querySelector('.product-category').textContent).toContain('Electronics');
    expect(compiled.querySelector('.product-price').textContent).toContain('99.99');
  });

  it('should emit productClick event when card is clicked', () => {
    const clickSpy = vi.fn();
    component.productClick.subscribe(clickSpy);

    fixture.nativeElement.querySelector('.product-card').click();

    expect(clickSpy).toHaveBeenCalledWith(mockProduct);
  });

  it('should display out of stock overlay when product is not in stock', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    fixture.componentRef.setInput('product', outOfStockProduct);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.out-of-stock-overlay')).toBeTruthy();
    expect(compiled.querySelector('.product-card').classList).toContain('out-of-stock');
  });

  it('should calculate star ratings correctly', () => {
    const stars = component.getStars();

    expect(stars).toEqual([true, true, true, true, true]);
  });

  it('should handle product with low rating', () => {
    const lowRatedProduct = { ...mockProduct, rating: 2.3 };
    fixture.componentRef.setInput('product', lowRatedProduct);

    const stars = component.getStars();

    expect(stars).toEqual([true, true, false, false, false]);
  });
});