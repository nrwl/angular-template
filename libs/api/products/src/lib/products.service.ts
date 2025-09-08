import { Product, ProductFilter, PaginatedResponse } from '@org/models';

export class ProductsService {
  private products: Product[] = this.generateMockProducts();

  private generateMockProducts(): Product[] {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
    const products: Product[] = [];

    for (let i = 1; i <= 50; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      products.push({
        id: `prod-${i}`,
        name: `Product ${i}`,
        description: `This is a high-quality ${category.toLowerCase()} product with excellent features and great value for money.`,
        price: Math.round(Math.random() * 500 * 100) / 100 + 10,
        category,
        imageUrl: `https://placehold.co/300x300?text=Product+${i}`,
        inStock: Math.random() > 0.2,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 500),
      });
    }

    return products;
  }

  getAllProducts(
    filter?: ProductFilter,
    page = 1,
    pageSize = 12
  ): PaginatedResponse<Product> {
    let filteredProducts = [...this.products];

    if (filter) {
      if (filter.category) {
        filteredProducts = filteredProducts.filter(
          p => p.category === filter.category
        );
      }

      if (filter.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          p => p.price >= filter.minPrice
        );
      }

      if (filter.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          p => p.price <= filter.maxPrice
        );
      }

      if (filter.inStock !== undefined) {
        filteredProducts = filteredProducts.filter(
          p => p.inStock === filter.inStock
        );
      }

      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(
          p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower)
        );
      }
    }

    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filteredProducts.slice(startIndex, endIndex);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  getProductById(id: string): Product | null {
    return this.products.find(p => p.id === id) || null;
  }

  getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))];
  }

  getPriceRange(): { min: number; max: number } {
    const prices = this.products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }
}