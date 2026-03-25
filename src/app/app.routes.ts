import { Routes } from '@angular/router';
import { adminGuard } from './core/services/admin.guard';
import { AdminLayoutComponent } from './features/admin/admin-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'mountain', pathMatch: 'full' },
  { path: 'login',    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent) },
  { path: 'carrito',  loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: 'producto/:id', loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
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
      { path: 'compras',     loadComponent: () => import('./features/admin/purchases/purchase-list.component').then(m => m.PurchaseListComponent) },
      { path: 'compras/nueva',           loadComponent: () => import('./features/admin/purchases/purchase-form.component').then(m => m.PurchaseFormComponent) },
      { path: 'proveedores', loadComponent: () => import('./features/admin/suppliers/supplier-list.component').then(m => m.SupplierListComponent) },
      { path: 'proveedores/nuevo',       loadComponent: () => import('./features/admin/suppliers/supplier-form.component').then(m => m.SupplierFormComponent) },
      { path: 'proveedores/:id/editar',  loadComponent: () => import('./features/admin/suppliers/supplier-form.component').then(m => m.SupplierFormComponent) },
    ]
  },
  { path: ':tipo', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: '**', redirectTo: 'mountain' }
];