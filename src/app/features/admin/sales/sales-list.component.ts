// src/app/features/admin/sales/sales-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { AdminService, VentaDetallada } from '../../../core/services/admin.service';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.css']
})
export class SalesListComponent implements OnInit {
  private adminService = inject(AdminService);

  ventas   = signal<VentaDetallada[]>([]);
  loading  = signal(true);
  expanded = signal<number | null>(null);

  fechaInicio = signal('');
  fechaFin    = signal('');

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminService.getVentas(this.fechaInicio(), this.fechaFin()).subscribe({
      next:  v  => { this.ventas.set(v); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleExpand(id: number): void {
    this.expanded.update(cur => cur === id ? null : id);
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
  }

  totalGeneral(): number {
    return this.ventas().reduce((s, v) => s + v.total, 0);
  }
}