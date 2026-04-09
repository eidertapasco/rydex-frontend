// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { adminGuard } from './core/services/admin.guard';
import { AdminLayoutComponent } from './features/admin/admin-layout.component';

export const routes: Routes = [
  // 1. LA PORTADA PRINCIPAL (Landing Page)
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent), pathMatch: 'full' },

  // ... RUTAS DE AUTENTICACIÓN Y CLIENTE ...
  { path: 'login',    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent) },
  { path: 'carrito',  loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: 'producto/:id', loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'mis-compras', loadComponent: () => import('./features/client/mis-compras/mis-compras.component').then(m => m.MisComprasComponent) },
  
  // ... RUTAS DEL PANEL DE ADMINISTRADOR ...
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',   loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'bicicletas',  loadComponent: () => import('./features/admin/bikes/bike-list.component').then(m => m.BikeListComponent) },
      { path: 'bicicletas/nueva',        loadComponent: () => import('./features/admin/bikes/bike-form.component').then(m => m.BikeFormComponent) },
      { path: 'bicicletas/:id/editar',   loadComponent: () => import('./features/admin/bikes/bike-form.component').then(m => m.BikeFormComponent) },
      { path: 'ventas',      loadComponent: () => import('./features/admin/sales/sales-list.component').then(m => m.SalesListComponent) },
      { path: 'ventas/nueva', loadComponent: () => import('./features/admin/sales/sales-form/sales-form.component').then(m => m.SalesFormComponent) },
      { path: 'compras',     loadComponent: () => import('./features/admin/purchases/purchase-list.component').then(m => m.PurchaseListComponent) },
      { path: 'compras/nueva',           loadComponent: () => import('./features/admin/purchases/purchase-form.component').then(m => m.PurchaseFormComponent) },
      { path: 'proveedores', loadComponent: () => import('./features/admin/suppliers/supplier-list.component').then(m => m.SupplierListComponent) },
      { path: 'proveedores/nuevo',       loadComponent: () => import('./features/admin/suppliers/supplier-form.component').then(m => m.SupplierFormComponent) },
      { path: 'proveedores/:id/editar',  loadComponent: () => import('./features/admin/suppliers/supplier-form.component').then(m => m.SupplierFormComponent) },
    ]
  },
  
  { path: 'home', redirectTo: '', pathMatch: 'full' },

  // Ruta específica para ver TODO el catálogo sin filtros
  { path: 'all', loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent), data: { tipo: 'all' } },
  
  // 2. EL CATÁLOGO DINÁMICO (mountain, road, electric, gear)
  // Ahora carga el CatalogComponent que creamos en el paso anterior
  { path: ':tipo', loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent) },
  
  // 3. FALLBACK: Si escriben una URL que no existe, los mandamos a la portada
  { path: '**', redirectTo: '' }
];