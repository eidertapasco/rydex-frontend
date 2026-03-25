// src/app/features/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterLink }   from '@angular/router';
import { Router }       from '@angular/router';
import { AuthService }  from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls:   ['./login.component.css']
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  email    = signal('');
  password = signal('');
  loading  = signal(false);
  error    = signal<string | null>(null);
  showPass = signal(false);

  login(): void {
    const emailVal    = this.email().trim();
    const passwordVal = this.password();

    if (!emailVal || !passwordVal) {
      this.error.set('Por favor completa todos los campos.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.login({ email: emailVal, password: passwordVal }).subscribe({
      next: () => {
        this.loading.set(false);
        // Redirige a la página anterior o a mountain por defecto
        this.router.navigate(['/mountain']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.error.set('Correo o contraseña incorrectos.');
        } else {
          this.error.set('Error de conexión. Intenta más tarde.');
        }
      }
    });
  }

  togglePass(): void { this.showPass.update(v => !v); }
}