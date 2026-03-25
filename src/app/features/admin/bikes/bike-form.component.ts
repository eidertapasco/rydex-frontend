// src/app/features/admin/bikes/bike-form.component.ts
import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService, NuevaBicicleta } from '../../../core/services/admin.service';
import { BikeService } from '../../../core/services/bike.service';

@Component({
  selector: 'app-bike-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bike-form.component.html',
  styleUrls: ['./bike-form.component.css']
})
export class BikeFormComponent implements OnInit {
  @Input() id?: string; // Si existe, es edición; si no, es creación

  private adminService = inject(AdminService);
  private bikeService  = inject(BikeService);
  private router       = inject(Router);

  loading  = signal(false);
  saving   = signal(false);
  error    = signal<string | null>(null);
  success  = signal(false);

  isEdit = false;

  form = signal<NuevaBicicleta>({
    sku: '', marca: '', modelo: '',
    tipo: 'Mountain', precio: 0,
    stock_actual: 0, stock_minimo: 5,
    descripcion: ''
  });

  tipos = ['Mountain', 'Road', 'Electric', 'Gear'];

  ngOnInit(): void {
    if (this.id) {
      this.isEdit = true;
      this.loading.set(true);
      this.bikeService.getBicicleta(Number(this.id)).subscribe({
        next: b => {
          this.form.set({
            sku: b.sku, marca: b.marca, modelo: b.modelo,
            tipo: b.tipo, precio: b.precio,
            stock_actual: b.stock_actual, stock_minimo: b.stock_minimo,
            descripcion: b.descripcion ?? ''
          });
          this.loading.set(false);
        },
        error: () => { this.error.set('No se pudo cargar la bicicleta.'); this.loading.set(false); }
      });
    }
  }

  updateField(field: keyof NuevaBicicleta, value: any): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  validate(): boolean {
    const f = this.form();
    if (!f.sku || !f.marca || !f.modelo || !f.tipo) {
      this.error.set('SKU, marca, modelo y tipo son obligatorios.');
      return false;
    }
    if (f.precio <= 0) {
      this.error.set('El precio debe ser mayor a 0.');
      return false;
    }
    return true;
  }

  save(): void {
    this.error.set(null);
    if (!this.validate()) return;

    this.saving.set(true);
    const data = this.form();
    const obs = this.isEdit
      ? this.adminService.updateBicicleta(Number(this.id), data)
      : this.adminService.createBicicleta(data);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/bicicletas']);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Error al guardar. Verifica los datos e intenta de nuevo.');
      }
    });
  }
}