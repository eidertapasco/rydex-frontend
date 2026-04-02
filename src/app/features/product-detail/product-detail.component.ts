// src/app/features/product-detail/product-detail.component.ts
import { Component, OnInit, inject, signal, Input, computed } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { Router, RouterLink }        from '@angular/router';
import { BikeService }   from '../../core/services/bike.service';
import { CartService }   from '../../core/services/cart.service';
import { Bicicleta }     from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls:   ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  @Input() id!: string; // Viene del parámetro :id de la URL

  private bikeService = inject(BikeService);
  private cartService = inject(CartService);
  private router      = inject(Router);

  bike         = signal<Bicicleta | null>(null);
  loading      = signal(true);
  error        = signal<string | null>(null);
  selectedImg  = signal(0);
  selectedSize = signal('M');
  addedToCart  = signal(false);
  apiUrl = environment.apiUrl.replace('/api', ''); // Variable para las fotos

  readonly sizes = ['S', 'M', 'L'];

  // Estado para rastrear la cantidad elegida por cada talla
  quantities = signal<Record<string, number>>({ S: 0, M: 0, L: 0 });

  // Calcula el total de unidades seleccionadas sumando todas las tallas
  totalSelected = computed(() => {
    const q = this.quantities();
    return (q['S'] || 0) + (q['M'] || 0) + (q['L'] || 0);
  });

  ngOnInit(): void {
    this.bikeService.getBicicleta(Number(this.id)).subscribe({
      next:  b  => { this.bike.set(b); this.loading.set(false); },
      error: () => { this.error.set('Producto no encontrado'); this.loading.set(false); }
    });
  }

  //Lógica para aumentar/disminuir cantidad validando contra el stock real
  updateQuantity(size: string, delta: number): void {
    const currentQty = this.quantities()[size] || 0;
    const newQty = currentQty + delta;

    if (newQty < 0) return; // Evita que baje de 0

    const currentBike = this.bike();
    if (currentBike && delta > 0) {
      // Si ya seleccionamos el máximo stock disponible (sumando todas las tallas), bloquea la suma
      const stock = currentBike.stock_actual ?? 99;
      if (this.totalSelected() >= stock) return;
    }

    this.quantities.update(q => ({ ...q, [size]: newQty }));
  }

  addToCart(): void {
    const b = this.bike();
    if (!b || this.totalSelected() === 0) return;

    const q = this.quantities();

    // Recorremos el mapa y añadimos la bicicleta al carrito tantas veces como se haya indicado por talla
    Object.entries(q).forEach(([size, qty]) => {
      for (let i = 0; i < qty; i++) {
        this.cartService.add(b, size);
      }
    });

    this.addedToCart.set(true);

    // Reiniciar los contadores a 0 después de añadir al carrito
    this.quantities.set({ S: 0, M: 0, L: 0 });
    
    setTimeout(() => this.addedToCart.set(false), 2000);
  }

  goToCart(): void { this.router.navigate(['/carrito']); }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  get specs(): { key: string; value: string }[] {
    const b = this.bike();
    if (!b) return [];
    const s = b.especificaciones ?? {};
    return Object.entries(s).map(([key, value]) => ({ key, value }));
  }
}