import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  theme  = inject(ThemeService);
  auth   = inject(AuthService);
  cart   = inject(CartService);
  router = inject(Router);

  searchQuery = signal('');
  showSearch  = signal(false);

  navLinks = [
    { label: 'Mountain', path: '/mountain' },
    { label: 'Road',     path: '/road'     },
    { label: 'Electric', path: '/electric' },
    { label: 'Gear',     path: '/gear'     }
  ];

  toggleSearch(): void {
    this.showSearch.update(v => !v);
    if (!this.showSearch()) this.searchQuery.set('');
  }

  submitSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/mountain'], { queryParams: { q } });
      this.showSearch.set(false);
    }
  }

  goToCart():  void { this.router.navigate(['/carrito']); }
  goToLogin(): void { this.router.navigate(['/login']);   }
}