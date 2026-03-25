// src/main.ts
// Este es el punto de entrada de toda la aplicación Angular.
// bootstrapApplication arranca la app usando el AppComponent
// como componente raíz y la configuración definida en app.config.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig }            from './app/app.config';
import { AppComponent }         from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));