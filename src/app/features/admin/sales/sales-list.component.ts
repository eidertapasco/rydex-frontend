// src/app/features/admin/sales/sales-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { AdminService, VentaDetallada } from '../../../core/services/admin.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  filterError = signal<string | null>(null); // Para mostrar errores de validación

  ngOnInit(): void { this.load(); }

  load(): void {
    this.filterError.set(null); // Limpiamos errores previos

    if (this.fechaInicio() && this.fechaFin()) {
      const start = new Date(this.fechaInicio());
      const end = new Date(this.fechaFin());

      if(start > end) {
        this.filterError.set('La fecha "Desde" no puede ser mayor a la fecha "Hasta".');
        return; // Detenemos la búsqueda
      }
    }

    this.loading.set(true);
    this.adminService.getVentas(this.fechaInicio(), this.fechaFin()).subscribe({
    // Asegurarnos de que asigne la lista correctamente (por si viene envuelta en 'data')
    next:  v  => { 
      const data = (v as any).data || v; 
        // Si data no es un arreglo o viene vacío, aseguramos que ventas quede como []
        this.ventas.set(Array.isArray(data) ? data : []); 
        this.loading.set(false); 
      },
      error: () => {
        // Si el backend da error (ej. 404 no encontrado), vaciamos la lista
        this.ventas.set([]);
        this.loading.set(false);
      }
    });
  }

  // Función para descargar la factura
  descargarPDF(idVenta: number): void {
    this.adminService.descargarFactura(idVenta).subscribe({
      next: (blob: Blob) => {
        // Creamos un link invisible en el navegador, le pegamos el PDF y lo "clickeamos"
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Factura_Rydex_${idVenta}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url); // Limpiamos la memoria
      },
      error: (err) => {
        console.error('Error al descargar la factura', err);
        alert('No se pudo descargar la factura.');
      }
    });
  }

  // Función para limpiar filtros y recargar
  limpiarFiltros(): void {
    this.fechaInicio.set('');
    this.fechaFin.set('');
    this.filterError.set(null);
    this.load();
  }

  // Función inteligente para descifrar la info del cliente
  obtenerInfoCliente(venta: any): string {
    if (venta.cliente && venta.cliente.nombre) return venta.cliente.nombre;
    if (venta.cliente_nombre) return venta.cliente_nombre;
    if (venta.id_cliente) return `ID Cliente: ${venta.id_cliente}`;
    return 'Cliente Mostrador';
  }

  toggleExpand(id: number): void {
    this.expanded.update(cur => cur === id ? null : id);
  }

  formatPrice(p: any): string {
    const safeValue = Number(p) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeValue);
  }

  totalGeneral(): number {
    return this.ventas().reduce((s, v) => s + (Number(v.total) || 0), 0);
  }
}