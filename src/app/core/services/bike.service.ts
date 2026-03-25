// src/app/core/services/bike.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bicicleta, BikeFilters, PaginatedResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BikeService {
  // inject() es la forma moderna en Angular 17 de inyectar dependencias.
  // Es equivalente al constructor(private http: HttpClient) pero más limpio.
  private http = inject(HttpClient);
  private api  = environment.apiUrl;

  // Obtiene lista de bicicletas con filtros opcionales
  getBicicletas(filters?: BikeFilters): Observable<PaginatedResponse<Bicicleta>> {
    let params = new HttpParams();
    if (filters?.tipo)      params = params.set('tipo',     filters.tipo);
    if (filters?.marca)     params = params.set('marca',    filters.marca);
    if (filters?.precioMin) params = params.set('precioMin', filters.precioMin);
    if (filters?.precioMax) params = params.set('precioMax', filters.precioMax);
    if (filters?.busqueda)  params = params.set('q',        filters.busqueda);
    return this.http.get<PaginatedResponse<Bicicleta>>(`${this.api}/bicicletas`, { params });
  }

  // Obtiene el detalle de una sola bicicleta
  getBicicleta(id: number): Observable<Bicicleta> {
    return this.http.get<Bicicleta>(`${this.api}/bicicletas/${id}`);
  }

  // Obtiene las marcas únicas para el filtro
  getMarcas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/bicicletas/marcas`);
  }
}