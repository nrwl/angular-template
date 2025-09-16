import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Product, ApiResponse, PaginatedResponse, ProductFilter } from '@org/models';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3333/api';

  // Signals for state management
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  getProducts(
    filter?: ProductFilter,
    page = 1,
    pageSize = 12
  ): Observable<PaginatedResponse<Product>> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filter) {
      if (filter.category) {
        params = params.set('category', filter.category);
      }
      if (filter.minPrice !== undefined) {
        params = params.set('minPrice', filter.minPrice.toString());
      }
      if (filter.maxPrice !== undefined) {
        params = params.set('maxPrice', filter.maxPrice.toString());
      }
      if (filter.inStock !== undefined) {
        params = params.set('inStock', filter.inStock.toString());
      }
      if (filter.searchTerm) {
        params = params.set('searchTerm', filter.searchTerm);
      }
    }

    return this.http
      .get<ApiResponse<PaginatedResponse<Product>>>(`${this.apiUrl}/products`, {
        params,
      })
      .pipe(
        map((response) => {
          this.loadingSignal.set(false);
          if (!response.success) {
            throw new Error(response.error || 'Failed to load products');
          }
          return response.data;
        }),
        catchError((error) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(
            error.message || 'An error occurred while loading products'
          );
          console.error('Error loading products:', error);
          return of({
            items: [],
            total: 0,
            page: 1,
            pageSize: 12,
            totalPages: 0,
          });
        })
      );
  }

  getProductById(id: string): Observable<Product | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .get<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`)
      .pipe(
        map((response) => {
          this.loadingSignal.set(false);
          if (!response.success) {
            throw new Error(response.error || 'Failed to load product');
          }
          return response.data;
        }),
        catchError((error) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(
            error.message || 'An error occurred while loading the product'
          );
          console.error('Error loading product:', error);
          return of(null);
        })
      );
  }

  getCategories(): Observable<string[]> {
    return this.http
      .get<ApiResponse<string[]>>(`${this.apiUrl}/products-metadata/categories`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to load categories');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('Error loading categories:', error);
          return of([]);
        })
      );
  }

  getPriceRange(): Observable<{ min: number; max: number }> {
    return this.http
      .get<ApiResponse<{ min: number; max: number }>>(
        `${this.apiUrl}/products-metadata/price-range`
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to load price range');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('Error loading price range:', error);
          return of({ min: 0, max: 1000 });
        })
      );
  }
}