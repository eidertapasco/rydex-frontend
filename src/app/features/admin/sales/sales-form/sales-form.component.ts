// src/app/features/admin/sales/sales-form/sales-form.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { Bicicleta }    from '../../../../core/models/models';

interface CartItem {
  bicicleta: Bicicleta;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.css']
})
export class SalesFormComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  // Datos
  bicicletas = signal<Bicicleta[]>([]);
  clientes = signal<any[]>([]);
  
  // Estado del POS
  cart = signal<CartItem[]>([]);
  searchTerm = signal('');
  selectedClienteId = signal<number | null>(null);
  
  // UI States
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  submitAttempted = signal(false); // <-- AÑADIDO: Controla el mensaje rojo

  // Buscador reactivo: filtra bicis por SKU, marca o modelo
  filteredBikes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.bicicletas().filter(b => 
      b.sku.toLowerCase().includes(term) || 
      b.modelo.toLowerCase().includes(term) || 
      b.marca.toLowerCase().includes(term)
    );
  });

  // Calcula el total del carrito
  cartTotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.subtotal, 0);
  });

  ngOnInit(): void {
    // Cargar bicicletas y clientes en paralelo
    this.adminService.getBicicletas().subscribe(res => {
      this.bicicletas.set(res.data);
      this.loading.set(false);
    });

    this.adminService.getClientes().subscribe(clientes => {
      this.clientes.set(clientes);
    });
  }

  addToCart(bike: Bicicleta): void {
    if (bike.stock_actual <= 0) {
      this.error.set(`La bicicleta ${bike.modelo} no tiene stock disponible.`);
      setTimeout(() => this.error.set(null), 3000);
      return;
    }

    this.cart.update(currentCart => {
      const existing = currentCart.find(i => i.bicicleta.id_bicicleta === bike.id_bicicleta);
      if (existing) {
        if (existing.cantidad >= bike.stock_actual) return currentCart; // Límite de stock
        existing.cantidad += 1;
        existing.subtotal = existing.cantidad * bike.precio;
        return [...currentCart];
      }
      return [...currentCart, { bicicleta: bike, cantidad: 1, subtotal: bike.precio }];
    });
  }

  removeFromCart(index: number): void {
    this.cart.update(current => current.filter((_, i) => i !== index));
  }

  updateQty(index: number, delta: number): void {
    this.cart.update(current => {
      const item = current[index];
      const newQty = item.cantidad + delta;
      
      if (newQty <= 0) {
        return current.filter((_, i) => i !== index); // Elimina si baja a 0
      }
      if (newQty > item.bicicleta.stock_actual) {
        return current; // No permite superar el stock
      }
      
      item.cantidad = newQty;
      item.subtotal = item.cantidad * item.bicicleta.precio;
      return [...current];
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  procesarVenta(event?: Event): void {
    if (event) {
      event.preventDefault(); // Detiene la recarga brusca
    }

    this.submitAttempted.set(true); // Marca que el admin intentó cobrar

    if (!this.selectedClienteId() || this.cart().length === 0) {
      // Retornamos sin hacer nada, el HTML mostrará la alerta roja gracias a submitAttempted
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    // CORRECCIÓN CRÍTICA: Propiedades idénticas a los @JsonProperty de Java
    const request = {
      id_cliente: Number(this.selectedClienteId()), 
      total: this.cartTotal(),
      detalles: this.cart().map(item => ({
        id_bicicleta: item.bicicleta.id_bicicleta,
        cantidad: item.cantidad,
        precio_unitario: item.bicicleta.precio,
        subtotal: item.subtotal
      }))
    };

    console.log("Enviando esta venta a Spring Boot:", request);

    this.adminService.registrarVenta(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/ventas']); 
      },
      error: (err) => {
        console.error("¡Error devuelto por el servidor!", err);
        this.error.set('Error al procesar la venta. Revisa la consola (F12) para más detalles.');
        this.saving.set(false);
      }
    });
  }
}