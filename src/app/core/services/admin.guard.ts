// // src/app/core/services/admin.guard.ts
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from './auth.service';

// /**
//  * Guard funcional (Angular 17+) que protege todas las rutas /admin/*.
//  * Verifica que el usuario esté logueado Y tenga rol ADMIN.
//  * Si no cumple, redirige al login.
//  */
// export const adminGuard: CanActivateFn = () => {
//   const auth   = inject(AuthService);
//   const router = inject(Router);

//   // isLoggedIn es un getter (no signal), se llama sin ()
//   // Cuando el backend incluya 'rol' en el objeto Cliente,
//   // descomenta la segunda condición:
//   //   && auth.cliente()?.rol === 'ADMIN'
//   if (auth.isLoggedIn) {
//     return true;
//   }

//   return router.createUrlTree(['/login']);
// };

//Temporal para pruebas del admin
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  // TEMPORAL: mientras no hay backend, permitir acceso directo
  // Cuando el backend esté listo, descomentar el bloque de abajo
  return true;

  /*
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn) { router.navigate(['/login']); return false; }
  const cliente = auth.cliente() as any;
  if (cliente?.rol !== 'ADMIN') { router.navigate(['/mountain']); return false; }
  return true;
  */
};