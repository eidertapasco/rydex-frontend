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
      next:  c  => { this.compras.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleExpand(id: number): void {
    this.expanded.update(cur => cur === id ? null : id);
  }

  totalGeneral(): number {
    return this.compras().reduce((s, c) => s + c.total, 0);
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
  }
}