import { Routes } from '@angular/router';
import { ProductDetailComponent } from './product-detail/product-detail.component';

export const featureProductDetailRoutes: Routes = [
  {
    path: ':id',
    component: ProductDetailComponent,
  },
];