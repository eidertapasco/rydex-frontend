// src/app/features/register/register.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterLink }   from '@angular/router';
import { Router }       from '@angular/router';
import { AuthService }  from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls:   ['./register.component.css']
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  nombre    = signal('');
  documento = signal('');
  telefono  = signal('');
  email     = signal('');
  password  = signal('');
  confirm   = signal('');
  loading   = signal(false);
  error     = signal<string | null>(null);
  showPass  = signal(false);

  togglePass(): void { this.showPass.update(v => !v); }

  register(): void {
    this.error.set(null);

    if (!this.nombre() || !this.documento() || !this.email() || !this.password()) {
      this.error.set('Todos los campos son obligatorios.');
      return;
    }
    if (this.password() !== this.confirm()) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    if (this.password().length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.loading.set(true);
    this.auth.register({
      nombre:    this.nombre(),
      documento: this.documento(),
      telefono:  this.telefono(),
      email:     this.email(),
      password:  this.password()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/mountain']);
      },
      // ✅ tipo explícito 'any' para evitar error TS7006
      error: (err: any) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.error.set('Ya existe una cuenta con ese correo o documento.');
        } else {
          this.error.set('Error de conexión. Intenta más tarde.');
        }
      }
    });
  }
}