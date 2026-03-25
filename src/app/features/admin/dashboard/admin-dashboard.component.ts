import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { AdminService, DashboardMetrics } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  metrics = signal<DashboardMetrics | null>(null);
  loading = signal(true);

  // Datos de respaldo mientras no hay backend
  mockMetrics: DashboardMetrics = {
    ventasHoy: 3,
    ingresosHoy: 18750,
    totalBicicletas: 24,
    stockBajo: 2,
    ventasSemana: 15,
    ingresosSemana: 87300
  };

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe({
      next:  m  => { this.metrics.set(m); this.loading.set(false); },
      error: () => { this.metrics.set(this.mockMetrics); this.loading.set(false); }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
}