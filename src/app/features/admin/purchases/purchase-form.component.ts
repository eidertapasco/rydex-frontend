// src/app/features/admin/purchases/purchase-form.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AdminService, NuevaCompra } from '../../../core/services/admin.service';
import { Proveedor, Bicicleta }      from '../../../core/models/models';

interface LineaCompra {
  id_bicicleta: number;
  modelo: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './purchase-form.component.html',
  styleUrls:   ['./purchase-form.component.css']
})
export class PurchaseFormComponent implements OnInit {
  private adminService = inject(AdminService);
  private router       = inject(Router);

  proveedores = signal<Proveedor[]>([]);
  bicicletas  = signal<Bicicleta[]>([]);
  lineas      = signal<LineaCompra[]>([]);
  loading     = signal(true);
  saving      = signal(false);
  error       = signal<string | null>(null);

  idProveedorSeleccionado = signal<number | null>(null);
  idBicicletaAAgregar     = signal<number | null>(null);

  ngOnInit(): void {
    this.adminService.getProveedores().subscribe({
      next: p => this.proveedores.set(p)
    });
    this.adminService.getBicicletas().subscribe({
      next:  res => { this.bicicletas.set(res.data); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  // NUEVO: Método para el Datalist del buscador inteligente
  seleccionarBicicleta(event: any): void {
    const textoIngresado = event.target.value;
    
    // Busca la bicicleta que haga match con "Marca Modelo"
    const bikeEncontrada = this.bicicletas().find(
      b => `${b.marca} ${b.modelo}` === textoIngresado
    );

    if (bikeEncontrada) {
      // Configuramos el ID y la agregamos directo
      this.idBicicletaAAgregar.set(bikeEncontrada.id_bicicleta);
      this.agregarLinea();
      
      // Limpiamos el input visualmente para buscar otra
      event.target.value = '';
    } else {
      this.idBicicletaAAgregar.set(null);
    }
  }

  agregarLinea(): void {
    const id = this.idBicicletaAAgregar();
    if (!id) return;
    const bike = this.bicicletas().find(b => b.id_bicicleta === id);
    if (!bike) return;
    
    // Si ya existe la línea, incrementa cantidad
    const existe = this.lineas().find(l => l.id_bicicleta === id);
    if (existe) {
      this.lineas.update(list => list.map(l =>
        l.id_bicicleta === id
          ? { ...l, cantidad: l.cantidad + 1, subtotal: (l.cantidad + 1) * l.precio_unitario }
          : l
      ));
    } else {
      // NOTA: Al comprar, sugerimos el precio de compra (costo), no el de venta
      this.lineas.update(list => [...list, {
        id_bicicleta: bike.id_bicicleta,
        modelo: bike.modelo,
        cantidad: 1,
        precio_unitario: bike.precio_compra || bike.precio, 
        subtotal: bike.precio_compra || bike.precio
      }]);
    }
    this.idBicicletaAAgregar.set(null);
  }

  updateCantidad(id: number, val: any): void {
    const cantidad = Number(val) || 0;
    this.lineas.update(list => list.map(l =>
      l.id_bicicleta === id
        ? { ...l, cantidad, subtotal: cantidad * l.precio_unitario }
        : l
    ));
  }

  removerLinea(id: number): void {
    this.lineas.update(list => list.filter(l => l.id_bicicleta !== id));
  }

  updatePrecio(id: number, precio: number): void {
    this.lineas.update(list => list.map(l =>
      l.id_bicicleta === id
        ? { ...l, precio_unitario: precio, subtotal: l.cantidad * precio }
        : l
    ));
  }

  get total(): number {
    return this.lineas().reduce((s, l) => s + l.subtotal, 0);
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
  }

  guardar(): void {
    const idProveedor = this.idProveedorSeleccionado();
    if (!idProveedor) { this.error.set('Selecciona un proveedor.'); return; }
    if (this.lineas().length === 0) { this.error.set('Agrega al menos una bicicleta.'); return; }

    this.saving.set(true);
    this.error.set(null);

    const payload: NuevaCompra = {
      id_proveedor: idProveedor,
      total: this.total,
      detalles: this.lineas().map(l => ({
        id_bicicleta:    l.id_bicicleta,
        cantidad:        l.cantidad,
        precio_unitario: l.precio_unitario,
        subtotal:        l.subtotal
      }))
    };

    this.adminService.createCompra(payload).subscribe({
      next:  () => { this.saving.set(false); this.router.navigate(['/admin/compras']); },
      error: () => { this.saving.set(false); this.error.set('Error al registrar la compra.'); }
    });
  }
}