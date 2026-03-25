// src/app/features/admin/suppliers/supplier-form.component.ts
import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterLink }   from '@angular/router';
import { Router }       from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Proveedor }    from '../../../core/models/models';

type ProveedorForm = Omit<Proveedor, 'id_proveedor'>;

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css']
})
export class SupplierFormComponent implements OnInit {
  @Input() id?: string;

  private adminService = inject(AdminService);
  private router       = inject(Router);

  isEdit  = false;
  saving  = signal(false);
  loading = signal(false);
  error   = signal<string | null>(null);

  form = signal<ProveedorForm>({
    nombre_empresa: '', persona_contacto: '',
    telefono_contacto: '', email_contacto: ''
  });

  ngOnInit(): void {
    if (this.id) {
      this.isEdit = true;
      this.loading.set(true);
      this.adminService.getProveedores().subscribe({
        next: list => {
          const p = list.find(x => x.id_proveedor === Number(this.id));
          if (p) this.form.set({ nombre_empresa: p.nombre_empresa, persona_contacto: p.persona_contacto, telefono_contacto: p.telefono_contacto, email_contacto: p.email_contacto });
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  update(field: keyof ProveedorForm, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  save(): void {
    const f = this.form();
    if (!f.nombre_empresa || !f.persona_contacto) {
      this.error.set('Nombre de empresa y persona de contacto son obligatorios.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const obs = this.isEdit
      ? this.adminService.updateProveedor(Number(this.id), f)
      : this.adminService.createProveedor(f);

    obs.subscribe({
      next:  () => { this.saving.set(false); this.router.navigate(['/admin/proveedores']); },
      error: () => { this.saving.set(false); this.error.set('Error al guardar el proveedor.'); }
    });
  }
}