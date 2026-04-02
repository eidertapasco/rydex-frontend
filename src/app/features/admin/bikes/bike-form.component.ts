// src/app/features/admin/bikes/bike-form.component.ts
import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService, NuevaBicicleta } from '../../../core/services/admin.service';
import { BikeService } from '../../../core/services/bike.service';
import { environment } from '../../../../environments/environment'; // <-- Para saber la URL base

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

  // Estado para saber si la imagen se está subiendo
  uploadingImage = signal(false);

  // Para construir la URL completa de la imagen y poder previsualizarla
  apiUrl = environment.apiUrl.replace('/api', '');

  isEdit = false;

  form = signal<NuevaBicicleta>({
    sku: '', marca: '', modelo: '',
    tipo: 'Mountain', 
    precio: 0, 
    precio_compra: 0, // <-- INICIALIZADO
    stock_actual: 0, stock_minimo: 5,
    descripcion: '', imagen_url: ''
  });

  tipos = ['Mountain', 'Road', 'Electric', 'Gear'];

  ngOnInit(): void {
    if (this.id) {
      this.isEdit = true;
      this.loading.set(true);
      this.bikeService.getBicicleta(Number(this.id)).subscribe({
        next: (b: any) => {
          this.form.set({
            sku: b.sku || '',
            marca: b.marca || '',
            modelo: b.modelo || '',
            tipo: b.tipo || 'Mountain',
            precio: b.precio || 0,
            precio_compra: b.precio_compra || 0,
            stock_actual: b.stock_actual || 0,
            stock_minimo: b.stock_minimo || 0,
            descripcion: b.descripcion || '',
            imagen_url: b.imagen_url || ''
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

  // Función que se dispara cuando el usuario elige una foto
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadingImage.set(true);
      this.error.set(null);
      
      this.adminService.uploadImage(file).subscribe({
        next: (response) => {
          // Guardamos la URL que nos devuelve Spring Boot (/uploads/...)
          this.updateField('imagen_url', response.url);
          this.uploadingImage.set(false);
        },
        error: () => {
          this.error.set('Error al subir la imagen. Intenta con otra foto.');
          this.uploadingImage.set(false);
        }
      });
    }
  }

  validate(): boolean {
    const f = this.form();
    if (!f.sku || !f.marca || !f.modelo || !f.tipo) {
      this.error.set('SKU, marca, modelo y tipo son obligatorios.');
      return false;
    }
    // NUEVA VALIDACIÓN: Revisamos ambos precios
    if (f.precio <= 0 || f.precio_compra <= 0) {
      this.error.set('Los precios de venta y compra deben ser mayores a 0.');
      return false;
    }
    if (f.precio_compra >= f.precio) {
      this.error.set('Los precios de compra no deben ser mayores a los precios de venta.');
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
        this.router.navigateByUrl('/admin/dashboard', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/admin/bicicletas']);
        });
      },
      error: (err) => {
        console.error("Error del backend:", err);
        this.saving.set(false);
        this.error.set('Error al guardar. Verifica los datos e intenta de nuevo.');
      }
    });
  }
}