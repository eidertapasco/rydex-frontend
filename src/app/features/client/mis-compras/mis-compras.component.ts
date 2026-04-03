// src/app/features/client/mis-compras/mis-compras.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-compras.component.html',
  styleUrls: ['./mis-compras.component.css'] // (Puedes dejar el CSS vacío por ahora)
})
export class MisComprasComponent implements OnInit {
  private authService = inject(AuthService);

  misCompras = signal<any[]>([]);
  loading = signal(true);
  expanded = signal<number | null>(null);

  ngOnInit(): void {
    this.authService.getMisCompras().subscribe({
      next: (data) => {
        this.misCompras.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar historial', err);
        this.loading.set(false);
      }
    });
  }

  toggleExpand(id: number): void {
    this.expanded.update(current => current === id ? null : id);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  descargarFactura(idVenta: number): void {
    this.authService.descargarMiFactura(idVenta).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Factura_Rydex_${idVenta}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar', err);
        alert('No se pudo descargar la factura en este momento.');
      }
    });
  }
}