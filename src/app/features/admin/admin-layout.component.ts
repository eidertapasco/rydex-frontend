// src/app/features/admin/admin-layout.component.ts
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService }  from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  sidebarCollapsed = signal(false);

  // ✅ Método normal en lugar de arrow function en el template
  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  getAdminNombre(): string {
    return this.auth.cliente()?.nombre ?? 'Admin';
  }

  navItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
               <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
             </svg>`
    },
    {
      label: 'Bicicletas',
      path: '/admin/bicicletas',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <circle cx="18" cy="18" r="3"/><circle cx="6" cy="18" r="3"/>
               <path d="M6 15l4-9 2 4.5M18 15l-6-3-2-4.5M12 6l1.5 3"/>
               <circle cx="12" cy="5" r="1"/>
             </svg>`
    },
    {
      label: 'Ventas',
      path: '/admin/ventas',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <line x1="12" y1="1" x2="12" y2="23"/>
               <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
             </svg>`
    },
    {
      label: 'Compras',
      path: '/admin/compras',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
               <line x1="3" y1="6" x2="21" y2="6"/>
               <path d="M16 10a4 4 0 01-8 0"/>
             </svg>`
    },
    {
      label: 'Proveedores',
      path: '/admin/proveedores',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
               <circle cx="9" cy="7" r="4"/>
               <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
               <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
             </svg>`
    }
  ];
}