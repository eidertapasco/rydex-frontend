// src/app/features/admin/dashboard/admin-dashboard.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router}   from '@angular/router';
import { AdminService, DashboardMetrics } from '../../../core/services/admin.service';
import { Bicicleta, PaginatedResponse } from '../../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  metrics = signal<DashboardMetrics | null>(null);
  loading = signal(true);

  // --- LÓGICA DEL MODAL DE STOCK ---
  showStockModal = signal(false);
  lowStockBikes = signal<Bicicleta[]>([]);
  loadingStock = signal(false);

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

  // NUEVO: Función para descargar el PDF general
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

  // --- NUEVOS MÉTODOS PARA EL MODAL ---
  abrirModalStock() {
    //if (this.metrics()?.stockBajo === 0) return; // Si no hay stock bajo, no abrimos nada
    
    this.showStockModal.set(true);
    this.loadingStock.set(true);

    // Llamamos a la API para traer TODAS las bicis, y luego filtramos
    // (En un futuro, el backend debería tener un endpoint específico para esto)
    this.adminService.getBicicletas().subscribe({
      next: (res: PaginatedResponse<Bicicleta>) => {
        // CORRECCIÓN APLICADA AQUÍ: Se le indicó a TypeScript que 'b' es de tipo 'Bicicleta'
        const bicisEnAlerta = res.data.filter((b: Bicicleta) => b.stock_actual <= b.stock_minimo);
        
        this.lowStockBikes.set(bicisEnAlerta);
        this.loadingStock.set(false);
      },
      error: (err) => {
        console.error('Error cargando stock bajo', err);
        this.loadingStock.set(false);
      }
    });
  }

  cerrarModalStock() {
    this.showStockModal.set(false);
  }

  pedirUnidades(bikeId: number) {
    this.cerrarModalStock();
    // Redirigimos al formulario de compras y pasamos el ID por la URL
    this.router.navigate(['/admin/compras/nueva'], { queryParams: { bikeId: bikeId } });
  }
}