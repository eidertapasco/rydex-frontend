// src/app/features/admin/suppliers/supplier-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Proveedor }    from '../../../core/models/models';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  private adminService = inject(AdminService);

  proveedores  = signal<Proveedor[]>([]);
  loading      = signal(true);
  confirmDelete = signal<number | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminService.getProveedores().subscribe({
      next:  p  => { this.proveedores.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  doDelete(id: number): void {
    this.adminService.deleteProveedor(id).subscribe({
      next:  () => { this.proveedores.update(list => list.filter(p => p.id_proveedor !== id)); this.confirmDelete.set(null); },
      error: () => this.confirmDelete.set(null)
    });
  }
}