// src/app/features/admin/dashboard/admin-dashboard.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- Para los calendarios
import { AdminService, DashboardMetrics } from '../../../core/services/admin.service';
import { Bicicleta, PaginatedResponse } from '../../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

  // --- LÓGICA DEL MODAL DE REPORTES DE FECHA ---
  showReportModal = signal(false);
  tipoReporte = signal<'ingresos' | 'egresos' | 'ganancias'>('ingresos');
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  generandoReporte = signal(false);

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
        alert('No se pudo generar el reporte general.');
      }
    });
  }

  // --- MÉTODOS DE STOCK BAJO ---
  abrirModalStock() {
    if (this.metrics()?.stockBajo === 0) return;
    this.showStockModal.set(true);
    this.loadingStock.set(true);
    this.adminService.getBicicletas().subscribe({
      next: (res: PaginatedResponse<Bicicleta>) => {
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

  cerrarModalStock() { this.showStockModal.set(false); }

  pedirUnidades(bikeId: number) {
    this.cerrarModalStock();
    this.router.navigate(['/admin/compras/nueva'], { queryParams: { bikeId: bikeId } });
  }

  // --- NUEVOS MÉTODOS PARA EL MODAL DE REPORTES ---
  abrirModalReportes(tipo: 'ingresos' | 'egresos' | 'ganancias') {
    this.tipoReporte.set(tipo);
    
    // Configurar fechas por defecto (Día 1 del mes actual hasta Hoy)
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    this.fechaInicio.set(primerDia.toISOString().split('T')[0]);
    this.fechaFin.set(hoy.toISOString().split('T')[0]);
    
    this.showReportModal.set(true);
  }

  cerrarModalReportes() { this.showReportModal.set(false); }

  generarReporteDetallado() {
    this.generandoReporte.set(true);
    
    // Formatear las fechas para empatar EXACTO con lo que espera Spring Boot
    const start = this.fechaInicio() ? `${this.fechaInicio()}T00:00:00` : undefined;
    const end = this.fechaFin() ? `${this.fechaFin()}T23:59:59` : undefined;

    // Decidir a qué endpoint de Spring Boot llamar
    // Decidir a qué endpoint de Spring Boot llamar (ahora con 3 opciones)
    let peticion$;
    if (this.tipoReporte() === 'ingresos') peticion$ = this.adminService.descargarReporteIngresos(start, end);
    else if (this.tipoReporte() === 'egresos') peticion$ = this.adminService.descargarReporteEgresos(start, end);
    else peticion$ = this.adminService.descargarReporteGanancias(start, end);

    peticion$.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Detalle_${this.tipoReporte().toUpperCase()}_Rydex.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.generandoReporte.set(false);
        this.cerrarModalReportes();
      },
      error: (err) => {
        console.error('Error al descargar el reporte detallado', err);
        alert('Ocurrió un error al generar el PDF. Verifica la consola.');
        this.generandoReporte.set(false);
      }
    });
  }
}