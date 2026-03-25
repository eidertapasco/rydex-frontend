// src/app/features/cart/cart.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { CartService }  from '../../core/services/cart.service';
import { AuthService }  from '../../core/services/auth.service';
import { Router }       from '@angular/router';
import { HttpClient }   from '@angular/common/http';
import { environment }  from '../../../environments/environment';
import { DetalleVenta } from '../../core/models/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls:   ['./cart.component.css']
})
export class CartComponent {
  cart   = inject(CartService);
  auth   = inject(AuthService);
  router = inject(Router);
  http   = inject(HttpClient);

  promoCode    = signal('');
  promoApplied = signal(false);
  checkingOut  = signal(false);
  orderError   = signal<string | null>(null);
  orderSuccess = signal(false);

  applyPromo(): void {
    // Lógica simplificada: solo acepta RYDEX-2024
    if (this.promoCode().toUpperCase() === 'RYDEX-2024') {
      this.promoApplied.set(true);
    }
  }

  // Calcula el descuento si hay promo
  get discount(): number {
    return this.promoApplied() ? this.cart.subtotal() * 0.1 : 0;
  }

  get finalTotal(): number {
    return this.cart.total() - this.discount;
  }

  checkout(): void {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.checkingOut.set(true);
    this.orderError.set(null);

    // Construimos el payload que espera el backend
    const payload = {
      id_cliente: this.auth.cliente()!.id_cliente,
      total:      this.finalTotal,
      detalles:   this.cart.items().map(i => ({
        id_bicicleta:    i.bicicleta.id_bicicleta,
        cantidad:        i.cantidad,
        precio_unitario: i.bicicleta.precio,
        subtotal:        i.bicicleta.precio * i.cantidad
      }))
    };

    this.http.post(`${environment.apiUrl}/ventas`, payload).subscribe({
      next: () => {
        this.cart.clear();
        this.orderSuccess.set(true);
        this.checkingOut.set(false);
      },
      error: (err) => {
        this.orderError.set('Error al procesar la orden. Intenta de nuevo.');
        this.checkingOut.set(false);
      }
    });
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
  }
}