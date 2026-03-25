// src/app/features/home/home.component.ts
import { Component, OnInit, inject, signal, computed, Input } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterLink }     from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { BikeService }    from '../../core/services/bike.service';
import { Bicicleta, BikeFilters } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls:   ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // @Input() recibe el parámetro de la URL (:tipo → mountain, road, electric, gear)
  // gracias a withComponentInputBinding() en app.config.ts
  @Input() tipo = 'mountain';

  private bikeService = inject(BikeService);

  bicicletas = signal<Bicicleta[]>([]);
  marcas     = signal<string[]>([]);
  loading    = signal(true);
  error      = signal<string | null>(null);

  // Filtros reactivos
  filters = signal<BikeFilters>({});
  selectedMarcas = signal<string[]>([]);
  precioMin = signal<number>(0);
  precioMax = signal<number>(20000);
  showCategories = signal(true);
  showPrice      = signal(true);
  showBrands     = signal(true);

  get tipoLabel(): string {
    const labels: Record<string, string> = {
      mountain: 'Mountain Gallery',
      road:     'Road Gallery',
      electric: 'Electric Gallery',
      gear:     'Gear Gallery'
    };
    return labels[this.tipo] ?? 'Gallery';
  }

  get heroConfig() {
    const configs: Record<string, { text: string; sub: string; color: string }> = {
      mountain: { text: 'UNLEASH\nGRAVITY.',    sub: 'SUMMER SERIES 2024', color: '#FF4D00' },
      road:     { text: 'CHASE\nTHE LIMIT.',    sub: 'AERO SERIES 2024',   color: '#111111' },
      electric: { text: 'AMPLIFY\nYOUR RIDE.',  sub: 'E-MOTION SERIES',    color: '#0062FF' },
      gear:     { text: 'GEAR\nUP.',            sub: 'ESSENTIALS SERIES',  color: '#2D9E2D' }
    };
    return configs[this.tipo] ?? configs['mountain'];
  }

  ngOnInit(): void {
    this.loadBikes();
    this.bikeService.getMarcas().subscribe({
      next: m => this.marcas.set(m),
      error: () => {}
    });
  }

  // Se llama cuando cambia el @Input tipo (navegación entre Mountain/Road/etc)
  ngOnChanges(): void {
    this.loadBikes();
  }

  loadBikes(): void {
    this.loading.set(true);
    this.error.set(null);
    const f: BikeFilters = {
      tipo: this.tipo,
      ...this.filters()
    };
    this.bikeService.getBicicletas(f).subscribe({
      next:  res => { this.bicicletas.set(res.data); this.loading.set(false); },
      error: ()  => { this.error.set('Error al cargar bicicletas'); this.loading.set(false); }
    });
  }

  applyFilters(): void {
    this.filters.set({
      marca:    this.selectedMarcas().join(','),
      precioMin: this.precioMin(),
      precioMax: this.precioMax()
    });
    this.loadBikes();
  }

  toggleMarca(marca: string): void {
    this.selectedMarcas.update(list =>
      list.includes(marca) ? list.filter(m => m !== marca) : [...list, marca]
    );
    this.applyFilters();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  toggleCategories(): void { this.showCategories.update(v => !v); }
  togglePrice():      void { this.showPrice.update(v => !v); }
  toggleBrands():     void { this.showBrands.update(v => !v); }
}