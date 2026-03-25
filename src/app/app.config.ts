// src/app/app.config.ts
// Este archivo reemplaza al antiguo AppModule. En Angular 17 se usa
// ApplicationConfig para registrar los providers globales de la app.
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors }      from '@angular/common/http';
import { routes }          from './app.routes';
import { authInterceptor } from './core/services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Registra el enrutador de Angular con las rutas definidas en app.routes.ts
    // withComponentInputBinding() permite pasar parámetros de ruta como @Input()
    provideRouter(routes, withComponentInputBinding()),

    // Activa el cliente HTTP y registra nuestro interceptor JWT
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};