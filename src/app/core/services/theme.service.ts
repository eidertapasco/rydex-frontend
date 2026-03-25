// src/app/core/services/theme.service.ts
import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // signal() es la nueva forma reactiva de Angular de manejar estado.
  // Funciona como una variable que "avisa" a los componentes cuando cambia.
  readonly isDark = signal<boolean>(this.getStoredTheme());

  constructor() {
    // effect() ejecuta código automáticamente cada vez que isDark cambia
    effect(() => {
      const dark = this.isDark();
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      localStorage.setItem('rydex-theme', dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  private getStoredTheme(): boolean {
    const stored = localStorage.getItem('rydex-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}