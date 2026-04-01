// src/app/core/services/cart.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Bicicleta } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  // signal() con array: toda la UI que use el carrito se actualiza
  // automáticamente cuando agregamos o eliminamos un item
  readonly items = signal<CartItem[]>(this.loadCart());

  // computed() deriva valores a partir de signals. Son de solo lectura
  // y se recalculan solo cuando cambia el signal que usan.
  readonly totalItems = computed(() =>
    this.items().reduce((sum, i) => sum + i.cantidad, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + (i.bicicleta.precio * i.cantidad), 0)
  );

  readonly tax = computed(() => this.subtotal() * 0.08);

  readonly total = computed(() => this.subtotal() + this.tax());

  // Agrega al carrito. Si ya existe, incrementa cantidad.
  add(bicicleta: Bicicleta, talla?: string, color?: string): void {
    this.items.update(items => {
      const exists = items.find(i => i.bicicleta.id_bicicleta === bicicleta.id_bicicleta && i.talla === talla);
      if (exists) {
        return items.map(i =>
          i.bicicleta.id_bicicleta === bicicleta.id_bicicleta && i.talla === talla
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...items, { bicicleta, cantidad: 1, talla, color }];
    });
    this.saveCart();
  }

  remove(id_bicicleta: number, talla: string | undefined) {
    this.items.update(items => 
      items.filter(i => !(i.bicicleta.id_bicicleta === id_bicicleta && i.talla === talla))
    );
  }

  updateCantidad(id_bicicleta: number, talla: string | undefined, nuevaCantidad: number) {
    this.items.update(items => {
      // Buscar el ítem exacto que coincida en ID y en Talla
      const index = items.findIndex(i => i.bicicleta.id_bicicleta === id_bicicleta && i.talla === talla);
      
      if (index === -1) return items;

      const itemActual = items[index];

      // Si intenta bajar de 1, bloqueamos la acción y devolvemos la lista tal cual
      if (nuevaCantidad < 1) {
        return items;
      }

      // Si intenta subir más allá del stock, lo bloque
      if (nuevaCantidad > itemActual.bicicleta.stock_actual) {
        return items; 
      }

      if (nuevaCantidad <= 0) {
        // Si llega a 0, filtramos para quitar SOLO ese ítem específico
        return items.filter(i => !(i.bicicleta.id_bicicleta === id_bicicleta && i.talla === talla));
      }

      // Si pasa las validaciones, actualizamos la cantidad
      const newItems = [...items];
      newItems[index].cantidad = nuevaCantidad;
      return newItems;
    });
  }

  clear(): void {
    this.items.set([]);
    localStorage.removeItem('rydex-cart');
  }

  private saveCart(): void {
    localStorage.setItem('rydex-cart', JSON.stringify(this.items()));
  }

  private loadCart(): CartItem[] {
    const raw = localStorage.getItem('rydex-cart');
    return raw ? JSON.parse(raw) : [];
  }
}