// src/app/core/services/auth.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient }                 from '@angular/common/http';
import { Router }                     from '@angular/router';
import { Observable }                 from 'rxjs';
import { tap }                        from 'rxjs/operators';
import { environment }                from '../../../environments/environment';
import { AuthResponse, Cliente, LoginRequest, RegisterRequest } from '../models/models';
import { CartService } from '../services/cart.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private api    = environment.apiUrl;
  private cart   = inject(CartService);

  readonly cliente = signal<Cliente | null>(this.getStoredCliente());

  get isLoggedIn(): boolean {
    return this.cliente() !== null;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('rydex-token', res.token);
        localStorage.setItem('rydex-cliente', JSON.stringify(res.cliente));
        this.cliente.set(res.cliente);
      })
    );
  }

  // Método register — llama a POST /api/auth/register
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, data).pipe(
      tap(res => {
        localStorage.setItem('rydex-token', res.token);
        localStorage.setItem('rydex-cliente', JSON.stringify(res.cliente));
        this.cliente.set(res.cliente);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('rydex-token');
    localStorage.removeItem('rydex-cliente');
    this.cliente.set(null);
    this.cart.clear();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('rydex-token');
  }

  private getStoredCliente(): Cliente | null {
    const raw = localStorage.getItem('rydex-cliente');
    return raw ? JSON.parse(raw) : null;
  }
}