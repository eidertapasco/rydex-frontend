// src/app/features/admin/dashboard/admin-dashboard.component.ts
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

  // Datos de respaldo actualizados
  mockMetrics: DashboardMetrics = {
    ventasHoy: 0,
    ingresosTotales: 0,
    egresosTotales: 0,
    gananciaNeta: 0,
    totalBicicletas: 0,
    stockBajo: 0
  };

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe({
      next:  m  => { this.metrics.set(m); this.loading.set(false); },
      error: () => { this.metrics.set(this.mockMetrics); this.loading.set(false); }
    });
  }

  formatCurrency(value: any): string {
    const safeValue = Number(value) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeValue);
  }

  // NUEVO: Función para descargar el PDF
  generarReportePDF(): void {
    this.adminService.descargarReporteFinanciero().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Financiero_Rydex.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el reporte', err);
        alert('No se pudo generar el reporte. Verifica que el backend esté corriendo.');
      }
    });
  }
}