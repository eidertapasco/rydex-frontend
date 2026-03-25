// src/app/features/product-detail/product-detail.component.ts
import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { Router, RouterLink }        from '@angular/router';
import { BikeService }   from '../../core/services/bike.service';
import { CartService }   from '../../core/services/cart.service';
import { Bicicleta }     from '../../core/models/models';

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

  readonly sizes = ['S', 'M', 'L'];

  ngOnInit(): void {
    this.bikeService.getBicicleta(Number(this.id)).subscribe({
      next:  b  => { this.bike.set(b); this.loading.set(false); },
      error: () => { this.error.set('Producto no encontrado'); this.loading.set(false); }
    });
  }

  addToCart(): void {
    const b = this.bike();
    if (!b) return;
    this.cartService.add(b, this.selectedSize());
    this.addedToCart.set(true);
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