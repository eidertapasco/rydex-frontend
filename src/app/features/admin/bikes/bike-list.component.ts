// src/app/features/admin/bikes/bike-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Bicicleta }    from '../../../core/models/models';

@Component({
  selector: 'app-bike-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bike-list.component.html',
  styleUrls: ['./bike-list.component.css']
})
export class BikeListComponent implements OnInit {
  private adminService = inject(AdminService);

  bikes   = signal<Bicicleta[]>([]);
  loading = signal(true);
  deleting = signal<number | null>(null);
  confirmDelete = signal<number | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminService.getBicicletas().subscribe({
      next:  res => { this.bikes.set(res.data); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  askDelete(id: number): void  { this.confirmDelete.set(id); }
  cancelDelete(): void { this.confirmDelete.set(null); }

  doDelete(id: number): void {
    this.deleting.set(id);
    this.adminService.deleteBicicleta(id).subscribe({
      next:  () => { this.bikes.update(list => list.filter(b => b.id_bicicleta !== id)); this.deleting.set(null); this.confirmDelete.set(null); },
      error: () => { this.deleting.set(null); this.confirmDelete.set(null); }
    });
  }

  stockStatus(b: Bicicleta): 'ok' | 'low' | 'out' {
    if (b.stock_actual === 0)                    return 'out';
    if (b.stock_actual <= b.stock_minimo)        return 'low';
    return 'ok';
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
  }
}