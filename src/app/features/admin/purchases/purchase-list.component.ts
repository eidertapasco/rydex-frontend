// src/app/features/admin/purchases/purchase-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { AdminService, CompraDetallada } from '../../../core/services/admin.service';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-list.component.html',
  styleUrls:   ['./purchase-list.component.css']
})
export class PurchaseListComponent implements OnInit {
  private adminService = inject(AdminService);

  compras   = signal<CompraDetallada[]>([]);
  loading   = signal(true);
  expanded  = signal<number | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminService.getCompras().subscribe({
      next:  c  => { 
        const data = (c as any).data || c;
        this.compras.set(Array.isArray(data) ? data : []); 
        this.loading.set(false); 
      },
      error: () => {
        this.compras.set([]);
        this.loading.set(false);
      }
    });
  }

  // Resuelve el nombre del proveedor si el backend lo manda en distintos formatos
  obtenerInfoProveedor(compra: any): string {
    if (compra.proveedor && compra.proveedor.nombre_empresa) return compra.proveedor.nombre_empresa;
    if (compra.proveedor_nombre) return compra.proveedor_nombre;
    if (compra.id_proveedor) return `ID Proveedor: ${compra.id_proveedor}`;
    return 'Proveedor Desconocido';
  }

  toggleExpand(id: number): void {
    this.expanded.update(cur => cur === id ? null : id);
  }

  totalGeneral(): number {
    return this.compras().reduce((s, c) => s + (Number(c.total) || 0), 0);
  }

  formatPrice(p: any): string {
    const safeValue = Number(p) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeValue);
  }
}