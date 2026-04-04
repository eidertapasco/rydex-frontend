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
  
  // --- NUEVOS CAMPOS PARA EL CLIENTE ---
  isNewClient = signal(false); // Toggle: false = Existente, true = Nuevo
  selectedClienteId = signal<number | null>(null);
  
  newClientNombre = signal('');
  newClientDocumento = signal('');
  newClientTelefono = signal('');
  newClientEmail = signal('');
  direccionEnvio = signal(''); // Para envío físico (Opcional)
  
  clientSearchTerm = signal('');
  showClientDropdown = signal(false);
  
  // UI States
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  submitAttempted = signal(false);

  filteredBikes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.bicicletas().filter(b => 
      b.sku.toLowerCase().includes(term) || 
      b.modelo.toLowerCase().includes(term) || 
      b.marca.toLowerCase().includes(term)
    );
  });

  filteredClientes = computed(() => {
    const term = this.clientSearchTerm().toLowerCase();
    if (!term) return []; 
    return this.clientes().filter(c => {
      const nombreValido = c.nombre ? c.nombre.toLowerCase() : '';
      const docValido = c.documento ? c.documento.toLowerCase() : '';
      return nombreValido.includes(term) || docValido.includes(term);
    });
  });

  updateClientSearch(term: string) {
    this.clientSearchTerm.set(term);
    this.showClientDropdown.set(true);
    this.selectedClienteId.set(null); 
  }

  selectClient(cliente: any) {
    this.selectedClienteId.set(cliente.id_cliente);
    // Extraemos el documento de forma segura
    const doc = cliente.documento ? cliente.documento : 'Sin Cédula';
    this.clientSearchTerm.set(`${cliente.nombre} (${doc})`);
    this.showClientDropdown.set(false);
  }

  cartTotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.subtotal, 0);
  });

  ngOnInit(): void {
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
        if (existing.cantidad >= bike.stock_actual) return currentCart;
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
        return current.filter((_, i) => i !== index);
      }
      if (newQty > item.bicicleta.stock_actual) {
        return current;
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
    if (event) event.preventDefault();
    this.submitAttempted.set(true);

    // --- NUEVA VALIDACIÓN INTELIGENTE ---
    if (this.cart().length === 0) return;
    
    if (!this.isNewClient() && !this.selectedClienteId()) return; // Si es existente, debe elegir uno
    
    if (this.isNewClient() && (!this.newClientNombre() || !this.newClientDocumento())) {
        return; // Si es nuevo, mínimo nombre y documento
    }
    // ------------------------------------

    this.saving.set(true);
    this.error.set(null);

    // Preparamos el payload base
    const request: any = {
      total: this.cartTotal(),
      detalles: this.cart().map(item => ({
        id_bicicleta: item.bicicleta.id_bicicleta,
        cantidad: item.cantidad,
        precio_unitario: item.bicicleta.precio,
        subtotal: item.subtotal
      }))
    };

    // Agregamos la dirección si la escribió
    if (this.direccionEnvio().trim() !== '') {
        request.direccion_envio = this.direccionEnvio();
    }

    // --- Enviar ID o Enviar Datos Nuevos ---
    if (this.isNewClient()) {
        request.nuevo_cliente_nombre = this.newClientNombre();
        request.nuevo_cliente_documento = this.newClientDocumento();
        request.nuevo_cliente_telefono = this.newClientTelefono();
        if (this.newClientEmail().trim() !== '') {
            request.nuevo_cliente_email = this.newClientEmail();
        }
    } else {
        request.id_cliente = Number(this.selectedClienteId());
    }
    // ------------------Esto es para validar que si envie la request----------------------------

    console.log("Enviando esta venta a Spring Boot:", request);

    this.adminService.registrarVenta(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/ventas']); 
      },
      error: (err) => {
        console.error("¡Error devuelto por el servidor!", err);
        this.error.set('Error al procesar la venta.'); // Revisar la consola (F12) para más detalles.
        this.saving.set(false);
      }
    });
  }
}