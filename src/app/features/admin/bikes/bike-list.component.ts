// src/app/features/admin/bikes/bike-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { FormsModule }  from '@angular/forms'; // <-- FormsModule para el input de búsqueda
import { AdminService } from '../../../core/services/admin.service';
import { Bicicleta }    from '../../../core/models/models';
import { environment }  from '../../../../environments/environment'; // <-- NUEVO

@Component({
  selector: 'app-bike-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './bike-list.component.html',
  styleUrls: ['./bike-list.component.css']
})
export class BikeListComponent implements OnInit {
  private adminService = inject(AdminService);

  // NUEVO: Variable para la URL del servidor
  apiUrl = environment.apiUrl.replace('/api', '');

  bikes   = signal<Bicicleta[]>([]);
  loading = signal(true);
  deleting = signal<number | null>(null);
  confirmDelete = signal<number | null>(null);

  // Variables y lógica para el buscador

  searchTerm = signal('');

  filteredBikes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    
    // Si la barra está vacía, devuelve la lista original completa
    if (!term) return this.bikes(); 
    
    // Si hay texto, filtra comparando con SKU, modelo o marca
    return this.bikes().filter(b => 
      b.sku.toLowerCase().includes(term) || 
      b.modelo.toLowerCase().includes(term) || 
      b.marca.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminService.getBicicletas().subscribe({
      next:  res => { 
        this.bikes.set(res.data); 
        this.loading.set(false);
      },
      error: ()  => this.loading.set(false)
    });
  }

  askDelete(id: number): void  { this.confirmDelete.set(id); }
  cancelDelete(): void { this.confirmDelete.set(null); }

  doDelete(id: number): void {
    this.deleting.set(id);
    this.adminService.deleteBicicleta(id).subscribe({
      next:  () => { 
        this.bikes.update(list => list.filter(b => b.id_bicicleta !== id)); 
        this.deleting.set(null); 
        this.confirmDelete.set(null); 
      },
      error: (err) => { 
        console.error(err);
        // Manejar el error de llave foranea de SQL
        alert('No se puede eliminar. Es muy probable que esta bicicleta tenga historial de ventas o compras asociadas en el sistema.');
        this.deleting.set(null);
        this.confirmDelete.set(null); 
      }
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