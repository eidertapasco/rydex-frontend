// src/app/core/services/auth.interceptor.ts
// Un interceptor es un "middleware" de Angular: intercepta TODAS las
// peticiones HTTP antes de que salgan y les agrega el token de autenticación.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject }            from '@angular/core';
import { AuthService }       from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  if (token) {
    // Clona la petición y añade el header Authorization
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  return next(req);
};