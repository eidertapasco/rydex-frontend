import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'mountain',
    pathMatch: 'full'
  },
  // ✅ Rutas específicas PRIMERO (antes que :tipo)
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component')
                           .then(m => m.LoginComponent)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./features/cart/cart.component')
                           .then(m => m.CartComponent)
  },
  {
    path: 'producto/:id',
    loadComponent: () => import('./features/product-detail/product-detail.component')
                           .then(m => m.ProductDetailComponent)
  },
  // ✅ La ruta dinámica :tipo va AL FINAL (después de las específicas)
  {
    path: ':tipo',
    loadComponent: () => import('./features/home/home.component')
                           .then(m => m.HomeComponent)
  },
  {
    path: '**',
    redirectTo: 'mountain'
  }
];