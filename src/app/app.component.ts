import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; // <-- Añadido RouterLink
import { NavbarComponent } from './shared/navbar/navbar.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, RouterLink], // <-- Añadido RouterLink
  templateUrl: './app.component.html' // <-- Ahora apunta al archivo que creaste
})
export class AppComponent implements OnInit {
  private theme = inject(ThemeService);

  ngOnInit(): void {
    const dark = this.theme.isDark();
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
}